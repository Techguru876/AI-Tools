# Content Generation Integration Strategy

## Overview

This document outlines how we'll integrate AI content generation services (GPT-4, ElevenLabs, DALL-E) into ContentForge Studio.

---

## Architecture

### Service Layer Structure

```
main/services/content-generation/
├── base/
│   ├── BaseProvider.ts          # Abstract base class
│   ├── RateLimiter.ts           # Rate limiting utility
│   ├── CacheManager.ts          # Content caching
│   └── CostTracker.ts           # API cost tracking
├── providers/
│   ├── OpenAIProvider.ts        # GPT-4 + DALL-E wrapper
│   ├── ElevenLabsProvider.ts    # Voice synthesis
│   └── index.ts                 # Provider registry
├── ScriptGenerator.ts           # Script generation service
├── VoiceGenerator.ts            # Voice synthesis service
├── ImageGenerator.ts            # Image generation service
└── ContentCache.ts              # SQLite cache for generated content
```

---

## 1. API Key Management

### Secure Storage with electron-store

**Why electron-store?**
- Encrypted storage on disk
- OS-specific secure locations
- Easy get/set interface
- Migration support

**Implementation:**

```typescript
// main/services/config/APIKeyManager.ts
import Store from 'electron-store';

interface APIKeys {
  openai?: string;
  elevenlabs?: string;
  stability?: string;  // Alternative to DALL-E
}

export class APIKeyManager {
  private store: Store<APIKeys>;

  constructor() {
    this.store = new Store<APIKeys>({
      name: 'api-keys',
      encryptionKey: 'contentforge-secure-key-2024',  // Should be env var
      defaults: {}
    });
  }

  setOpenAIKey(key: string): void {
    this.store.set('openai', key);
  }

  getOpenAIKey(): string | undefined {
    return this.store.get('openai');
  }

  setElevenLabsKey(key: string): void {
    this.store.set('elevenlabs', key);
  }

  getElevenLabsKey(): string | undefined {
    return this.store.get('elevenlabs');
  }

  validateKeys(): { openai: boolean; elevenlabs: boolean } {
    return {
      openai: !!this.getOpenAIKey(),
      elevenlabs: !!this.getElevenLabsKey()
    };
  }

  clearAllKeys(): void {
    this.store.clear();
  }
}
```

**UI Integration:**

```typescript
// Settings Panel in Frontend
import { config } from './lib/electron-bridge';

// Set API key
await config.setAPIKey('openai', 'sk-...');

// Validate keys
const status = await config.validateAPIKeys();
// { openai: true, elevenlabs: false }
```

---

## 2. Base Provider Architecture

### Abstract Base Class

**Features:**
- Rate limiting (requests per minute)
- Retry logic with exponential backoff
- Cost tracking
- Error handling

```typescript
// main/services/content-generation/base/BaseProvider.ts
export abstract class BaseProvider {
  protected rateLimiter: RateLimiter;
  protected costTracker: CostTracker;
  protected maxRetries: number = 3;

  constructor(
    protected apiKey: string,
    protected rateLimit: number = 60  // Requests per minute
  ) {
    this.rateLimiter = new RateLimiter(rateLimit);
    this.costTracker = new CostTracker(this.getProviderName());
  }

  abstract getProviderName(): string;

  protected async makeRequest<T>(
    requestFn: () => Promise<T>,
    estimatedCost: number
  ): Promise<T> {
    // Wait for rate limit
    await this.rateLimiter.waitForSlot();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await requestFn();

        // Track successful request cost
        this.costTracker.addCost(estimatedCost);

        return result;
      } catch (error: any) {
        lastError = error;

        // Don't retry on auth errors
        if (error.status === 401 || error.status === 403) {
          throw new Error(`Authentication failed: ${error.message}`);
        }

        // Exponential backoff
        if (attempt < this.maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Request failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  getCostStats(): { total: number; today: number; thisMonth: number } {
    return this.costTracker.getStats();
  }
}
```

---

## 3. OpenAI Provider (GPT-4 + DALL-E)

### GPT-4 for Scripts

**Pricing:**
- GPT-4 Turbo: $0.01 / 1K input tokens, $0.03 / 1K output tokens
- GPT-4o: $0.005 / 1K input tokens, $0.015 / 1K output tokens

**Implementation:**

```typescript
// main/services/content-generation/providers/OpenAIProvider.ts
import OpenAI from 'openai';
import { BaseProvider } from '../base/BaseProvider';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey, 60);  // 60 requests per minute
    this.client = new OpenAI({ apiKey });
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  async generateScript(prompt: string, options?: {
    model?: 'gpt-4-turbo' | 'gpt-4o';
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ text: string; tokens: number; cost: number }> {
    const model = options?.model || 'gpt-4o';
    const maxTokens = options?.maxTokens || 2000;
    const temperature = options?.temperature || 0.7;

    // Estimate cost (rough)
    const estimatedCost = 0.03;  // ~$0.03 per request

    return this.makeRequest(async () => {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      });

      const text = response.choices[0].message.content || '';
      const tokens = response.usage?.total_tokens || 0;

      // Calculate actual cost
      const inputCost = (response.usage?.prompt_tokens || 0) / 1000 * 0.005;
      const outputCost = (response.usage?.completion_tokens || 0) / 1000 * 0.015;
      const cost = inputCost + outputCost;

      return { text, tokens, cost };
    }, estimatedCost);
  }

  async generateImage(prompt: string, options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
  }): Promise<{ url: string; cost: number }> {
    const size = options?.size || '1024x1024';
    const quality = options?.quality || 'standard';

    // DALL-E 3 pricing
    const costMap: Record<string, number> = {
      '1024x1024-standard': 0.040,
      '1024x1024-hd': 0.080,
      '1792x1024-standard': 0.080,
      '1792x1024-hd': 0.120,
      '1024x1792-standard': 0.080,
      '1024x1792-hd': 0.120,
    };

    const estimatedCost = costMap[`${size}-${quality}`];

    return this.makeRequest(async () => {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        size,
        quality,
        n: 1
      });

      const url = response.data[0].url!;
      return { url, cost: estimatedCost };
    }, estimatedCost);
  }
}
```

---

## 4. ElevenLabs Provider (Voice Synthesis)

**Pricing:**
- Starter: $5/month (30K characters)
- Creator: $22/month (100K characters)
- Pro: $99/month (500K characters)

**Implementation:**

```typescript
// main/services/content-generation/providers/ElevenLabsProvider.ts
import axios from 'axios';
import { BaseProvider } from '../base/BaseProvider';
import fs from 'fs/promises';

export class ElevenLabsProvider extends BaseProvider {
  private baseURL = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    super(apiKey, 60);  // 60 requests per minute
  }

  getProviderName(): string {
    return 'ElevenLabs';
  }

  async listVoices(): Promise<Array<{ id: string; name: string }>> {
    return this.makeRequest(async () => {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: { 'xi-api-key': this.apiKey }
      });

      return response.data.voices.map((v: any) => ({
        id: v.voice_id,
        name: v.name
      }));
    }, 0);  // Free request
  }

  async generateVoice(
    text: string,
    voiceId: string,
    outputPath: string,
    options?: {
      stability?: number;
      similarityBoost?: number;
      model?: 'eleven_monolingual_v1' | 'eleven_multilingual_v2';
    }
  ): Promise<{ path: string; characters: number; cost: number }> {
    const characters = text.length;

    // Estimate cost (assuming $22/month plan = $0.00022 per character)
    const estimatedCost = characters * 0.00022;

    return this.makeRequest(async () => {
      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: options?.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: options?.stability || 0.5,
            similarity_boost: options?.similarityBoost || 0.75
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      );

      // Save audio file
      await fs.writeFile(outputPath, Buffer.from(response.data));

      return {
        path: outputPath,
        characters,
        cost: estimatedCost
      };
    }, estimatedCost);
  }
}
```

---

## 5. High-Level Service Layer

### Script Generator

```typescript
// main/services/content-generation/ScriptGenerator.ts
import { OpenAIProvider } from './providers/OpenAIProvider';
import { ContentCache } from './ContentCache';

export class ScriptGenerator {
  private openai: OpenAIProvider;
  private cache: ContentCache;

  constructor(apiKey: string) {
    this.openai = new OpenAIProvider(apiKey);
    this.cache = new ContentCache();
  }

  async generateHorrorStory(options: {
    duration: number;       // Target duration in seconds
    theme?: string;         // Optional theme
    setting?: string;       // Optional setting
  }): Promise<{
    title: string;
    script: string;
    scenes: string[];
    estimatedDuration: number;
  }> {
    const wordCount = Math.floor(options.duration / 60 * 150);  // 150 WPM

    const prompt = `
Generate a spine-chilling horror story script for a YouTube video.

Requirements:
- Word count: ~${wordCount} words
- Duration: ${options.duration / 60} minutes
- Theme: ${options.theme || 'psychological horror'}
- Setting: ${options.setting || 'modern day'}

Format:
{
  "title": "Engaging title with emoji",
  "script": "Full narration script...",
  "scenes": ["Scene 1 description", "Scene 2 description", ...]
}

Make it gripping, atmospheric, and perfect for narration.
`.trim();

    const result = await this.openai.generateScript(prompt, {
      model: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.8
    });

    const parsed = JSON.parse(result.text);

    // Cache result
    await this.cache.set('horror_story', prompt, parsed);

    return {
      ...parsed,
      estimatedDuration: options.duration
    };
  }

  async generateLofiDescription(options: {
    trackName: string;
    mood: string;
  }): Promise<string> {
    const prompt = `
Write a YouTube description for a lofi hip hop stream.

Track: ${options.trackName}
Mood: ${options.mood}

Include:
- Catchy intro
- Study/relax/work benefits
- Timestamps (if applicable)
- Social media links placeholders
- SEO keywords

Keep it under 5000 characters.
`.trim();

    const result = await this.openai.generateScript(prompt, {
      model: 'gpt-4o',
      maxTokens: 1000,
      temperature: 0.7
    });

    return result.text;
  }
}
```

### Voice Generator

```typescript
// main/services/content-generation/VoiceGenerator.ts
import { ElevenLabsProvider } from './providers/ElevenLabsProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import path from 'path';

export class VoiceGenerator {
  private elevenlabs?: ElevenLabsProvider;
  private openai?: OpenAIProvider;
  private outputDir: string;

  constructor(
    elevenLabsKey?: string,
    openAIKey?: string,
    outputDir: string = '/tmp/voices'
  ) {
    if (elevenLabsKey) {
      this.elevenlabs = new ElevenLabsProvider(elevenLabsKey);
    }
    if (openAIKey) {
      this.openai = new OpenAIProvider(openAIKey);
    }
    this.outputDir = outputDir;
  }

  async generateNarration(
    text: string,
    outputFilename: string,
    options?: {
      provider?: 'elevenlabs' | 'openai';
      voiceId?: string;  // ElevenLabs voice ID
      voice?: string;    // OpenAI voice name
    }
  ): Promise<{ path: string; cost: number }> {
    const outputPath = path.join(this.outputDir, outputFilename);
    const provider = options?.provider || 'elevenlabs';

    if (provider === 'elevenlabs' && this.elevenlabs) {
      return await this.elevenlabs.generateVoice(
        text,
        options?.voiceId || 'default-voice-id',
        outputPath,
        {
          stability: 0.5,
          similarityBoost: 0.8,
          model: 'eleven_multilingual_v2'
        }
      );
    } else if (provider === 'openai' && this.openai) {
      // OpenAI TTS (cheaper alternative)
      // Implementation here
      throw new Error('OpenAI TTS not yet implemented');
    }

    throw new Error('No voice provider configured');
  }

  async listAvailableVoices(): Promise<Array<{ id: string; name: string }>> {
    if (this.elevenlabs) {
      return await this.elevenlabs.listVoices();
    }
    return [];
  }
}
```

---

## 6. Content Caching

### Cache Strategy

**Why cache?**
- Avoid regenerating identical content
- Save API costs
- Faster iteration during development
- Version control for generated content

**Implementation:**

```typescript
// main/services/content-generation/ContentCache.ts
import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import os from 'os';

export class ContentCache {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(os.homedir(), 'ContentForge', 'content-cache.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS content_cache (
        hash TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        accessed_at INTEGER NOT NULL,
        access_count INTEGER DEFAULT 0
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cache_type ON content_cache(type);
      CREATE INDEX IF NOT EXISTS idx_cache_accessed ON content_cache(accessed_at DESC);
    `);
  }

  private hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  async get(type: string, prompt: string): Promise<any | null> {
    const hash = this.hashPrompt(prompt);
    const row = this.db.prepare(`
      SELECT content, metadata FROM content_cache WHERE hash = ? AND type = ?
    `).get(hash, type) as any;

    if (!row) return null;

    // Update access stats
    this.db.prepare(`
      UPDATE content_cache
      SET accessed_at = ?, access_count = access_count + 1
      WHERE hash = ?
    `).run(Date.now(), hash);

    return JSON.parse(row.content);
  }

  async set(type: string, prompt: string, content: any, metadata?: any): Promise<void> {
    const hash = this.hashPrompt(prompt);

    this.db.prepare(`
      INSERT OR REPLACE INTO content_cache
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      hash,
      type,
      prompt,
      JSON.stringify(content),
      metadata ? JSON.stringify(metadata) : null,
      Date.now(),
      Date.now(),
      0
    );
  }

  async clear(type?: string): Promise<number> {
    if (type) {
      const result = this.db.prepare('DELETE FROM content_cache WHERE type = ?').run(type);
      return result.changes;
    } else {
      const result = this.db.prepare('DELETE FROM content_cache').run();
      return result.changes;
    }
  }

  getStats(): {
    total: number;
    byType: Record<string, number>;
    totalCostSaved: number;
  } {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM content_cache').get() as any).count;

    const byType = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM content_cache
      GROUP BY type
    `).all() as any[];

    const typeStats: Record<string, number> = {};
    byType.forEach(row => {
      typeStats[row.type] = row.count;
    });

    // Rough estimate: $0.05 per cached item
    const totalCostSaved = total * 0.05;

    return { total, byType: typeStats, totalCostSaved };
  }
}
```

---

## 7. Rate Limiting & Cost Tracking

### Rate Limiter

```typescript
// main/services/content-generation/base/RateLimiter.ts
export class RateLimiter {
  private requests: number[] = [];
  private maxRequestsPerMinute: number;

  constructor(maxRequestsPerMinute: number) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove requests older than 1 minute
    this.requests = this.requests.filter(t => t > oneMinuteAgo);

    if (this.requests.length >= this.maxRequestsPerMinute) {
      // Wait until oldest request is 1 minute old
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest) + 100;  // +100ms buffer

      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot();  // Recursive check
    }

    // Add current request
    this.requests.push(now);
  }
}
```

### Cost Tracker

```typescript
// main/services/content-generation/base/CostTracker.ts
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export class CostTracker {
  private db: Database.Database;
  private provider: string;

  constructor(provider: string) {
    const dbPath = path.join(os.homedir(), 'ContentForge', 'costs.db');
    this.db = new Database(dbPath);
    this.provider = provider;
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        cost REAL NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
  }

  addCost(cost: number): void {
    this.db.prepare(`
      INSERT INTO api_costs (provider, cost, timestamp)
      VALUES (?, ?, ?)
    `).run(this.provider, cost, Date.now());
  }

  getStats(): { total: number; today: number; thisMonth: number } {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const total = (this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs WHERE provider = ?
    `).get(this.provider) as any).total || 0;

    const today = (this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, todayStart) as any).total || 0;

    const thisMonth = (this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, monthStart) as any).total || 0;

    return { total, today, thisMonth };
  }
}
```

---

## 8. Frontend Integration

### Settings Panel for API Keys

```typescript
// src/components/settings/APIKeysPanel.tsx
import React, { useState } from 'react';
import { config } from '../../lib/electron-bridge';

export function APIKeysPanel() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (openaiKey) {
      await config.setAPIKey('openai', openaiKey);
    }
    if (elevenLabsKey) {
      await config.setAPIKey('elevenlabs', elevenLabsKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="api-keys-panel">
      <h2>API Configuration</h2>

      <div className="key-input">
        <label>OpenAI API Key (GPT-4 + DALL-E)</label>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
        />
        <small>Used for script generation and image creation</small>
      </div>

      <div className="key-input">
        <label>ElevenLabs API Key</label>
        <input
          type="password"
          value={elevenLabsKey}
          onChange={(e) => setElevenLabsKey(e.target.value)}
          placeholder="..."
        />
        <small>Used for voice synthesis</small>
      </div>

      <button onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save API Keys'}
      </button>
    </div>
  );
}
```

---

## 9. Cost Optimization Strategies

### 1. **Use Caching Aggressively**
- Cache all generated content by prompt hash
- Reuse scripts/voices/images across similar videos
- Saves ~80% of API costs during iteration

### 2. **Cheaper Alternatives**
- GPT-4o instead of GPT-4 Turbo (50% cheaper)
- OpenAI TTS instead of ElevenLabs (90% cheaper)
- Stable Diffusion instead of DALL-E (free self-hosted)

### 3. **Batch Processing**
- Generate 50 scripts in one session
- Generate 50 voices in one session
- Amortize API overhead

### 4. **Smart Defaults**
- Lower quality for development/preview
- Higher quality only for final render
- Progressive enhancement

---

## 10. Implementation Timeline

### Week 1: Foundation
- [x] API key management (electron-store)
- [ ] Base provider architecture
- [ ] Rate limiter
- [ ] Cost tracker
- [ ] Content cache

### Week 2: Providers
- [ ] OpenAI provider (GPT-4 + DALL-E)
- [ ] ElevenLabs provider
- [ ] Provider tests
- [ ] Error handling

### Week 3: Services
- [ ] ScriptGenerator
- [ ] VoiceGenerator
- [ ] ImageGenerator
- [ ] Integration tests

### Week 4: Templates
- [ ] Horror Story template with AI
- [ ] Update lofi template with AI descriptions
- [ ] Template tests
- [ ] End-to-end workflow

---

## 11. Example: Full Horror Story Workflow

```typescript
// Example: Generate a complete horror story video

const scriptGen = new ScriptGenerator(openAIKey);
const voiceGen = new VoiceGenerator(elevenLabsKey, openAIKey);
const imageGen = new ImageGenerator(openAIKey);

// 1. Generate script
const story = await scriptGen.generateHorrorStory({
  duration: 600,  // 10 minutes
  theme: 'urban legend',
  setting: 'abandoned hospital'
});

// 2. Generate narration
const voice = await voiceGen.generateNarration(
  story.script,
  'horror-narration.mp3',
  { provider: 'elevenlabs', voiceId: 'deep-male-voice' }
);

// 3. Generate scene images
const images = await Promise.all(
  story.scenes.map((scene, i) =>
    imageGen.generate(scene, {
      style: 'dark cinematic horror',
      filename: `scene-${i}.png`
    })
  )
);

// 4. Queue video rendering
await batch.addJob({
  templateId: 'horror_story_v1',
  variables: {
    NARRATION_AUDIO: voice.path,
    SCENE_IMAGES: images.map(img => img.path),
    TITLE: story.title,
    BACKGROUND_MUSIC: '/music/horror-ambient.mp3'
  },
  outputPath: '/output/horror-story-001.mp4'
});

// Total cost: ~$0.15
// Time: ~5 minutes
// Result: Professional horror video ready for YouTube
```

---

## Summary

This integration strategy provides:

✅ **Secure API key management** (electron-store)
✅ **Rate limiting** (avoid API throttling)
✅ **Cost tracking** (monitor spending)
✅ **Content caching** (save 80% on costs)
✅ **Error handling** (retry with backoff)
✅ **Multi-provider support** (OpenAI, ElevenLabs, alternatives)
✅ **High-level services** (ScriptGenerator, VoiceGenerator, ImageGenerator)
✅ **Template integration** (horror stories, lofi, etc.)

**Next step**: Implement Week 1 (Foundation) to get the base infrastructure in place.

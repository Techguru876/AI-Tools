import { OpenAIProvider } from './providers/OpenAIProvider';
import { ContentCache } from './ContentCache';

/**
 * Script Generator
 * High-level service for generating video scripts using AI
 */
export class ScriptGenerator {
  private openai: OpenAIProvider;
  private cache: ContentCache;

  constructor(apiKey: string) {
    this.openai = new OpenAIProvider(apiKey);
    this.cache = new ContentCache();
  }

  /**
   * Generate horror story script
   */
  async generateHorrorStory(options: {
    duration: number;       // Target duration in seconds
    theme?: string;         // e.g., "psychological", "supernatural", "urban legend"
    setting?: string;       // e.g., "abandoned hospital", "dark forest"
    pov?: 'first' | 'third';
  }): Promise<{
    title: string;
    script: string;
    scenes: Array<{ description: string; timestamp: number }>;
    estimatedDuration: number;
    keywords: string[];
  }> {
    const wordCount = Math.floor(options.duration / 60 * 150);  // 150 words per minute
    const theme = options.theme || 'psychological horror';
    const setting = options.setting || 'modern day';
    const pov = options.pov || 'first';

    const prompt = `
Create a spine-chilling horror story script for a YouTube video narration.

Requirements:
- Word count: ~${wordCount} words (${Math.floor(options.duration / 60)} minutes)
- Theme: ${theme}
- Setting: ${setting}
- Point of view: ${pov} person
- Format: Engaging narration perfect for text-to-speech
- Style: Atmospheric, suspenseful, gripping

Output as JSON:
{
  "title": "Catchy title with emoji (e.g., '👻 The Whispers in Ward 13')",
  "script": "Full narration script with proper pacing...",
  "scenes": [
    {"description": "Visual scene description for AI image generation", "timestamp": 0},
    {"description": "Next scene...", "timestamp": 30}
  ],
  "keywords": ["horror", "scary", "creepy", ...]
}

Make it genuinely scary and atmospheric!
`.trim();

    // Check cache first
    const cached = await this.cache.get('horror_story', prompt);
    if (cached) {
      return { ...cached, estimatedDuration: options.duration };
    }

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.8,
      systemPrompt: 'You are a master horror storyteller. Create terrifying, atmospheric stories.',
    });

    const parsed = JSON.parse(result.text);

    // Cache the result
    await this.cache.set('horror_story', prompt, parsed, {
      costSaved: result.cost,
    });

    return {
      ...parsed,
      estimatedDuration: options.duration,
    };
  }

  /**
   * Generate lofi video description
   */
  async generateLofiDescription(options: {
    trackName?: string;
    mood?: string;
    tags?: string[];
  }): Promise<{
    title: string;
    description: string;
    tags: string[];
  }> {
    const trackName = options.trackName || 'Lofi Hip Hop Radio';
    const mood = options.mood || 'chill, relaxed, focused';

    const prompt = `
Create a YouTube video title and description for a lofi hip hop stream.

Track: ${trackName}
Mood: ${mood}
Existing tags: ${options.tags?.join(', ') || 'none'}

Output as JSON:
{
  "title": "Engaging title under 100 chars with emoji",
  "description": "SEO-optimized description under 5000 chars including:
    - Catchy intro paragraph
    - Benefits (study, relax, work, sleep)
    - Timestamps if applicable
    - Social media placeholders
    - Call to action
  ",
  "tags": ["lofi", "study music", ...]
}

Make it appealing and SEO-friendly!
`.trim();

    // Check cache
    const cached = await this.cache.get('lofi_description', prompt);
    if (cached) return cached;

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o-mini',  // Cheaper model for simpler task
      maxTokens: 1500,
      temperature: 0.7,
    });

    const parsed = JSON.parse(result.text);

    await this.cache.set('lofi_description', prompt, parsed, {
      costSaved: result.cost,
    });

    return parsed;
  }

  /**
   * Generate explainer video script
   */
  async generateExplainerScript(options: {
    topic: string;
    duration: number;
    targetAudience?: string;
    style?: 'casual' | 'professional' | 'educational';
  }): Promise<{
    title: string;
    script: string;
    keyPoints: string[];
    scenes: Array<{ description: string; timestamp: number }>;
  }> {
    const wordCount = Math.floor(options.duration / 60 * 140);  // Slightly slower pace
    const style = options.style || 'casual';
    const audience = options.targetAudience || 'general audience';

    const prompt = `
Create an explainer video script about: ${options.topic}

Requirements:
- Duration: ${Math.floor(options.duration / 60)} minutes (~${wordCount} words)
- Target audience: ${audience}
- Style: ${style}
- Format: Clear, concise narration
- Include key points and visual scene descriptions

Output as JSON:
{
  "title": "Clear, descriptive title with emoji",
  "script": "Full narration script...",
  "keyPoints": ["Point 1", "Point 2", ...],
  "scenes": [
    {"description": "Visual for this section", "timestamp": 0}
  ]
}
`.trim();

    const cached = await this.cache.get('explainer_script', prompt);
    if (cached) return cached;

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o',
      maxTokens: 2500,
      temperature: 0.6,
      systemPrompt: 'You are an expert educational content creator. Make complex topics simple.',
    });

    const parsed = JSON.parse(result.text);

    await this.cache.set('explainer_script', prompt, parsed, {
      costSaved: result.cost,
    });

    return parsed;
  }

  /**
   * Generate motivational quote script
   */
  async generateMotivationalScript(options: {
    theme?: string;
    count?: number;
  }): Promise<{
    title: string;
    quotes: Array<{ text: string; author?: string; scene: string }>;
  }> {
    const theme = options.theme || 'success, perseverance, growth';
    const count = options.count || 10;

    const prompt = `
Generate ${count} powerful motivational quotes about: ${theme}

Output as JSON:
{
  "title": "Video title with emoji",
  "quotes": [
    {
      "text": "The quote...",
      "author": "Author name or null",
      "scene": "Visual scene description for background image"
    }
  ]
}
`.trim();

    const cached = await this.cache.get('motivational_script', prompt);
    if (cached) return cached;

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o-mini',
      maxTokens: 1500,
      temperature: 0.7,
    });

    const parsed = JSON.parse(result.text);

    await this.cache.set('motivational_script', prompt, parsed, {
      costSaved: result.cost,
    });

    return parsed;
  }

  /**
   * Get cost statistics
   */
  getCostStats() {
    return this.openai.getCostStats();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  close() {
    this.openai.close();
    this.cache.close();
  }
}

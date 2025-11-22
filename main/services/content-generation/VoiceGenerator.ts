import { ElevenLabsProvider, type ElevenLabsVoice } from './providers/ElevenLabsProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

/**
 * Voice Generator
 * High-level service for generating narration and voice-overs
 */
export class VoiceGenerator {
  private elevenlabs?: ElevenLabsProvider;
  private openai?: OpenAIProvider;
  private outputDir: string;

  constructor(
    elevenLabsKey?: string,
    openAIKey?: string,
    outputDir?: string
  ) {
    if (elevenLabsKey) {
      this.elevenlabs = new ElevenLabsProvider(elevenLabsKey);
    }
    if (openAIKey) {
      this.openai = new OpenAIProvider(openAIKey);
    }

    this.outputDir = outputDir || path.join(os.homedir(), 'ContentForge', 'voices');
    this.ensureOutputDir();
  }

  private async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating voice output directory:', error);
    }
  }

  /**
   * Generate narration (auto-selects best provider)
   */
  async generateNarration(
    text: string,
    outputFilename: string,
    options?: {
      provider?: 'elevenlabs' | 'openai' | 'auto';
      voiceId?: string;           // ElevenLabs voice ID
      openAIVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      quality?: 'standard' | 'high';
    }
  ): Promise<{
    path: string;
    provider: string;
    characters: number;
    cost: number;
  }> {
    const outputPath = path.join(this.outputDir, outputFilename);
    let provider = options?.provider || 'auto';

    // Auto-select provider
    if (provider === 'auto') {
      provider = this.elevenlabs ? 'elevenlabs' : 'openai';
    }

    if (provider === 'elevenlabs' && this.elevenlabs) {
      const voiceId = options?.voiceId || await this.getDefaultVoiceId();

      const result = await this.elevenlabs.generateVoice(
        text,
        voiceId,
        outputPath,
        {
          stability: 0.5,
          similarityBoost: 0.75,
          model: options?.quality === 'high' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2',
        }
      );

      return {
        ...result,
        provider: 'elevenlabs',
      };
    } else if (provider === 'openai' && this.openai) {
      const voice = options?.openAIVoice || 'alloy';
      const model = options?.quality === 'high' ? 'tts-1-hd' : 'tts-1';

      const result = await this.openai.generateSpeech(text, outputPath, {
        voice,
        model,
      });

      return {
        ...result,
        provider: 'openai',
      };
    }

    throw new Error('No voice provider available');
  }

  /**
   * Generate long narration (splits into chunks if needed)
   */
  async generateLongNarration(
    text: string,
    outputFilename: string,
    options?: {
      provider?: 'elevenlabs' | 'openai';
      voiceId?: string;
      quality?: 'standard' | 'high';
      maxChunkLength?: number;
    }
  ): Promise<{
    path: string;
    provider: string;
    characters: number;
    cost: number;
    chunks: number;
  }> {
    const maxChunkLength = options?.maxChunkLength || 4500; // ElevenLabs limit is ~5000 chars

    // If text is short enough, generate directly
    if (text.length <= maxChunkLength) {
      const result = await this.generateNarration(text, outputFilename, options);
      return { ...result, chunks: 1 };
    }

    // Split into chunks (on sentence boundaries)
    const chunks = this.splitIntoChunks(text, maxChunkLength);

    // Generate each chunk
    const chunkFiles: string[] = [];
    let totalCost = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunkFilename = outputFilename.replace(/\.mp3$/, `_chunk${i}.mp3`);
      const result = await this.generateNarration(chunks[i], chunkFilename, options);
      chunkFiles.push(result.path);
      totalCost += result.cost;
    }

    // TODO: Merge chunks into single file using ffmpeg
    // For now, return the first chunk path
    const outputPath = path.join(this.outputDir, outputFilename);

    return {
      path: chunkFiles[0], // TODO: Return merged file
      provider: options?.provider || 'auto',
      characters: text.length,
      cost: totalCost,
      chunks: chunks.length,
    };
  }

  /**
   * Split text into chunks on sentence boundaries
   */
  private splitIntoChunks(text: string, maxLength: number): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * List available voices (ElevenLabs)
   */
  async listVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.elevenlabs) {
      return [];
    }

    return await this.elevenlabs.listVoices();
  }

  /**
   * Get default voice ID
   */
  private async getDefaultVoiceId(): Promise<string> {
    if (!this.elevenlabs) {
      throw new Error('ElevenLabs provider not initialized');
    }

    const voices = await this.elevenlabs.listVoices();

    // Find a suitable narration voice
    const narratorVoice = voices.find(v =>
      v.name.toLowerCase().includes('adam') || // Deep male voice
      v.name.toLowerCase().includes('antoni') // Calm male voice
    );

    return narratorVoice?.voice_id || voices[0]?.voice_id || 'default';
  }

  /**
   * Get cost statistics
   */
  getCostStats(provider: 'elevenlabs' | 'openai' | 'both' = 'both') {
    const stats: any = {};

    if (provider === 'both' || provider === 'elevenlabs') {
      if (this.elevenlabs) {
        stats.elevenlabs = this.elevenlabs.getCostStats();
      }
    }

    if (provider === 'both' || provider === 'openai') {
      if (this.openai) {
        stats.openai = this.openai.getCostStats();
      }
    }

    return stats;
  }

  close() {
    if (this.elevenlabs) this.elevenlabs.close();
    if (this.openai) this.openai.close();
  }
}

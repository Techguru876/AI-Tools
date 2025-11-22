import { OpenAIProvider } from './providers/OpenAIProvider';
import { ContentCache } from './ContentCache';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

/**
 * Image Generator
 * High-level service for generating images with AI
 */
export class ImageGenerator {
  private openai: OpenAIProvider;
  private cache: ContentCache;
  private outputDir: string;

  constructor(apiKey: string, outputDir?: string) {
    this.openai = new OpenAIProvider(apiKey);
    this.cache = new ContentCache();
    this.outputDir = outputDir || path.join(os.homedir(), 'ContentForge', 'images');
    this.ensureOutputDir();
  }

  private async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating image output directory:', error);
    }
  }

  /**
   * Generate image from prompt
   */
  async generate(prompt: string, options?: {
    filename?: string;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: string;  // Additional style descriptor
  }): Promise<{
    url: string;
    path: string;
    cost: number;
  }> {
    const filename = options?.filename || `image_${Date.now()}.png`;
    const outputPath = path.join(this.outputDir, filename);

    // Enhance prompt with style if provided
    let enhancedPrompt = prompt;
    if (options?.style) {
      enhancedPrompt = `${prompt}, ${options.style}`;
    }

    // Check cache
    const cacheKey = `${enhancedPrompt}_${options?.size}_${options?.quality}`;
    const cached = await this.cache.get('image_generation', cacheKey);

    if (cached && cached.path) {
      // Check if cached file still exists
      try {
        await fs.access(cached.path);
        return cached;
      } catch {
        // Cached file doesn't exist, regenerate
      }
    }

    const result = await this.openai.generateImage(enhancedPrompt, {
      size: options?.size || '1024x1024',
      quality: options?.quality || 'standard',
      outputPath,
    });

    const response = {
      url: result.url,
      path: outputPath,
      cost: result.cost,
    };

    // Cache the result
    await this.cache.set('image_generation', cacheKey, response, {
      costSaved: result.cost,
    });

    return response;
  }

  /**
   * Generate horror scene image
   */
  async generateHorrorScene(sceneDescription: string, options?: {
    filename?: string;
    intensity?: 'subtle' | 'moderate' | 'extreme';
  }): Promise<{
    url: string;
    path: string;
    cost: number;
  }> {
    const intensity = options?.intensity || 'moderate';

    const styleMap = {
      subtle: 'dark atmospheric, subtle horror, eerie lighting, cinematic',
      moderate: 'dark horror, ominous atmosphere, dramatic shadows, unsettling',
      extreme: 'intense horror, terrifying, nightmarish, extremely dark and disturbing',
    };

    const style = styleMap[intensity];

    return this.generate(sceneDescription, {
      filename: options?.filename,
      size: '1792x1024', // Widescreen for video
      quality: 'hd',
      style,
    });
  }

  /**
   * Generate lofi background image
   */
  async generateLofiBackground(description: string, options?: {
    filename?: string;
    mood?: 'chill' | 'cozy' | 'dreamy' | 'nostalgic';
  }): Promise<{
    url: string;
    path: string;
    cost: number;
  }> {
    const mood = options?.mood || 'chill';

    const styleMap = {
      chill: 'lofi aesthetic, anime style, soft colors, relaxing atmosphere',
      cozy: 'cozy lofi scene, warm lighting, comfortable, intimate',
      dreamy: 'dreamy lofi aesthetic, soft focus, pastel colors, ethereal',
      nostalgic: 'nostalgic lofi vibe, retro aesthetic, warm tones, vintage feel',
    };

    const style = styleMap[mood];

    return this.generate(description, {
      filename: options?.filename,
      size: '1024x1024', // Square for lofi streams
      quality: 'hd',
      style,
    });
  }

  /**
   * Generate motivational quote background
   */
  async generateMotivationalBackground(theme: string, options?: {
    filename?: string;
  }): Promise<{
    url: string;
    path: string;
    cost: number;
  }> {
    const style = 'inspirational, uplifting, vibrant colors, professional, modern design';

    return this.generate(theme, {
      filename: options?.filename,
      size: '1024x1024',
      quality: 'standard', // Standard quality is fine for backgrounds
      style,
    });
  }

  /**
   * Generate multiple images in batch
   */
  async generateBatch(prompts: Array<{
    prompt: string;
    filename?: string;
    style?: string;
  }>): Promise<Array<{
    url: string;
    path: string;
    cost: number;
  }>> {
    const results = [];

    for (const item of prompts) {
      const result = await this.generate(item.prompt, {
        filename: item.filename,
        style: item.style,
      });
      results.push(result);
    }

    return results;
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

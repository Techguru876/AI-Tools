import OpenAI from 'openai';
import { BaseProvider } from '../base/BaseProvider';
import fs from 'fs/promises';
import axios from 'axios';

/**
 * OpenAI Provider
 * Wrapper for OpenAI API (GPT-4, DALL-E, TTS)
 */
export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey, 60);  // 60 requests per minute
    this.client = new OpenAI({ apiKey });
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  /**
   * Generate text with GPT-4
   */
  async generateText(prompt: string, options?: {
    model?: 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini';
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }): Promise<{
    text: string;
    tokens: number;
    cost: number;
  }> {
    const model = options?.model || 'gpt-4o';
    const maxTokens = options?.maxTokens || 2000;
    const temperature = options?.temperature || 0.7;

    // Cost estimation (per 1K tokens)
    const costMap: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    };

    const estimatedCost = 0.05; // Rough estimate

    return this.makeRequest(async () => {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];

      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      });

      const text = response.choices[0].message.content || '';
      const tokens = response.usage?.total_tokens || 0;

      // Calculate actual cost
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const inputCost = (inputTokens / 1000) * costMap[model].input;
      const outputCost = (outputTokens / 1000) * costMap[model].output;
      const cost = inputCost + outputCost;

      return { text, tokens, cost };
    }, estimatedCost, 'text-generation');
  }

  /**
   * Generate image with DALL-E 3
   */
  async generateImage(prompt: string, options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    outputPath?: string;
  }): Promise<{
    url: string;
    localPath?: string;
    cost: number;
  }> {
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
        n: 1,
      });

      if (!response.data || !response.data[0]?.url) {
        throw new Error('No image URL returned from DALL-E');
      }

      const url = response.data[0].url;

      // Download image if output path specified
      let localPath: string | undefined;
      if (options?.outputPath) {
        const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.writeFile(options.outputPath, Buffer.from(imageResponse.data));
        localPath = options.outputPath;
      }

      return {
        url,
        localPath,
        cost: estimatedCost,
      };
    }, estimatedCost, 'image-generation');
  }

  /**
   * Generate speech with TTS
   */
  async generateSpeech(text: string, outputPath: string, options?: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
  }): Promise<{
    path: string;
    characters: number;
    cost: number;
  }> {
    const voice = options?.voice || 'alloy';
    const model = options?.model || 'tts-1';

    // TTS pricing ($15 per 1M characters for tts-1, $30 for tts-1-hd)
    const costPerChar = model === 'tts-1' ? 0.000015 : 0.00003;
    const characters = text.length;
    const estimatedCost = characters * costPerChar;

    return this.makeRequest(async () => {
      const mp3 = await this.client.audio.speech.create({
        model,
        voice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.writeFile(outputPath, buffer);

      return {
        path: outputPath,
        characters,
        cost: estimatedCost,
      };
    }, estimatedCost, 'speech-generation');
  }

  /**
   * Validate API key
   */
  async validateAPIKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database';
import { AppError } from '../api/middleware/errorHandler';
import { logger } from '../utils/logger';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ContentGenerationOptions {
  brandId: string;
  prompt?: string;
  platform?: string;
  contentType?: 'post' | 'caption' | 'hashtags' | 'video-script';
  tone?: string;
  context?: any;
  length?: 'short' | 'medium' | 'long';
}

interface HashtagGenerationOptions {
  topic: string;
  brandId: string;
  count?: number;
}

interface ImageGenerationOptions {
  prompt: string;
  brandId: string;
  style?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  provider?: 'dalle' | 'leonardo' | 'midjourney';
}

interface VideoScriptOptions {
  topic: string;
  brandId: string;
  duration: number; // seconds
  tone?: string;
  includeNarration?: boolean;
}

export class AIService {
  /**
   * Get brand context for AI generation
   */
  private static async getBrandContext(brandId: string) {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        name: true,
        description: true,
        tone: true,
        style: true,
        targetAudience: true,
        keywords: true,
        hashtags: true,
        brandGuidelines: true,
        companyData: true,
      },
    });

    if (!brand) {
      throw new AppError('Brand not found', 404);
    }

    return brand;
  }

  /**
   * Build system prompt with brand context
   */
  private static buildSystemPrompt(brand: any, contentType: string): string {
    const basePrompt = `You are an expert social media content creator for ${brand.name}.`;

    const brandContext = `
Brand Information:
- Name: ${brand.name}
- Description: ${brand.description || 'Not provided'}
- Tone: ${brand.tone || 'professional and friendly'}
- Style: ${brand.style || 'engaging and informative'}
- Target Audience: ${JSON.stringify(brand.targetAudience) || 'general audience'}
- Keywords: ${brand.keywords?.join(', ') || 'None'}
- Brand Guidelines: ${brand.brandGuidelines || 'None'}
`;

    const instructions = {
      post: 'Create engaging social media post content that resonates with the target audience.',
      caption: 'Write compelling captions that drive engagement and align with brand voice.',
      hashtags: 'Generate relevant, trending hashtags that increase discoverability.',
      'video-script': 'Write engaging video scripts with clear narration and visual cues.',
    };

    return `${basePrompt}\n\n${brandContext}\n\nTask: ${instructions[contentType as keyof typeof instructions]}`;
  }

  /**
   * Generate content using Claude
   */
  static async generateContentWithClaude(options: ContentGenerationOptions) {
    try {
      const brand = await this.getBrandContext(options.brandId);
      const systemPrompt = this.buildSystemPrompt(brand, options.contentType || 'post');

      const userPrompt = options.prompt || `Create a ${options.contentType} for ${options.platform || 'social media'}.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return {
          content: content.text,
          model: 'claude-3-5-sonnet',
          tokens: message.usage.input_tokens + message.usage.output_tokens,
        };
      }

      throw new AppError('Unexpected response format', 500);
    } catch (error) {
      logger.error('Claude content generation error:', error);
      throw new AppError('Failed to generate content with Claude', 500);
    }
  }

  /**
   * Generate content using GPT-4
   */
  static async generateContentWithGPT(options: ContentGenerationOptions) {
    try {
      const brand = await this.getBrandContext(options.brandId);
      const systemPrompt = this.buildSystemPrompt(brand, options.contentType || 'post');

      const userPrompt = options.prompt || `Create a ${options.contentType} for ${options.platform || 'social media'}.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return {
        content: completion.choices[0].message.content,
        model: 'gpt-4-turbo',
        tokens: completion.usage?.total_tokens || 0,
      };
    } catch (error) {
      logger.error('GPT content generation error:', error);
      throw new AppError('Failed to generate content with GPT', 500);
    }
  }

  /**
   * Generate hashtags
   */
  static async generateHashtags(options: HashtagGenerationOptions) {
    try {
      const brand = await this.getBrandContext(options.brandId);
      const count = options.count || 10;

      const prompt = `Generate ${count} relevant, trending hashtags for a post about "${options.topic}"
      for ${brand.name}. Include a mix of popular, niche, and branded hashtags.

      Return only the hashtags, one per line, without the # symbol.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      const content = completion.choices[0].message.content || '';
      const hashtags = content
        .split('\n')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter((tag) => tag.length > 0)
        .map((tag) => `#${tag}`);

      return {
        hashtags: hashtags.slice(0, count),
        model: 'gpt-4-turbo',
      };
    } catch (error) {
      logger.error('Hashtag generation error:', error);
      throw new AppError('Failed to generate hashtags', 500);
    }
  }

  /**
   * Generate image with DALL-E
   */
  static async generateImageWithDALLE(options: ImageGenerationOptions) {
    try {
      const brand = await this.getBrandContext(options.brandId);

      // Enhance prompt with brand context
      const enhancedPrompt = `${options.prompt}. Style: ${brand.style || 'professional'}.
      ${options.style ? `Additional style: ${options.style}` : ''}`;

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: 'hd',
      });

      return {
        url: response.data[0].url,
        revisedPrompt: response.data[0].revised_prompt,
        provider: 'dalle',
      };
    } catch (error) {
      logger.error('DALL-E image generation error:', error);
      throw new AppError('Failed to generate image with DALL-E', 500);
    }
  }

  /**
   * Generate video script with narration
   */
  static async generateVideoScript(options: VideoScriptOptions) {
    try {
      const brand = await this.getBrandContext(options.brandId);

      const prompt = `Create a ${options.duration}-second video script about "${options.topic}"
      for ${brand.name}.

      Brand tone: ${brand.tone || 'professional and friendly'}
      Target audience: ${JSON.stringify(brand.targetAudience) || 'general audience'}

      Format the script as:
      [TIMESTAMP] - VISUAL: [what to show]
      NARRATION: [what to say]

      ${options.includeNarration ? 'Include detailed narration that can be used with text-to-speech.' : 'Keep narration concise.'}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const script = completion.choices[0].message.content || '';

      return {
        script,
        duration: options.duration,
        model: 'gpt-4-turbo',
      };
    } catch (error) {
      logger.error('Video script generation error:', error);
      throw new AppError('Failed to generate video script', 500);
    }
  }

  /**
   * Analyze content sentiment
   */
  static async analyzeSentiment(text: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment of this text and respond with only one word: positive, negative, or neutral.\n\nText: "${text}"`,
          },
        ],
        max_tokens: 10,
        temperature: 0,
      });

      return completion.choices[0].message.content?.toLowerCase().trim() || 'neutral';
    } catch (error) {
      logger.error('Sentiment analysis error:', error);
      return 'neutral';
    }
  }

  /**
   * Generate post ideas based on trending topics
   */
  static async generatePostIdeas(brandId: string, count: number = 5) {
    try {
      const brand = await this.getBrandContext(brandId);

      const prompt = `Generate ${count} creative social media post ideas for ${brand.name}.

      Brand description: ${brand.description}
      Target audience: ${JSON.stringify(brand.targetAudience)}
      Keywords: ${brand.keywords?.join(', ')}

      For each idea, provide:
      1. Post concept (1 sentence)
      2. Suggested platform(s)
      3. Suggested hashtags (3-5)

      Format as JSON array.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      });

      const content = completion.choices[0].message.content || '[]';

      // Try to parse JSON, fallback to text if it fails
      try {
        return {
          ideas: JSON.parse(content),
          model: 'gpt-4-turbo',
        };
      } catch {
        return {
          ideas: [{ concept: content, platform: ['Instagram'], hashtags: [] }],
          model: 'gpt-4-turbo',
        };
      }
    } catch (error) {
      logger.error('Post ideas generation error:', error);
      throw new AppError('Failed to generate post ideas', 500);
    }
  }

  /**
   * Optimize content for specific platform
   */
  static async optimizeForPlatform(
    content: string,
    platform: string,
    brandId: string
  ) {
    try {
      const brand = await this.getBrandContext(brandId);

      const platformGuidelines = {
        INSTAGRAM: 'Instagram: Use emojis, max 2,200 characters, strong visual focus',
        FACEBOOK: 'Facebook: Conversational tone, max 63,206 characters, link-friendly',
        LINKEDIN: 'LinkedIn: Professional tone, max 3,000 characters, value-driven',
        TWITTER: 'Twitter: Concise, max 280 characters, use hashtags strategically',
        TIKTOK: 'TikTok: Casual, trendy, max 2,200 characters, use trending sounds/hashtags',
      };

      const guideline = platformGuidelines[platform as keyof typeof platformGuidelines] || platformGuidelines.INSTAGRAM;

      const prompt = `Optimize this social media content for ${platform}:

Original content: "${content}"

Platform guidelines: ${guideline}
Brand tone: ${brand.tone}

Return the optimized content only.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        optimizedContent: completion.choices[0].message.content,
        platform,
        model: 'gpt-4-turbo',
      };
    } catch (error) {
      logger.error('Content optimization error:', error);
      throw new AppError('Failed to optimize content', 500);
    }
  }
}

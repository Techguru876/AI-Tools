import { OpenAIProvider } from '../content-generation/providers/OpenAIProvider';
import { ContentCache } from '../content-generation/ContentCache';

/**
 * YouTube Metadata Generator
 * Generates SEO-optimized titles, descriptions, and tags
 */
export class MetadataGenerator {
  private openai: OpenAIProvider;
  private cache: ContentCache;

  constructor(apiKey: string) {
    this.openai = new OpenAIProvider(apiKey);
    this.cache = new ContentCache();
  }

  /**
   * Generate optimized title
   */
  async generateTitle(options: {
    niche: string;
    topic: string;
    style?: 'clickbait' | 'professional' | 'casual';
    maxLength?: number;
  }): Promise<string> {
    const style = options.style || 'professional';
    const maxLength = options.maxLength || 100;

    const prompt = `
Create an SEO-optimized YouTube video title.

Niche: ${options.niche}
Topic: ${options.topic}
Style: ${style}
Max length: ${maxLength} characters

Requirements:
- Attention-grabbing
- SEO keyword-rich
- Clear and descriptive
- Include relevant emoji if appropriate
- Under ${maxLength} characters

Output only the title, no explanation.
`.trim();

    const cached = await this.cache.get('youtube_title', prompt);
    if (cached) return cached;

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o-mini',
      maxTokens: 50,
      temperature: 0.7,
    });

    const title = result.text.trim().replace(/^["']|["']$/g, ''); // Remove quotes

    await this.cache.set('youtube_title', prompt, title, {
      costSaved: result.cost,
    });

    return title;
  }

  /**
   * Generate optimized description
   */
  async generateDescription(options: {
    niche: string;
    topic: string;
    script?: string;
    duration?: number;
    keywords?: string[];
  }): Promise<string> {
    const prompt = `
Create an SEO-optimized YouTube video description.

Niche: ${options.niche}
Topic: ${options.topic}
${options.script ? `Script summary: ${options.script.substring(0, 500)}...` : ''}
Duration: ${options.duration ? `${Math.floor(options.duration / 60)} minutes` : 'N/A'}
Keywords: ${options.keywords?.join(', ') || 'N/A'}

Requirements:
- Engaging opening paragraph (hook viewers)
- Detailed description of content
- SEO keywords naturally incorporated
- Include timestamps if duration > 5 min
- Call to action (like, subscribe, comment)
- Social media links placeholders
- Hashtags
- Under 5000 characters

Format:
[Opening hook]

[Main description with timestamps]

[Call to action]

🔔 Subscribe: [CHANNEL_LINK]
📱 Instagram: [INSTAGRAM_LINK]
🐦 Twitter: [TWITTER_LINK]

#hashtag1 #hashtag2 #hashtag3
`.trim();

    const cached = await this.cache.get('youtube_description', prompt);
    if (cached) return cached;

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o',
      maxTokens: 1500,
      temperature: 0.7,
    });

    const description = result.text.trim();

    await this.cache.set('youtube_description', prompt, description, {
      costSaved: result.cost,
    });

    return description;
  }

  /**
   * Generate tags
   */
  async generateTags(options: {
    niche: string;
    topic: string;
    title?: string;
    maxTags?: number;
  }): Promise<string[]> {
    const maxTags = options.maxTags || 30;

    const prompt = `
Generate SEO-optimized YouTube tags.

Niche: ${options.niche}
Topic: ${options.topic}
${options.title ? `Title: ${options.title}` : ''}

Requirements:
- Mix of broad and specific tags
- Include long-tail keywords
- Relevant to content
- Max ${maxTags} tags
- Each tag under 30 characters

Output as JSON array: ["tag1", "tag2", ...]
`.trim();

    const cached = await this.cache.get('youtube_tags', prompt);
    if (cached) return cached;

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.6,
    });

    const tags = JSON.parse(result.text);

    await this.cache.set('youtube_tags', prompt, tags, {
      costSaved: result.cost,
    });

    return tags;
  }

  /**
   * Generate complete metadata package
   */
  async generateFullMetadata(options: {
    niche: string;
    topic: string;
    script?: string;
    duration?: number;
    style?: 'clickbait' | 'professional' | 'casual';
  }): Promise<{
    title: string;
    description: string;
    tags: string[];
  }> {
    // Generate all in parallel
    const [title, tags] = await Promise.all([
      this.generateTitle({
        niche: options.niche,
        topic: options.topic,
        style: options.style,
      }),
      this.generateTags({
        niche: options.niche,
        topic: options.topic,
      }),
    ]);

    // Generate description with title context
    const description = await this.generateDescription({
      niche: options.niche,
      topic: options.topic,
      script: options.script,
      duration: options.duration,
      keywords: tags.slice(0, 10),
    });

    return { title, description, tags };
  }

  /**
   * Optimize existing metadata
   */
  async optimizeMetadata(existing: {
    title: string;
    description: string;
    tags: string[];
  }): Promise<{
    title: string;
    description: string;
    tags: string[];
    improvements: string[];
  }> {
    const prompt = `
Analyze and improve this YouTube metadata for better SEO and engagement:

Current Title: ${existing.title}
Current Description: ${existing.description}
Current Tags: ${existing.tags.join(', ')}

Provide:
1. Improved title (if needed)
2. Improved description (if needed)
3. Improved tags (if needed)
4. List of specific improvements made

Output as JSON:
{
  "title": "improved title",
  "description": "improved description",
  "tags": ["tag1", "tag2"],
  "improvements": ["improvement 1", "improvement 2"]
}
`.trim();

    const result = await this.openai.generateText(prompt, {
      model: 'gpt-4o',
      maxTokens: 2000,
      temperature: 0.6,
      systemPrompt: 'You are a YouTube SEO expert. Optimize metadata for maximum visibility and engagement.',
    });

    return JSON.parse(result.text);
  }

  getCostStats() {
    return this.openai.getCostStats();
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  close() {
    this.openai.close();
    this.cache.close();
  }
}

/**
 * Content Generation Tools for Blog Management Agent
 * 
 * These tools wrap existing content generation functions and add new capabilities
 * for the AI agent to create and optimize blog content.
 */

import { ai, z } from '../genkit'
import { generateArticle as generateArticleCore, type GenerateArticleInput } from '../content-generator'
import { SYSTEM_PROMPTS, CONTENT_PROMPTS } from '../prompts'
import type { ContentType } from '@prisma/client'

// ============================================
// Generate Article Tool
// ============================================

export const generateArticleTool = ai.defineTool(
    {
        name: 'generateArticle',
        description: 'Generate a complete blog article using AI. This wraps the existing content generation system and produces full articles with SEO metadata.',
        inputSchema: z.object({
            type: z.enum(['ARTICLE', 'REVIEW', 'COMPARISON', 'GUIDE', 'NEWS', 'AI_NEWS', 'ROUNDUP'])
                .describe('Type of content to generate'),
            topic: z.string()
                .describe('The main topic or subject for the article'),
            additionalContext: z.string().optional()
                .describe('Extra context or requirements for the article'),
            specifications: z.string().optional()
                .describe('Product specifications (for reviews)'),
            difficulty: z.string().optional()
                .describe('Difficulty level (for how-to guides)'),
            priceRange: z.string().optional()
                .describe('Price range focus (for buying guides)'),
            product1: z.string().optional()
                .describe('First product (for comparisons)'),
            product2: z.string().optional()
                .describe('Second product (for comparisons)'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            title: z.string().optional(),
            content: z.string().optional(),
            excerpt: z.string().optional(),
            slug: z.string().optional(),
            keywords: z.array(z.string()).optional(),
            metaDescription: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        try {
            const result = await generateArticleCore({
                type: input.type as ContentType,
                topic: input.topic,
                additionalContext: input.additionalContext,
                specifications: input.specifications,
                difficulty: input.difficulty,
                priceRange: input.priceRange,
                product1: input.product1,
                product2: input.product2,
                aiProvider: 'openai', // Use existing OpenAI integration
            })

            return {
                success: true,
                title: result.title,
                content: result.content,
                excerpt: result.excerpt,
                slug: result.slug,
                keywords: result.keywords,
                metaDescription: result.metaDescription,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during article generation',
            }
        }
    }
)

// ============================================
// Generate with Gemini Tool (Direct Genkit)
// ============================================

export const generateWithGeminiTool = ai.defineTool(
    {
        name: 'generateWithGemini',
        description: 'Generate content directly using Gemini via Genkit. Use this for custom prompts or when you need more control over generation.',
        inputSchema: z.object({
            prompt: z.string()
                .describe('The full prompt for content generation'),
            systemPrompt: z.string().optional()
                .describe('Optional system prompt to set context'),
            temperature: z.number().min(0).max(1).default(0.7)
                .describe('Creativity level (0=deterministic, 1=creative)'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            content: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        try {
            const messages = []

            if (input.systemPrompt) {
                messages.push({ role: 'system' as const, content: input.systemPrompt })
            }
            messages.push({ role: 'user' as const, content: input.prompt })

            const { text } = await ai.generate({
                prompt: input.prompt,
                config: {
                    temperature: input.temperature,
                },
            })

            return {
                success: true,
                content: text,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
)

// ============================================
// Suggest Topics Tool
// ============================================

export const suggestTopicsTool = ai.defineTool(
    {
        name: 'suggestTopics',
        description: 'Generate topic suggestions for new articles based on category and current trends.',
        inputSchema: z.object({
            category: z.string()
                .describe('The category to suggest topics for (e.g., "smartphones", "ai", "gaming")'),
            contentType: z.enum(['NEWS', 'AI_NEWS', 'REVIEW', 'GUIDE', 'COMPARISON', 'ROUNDUP'])
                .describe('Type of content to suggest topics for'),
            count: z.number().min(1).max(10).default(5)
                .describe('Number of topics to suggest'),
            avoidTopics: z.array(z.string()).optional()
                .describe('Topics to avoid (e.g., recently covered subjects)'),
        }),
        outputSchema: z.object({
            topics: z.array(z.object({
                title: z.string(),
                description: z.string(),
                relevanceScore: z.number().min(1).max(10),
            })),
        }),
    },
    async (input) => {
        const avoidList = input.avoidTopics?.length
            ? `\nAvoid these topics as they've been recently covered:\n${input.avoidTopics.map(t => `- ${t}`).join('\n')}`
            : ''

        const prompt = `You are a senior tech editor at a leading technology publication. Suggest ${input.count} compelling article topics for the "${input.category}" category.

Content type: ${input.contentType}
${avoidList}

For each topic, provide:
1. A specific, engaging title (not generic)
2. A brief description of what the article should cover
3. A relevance score from 1-10 based on current industry trends and reader interest

Focus on topics that are:
- Timely and newsworthy (late 2025/early 2026)
- Specific rather than generic
- Interesting to tech enthusiasts
- Not overdone by competitors

Respond in JSON format:
{
  "topics": [
    {
      "title": "Specific Article Title Here",
      "description": "What this article should cover...",
      "relevanceScore": 8
    }
  ]
}`

        const { text } = await ai.generate({ prompt })

        try {
            // Parse the JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                return { topics: [] }
            }
            const parsed = JSON.parse(jsonMatch[0])
            return { topics: parsed.topics || [] }
        } catch {
            return { topics: [] }
        }
    }
)

// ============================================
// Analyze Content Quality Tool
// ============================================

export const analyzeContentQualityTool = ai.defineTool(
    {
        name: 'analyzeContentQuality',
        description: 'Analyze an article for quality, SEO optimization, and suggest improvements.',
        inputSchema: z.object({
            content: z.string()
                .describe('The article content to analyze'),
            title: z.string().optional()
                .describe('The article title'),
        }),
        outputSchema: z.object({
            overallScore: z.number().min(1).max(10),
            seoScore: z.number().min(1).max(10),
            readabilityScore: z.number().min(1).max(10),
            suggestions: z.array(z.string()),
            wordCount: z.number(),
            estimatedReadTime: z.number().describe('Estimated reading time in minutes'),
        }),
    },
    async (input) => {
        const wordCount = input.content.split(/\s+/).length
        const estimatedReadTime = Math.ceil(wordCount / 200) // ~200 wpm reading speed

        const prompt = `Analyze this tech article for quality and provide improvement suggestions.

${input.title ? `Title: ${input.title}` : ''}

Content (first 2000 chars):
${input.content.slice(0, 2000)}...

Provide scores from 1-10 for:
1. Overall quality (writing, depth, accuracy)
2. SEO optimization (keywords, structure, meta-friendliness)
3. Readability (clarity, flow, engagement)

Also provide 3-5 specific, actionable suggestions for improvement.

Respond in JSON:
{
  "overallScore": 7,
  "seoScore": 6,
  "readabilityScore": 8,
  "suggestions": ["Suggestion 1", "Suggestion 2", ...]
}`

        const { text } = await ai.generate({ prompt })

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                return {
                    overallScore: 5,
                    seoScore: 5,
                    readabilityScore: 5,
                    suggestions: [],
                    wordCount,
                    estimatedReadTime,
                }
            }
            const parsed = JSON.parse(jsonMatch[0])
            return {
                overallScore: parsed.overallScore || 5,
                seoScore: parsed.seoScore || 5,
                readabilityScore: parsed.readabilityScore || 5,
                suggestions: parsed.suggestions || [],
                wordCount,
                estimatedReadTime,
            }
        } catch {
            return {
                overallScore: 5,
                seoScore: 5,
                readabilityScore: 5,
                suggestions: [],
                wordCount,
                estimatedReadTime,
            }
        }
    }
)

// Export all content tools
export const contentTools = [
    generateArticleTool,
    generateWithGeminiTool,
    suggestTopicsTool,
    analyzeContentQualityTool,
]

/**
 * AI Image Generation Tools
 * 
 * Tools for generating images with DALL-E 3 and Midjourney.
 */

import { ai, z } from '../genkit'
import OpenAI from 'openai'

// OpenAI client for DALL-E
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// ============================================
// Generate Image with DALL-E Tool
// ============================================

export const generateImageWithDalleTool = ai.defineTool(
    {
        name: 'generateImageWithDalle',
        description: 'Generate a unique image using DALL-E 3. Best for creating original visuals for articles.',
        inputSchema: z.object({
            prompt: z.string()
                .describe('Detailed prompt describing the image to generate'),
            style: z.enum(['natural', 'vivid']).default('natural')
                .describe('Image style: natural (realistic) or vivid (dramatic)'),
            size: z.enum(['1024x1024', '1792x1024', '1024x1792']).default('1792x1024')
                .describe('Image dimensions'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            imageUrl: z.string().optional(),
            revisedPrompt: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        try {
            if (!process.env.OPENAI_API_KEY) {
                return { success: false, error: 'OPENAI_API_KEY not configured' }
            }

            const response = await openai.images.generate({
                model: 'dall-e-3',
                prompt: input.prompt,
                n: 1,
                size: input.size,
                style: input.style,
                quality: 'hd',
            })

            const image = response.data[0]

            return {
                success: true,
                imageUrl: image.url,
                revisedPrompt: image.revised_prompt,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'DALL-E generation failed',
            }
        }
    }
)

// ============================================
// Generate Image with Midjourney Tool
// ============================================

export const generateImageWithMidjourneyTool = ai.defineTool(
    {
        name: 'generateImageWithMidjourney',
        description: 'Generate an artistic image using Midjourney. Best for stylized, creative visuals.',
        inputSchema: z.object({
            prompt: z.string()
                .describe('Detailed prompt for Midjourney'),
            aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).default('16:9')
                .describe('Aspect ratio for the image'),
            style: z.string().optional()
                .describe('Optional style modifiers (e.g., "cinematic", "minimalist")'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            imageUrl: z.string().optional(),
            jobId: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        try {
            const apiKey = process.env.MIDJOURNEY_API_KEY
            if (!apiKey) {
                return { success: false, error: 'MIDJOURNEY_API_KEY not configured' }
            }

            // Midjourney direct API endpoint
            // Note: Adjust based on the actual API provider you're using
            const fullPrompt = input.style
                ? `${input.prompt}, ${input.style} --ar ${input.aspectRatio}`
                : `${input.prompt} --ar ${input.aspectRatio}`

            const response = await fetch('https://api.midjourney.com/v1/imagine', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                return { success: false, error: `Midjourney API error: ${errorText}` }
            }

            const data = await response.json()

            // Note: Midjourney may return a job ID that requires polling
            // This is a simplified version - actual implementation may need
            // to poll for completion
            return {
                success: true,
                imageUrl: data.imageUrl || data.uri,
                jobId: data.jobId || data.id,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Midjourney generation failed',
            }
        }
    }
)

// ============================================
// Generate Article Visual Tool
// ============================================

export const generateArticleVisualTool = ai.defineTool(
    {
        name: 'generateArticleVisual',
        description: 'Generate an appropriate visual for an article. Automatically creates a prompt based on article content and selects the best generation method.',
        inputSchema: z.object({
            title: z.string().describe('Article title'),
            category: z.string().describe('Article category'),
            excerpt: z.string().optional().describe('Article excerpt or summary'),
            preferredStyle: z.enum(['photo-realistic', 'artistic', 'tech-illustration', 'auto']).default('auto')
                .describe('Preferred visual style'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            imageUrl: z.string().optional(),
            generationMethod: z.string().optional(),
            prompt: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        try {
            // Generate an optimized image prompt using AI
            const { text: promptResponse } = await ai.generate({
                prompt: `Create a DALL-E image prompt for a tech article visual.

Article Title: ${input.title}
Category: ${input.category}
${input.excerpt ? `Excerpt: ${input.excerpt}` : ''}
Preferred Style: ${input.preferredStyle}

Requirements:
- Must be suitable for a professional tech blog header image
- Should be visually striking and modern
- Avoid text/words in the image
- Focus on abstract tech concepts or product imagery
- 16:9 aspect ratio composition

Respond with ONLY the image prompt, no explanation.`,
                config: { temperature: 0.7 },
            })

            const imagePrompt = promptResponse.trim()

            // Determine which generator to use
            const style = input.preferredStyle === 'auto'
                ? (input.category === 'AI_NEWS' ? 'artistic' : 'photo-realistic')
                : input.preferredStyle

            // Use DALL-E for image generation
            if (!process.env.OPENAI_API_KEY) {
                return {
                    success: false,
                    error: 'OPENAI_API_KEY not configured',
                    prompt: imagePrompt,
                }
            }

            const dalleResult = await generateImageWithDalleTool({
                prompt: imagePrompt,
                style: style === 'artistic' ? 'vivid' : 'natural',
                size: '1792x1024',
            })

            if (dalleResult.success && dalleResult.imageUrl) {
                return {
                    success: true,
                    imageUrl: dalleResult.imageUrl,
                    generationMethod: 'dall-e-3',
                    prompt: imagePrompt,
                }
            }

            return {
                success: false,
                error: dalleResult.error || 'DALL-E generation failed',
                prompt: imagePrompt,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Visual generation failed',
            }
        }
    }
)

// Export all image generation tools
export const imageGenTools = [
    generateImageWithDalleTool,
    generateImageWithMidjourneyTool,
    generateArticleVisualTool,
]

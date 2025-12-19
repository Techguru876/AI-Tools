/**
 * Daily Content Generator
 * 
 * Autonomous flow that generates content to meet daily quotas.
 */

import { ai, z } from '../genkit'
import { getCategoriesNeedingContent, recordGeneration, getRemainingQuota } from './quota-tracker'
import { getRAGContext } from '../rag'
import { db } from '@/lib/db'

export interface GenerationResult {
    category: string
    success: boolean
    postId?: string
    title?: string
    error?: string
}

/**
 * Generate a single article for a category
 */
async function generateArticleForCategory(
    category: string,
    topic?: string
): Promise<GenerationResult> {
    try {
        // If no topic provided, get one from trending topics
        let articleTopic = topic
        if (!articleTopic) {
            // Use AI to suggest a topic based on category
            const { text } = await ai.generate({
                prompt: `Suggest a single specific, timely tech article topic for the ${category} category.
        
Requirements:
- Must be newsworthy and relevant in December 2025
- Specific enough to write a focused article about
- Not too broad or generic

Respond with ONLY the topic, no explanation.`,
                config: { temperature: 0.8 },
            })
            articleTopic = text.trim()
        }

        // Get RAG context from similar high-quality articles
        const ragContext = await getRAGContext(articleTopic, category)

        // Generate the article with RAG-enhanced prompt
        const contentType = category as 'NEWS' | 'AI_NEWS' | 'REVIEW' | 'GUIDE' | 'COMPARISON' | 'ROUNDUP'

        const { text: generatedContent } = await ai.generate({
            prompt: `Generate a comprehensive ${contentType} article about: ${articleTopic}

${ragContext}

Follow high-quality journalism standards. Include proper markdown with ## sections.
The article should be detailed (1500+ words), informative, and engaging.
Do NOT include the title as an H1 - start with content sections.`,
            config: { temperature: 0.7 },
        })

        // Extract title
        const titleMatch = generatedContent.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : articleTopic

        // Create slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 100)

        // Check for duplicate
        const existing = await db.post.findUnique({ where: { slug } })
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug

        // Create excerpt
        const contentWithoutTitle = generatedContent.replace(/^#\s+.+$/m, '').trim()
        const excerpt = contentWithoutTitle.split('\n\n')[0].slice(0, 200)

        // Generate SEO metadata
        const { text: metadataJson } = await ai.generate({
            prompt: `Generate SEO metadata for: "${title}"
Respond only in JSON: {"keywords": ["..."], "metaDescription": "150 char description"}`,
            config: { temperature: 0.3 },
        })

        let keywords: string[] = []
        let metaDescription = excerpt.slice(0, 155)
        try {
            const match = metadataJson.match(/\{[\s\S]*\}/)
            if (match) {
                const parsed = JSON.parse(match[0])
                keywords = parsed.keywords || []
                metaDescription = parsed.metaDescription || metaDescription
            }
        } catch { /* Use defaults */ }

        // Find category in database
        const categorySlug = category.toLowerCase().replace('_', '-')
        const dbCategory = await db.category.findFirst({
            where: {
                OR: [
                    { slug: categorySlug },
                    { name: { contains: category, mode: 'insensitive' } },
                ],
            },
        })

        // Create the post
        const post = await db.post.create({
            data: {
                title,
                slug: finalSlug,
                content: generatedContent,
                excerpt,
                contentType,
                keywords,
                metaDescription,
                isAiGenerated: true,
                status: 'DRAFT', // Go to review queue
                categories: dbCategory ? { connect: [{ id: dbCategory.id }] } : undefined,
            },
        })

        // Record generation in quota tracker
        await recordGeneration(category)

        // Log the generation
        console.log(`[DailyGenerator] Generated: ${post.title} (${category})`)

        return {
            category,
            success: true,
            postId: post.id,
            title: post.title,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Log the failure
        console.error(`[DailyGenerator] Failed: ${category} - ${errorMessage}`)

        return {
            category,
            success: false,
            error: errorMessage,
        }
    }
}

/**
 * Run the daily content generation cycle
 */
export async function runDailyGeneration(): Promise<{
    totalGenerated: number
    results: GenerationResult[]
    categoriesProcessed: string[]
}> {
    const results: GenerationResult[] = []
    const categoriesProcessed: string[] = []

    // Get categories that need content
    const categoriesNeeding = await getCategoriesNeedingContent()

    for (const category of categoriesNeeding) {
        const quota = await getRemainingQuota(category)

        if (quota.remaining <= 0) continue

        categoriesProcessed.push(category)

        // Generate articles up to remaining quota (max 2 per run to spread load)
        const toGenerate = Math.min(quota.remaining, 2)

        for (let i = 0; i < toGenerate; i++) {
            const result = await generateArticleForCategory(category)
            results.push(result)

            // Small delay between generations
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
    }

    const totalGenerated = results.filter(r => r.success).length

    return {
        totalGenerated,
        results,
        categoriesProcessed,
    }
}

/**
 * Genkit flow for daily generation (can be called via API)
 */
export const dailyGenerationFlow = ai.defineFlow(
    {
        name: 'dailyGenerationFlow',
        inputSchema: z.object({
            maxArticles: z.number().min(1).max(30).default(10)
                .describe('Maximum articles to generate in this run'),
            categories: z.array(z.string()).optional()
                .describe('Specific categories to focus on (optional)'),
        }),
        outputSchema: z.object({
            totalGenerated: z.number(),
            results: z.array(z.object({
                category: z.string(),
                success: z.boolean(),
                postId: z.string().optional(),
                title: z.string().optional(),
                error: z.string().optional(),
            })),
            quotaStatus: z.record(z.string(), z.object({
                remaining: z.number(),
                generated: z.number(),
                target: z.number(),
            })),
        }),
    },
    async (input) => {
        const results: GenerationResult[] = []

        // Get categories to process
        let categoriesToProcess = input.categories || await getCategoriesNeedingContent()

        let generated = 0
        for (const category of categoriesToProcess) {
            if (generated >= input.maxArticles) break

            const quota = await getRemainingQuota(category)
            if (quota.remaining <= 0) continue

            const toGenerate = Math.min(quota.remaining, input.maxArticles - generated, 3)

            for (let i = 0; i < toGenerate; i++) {
                const result = await generateArticleForCategory(category)
                results.push(result)
                if (result.success) generated++

                await new Promise(resolve => setTimeout(resolve, 1500))
            }
        }

        // Get final quota status
        const { getAllCategoryQuotas } = await import('./quota-tracker')
        const quotaStatus = await getAllCategoryQuotas()

        return {
            totalGenerated: generated,
            results,
            quotaStatus,
        }
    }
)

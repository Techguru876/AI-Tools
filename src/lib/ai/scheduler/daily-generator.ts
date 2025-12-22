/**
 * Daily Content Generator
 * 
 * Autonomous flow that generates content to meet daily quotas.
 * Uses OpenAI/Claude to avoid compatibility issues in Cloudflare Workers.
 */

import { generateArticle } from '../content-generator'
import { generateEmbedding } from '../openai'
import { getCategoriesNeedingContent, recordGeneration, getRemainingQuota } from './quota-tracker'
import { getRAGContext } from '../rag'
import { db } from '@/lib/db'
import { posts, categories, postCategories } from '@/lib/db/schema'
import { eq, or, ilike } from 'drizzle-orm'
import { z } from 'zod'

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
        console.log(`[DailyGenerator] Starting article generation for category: ${category}`)

        // If no topic provided, use AI to suggest one
        let articleTopic = topic
        if (!articleTopic) {
            console.log(`[DailyGenerator] Suggesting topic for ${category}...`)
            // We use a simplified version of the generation for topic suggestion
            // Using generateArticle's input structure for consistency
            const result = await generateArticle({
                type: category as any,
                topic: `Suggest a single specific, timely tech article topic for the ${category} category in December 2025. Respond with ONLY the topic.`,
                aiProvider: 'openai'
            })
            articleTopic = result.title.replace(/^"/, '').replace(/"$/, '').trim()
            console.log(`[DailyGenerator] Topic suggestion: ${articleTopic}`)
        }

        // Get RAG context
        console.log(`[DailyGenerator] Getting RAG context for: ${articleTopic}`)
        const ragContext = await getRAGContext(articleTopic, category)
        console.log(`[DailyGenerator] RAG context retrieved`)

        // Generate the article using the main generation utility
        const contentType = category as any

        console.log(`[DailyGenerator] Generating final content for ${contentType}...`)
        const generated = await generateArticle({
            type: contentType,
            topic: articleTopic,
            additionalContext: ragContext,
            aiProvider: 'openai'
        })
        console.log(`[DailyGenerator] Content generated: ${generated.title}`)

        // Create slug
        const slug = generated.slug

        // Check for duplicate
        console.log(`[DailyGenerator] Checking for duplicate slug: ${slug}`)
        const existing = await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.slug, slug))
            .limit(1)
        const finalSlug = existing.length > 0 ? `${slug}-${Date.now()}` : slug

        // Find category in database
        console.log(`[DailyGenerator] Finding category ID for: ${category}`)
        const categorySlug = category.toLowerCase().replace('_', '-')

        // Fetch all categories and search in JS
        const allCategories = await db.select().from(categories)
        const dbCategory = allCategories.find((c) =>
            c.slug === categorySlug ||
            c.name.toLowerCase().includes(category.toLowerCase())
        )

        // Create the post
        console.log(`[DailyGenerator] Inserting post into database...`)
        const newPost = await db.insert(posts).values({
            title: generated.title,
            slug: finalSlug,
            content: generated.content,
            excerpt: generated.excerpt,
            contentType: contentType as any,
            keywords: generated.keywords,
            metaDescription: generated.metaDescription,
            isAiGenerated: true,
            status: 'DRAFT',
        }).returning({ id: posts.id, title: posts.title })

        const post = newPost[0]

        // Connect category if found
        if (dbCategory && post) {
            console.log(`[DailyGenerator] Linking post to category: ${dbCategory.name}`)
            await db.insert(postCategories).values({
                postId: post.id,
                categoryId: dbCategory.id,
            })
        }

        // Record generation in quota tracker
        await recordGeneration(category)

        // Log the generation
        console.log(`[DailyGenerator] Success! Generated: ${post.title}`)

        return {
            category,
            success: true,
            postId: post.id,
            title: post.title,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[DailyGenerator] FATAL ERROR for ${category}: ${errorMessage}`)

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

        // Generate articles up to remaining quota (max 1 per run to be safe)
        const toGenerate = Math.min(quota.remaining, 1)

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
 * Standard function (previously Genkit flow) for daily generation
 */
export const dailyGenerationFlow = async (input: {
    maxArticles: number,
    categories?: string[]
}) => {
    const results: GenerationResult[] = []

    // Get categories to process
    let categoriesToProcess = input.categories || await getCategoriesNeedingContent()

    let generated = 0
    for (const category of categoriesToProcess) {
        if (generated >= input.maxArticles) break

        const quota = await getRemainingQuota(category)
        if (quota.remaining <= 0) continue

        const toGenerate = Math.min(quota.remaining, input.maxArticles - generated, 1)

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

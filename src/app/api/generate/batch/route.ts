import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateArticle } from '@/lib/ai/content-generator'
import { slugify } from '@/lib/utils'
import type { ContentType, PostStatus } from '@prisma/client'

// Content mix percentages for automated generation
const CONTENT_MIX = {
    NEWS: 0.5,        // 50% news articles
    AI_NEWS: 0.15,    // 15% AI news
    REVIEW: 0.15,     // 15% reviews
    GUIDE: 0.1,       // 10% guides
    COMPARISON: 0.1,  // 10% comparisons
}

// Map content types to categories
const CONTENT_TO_CATEGORY: Record<string, string> = {
    NEWS: 'tech',
    AI_NEWS: 'ai-news',
    REVIEW: 'reviews',
    GUIDE: 'tech',
    COMPARISON: 'reviews',
}

interface BatchGenerateRequest {
    count?: number
    topics?: string[]
    autoPublish?: boolean
    cronSecret?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: BatchGenerateRequest = await request.json()
        const { count = 3, topics, autoPublish = false, cronSecret } = body

        // Verify cron secret if set (for automated calls)
        if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
            // Allow if no cron secret in request (manual call from admin)
            if (cronSecret) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        // Determine content types based on mix
        const contentTypes = selectContentTypes(count)

        // Get topics - either provided or generate trending topics
        const articleTopics = topics?.length
            ? topics.slice(0, count)
            : await generateTopics(contentTypes)

        const results: any[] = []
        const errors: any[] = []

        // Generate articles
        for (let i = 0; i < Math.min(contentTypes.length, articleTopics.length); i++) {
            const contentType = contentTypes[i]
            const topic = articleTopics[i]

            try {
                console.log(`Generating ${contentType}: ${topic}`)

                // Generate article content
                const generated = await generateArticle({
                    type: contentType as ContentType,
                    topic,
                    aiProvider: 'claude',
                })

                // Get category
                const categorySlug = CONTENT_TO_CATEGORY[contentType] || 'tech'
                const category = await db.category.findUnique({
                    where: { slug: categorySlug },
                })

                // Check for duplicate slug
                let finalSlug = generated.slug
                const existingPost = await db.post.findUnique({
                    where: { slug: finalSlug },
                })
                if (existingPost) {
                    finalSlug = `${finalSlug}-${Date.now()}`
                }

                // Create post
                const status: PostStatus = autoPublish ? 'PUBLISHED' : 'IN_REVIEW'
                const post = await db.post.create({
                    data: {
                        title: generated.title,
                        slug: finalSlug,
                        content: generated.content,
                        excerpt: generated.excerpt,
                        metaTitle: generated.title,
                        metaDescription: generated.metaDescription,
                        keywords: generated.keywords,
                        contentType: contentType as ContentType,
                        status,
                        isAiGenerated: true,
                        publishedAt: autoPublish ? new Date() : null,
                        categories: category ? { connect: [{ id: category.id }] } : undefined,
                        tags: {
                            connectOrCreate: generated.keywords.slice(0, 5).map((kw) => ({
                                where: { slug: slugify(kw) },
                                create: { name: kw, slug: slugify(kw) },
                            })),
                        },
                    },
                })

                results.push({
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    status: post.status,
                    contentType: post.contentType,
                    tokensUsed: generated.usage.inputTokens + generated.usage.outputTokens,
                })

                console.log(`✅ Created: ${post.title}`)
            } catch (error: any) {
                console.error(`❌ Failed to generate: ${topic}`, error)
                errors.push({
                    topic,
                    contentType,
                    error: error.message,
                })
            }
        }

        return NextResponse.json({
            success: true,
            generated: results.length,
            failed: errors.length,
            posts: results,
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error: any) {
        console.error('Batch generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate content batch', details: error.message },
            { status: 500 }
        )
    }
}

// Select content types based on configured mix
function selectContentTypes(count: number): string[] {
    const types: string[] = []
    const entries = Object.entries(CONTENT_MIX)

    for (let i = 0; i < count; i++) {
        // Weighted random selection
        const random = Math.random()
        let cumulative = 0
        for (const [type, weight] of entries) {
            cumulative += weight
            if (random < cumulative) {
                types.push(type)
                break
            }
        }
    }

    return types
}

// Generate trending topics for each content type
async function generateTopics(contentTypes: string[]): Promise<string[]> {
    // For now, use a mix of evergreen and trending topic patterns
    // In production, this would integrate with NewsAPI, Reddit, or AI topic generation

    const topicTemplates: Record<string, string[]> = {
        NEWS: [
            'Latest developments in smartphone technology',
            'Breaking tech industry news this week',
            'New software updates and features announced',
            'Emerging trends in consumer electronics',
            'Tech company earnings and market moves',
        ],
        AI_NEWS: [
            'New breakthrough in large language models',
            'AI regulation updates and policy changes',
            'Machine learning applications in healthcare',
            'Generative AI tools for productivity',
            'OpenAI and Anthropic latest announcements',
        ],
        REVIEW: [
            'Latest flagship smartphone comprehensive review',
            'Best wireless earbuds in-depth comparison',
            'New laptop release performance analysis',
            'Smart home device hands-on review',
            'Gaming console update review',
        ],
        GUIDE: [
            'How to optimize your smartphone battery life',
            'Best practices for online privacy in 2024',
            'Setting up a home network for beginners',
            'Tips for choosing the right laptop',
            'Getting started with smart home automation',
        ],
        COMPARISON: [
            'iPhone vs Android: Which is better for you',
            'Mac vs PC for creative professionals',
            'Cloud storage services compared',
            'Streaming services head-to-head',
            'Electric vehicle charging solutions compared',
        ],
    }

    return contentTypes.map((type) => {
        const templates = topicTemplates[type] || topicTemplates.NEWS
        return templates[Math.floor(Math.random() * templates.length)]
    })
}

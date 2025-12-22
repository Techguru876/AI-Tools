import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, categories, tags, postCategories, postTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateArticle } from '@/lib/ai/content-generator'
import { slugify } from '@/lib/utils'

// Type definitions
type ContentType = 'ARTICLE' | 'REVIEW' | 'COMPARISON' | 'GUIDE' | 'NEWS' | 'AI_NEWS' | 'ROUNDUP' | 'SPONSORED'
type PostStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'

// GET handler - returns API usage instructions
export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/generate/batch',
        method: 'POST',
        description: 'Batch generate AI articles',
        contentType: 'application/json',
        parameters: {
            count: { type: 'number', default: 3, description: 'Number of articles to generate (1-10)' },
            topics: { type: 'string[]', optional: true, description: 'Array of topics (auto-generated if not provided)' },
            autoPublish: { type: 'boolean', default: false, description: 'Publish immediately or save as IN_REVIEW' },
            cronSecret: { type: 'string', optional: true, description: 'Secret for automated cron calls' },
        },
        examples: {
            windows_cmd: `curl -X POST "${baseUrl}/api/generate/batch" -H "Content-Type: application/json" -d "{\\"count\\": 1}"`,
            windows_powershell: `Invoke-RestMethod -Uri "${baseUrl}/api/generate/batch" -Method POST -ContentType "application/json" -Body '{"count": 1}'`,
            linux_macos: `curl -X POST '${baseUrl}/api/generate/batch' -H 'Content-Type: application/json' -d '{"count": 1}'`,
            with_topics: `curl -X POST '${baseUrl}/api/generate/batch' -H 'Content-Type: application/json' -d '{"count": 2, "topics": ["AI trends 2025", "Best laptops for developers"]}'`,
        },
        troubleshooting: [
            'Use 127.0.0.1 or localhost, NOT 0.0.0.1',
            'Always include Content-Type: application/json header',
            'On Windows cmd, escape quotes with backslash: \\"',
            'Ensure JSON braces {} are inside quotes to avoid shell interpretation',
        ],
    })
}

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

        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
        const hasOpenAI = !!process.env.OPENAI_API_KEY

        if (!hasAnthropic && !hasOpenAI) {
            return NextResponse.json(
                { error: 'No AI provider configured. Set OPENAI_API_KEY (recommended for Cloudflare) or ANTHROPIC_API_KEY.' },
                { status: 500 }
            )
        }

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
                // Prefer OpenAI for Cloudflare Workers compatibility (Anthropic SDK uses MessagePort)
                const generated = await generateArticle({
                    type: contentType as ContentType,
                    topic,
                    aiProvider: hasOpenAI ? 'openai' : 'claude',
                })

                // Get category
                const categorySlug = CONTENT_TO_CATEGORY[contentType] || 'tech'
                const categoryResult = await db
                    .select({ id: categories.id })
                    .from(categories)
                    .where(eq(categories.slug, categorySlug))
                    .limit(1)

                const category = categoryResult[0]

                // Check for duplicate slug
                let finalSlug = generated.slug
                const existingPost = await db
                    .select({ id: posts.id })
                    .from(posts)
                    .where(eq(posts.slug, finalSlug))
                    .limit(1)

                if (existingPost.length > 0) {
                    finalSlug = `${finalSlug}-${Date.now()}`
                }

                // Create post
                const status: PostStatus = autoPublish ? 'PUBLISHED' : 'IN_REVIEW'
                const newPost = await db.insert(posts).values({
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
                }).returning({
                    id: posts.id,
                    title: posts.title,
                    slug: posts.slug,
                    status: posts.status,
                    contentType: posts.contentType,
                })

                const post = newPost[0]

                // Connect category if found
                if (category && post) {
                    await db.insert(postCategories).values({
                        postId: post.id,
                        categoryId: category.id,
                    })
                }

                // Create/connect tags from keywords
                for (const kw of generated.keywords.slice(0, 5)) {
                    const tagSlug = slugify(kw)

                    // Find or create tag
                    let tagRecord = await db
                        .select({ id: tags.id })
                        .from(tags)
                        .where(eq(tags.slug, tagSlug))
                        .limit(1)

                    let tagId: string
                    if (tagRecord[0]) {
                        tagId = tagRecord[0].id
                    } else {
                        const newTag = await db.insert(tags).values({
                            name: kw,
                            slug: tagSlug,
                        }).returning({ id: tags.id })
                        tagId = newTag[0].id
                    }

                    // Connect tag to post
                    await db.insert(postTags).values({
                        postId: post.id,
                        tagId,
                    }).onConflictDoNothing()
                }

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

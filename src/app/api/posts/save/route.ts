import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, categories, tags, postCategories, postTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

// Generate contextual cover image based on content
function generateContextualImage(title: string, contentType: string, keywords: string[]): string {
    const imageMap: Record<string, string> = {
        'Apple': 'apple-technology-macbook',
        'Google': 'google-technology-search',
        'Microsoft': 'microsoft-technology-windows',
        'OpenAI': 'artificial-intelligence-neural-network',
        'AI': 'artificial-intelligence-technology',
        'ChatGPT': 'chatgpt-ai-conversation',
        'Machine Learning': 'machine-learning-data-science',
        'Smartphone': 'smartphone-mobile-technology',
        'Laptop': 'laptop-computer-workspace',
        'Review': 'product-review-technology',
    }

    // Find best matching keyword
    for (const [keyword, query] of Object.entries(imageMap)) {
        if (title.includes(keyword) || keywords.some(k => k.includes(keyword))) {
            return `https://source.unsplash.com/1200x630/?${query}`
        }
    }

    // Fallback based on content type
    const typeMap: Record<string, string> = {
        'NEWS': 'tech-news-latest',
        'REVIEW': 'product-review-tech',
        'GUIDE': 'tutorial-learning-tech',
        'AI_NEWS': 'artificial-intelligence',
        'COMPARISON': 'comparison-technology',
    }

    const fallbackQuery = typeMap[contentType] || 'technology-innovation'
    return `https://source.unsplash.com/1200x630/?${fallbackQuery}`
}

type ContentType = 'ARTICLE' | 'REVIEW' | 'COMPARISON' | 'GUIDE' | 'NEWS' | 'AI_NEWS' | 'ROUNDUP' | 'SPONSORED'
type PostStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'

interface SavePostRequest {
    title: string
    content: string
    excerpt: string
    slug?: string
    keywords?: string[]
    metaDescription?: string
    contentType: ContentType
    status: PostStatus
    categorySlug?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: SavePostRequest = await request.json()

        const {
            title,
            content,
            excerpt,
            slug,
            keywords = [],
            metaDescription,
            contentType,
            status,
            categorySlug,
        } = body

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            )
        }

        // Generate slug if not provided
        const postSlug = slug || slugify(title)

        // Check if slug already exists
        const existingPost = await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.slug, postSlug))
            .limit(1)

        if (existingPost.length > 0) {
            return NextResponse.json(
                { error: 'An article with this slug already exists' },
                { status: 409 }
            )
        }

        // Find category
        let categoryId: string | null = null
        if (categorySlug) {
            const category = await db
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.slug, categorySlug))
                .limit(1)
            if (category[0]) {
                categoryId = category[0].id
            }
        }

        // Generate contextual cover image
        const coverImage = generateContextualImage(title, contentType, keywords)

        // Create the post
        const newPost = await db.insert(posts).values({
            title,
            slug: postSlug,
            content,
            excerpt,
            coverImage,
            metaTitle: title,
            metaDescription: metaDescription || excerpt.slice(0, 155),
            keywords,
            contentType,
            status,
            isAiGenerated: true,
            publishedAt: status === 'PUBLISHED' ? new Date() : null,
        }).returning({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            status: posts.status,
        })

        const post = newPost[0]

        // Connect category if found
        if (categoryId && post) {
            await db.insert(postCategories).values({
                postId: post.id,
                categoryId,
            })
        }

        // Create/connect tags from keywords
        for (const keyword of keywords.slice(0, 10)) {
            const tagSlug = slugify(keyword)

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
                    name: keyword,
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

        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                status: post.status,
            },
        })
    } catch (error) {
        console.error('Error saving post:', error)
        return NextResponse.json(
            { error: 'Failed to save post' },
            { status: 500 }
        )
    }
}

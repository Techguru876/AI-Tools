import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
import { slugify } from '@/lib/utils'
import type { ContentType, PostStatus } from '@prisma/client'

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
        const existingPost = await db.post.findUnique({
            where: { slug: postSlug },
        })

        if (existingPost) {
            return NextResponse.json(
                { error: 'An article with this slug already exists' },
                { status: 409 }
            )
        }

        // Find or create category
        let categoryConnect = undefined
        if (categorySlug) {
            const category = await db.category.findUnique({
                where: { slug: categorySlug },
            })
            if (category) {
                categoryConnect = { connect: [{ id: category.id }] }
            }
        }

        // Create tags from keywords
        const tagOperations = keywords.slice(0, 10).map((keyword) => ({
            where: { slug: slugify(keyword) },
            create: { name: keyword, slug: slugify(keyword) },
        }))

        // Generate contextual cover image
        const coverImage = generateContextualImage(title, contentType, keywords)

        // Create the post
        const post = await db.post.create({
            data: {
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
                categories: categoryConnect,
                tags: {
                    connectOrCreate: tagOperations,
                },
            },
            include: {
                categories: true,
                tags: true,
            },
        })

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

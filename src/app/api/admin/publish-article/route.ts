import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, content, excerpt, slug, metaDescription, keywords, categorySlug } = body

        // Find category
        const category = await db.category.findUnique({
            where: { slug: categorySlug || 'tech' },
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 400 })
        }

        // Find or create default author
        let author = await db.user.findFirst({
            where: { email: 'admin@techblogusa.com' },
        })

        if (!author) {
            author = await db.user.create({
                data: {
                    email: 'admin@techblogusa.com',
                    name: 'TechBlog USA',
                    image: '/logos/header/techblog_logo.svg',
                    bio: 'Expert tech journalism team covering the latest in technology, AI, gadgets, and innovation.',
                    title: 'Editorial Team',
                },
            })
        }

        // Calculate reading time
        const wordCount = content.split(/\s+/).length
        const readingTime = Math.ceil(wordCount / 200)

        // Create post
        const post = await db.post.create({
            data: {
                title,
                slug: slugify(slug),
                content,
                excerpt,
                metaDescription,
                contentType: 'NEWS',
                status: 'PUBLISHED',
                publishedAt: new Date(),
                readingTime,
                authorId: author.id,
                categories: {
                    connect: { id: category.id },
                },
                coverImage: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop`,
            },
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Failed to publish article:', error)
        return NextResponse.json(
            { error: 'Failed to publish article' },
            { status: 500 }
        )
    }
}

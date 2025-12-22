import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, users, categories, postCategories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, content, excerpt, slug, metaDescription, keywords, categorySlug } = body

        // Find category
        const categoryResult = await db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.slug, categorySlug || 'tech'))
            .limit(1)

        const category = categoryResult[0]
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 400 })
        }

        // Find or create default author
        let authorResult = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, 'admin@techblogusa.com'))
            .limit(1)

        let authorId: string
        if (authorResult[0]) {
            authorId = authorResult[0].id
        } else {
            const newAuthor = await db.insert(users).values({
                email: 'admin@techblogusa.com',
                name: 'TechBlog USA',
                image: '/logos/header/techblog_logo.svg',
                bio: 'Expert tech journalism team covering the latest in technology, AI, gadgets, and innovation.',
                title: 'Editorial Team',
            }).returning({ id: users.id })
            authorId = newAuthor[0].id
        }

        // Calculate reading time
        const wordCount = content.split(/\s+/).length
        const readingTime = Math.ceil(wordCount / 200)

        // Create post
        const newPost = await db.insert(posts).values({
            title,
            slug: slugify(slug),
            content,
            excerpt,
            metaDescription,
            contentType: 'NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(),
            readingTime,
            authorId,
            coverImage: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop`,
        }).returning()

        const post = newPost[0]

        // Connect category
        if (category && post) {
            await db.insert(postCategories).values({
                postId: post.id,
                categoryId: category.id,
            })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('Failed to publish article:', error)
        return NextResponse.json(
            { error: 'Failed to publish article' },
            { status: 500 }
        )
    }
}

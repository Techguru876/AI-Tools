import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, categories, tags, postCategories, postTags } from '@/lib/db/schema'
import { eq, ilike, or, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ results: [] })
        }

        const searchTerm = `%${query}%`

        // Search in posts using Drizzle
        const results = await db
            .select({
                id: posts.id,
                title: posts.title,
                excerpt: posts.excerpt,
                slug: posts.slug,
                coverImage: posts.coverImage,
                publishedAt: posts.publishedAt,
                viewCount: posts.viewCount,
            })
            .from(posts)
            .where(
                eq(posts.status, 'PUBLISHED')
            )
            .orderBy(desc(posts.viewCount))
            .limit(50)

        // Filter in JS for case-insensitive contains (Drizzle ilike needs specific setup)
        const filteredResults = results.filter((post) => {
            const lowerQuery = query.toLowerCase()
            return (
                post.title.toLowerCase().includes(lowerQuery) ||
                (post.excerpt?.toLowerCase().includes(lowerQuery) ?? false)
            )
        }).slice(0, 10)

        // Fetch categories for each result
        const formattedResults = await Promise.all(
            filteredResults.map(async (post) => {
                const postCats = await db
                    .select({
                        name: categories.name,
                        slug: categories.slug,
                    })
                    .from(categories)
                    .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
                    .where(eq(postCategories.postId, post.id))
                    .limit(1)

                return {
                    id: post.id,
                    title: post.title,
                    excerpt: post.excerpt,
                    slug: post.slug,
                    category: postCats[0]?.name || 'Tech',
                    categorySlug: postCats[0]?.slug || 'tech',
                    coverImage: post.coverImage,
                    publishedAt: post.publishedAt,
                }
            })
        )

        return NextResponse.json({ results: formattedResults })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}

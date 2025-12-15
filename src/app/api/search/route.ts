import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ results: [] })
        }

        // Search in posts using Prisma
        const results = await db.post.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        excerpt: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        content: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            include: {
                categories: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
            take: 10,
            orderBy: {
                viewCount: 'desc',
            },
        })

        // Format results
        const formattedResults = results.map((post) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            slug: post.slug,
            category: post.categories[0]?.name || 'Tech',
            categorySlug: post.categories[0]?.slug || 'tech',
            coverImage: post.coverImage,
            publishedAt: post.publishedAt,
        }))

        return NextResponse.json({ results: formattedResults })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}

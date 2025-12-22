import { db } from '@/lib/db'
import { posts, categories, postCategories } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Eye, FileText } from 'lucide-react'

// Force dynamic rendering - admin pages need database access
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    // Fetch real analytics from database
    const postCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.status, 'PUBLISHED'))

    const totalViewsResult = await db
        .select({ sum: sql<number>`coalesce(sum(${posts.viewCount}), 0)` })
        .from(posts)

    const topPostsResult = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            viewCount: posts.viewCount,
        })
        .from(posts)
        .where(eq(posts.status, 'PUBLISHED'))
        .orderBy(desc(posts.viewCount))
        .limit(10)

    // Fetch categories for top posts
    const topPosts = await Promise.all(
        topPostsResult.map(async (post) => {
            const postCats = await db
                .select({ slug: categories.slug })
                .from(categories)
                .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
                .where(eq(postCategories.postId, post.id))
                .limit(1)

            return {
                ...post,
                categories: postCats,
            }
        })
    )

    const postCount = Number(postCountResult[0]?.count ?? 0)
    const totalViews = Number(totalViewsResult[0]?.sum ?? 0)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Analytics</h2>
                <p className="text-muted-foreground">View your content performance</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{postCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Views/Post</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {postCount > 0 ? Math.round(totalViews / postCount) : 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Posts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Top Performing Articles
                    </CardTitle>
                    <CardDescription>Articles ranked by view count</CardDescription>
                </CardHeader>
                <CardContent>
                    {topPosts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No published posts yet</p>
                    ) : (
                        <div className="space-y-4">
                            {topPosts.map((post, index) => (
                                <div key={post.id} className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                                    <div className="flex-1">
                                        <a
                                            href={`/${post.categories[0]?.slug || 'tech'}/${post.slug}`}
                                            className="font-medium hover:text-primary"
                                        >
                                            {post.title}
                                        </a>
                                    </div>
                                    <span className="text-muted-foreground">{post.viewCount || 0} views</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

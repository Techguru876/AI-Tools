import { db } from '@/lib/db'
import { posts, users, categories, postCategories } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Eye, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering - admin pages need database access
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Fetch real stats from database
  const postCountResult = await db.select({ count: sql<number>`count(*)` }).from(posts)
  const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(users)
  const totalViewsResult = await db.select({ sum: sql<number>`coalesce(sum(${posts.viewCount}), 0)` }).from(posts)

  const recentPostsResult = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      viewCount: posts.viewCount,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.status, 'PUBLISHED'))
    .orderBy(desc(posts.publishedAt))
    .limit(5)

  // Fetch categories for recent posts
  const recentPosts = await Promise.all(
    recentPostsResult.map(async (post) => {
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

  const stats = {
    totalPosts: Number(postCountResult[0]?.count ?? 0),
    totalUsers: Number(userCountResult[0]?.count ?? 0),
    totalViews: Number(totalViewsResult[0]?.sum ?? 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your AI-powered editorial dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/admin/generate" className="text-primary hover:underline text-sm">
              → Generate New Article
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Latest published articles from your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <p className="text-muted-foreground">No posts yet. Create your first article!</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <Link
                      href={`/${post.categories[0]?.slug || 'tech'}/${post.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{post.viewCount || 0} views</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

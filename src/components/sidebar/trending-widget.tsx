import Link from 'next/link'
import { TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { db } from '@/lib/db'

export async function TrendingWidget() {
  // Fetch real trending posts from database based on view count
  const trendingPosts = await db.post.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      categories: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { viewCount: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 5,
  })

  // If no posts, don't render the widget
  if (trendingPosts.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold">Trending Now</h3>
      </div>

      <div className="space-y-4">
        {trendingPosts.map((post, index) => {
          const categorySlug = post.categories[0]?.slug || 'tech'
          const categoryName = post.categories[0]?.name || 'Tech'
          const publishedDate = post.publishedAt || post.createdAt

          return (
            <Link
              key={post.id}
              href={`/${categorySlug}/${post.slug}`}
              className="group block"
            >
              <div className="flex gap-3">
                {/* Ranking Number */}
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                </div>

                {/* Post Info */}
                <div className="flex-1 space-y-1">
                  <h4 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {categoryName}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(publishedDate, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/search?sort=views"
        className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
      >
        View All Trending →
      </Link>
    </div>
  )
}

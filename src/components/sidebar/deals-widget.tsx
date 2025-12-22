import Link from 'next/link'
import Image from 'next/image'
import { DollarSign, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { posts, categories, postCategories } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function DealsWidget() {
  // First, find the deals category
  const dealsCategory = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, 'deals'))
    .limit(1)

  if (dealsCategory.length === 0) {
    return null
  }

  // Find post IDs that belong to deals category
  const dealPostIds = await db
    .select({ postId: postCategories.postId })
    .from(postCategories)
    .where(eq(postCategories.categoryId, dealsCategory[0].id))

  const postIds = dealPostIds.map((r) => r.postId)

  if (postIds.length === 0) {
    return null
  }

  // Fetch published posts that are deals
  const allPublishedPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.status, 'PUBLISHED'))
    .orderBy(desc(posts.publishedAt))
    .limit(20)

  // Filter to deals only
  const dealArticles = allPublishedPosts
    .filter((p) => postIds.includes(p.id))
    .slice(0, 3)

  // If no deals in database, don't render the widget
  if (dealArticles.length === 0) {
    return null
  }

  // Fetch categories for each deal
  const dealsWithCategories = await Promise.all(
    dealArticles.map(async (deal) => {
      const postCats = await db
        .select({
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, deal.id))
        .limit(1)

      return {
        ...deal,
        categories: postCats,
      }
    })
  )

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold">Featured Deals</h3>
      </div>

      <div className="space-y-4">
        {dealsWithCategories.map((deal) => {
          // Extract category slug from first category
          const categorySlug = deal.categories[0]?.slug || 'deals'

          return (
            <Link
              key={deal.id}
              href={`/${categorySlug}/${deal.slug}`}
              className="group block overflow-hidden rounded-lg border bg-gradient-to-br from-green-50/50 to-transparent transition-shadow hover:shadow-md dark:from-green-950/20"
            >
              {/* Product Image */}
              {deal.coverImage && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={deal.coverImage}
                    alt={deal.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute right-2 top-2 bg-red-600 hover:bg-red-700">
                    DEAL
                  </Badge>
                </div>
              )}

              {/* Deal Info */}
              <div className="p-3">
                <h4 className="mb-2 line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                  {deal.title}
                </h4>

                {deal.excerpt && (
                  <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                    {deal.excerpt}
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  asChild
                >
                  <span>
                    View Deal
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </span>
                </Button>
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/deals"
        className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
      >
        View All Deals →
      </Link>
    </div>
  )
}

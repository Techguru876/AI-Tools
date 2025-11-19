'use client'

import { useState } from 'react'
import { ArticleCard } from '@/components/article-cards/article-card'
import type { ArticleCardProps } from '@/components/article-cards/article-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ArticleFeedProps {
  initialArticles: ArticleCardProps[]
}

export function ArticleFeed({ initialArticles }: ArticleFeedProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // TODO: Replace with actual API call
    // const newArticles = await fetch(`/api/articles?page=${page + 1}`).then(r => r.json())

    // For now, just show we've reached the end
    setHasMore(false)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Article Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((article, index) => {
          // First article spans full width and is larger
          const isFeatured = index === 0 || (article.featured && index < 3)
          const gridClass = isFeatured ? 'md:col-span-2' : ''

          return (
            <div key={article.id} className={gridClass}>
              <ArticleCard {...article} featured={isFeatured} />
            </div>
          )
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            size="lg"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Articles'
            )}
          </Button>
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          You've reached the end of the feed
        </p>
      )}
    </div>
  )
}

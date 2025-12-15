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
      {/* Magazine-Style Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {articles.map((article, index) => {
          // Magazine layout pattern:
          // Articles 0-1: First two are 2-column featured cards
          // Articles 2-5: Four standard 1-column cards
          // Articles 6-7: Two more 2-column featured
          // Articles 8+: Standard 2-column grid

          let gridClass = 'md:col-span-2' // Default to medium
          let cardSize: 'large' | 'medium' | 'small' = 'medium'

          if (index < 2) {
            // First two articles: Large featured
            gridClass = 'md:col-span-2'
            cardSize = 'large'
          } else if (index < 6) {
            // Next 4: Small cards in a row
            gridClass = 'md:col-span-1'
            cardSize = 'small'
          } else if (index < 8) {
            // Next 2: Medium featured
            gridClass = 'md:col-span-2'
            cardSize = 'medium'
          } else {
            // Rest: Standard 2-column grid
            gridClass = 'md:col-span-2'
            cardSize = 'medium'
          }

          return (
            <div key={article.id} className={gridClass}>
              <ArticleCard {...article} featured={cardSize === 'large'} size={cardSize} />
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

import Link from 'next/link'
import { TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

// Mock trending posts - will be replaced with real data
const trendingPosts = [
  {
    id: '1',
    title: 'OpenAI Announces GPT-5 with Revolutionary Capabilities',
    category: 'AI News',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    slug: 'openai-gpt5-announcement',
  },
  {
    id: '2',
    title: 'iPhone 16 Pro Review: The Best iPhone Ever Made',
    category: 'Reviews',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    slug: 'iphone-16-pro-review',
  },
  {
    id: '3',
    title: 'NASA Discovers Evidence of Water on Mars',
    category: 'Science',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    slug: 'nasa-mars-water-discovery',
  },
  {
    id: '4',
    title: 'Best Black Friday Tech Deals 2024',
    category: 'Deals',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    slug: 'black-friday-tech-deals-2024',
  },
  {
    id: '5',
    title: 'Tesla Unveils New Self-Driving Technology',
    category: 'Tech',
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
    slug: 'tesla-self-driving-unveil',
  },
]

export function TrendingWidget() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold">Trending Now</h3>
      </div>

      <div className="space-y-4">
        {trendingPosts.map((post, index) => (
          <Link
            key={post.id}
            href={`/${post.category.toLowerCase().replace(' ', '-')}/${post.slug}`}
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
                    {post.category}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/trending"
        className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
      >
        View All Trending →
      </Link>
    </div>
  )
}

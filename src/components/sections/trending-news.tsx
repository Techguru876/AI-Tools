import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp } from 'lucide-react'

const trendingArticles = [
  {
    id: '1',
    title: 'Apple Announces New MacBook Pro with M3 Chip',
    category: 'News',
    time: '2 hours ago',
    trend: '+350%',
  },
  {
    id: '2',
    title: 'Google Pixel 8 Pro Camera Review: Best in Class?',
    category: 'Reviews',
    time: '5 hours ago',
    trend: '+245%',
  },
  {
    id: '3',
    title: 'Tesla Cybertruck Finally Gets Production Date',
    category: 'News',
    time: '8 hours ago',
    trend: '+198%',
  },
  {
    id: '4',
    title: 'Best Black Friday Tech Deals: Live Updates',
    category: 'Deals',
    time: '1 hour ago',
    trend: '+420%',
  },
  {
    id: '5',
    title: 'OpenAI Unveils GPT-5: What You Need to Know',
    category: 'AI',
    time: '3 hours ago',
    trend: '+512%',
  },
]

export function TrendingNews() {
  return (
    <section className="border-y bg-muted/40 py-12">
      <div className="container">
        <div className="mb-8 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h2 className="text-3xl font-bold">Trending Now</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {trendingArticles.map((article, index) => (
            <Link
              key={article.id}
              href={`/posts/${article.id}`}
              className="group rounded-lg border bg-background p-4 transition-all hover:shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-muted-foreground/30">{index + 1}</span>
                <Badge variant="secondary">{article.category}</Badge>
              </div>
              <h3 className="mb-3 line-clamp-2 font-semibold group-hover:text-primary">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {article.time}
                </div>
                <div className="flex items-center text-orange-500">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {article.trend}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

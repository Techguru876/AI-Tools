import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp } from 'lucide-react'

// Placeholder data - will be replaced with real data from database
const featuredPosts = [
  {
    id: '1',
    title: 'The New iPhone 15 Pro: A Complete Review',
    excerpt: 'Deep dive into Apple\'s latest flagship with camera tests, performance benchmarks, and more.',
    category: 'Reviews',
    readTime: 8,
    trending: true,
  },
  {
    id: '2',
    title: 'AI Revolution: How Large Language Models Are Changing Tech',
    excerpt: 'Exploring the impact of AI on technology, productivity, and everyday applications.',
    category: 'Analysis',
    readTime: 12,
    trending: true,
  },
  {
    id: '3',
    title: 'Best Laptops for 2024: Complete Buyer\'s Guide',
    excerpt: 'Our comprehensive guide to the best laptops across all price ranges and use cases.',
    category: 'Guides',
    readTime: 15,
    trending: false,
  },
  {
    id: '4',
    title: 'Samsung Galaxy S24 vs iPhone 15: Which Should You Buy?',
    excerpt: 'Head-to-head comparison of the flagship smartphones from Samsung and Apple.',
    category: 'Comparisons',
    readTime: 10,
    trending: false,
  },
]

export function FeaturedPosts() {
  return (
    <section className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Featured Stories</h2>
        <Link href="/latest" className="text-sm font-medium text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="grid auto-rows-[200px] gap-4 md:grid-cols-2 lg:grid-cols-4">
        {featuredPosts.map((post, index) => {
          // Create dynamic bento layout - first post is featured (larger)
          const isFeatured = index === 0
          const gridClass = isFeatured
            ? 'md:col-span-2 md:row-span-2'
            : index === 2
            ? 'md:row-span-2'
            : ''

          return (
            <Link key={post.id} href={`/posts/${post.id}`} className={gridClass}>
              <Card className="interactive-card group h-full overflow-hidden">
                <CardHeader className="relative h-full">
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative z-10 mb-2 flex items-center justify-between">
                    <Badge variant="secondary" className="backdrop-blur-sm">
                      {post.category}
                    </Badge>
                    {post.trending && (
                      <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-500 backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                    )}
                  </div>

                  <CardTitle
                    className={`relative z-10 transition-colors group-hover:text-primary ${
                      isFeatured ? 'text-2xl' : 'line-clamp-2 text-lg'
                    }`}
                  >
                    {post.title}
                  </CardTitle>

                  <CardDescription
                    className={`relative z-10 mt-2 ${isFeatured ? 'line-clamp-4' : 'line-clamp-2'}`}
                  >
                    {post.excerpt}
                  </CardDescription>

                  <div className="relative z-10 mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime} min
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {featuredPosts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary">{post.category}</Badge>
                  {post.trending && (
                    <div className="flex items-center text-xs text-orange-500">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Trending
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {post.readTime} min read
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

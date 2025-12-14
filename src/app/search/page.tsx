import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleCard } from '@/components/article-cards/article-card'
import { Sidebar } from '@/components/sidebar/sidebar'
import { db } from '@/lib/db'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  return {
    title: query ? `Search results for "${query}" - TechFrontier` : 'Search - TechFrontier',
    description: `Search results for ${query}`,
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  // Query database for matching articles
  const posts = query
    ? await db.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        categories: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })
    : []

  // Transform to match ArticleCardProps interface
  const results = posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    slug: post.slug,
    category: post.categories[0]?.name || 'Tech',
    categorySlug: post.categories[0]?.slug || 'tech',
    categoryColor: post.categories[0]?.color || '#3B82F6',
    author: 'TechFrontier Team',
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    image: post.coverImage || `https://source.unsplash.com/800x600/?technology`,
    contentType: post.contentType.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    tags: post.tags.slice(0, 5).map((tag) => tag.name),
    trending: post.viewCount > 500,
    type: post.contentType.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Search Results</h1>
            {query && (
              <p className="text-lg text-muted-foreground">
                {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;{query}&quot;
              </p>
            )}
          </div>

          {/* Results + Sidebar */}
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Results */}
            <div>
              {!query ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-muted/20">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Start Searching</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter a search term to find articles
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {results.map((article) => (
                    <ArticleCard key={article.id} {...article} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-muted/20">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">No Results Found</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

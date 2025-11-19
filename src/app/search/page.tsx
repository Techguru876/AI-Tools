import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleCard } from '@/components/article-cards/article-card'
import { Sidebar } from '@/components/sidebar/sidebar'
import { mockArticles } from '@/lib/mock-data/articles'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  return {
    title: query ? `Search results for "${query}" - AI Tech Blog` : 'Search - AI Tech Blog',
    description: `Search results for ${query}`,
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  // Simple mock search - in production, this would use full-text search
  const results = query
    ? mockArticles.filter((article) => {
        const searchText = `${article.title} ${article.excerpt} ${article.tags?.join(' ')}`.toLowerCase()
        return searchText.includes(query.toLowerCase())
      })
    : []

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

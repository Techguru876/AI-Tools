import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleFeed } from '@/components/homepage/article-feed'
import { Sidebar } from '@/components/sidebar/sidebar'
import { CATEGORIES, CATEGORY_SLUGS, getCategoryBySlug } from '@/lib/constants/categories'
import { getArticlesByCategory } from '@/lib/mock-data/articles'
import { Badge } from '@/components/ui/badge'

interface CategoryPageProps {
  params: {
    category: string
  }
}

// Generate static params for all categories
export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({
    category: slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.label} - AI Tech Blog`,
    description: category.description,
    openGraph: {
      title: `${category.label} - AI Tech Blog`,
      description: category.description,
    },
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category)

  if (!category) {
    notFound()
  }

  // Get articles for this category
  const articles = getArticlesByCategory(params.category)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Category Header */}
        <div className="border-b bg-muted/30">
          <div className="container py-8">
            <div className="flex items-center gap-3">
              <Badge
                className="text-lg"
                style={{
                  backgroundColor: category.color,
                  color: 'white',
                }}
              >
                {category.label}
              </Badge>
            </div>
            <p className="mt-2 text-lg text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>

        {/* Feed + Sidebar */}
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Article Feed */}
            {articles.length > 0 ? (
              <ArticleFeed initialArticles={articles} />
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No articles yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check back soon for {category.label.toLowerCase()} content.
                  </p>
                </div>
              </div>
            )}

            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

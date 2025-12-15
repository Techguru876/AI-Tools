import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleFeed } from '@/components/homepage/article-feed'
import { Sidebar } from '@/components/sidebar/sidebar'
import { CATEGORIES, CATEGORY_SLUGS, getCategoryBySlug } from '@/lib/constants/categories'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'

// Force dynamic rendering - prevents build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const resolvedParams = await params
  const category = getCategoryBySlug(resolvedParams.category)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.label} - TechBlog USA`,
    description: category.description,
    openGraph: {
      title: `${category.label} - TechBlog USA`,
      description: category.description,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params
  const category = getCategoryBySlug(resolvedParams.category)

  if (!category) {
    notFound()
  }

  // Fetch posts for this category from database
  const posts = await db.post.findMany({
    where: {
      status: 'PUBLISHED',
      categories: {
        some: {
          slug: resolvedParams.category,
        },
      },
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

  // Transform to match ArticleCardProps interface
  const articles = posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    slug: post.slug,
    category: post.categories[0]?.name || category.label,
    categorySlug: post.categories[0]?.slug || resolvedParams.category,
    categoryColor: post.categories[0]?.color || category.color,
    author: 'TechFrontier Team',
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    image: post.coverImage || `https://source.unsplash.com/800x600/?${resolvedParams.category},technology`,
    contentType: post.contentType.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    type: post.contentType.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    tags: post.tags.slice(0, 5).map((tag) => tag.name),
    trending: post.viewCount > 500,
  }))

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

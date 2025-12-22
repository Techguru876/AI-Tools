import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleCard } from '@/components/article-cards/article-card'
import { Sidebar } from '@/components/sidebar/sidebar'
import { db } from '@/lib/db'
import { posts, categories, tags, postCategories, postTags } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Search } from 'lucide-react'

// Force dynamic rendering - prevents build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''

  return {
    title: query ? `Search results for "${query}" - TechBlog USA` : 'Search - TechBlog USA',
    description: `Search results for ${query}`,
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''

  // Query database for matching articles
  let postsWithRelations: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    publishedAt: Date | null
    contentType: string | null
    viewCount: number | null
    categories: Array<{ name: string; slug: string; color: string | null }>
    tags: Array<{ name: string; slug: string }>
  }> = []

  if (query) {
    // Fetch all published posts
    const postsResult = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        publishedAt: posts.publishedAt,
        contentType: posts.contentType,
        viewCount: posts.viewCount,
      })
      .from(posts)
      .where(eq(posts.status, 'PUBLISHED'))
      .orderBy(desc(posts.publishedAt))
      .limit(100)

    // Filter by search query (case-insensitive)
    const lowerQuery = query.toLowerCase()
    const filteredPosts = postsResult.filter((post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      (post.excerpt?.toLowerCase().includes(lowerQuery) ?? false) ||
      post.content.toLowerCase().includes(lowerQuery)
    ).slice(0, 20)

    // Fetch categories and tags for each post
    postsWithRelations = await Promise.all(
      filteredPosts.map(async (post) => {
        const postCats = await db
          .select({
            name: categories.name,
            slug: categories.slug,
            color: categories.color,
          })
          .from(categories)
          .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
          .where(eq(postCategories.postId, post.id))

        const postTagsResult = await db
          .select({
            name: tags.name,
            slug: tags.slug,
          })
          .from(tags)
          .innerJoin(postTags, eq(tags.id, postTags.tagId))
          .where(eq(postTags.postId, post.id))
          .limit(5)

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt,
          contentType: post.contentType,
          viewCount: post.viewCount,
          categories: postCats,
          tags: postTagsResult,
        }
      })
    )
  }

  // Transform to match ArticleCardProps interface
  const results = postsWithRelations.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    slug: post.slug,
    category: post.categories[0]?.name || 'Tech',
    categorySlug: post.categories[0]?.slug || 'tech',
    categoryColor: post.categories[0]?.color || '#3B82F6',
    author: 'TechBlog USA Team',
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    image: post.coverImage || `https://source.unsplash.com/800x600/?technology`,
    contentType: post.contentType?.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    tags: post.tags.slice(0, 5).map((tag) => tag.name),
    trending: (post.viewCount ?? 0) > 500,
    type: post.contentType?.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
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

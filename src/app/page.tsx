import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleFeed } from '@/components/homepage/article-feed'
import { Sidebar } from '@/components/sidebar/sidebar'
import { db } from '@/lib/db'
import { posts, categories, tags, postCategories, postTags } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// Force dynamic rendering - prevents build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function HomePage() {
  // Fetch featured post with categories
  const featuredPostResult = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      readingTime: posts.readingTime,
      viewCount: posts.viewCount,
      publishedAt: posts.publishedAt,
      contentType: posts.contentType,
    })
    .from(posts)
    .where(eq(posts.status, 'PUBLISHED'))
    .orderBy(desc(posts.publishedAt))
    .limit(1)

  // Get featured post's categories
  let featuredPost = featuredPostResult[0] ? {
    ...featuredPostResult[0],
    categories: [] as { name: string; slug: string; color: string | null }[],
  } : null

  if (featuredPost) {
    const featuredCategories = await db
      .select({
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
      })
      .from(categories)
      .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
      .where(eq(postCategories.postId, featuredPost.id))

    featuredPost.categories = featuredCategories
  }

  // Fetch published posts with categories and tags
  const postsResult = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      publishedAt: posts.publishedAt,
      contentType: posts.contentType,
      viewCount: posts.viewCount,
    })
    .from(posts)
    .where(eq(posts.status, 'PUBLISHED'))
    .orderBy(desc(posts.publishedAt))
    .limit(20)

  // Fetch categories and tags for each post
  const postsWithRelations = await Promise.all(
    postsResult.map(async (post) => {
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
        ...post,
        categories: postCats,
        tags: postTagsResult,
      }
    })
  )

  // Transform to match ArticleCardProps interface
  const articles = postsWithRelations.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    slug: post.slug,
    category: post.categories[0]?.name || 'Tech',
    categorySlug: post.categories[0]?.slug || 'tech',
    categoryColor: post.categories[0]?.color || '#3B82F6',
    author: 'TechBlog USA Team',
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    image: post.coverImage || `https://source.unsplash.com/800x600/?technology,${post.categories[0]?.slug || 'tech'}`,
    contentType: post.contentType?.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    type: post.contentType?.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    tags: post.tags.slice(0, 5).map((tag) => tag.name),
    trending: (post.viewCount ?? 0) > 500,
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero Section - TechBlog USA Slogan */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/20 dark:to-teal-950/20">
          <div className="container py-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              TechBlog USA
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Exploring Tomorrow&apos;s Tech, Today
            </p>
          </div>
        </div>

        {/* Featured Article Hero */}
        {featuredPost && (
          <div className="container py-12">
            <a
              href={`/${featuredPost.categories[0]?.slug || 'tech'}/${featuredPost.slug}`}
              className="group block overflow-hidden rounded-2xl border transition-shadow hover:shadow-2xl"
            >
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-video lg:aspectauto lg:min-h-[400px]">
                  {featuredPost.coverImage && (
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute left-4 top-4">
                    <span
                      className="rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-lg"
                      style={{ backgroundColor: featuredPost.categories[0]?.color || '#3B82F6' }}
                    >
                      {featuredPost.categories[0]?.name || 'Featured'}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center p-8">
                  <span className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                    Featured Article
                  </span>
                  <h2 className="mb-4 text-3xl font-bold leading-tight group-hover:text-primary md:text-4xl">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="mb-6 text-lg text-muted-foreground line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{featuredPost.readingTime || 5} min read</span>
                    <span>•</span>
                    <span>{(featuredPost.viewCount ?? 0).toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        )}

        <div className="container py-8">
          {/* Main Feed + Sidebar Layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Feed */}
            <ArticleFeed initialArticles={articles} />

            {/* Sidebar (Desktop Only) */}
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

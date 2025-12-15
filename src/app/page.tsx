import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleFeed } from '@/components/homepage/article-feed'
import { Sidebar } from '@/components/sidebar/sidebar'
import { db } from '@/lib/db'

// Force dynamic rendering - prevents build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function HomePage() {
  // Fetch featured post
  const featuredPost = await db.post.findFirst({
    where: {
      status: 'PUBLISHED',
      featured: true
    },
    include: {
      categories: {
        select: {
          name: true,
          slug: true,
          color: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  // Fetch published posts from database
  const posts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
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
    category: post.categories[0]?.name || 'Tech',
    categorySlug: post.categories[0]?.slug || 'tech',
    categoryColor: post.categories[0]?.color || '#3B82F6',
    author: 'TechBlog USA Team',
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    image: post.coverImage || `https://source.unsplash.com/800x600/?technology,${post.categories[0]?.slug || 'tech'}`,
    contentType: post.contentType.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    type: post.contentType.toLowerCase() as 'news' | 'feature' | 'review' | 'deal' | 'opinion',
    tags: post.tags.slice(0, 5).map((tag) => tag.name),
    trending: post.viewCount > 500,
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
                    <span>{featuredPost.viewCount.toLocaleString()} views</span>
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

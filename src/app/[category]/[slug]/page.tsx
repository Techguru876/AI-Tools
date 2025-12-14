import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { db } from '@/lib/db'
import { getCategoryBySlug } from '@/lib/constants/categories'

interface ArticlePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const resolvedParams = await params
  const post = await db.post.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: `${post.title} - TechFrontier`,
    description: post.excerpt || post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.metaDescription || '',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.metaDescription || '',
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params
  const category = getCategoryBySlug(resolvedParams.category)

  if (!category) {
    notFound()
  }

  // Fetch article from database
  const post = await db.post.findUnique({
    where: { slug: resolvedParams.slug },
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
  })

  if (!post) {
    notFound()
  }

  // Increment view count (fire and forget)
  db.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => { }) // Silently fail if update fails

  // Get related articles (same category, exclude current)
  const relatedPosts = await db.post.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: post.id },
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
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })

  const articleCategory = post.categories[0] || { name: category.label, slug: resolvedParams.category, color: category.color }
  const authorName = 'TechFrontier Team'
  const publishedAt = post.publishedAt || post.createdAt

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container max-w-4xl py-8">
          {/* Article Header */}
          <header className="mb-8">
            {/* Category Badge */}
            <div className="mb-4">
              <Badge
                style={{
                  backgroundColor: articleCategory.color || category.color,
                  color: 'white',
                }}
              >
                {articleCategory.name}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
              {post.title}
            </h1>

            {/* Excerpt/Dek */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            {/* Metadata */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <time dateTime={publishedAt.toISOString()}>
                  {formatDistanceToNow(publishedAt, {
                    addSuffix: true,
                  })}
                </time>
              </div>
              {/* Social Share */}
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="ghost">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="mb-8">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="article-content prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.slug} href={`/topics/${tag.slug}`}>
                    <Badge variant="outline" className="hover:bg-accent">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/${related.categories[0]?.slug || 'tech'}/${related.slug}`}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
                      {related.coverImage && (
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={related.coverImage}
                            alt={related.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                          {related.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {related.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-12 rounded-lg border bg-muted/50 p-8 text-center">
            <h3 className="mb-2 text-2xl font-bold">Stay in the Loop</h3>
            <p className="mb-4 text-muted-foreground">
              Get the latest tech news delivered to your inbox daily.
            </p>
            <div className="mx-auto flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border bg-background px-4 py-2"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

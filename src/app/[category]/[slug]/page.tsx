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
import { mockArticles } from '@/lib/mock-data/articles'
import { getCategoryBySlug } from '@/lib/constants/categories'

interface ArticlePageProps {
  params: {
    category: string
    slug: string
  }
}

// For demo: find article by slug
function getArticleBySlug(slug: string) {
  return mockArticles.find((article) => {
    // Generate slug from title for demo
    const articleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    return articleSlug === slug
  })
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: `${article.title} - AI Tech Blog`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image ? [{ url: article.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : [],
    },
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug)
  const category = getCategoryBySlug(params.category)

  if (!article || !category) {
    notFound()
  }

  // Mock article content - in production, this would come from database
  const articleContent = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Key Highlights

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Technical Specifications

- **Processor**: Latest generation chip
- **Memory**: Up to 64GB RAM
- **Storage**: 1TB SSD
- **Display**: 15-inch Retina display

## Performance Analysis

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Conclusion

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
  `.trim()

  // Get related articles (same category, exclude current)
  const relatedArticles = mockArticles
    .filter(
      (a) => a.category === article.category && a.id !== article.id
    )
    .slice(0, 3)

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
                  backgroundColor: category.color,
                  color: 'white',
                }}
              >
                {category.label}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
              {article.title}
            </h1>

            {/* Excerpt/Dek */}
            <p className="text-xl text-muted-foreground">
              {article.excerpt}
            </p>

            {/* Metadata */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDistanceToNow(article.publishedAt, {
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
          {article.image && (
            <div className="mb-8">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="article-content prose prose-lg dark:prose-invert max-w-none">
            {/* In production, this would be rendered markdown or from rich text editor */}
            <div dangerouslySetInnerHTML={{ __html: articleContent.replace(/\n/g, '<br/>') }} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link key={tag} href={`/topics/${tag}`}>
                    <Badge variant="outline" className="hover:bg-accent">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/${related.category}/${related.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
                      {related.image && (
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={related.image}
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

import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'
import { Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'RSS Feeds | TechFrontier',
  description: 'Subscribe to TechFrontier RSS feeds to stay updated with the latest tech news, reviews, and articles.',
}

export default function RSSPage() {
  const feeds = [
    {
      title: 'All Content',
      description: 'Complete feed of all TechFrontier articles, news, and reviews',
      url: '/feed.xml',
      subscribers: '15K+',
    },
    {
      title: 'Tech News',
      description: 'Latest technology news and industry updates',
      url: '/feeds/tech.xml',
      subscribers: '8K+',
    },
    {
      title: 'Science',
      description: 'Science and research news',
      url: '/feeds/science.xml',
      subscribers: '5K+',
    },
    {
      title: 'AI News',
      description: 'Artificial Intelligence and machine learning updates',
      url: '/feeds/ai-news.xml',
      subscribers: '12K+',
    },
    {
      title: 'Product Reviews',
      description: 'In-depth reviews of the latest gadgets and tech products',
      url: '/feeds/reviews.xml',
      subscribers: '7K+',
    },
    {
      title: 'Culture & Entertainment',
      description: 'Tech culture, gaming, and entertainment news',
      url: '/feeds/culture.xml',
      subscribers: '4K+',
    },
    {
      title: 'Deals & Discounts',
      description: 'Best tech deals, sales, and buying opportunities',
      url: '/feeds/deals.xml',
      subscribers: '6K+',
    },
  ]

  const readers = [
    { name: 'Feedly', url: 'https://feedly.com' },
    { name: 'Inoreader', url: 'https://www.inoreader.com' },
    { name: 'NewsBlur', url: 'https://newsblur.com' },
    { name: 'The Old Reader', url: 'https://theoldreader.com' },
    { name: 'Feedbin', url: 'https://feedbin.com' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Rss className="h-10 w-10 text-primary" />
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                RSS Feeds
              </h1>
              <p className="text-xl text-muted-foreground">
                Subscribe to TechFrontier content in your favorite RSS reader
              </p>
            </div>

            <Separator className="mb-12" />

            {/* What is RSS */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">What is RSS?</h2>
              <div className="rounded-lg border bg-card p-6">
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  RSS (Really Simple Syndication) is a web feed format that allows you to
                  subscribe to websites and receive updates automatically in your RSS
                  reader app. Instead of visiting TechFrontier multiple times a day, your
                  RSS reader will notify you whenever we publish new content.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  RSS gives you complete control over your reading experience—no
                  algorithms, no ads, no tracking. Just pure content delivered the way you
                  want it.
                </p>
              </div>
            </section>

            {/* Available Feeds */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">Available Feeds</h2>
              <div className="space-y-4">
                {feeds.map((feed, index) => (
                  <div key={index} className="rounded-lg border bg-card p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 flex items-center gap-2 font-bold">
                          <Rss className="h-5 w-5 text-primary" />
                          {feed.title}
                        </h3>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {feed.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {feed.subscribers} subscribers
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={feed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Rss className="mr-2 h-4 w-4" />
                            Subscribe
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const fullUrl = `${window.location.origin}${feed.url}`
                            navigator.clipboard.writeText(fullUrl)
                          }}
                        >
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How to Subscribe */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">How to Subscribe</h2>
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Step 1: Choose an RSS Reader</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Pick an RSS reader app or service. Here are some popular options:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {readers.map((reader, index) => (
                      <a
                        key={index}
                        href={reader.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border bg-background px-3 py-1 text-sm transition-colors hover:bg-accent"
                      >
                        {reader.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Step 2: Add the Feed URL</h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Copy the feed URL from the list above and paste it into your RSS
                    reader. Most readers have an &quot;Add Feed&quot; or &quot;Subscribe&quot; button.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Example URL:{' '}
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      https://techfrontier.com/feed.xml
                    </code>
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Step 3: Enjoy!</h3>
                  <p className="text-sm text-muted-foreground">
                    That&apos;s it! You&apos;ll now receive all new TechFrontier content
                    directly in your reader. You can subscribe to multiple feeds to
                    customize your reading experience.
                  </p>
                </div>
              </div>
            </section>

            {/* Alternative */}
            <section>
              <div className="rounded-lg border bg-muted/50 p-6">
                <h3 className="mb-2 text-lg font-bold">
                  Prefer Email Instead?
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  If RSS isn&apos;t your thing, subscribe to our newsletter for daily
                  and weekly digests delivered straight to your inbox.
                </p>
                <Button asChild>
                  <a href="/newsletter">Subscribe to Newsletter</a>
                </Button>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

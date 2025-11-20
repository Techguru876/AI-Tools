import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleFeed } from '@/components/homepage/article-feed'
import { Sidebar } from '@/components/sidebar/sidebar'
import { mockArticles } from '@/lib/mock-data/articles'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero Section - TechFrontier Slogan */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/20 dark:to-teal-950/20">
          <div className="container py-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              TechFrontier
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Exploring Tomorrow&apos;s Tech, Today
            </p>
          </div>
        </div>

        <div className="container py-8">
          {/* Main Feed + Sidebar Layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Feed */}
            <ArticleFeed initialArticles={mockArticles} />

            {/* Sidebar (Desktop Only) */}
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

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

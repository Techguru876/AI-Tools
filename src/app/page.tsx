import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedPosts } from '@/components/sections/featured-posts'
import { CategoryGrid } from '@/components/sections/category-grid'
import { TrendingNews } from '@/components/sections/trending-news'
import { NewsletterSignup } from '@/components/sections/newsletter-signup'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <FeaturedPosts />
        <CategoryGrid />
        <TrendingNews />
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  )
}

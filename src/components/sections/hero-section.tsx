import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="container py-12 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          The Future of Tech News is{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI-Powered
          </span>
        </h1>
        <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
          Get the latest tech news, expert reviews, and buying guides powered by advanced AI. Stay ahead
          of the curve with instant analysis and personalized recommendations.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/latest">
              Explore Latest News
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/subscribe">Subscribe for Free</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-8">
          <div>
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-sm text-muted-foreground">Articles Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-sm text-muted-foreground">AI Coverage</div>
          </div>
          <div>
            <div className="text-3xl font-bold">100%</div>
            <div className="text-sm text-muted-foreground">Fact-Checked</div>
          </div>
        </div>
      </div>
    </section>
  )
}

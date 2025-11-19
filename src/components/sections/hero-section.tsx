import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="container py-12 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="reveal-on-scroll">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            The Future of Tech News is{' '}
            <span className="gradient-text bg-gradient-to-r from-primary via-blue-600 to-purple-600">
              AI-Powered
            </span>
          </h1>
        </div>

        <div className="reveal-on-scroll" style={{ animationDelay: '0.1s' }}>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Get the latest tech news, expert reviews, and buying guides powered by advanced AI. Stay
            ahead of the curve with instant analysis and personalized recommendations.
          </p>
        </div>

        <div
          className="reveal-on-scroll flex flex-col justify-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.2s' }}
        >
          <Button size="lg" className="btn-ripple group" asChild>
            <Link href="/latest">
              Explore Latest News
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="btn-ripple" asChild>
            <Link href="/subscribe">Subscribe for Free</Link>
          </Button>
        </div>

        {/* Stats with stagger animation */}
        <div className="stagger-children mt-16 grid grid-cols-3 gap-8 border-t pt-8">
          <div className="group cursor-default">
            <div className="text-3xl font-bold transition-colors group-hover:text-primary">
              1000+
            </div>
            <div className="text-sm text-muted-foreground">Articles Generated</div>
          </div>
          <div className="group cursor-default">
            <div className="text-3xl font-bold transition-colors group-hover:text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Coverage</div>
          </div>
          <div className="group cursor-default">
            <div className="text-3xl font-bold transition-colors group-hover:text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Fact-Checked</div>
          </div>
        </div>
      </div>
    </section>
  )
}

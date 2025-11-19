import { TrendingWidget } from './trending-widget'
import { DealsWidget } from './deals-widget'
import { NewsletterWidget } from './newsletter-widget'

export function Sidebar() {
  return (
    <aside className="hidden space-y-6 lg:block">
      {/* Trending Posts */}
      <TrendingWidget />

      {/* Featured Deals */}
      <DealsWidget />

      {/* Newsletter Signup */}
      <NewsletterWidget />

      {/* Ad Placement - Placeholder */}
      <div className="rounded-lg border bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">Advertisement</p>
        <div className="mt-2 h-64 rounded bg-muted/40" />
      </div>
    </aside>
  )
}

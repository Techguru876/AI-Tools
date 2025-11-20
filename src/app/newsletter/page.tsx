'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Check } from 'lucide-react'
import { useState } from 'react'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual newsletter subscription
    setSubscribed(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-3xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Join the TechFrontier Newsletter
              </h1>
              <p className="text-xl text-muted-foreground">
                Stay ahead of the curve with daily tech insights delivered to your inbox
              </p>
            </div>

            <Separator className="mb-12" />

            {/* Subscription Form */}
            {!subscribed ? (
              <div className="mb-12 rounded-lg border bg-card p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Subscribe to Newsletter
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By subscribing, you agree to our{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    . Unsubscribe anytime.
                  </p>
                </form>
              </div>
            ) : (
              <div className="mb-12 rounded-lg border bg-green-50 p-8 text-center dark:bg-green-900/20">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-green-900 dark:text-green-100">
                  You&apos;re Subscribed!
                </h2>
                <p className="text-green-800 dark:text-green-200">
                  Check your inbox for a confirmation email. Welcome to the frontier!
                </p>
              </div>
            )}

            {/* What You'll Get */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">What You&apos;ll Get</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Daily Tech Digest</h3>
                  <p className="text-sm text-muted-foreground">
                    Curated top stories from AI, gadgets, startups, and emerging tech—delivered every morning.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Exclusive Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    In-depth product reviews and comparisons before they hit the main site.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Deal Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Early access to the best tech deals, discounts, and product launches.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-lg font-bold">Weekly Roundup</h3>
                  <p className="text-sm text-muted-foreground">
                    Friday deep-dive featuring the week&apos;s biggest stories and expert analysis.
                  </p>
                </div>
              </div>
            </section>

            {/* Frequency */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">Newsletter Schedule</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    M-F
                  </span>
                  <div>
                    <p className="font-medium">Daily Digest (9:00 AM EST)</p>
                    <p className="text-sm text-muted-foreground">
                      Top 5-7 stories of the day
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    F
                  </span>
                  <div>
                    <p className="font-medium">Weekly Roundup (5:00 PM EST)</p>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive analysis and biggest stories
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    ?
                  </span>
                  <div>
                    <p className="font-medium">Special Editions (As needed)</p>
                    <p className="text-sm text-muted-foreground">
                      Breaking news, product launches, major announcements
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Privacy Assurance */}
            <section>
              <div className="rounded-lg border bg-muted/50 p-6">
                <h3 className="mb-2 text-lg font-bold">Your Privacy Matters</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  We respect your inbox and your privacy. No spam, no selling your data, no shady practices. Unsubscribe with one click anytime.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>✓ No spam ever</span>
                  <span>✓ Unsubscribe anytime</span>
                  <span>✓ Never shared or sold</span>
                  <span>✓ GDPR compliant</span>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Advertise with TechBlog USA',
  description:
    'Reach a highly engaged audience of tech enthusiasts, early adopters, and decision-makers. Learn about advertising opportunities on TechBlog USA.',
  openGraph: {
    title: 'Advertise with TechBlog USA',
    description:
      'Reach a highly engaged audience of tech enthusiasts, early adopters, and decision-makers.',
  },
}

export default function AdvertisePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Advertise with TechBlog USA
              </h1>
              <p className="text-xl text-muted-foreground">
                Reach a highly engaged audience at the frontier of technology
              </p>
            </div>

            <Separator className="mb-12" />

            {/* Why Advertise Section */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">Why TechBlog USA?</h2>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                TechBlog USA reaches a passionate, tech-savvy audience of early adopters,
                industry professionals, and enthusiasts who are actively researching and
                purchasing the latest technology products and services.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-6 text-center">
                  <div className="mb-2 text-3xl font-bold text-primary">500K+</div>
                  <p className="text-sm text-muted-foreground">Monthly Readers</p>
                </div>
                <div className="rounded-lg border bg-card p-6 text-center">
                  <div className="mb-2 text-3xl font-bold text-primary">2.5M+</div>
                  <p className="text-sm text-muted-foreground">Monthly Page Views</p>
                </div>
                <div className="rounded-lg border bg-card p-6 text-center">
                  <div className="mb-2 text-3xl font-bold text-primary">85%</div>
                  <p className="text-sm text-muted-foreground">Tech Decision Makers</p>
                </div>
              </div>
            </section>

            {/* Advertising Options */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">Advertising Options</h2>
              <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Display Advertising</h3>
                  <p className="mb-4 text-muted-foreground">
                    Banner ads, native content blocks, and sponsored placements throughout
                    our site. Available in multiple formats and sizes.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Homepage hero placements
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Sidebar widgets and native ads
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Category-specific targeting
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Sponsored Content</h3>
                  <p className="mb-4 text-muted-foreground">
                    Work with our editorial team to create custom content that resonates
                    with our audience while clearly marked as sponsored.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Product reviews and comparisons
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Thought leadership articles
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Launch announcements and features
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Newsletter Sponsorship</h3>
                  <p className="mb-4 text-muted-foreground">
                    Reach our engaged subscribers directly with dedicated placements in
                    our weekly newsletter.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Primary sponsor placement
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Classified listings
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      Exclusive newsletter editions
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Custom Campaigns</h3>
                  <p className="text-muted-foreground">
                    Multi-channel campaigns combining display, content, social, and email
                    for maximum impact. We&apos;ll work with you to design a package that
                    meets your goals.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Audience */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">Our Audience</h2>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                TechBlog USA readers are highly engaged technology enthusiasts who
                actively seek out the latest news, reviews, and buying guides:
              </p>
              <ul className="grid gap-3 md:grid-cols-2">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Tech professionals and decision-makers
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Early adopters and gadget enthusiasts
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Software developers and engineers
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">AI/ML researchers and practitioners</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Consumer electronics buyers
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">Startup founders and investors</span>
                </li>
              </ul>
            </section>

            {/* Contact CTA */}
            <section>
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Let&apos;s Work Together</h2>
                <p className="mb-4 text-muted-foreground">
                  Ready to reach our engaged tech audience? Get in touch to discuss your
                  advertising goals.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Contact Sales
                  </a>
                  <a
                    href="mailto:advertising@techblogusa.com"
                    className="inline-flex items-center justify-center rounded-md border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Email Us
                  </a>
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

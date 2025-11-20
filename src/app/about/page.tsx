import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'About TechFrontier | Exploring Tomorrow\'s Tech, Today',
  description:
    'TechFrontier is an independent tech media platform at the edge of innovation, delivering up-to-the-minute news, unbiased reviews, and expert analysis.',
  openGraph: {
    title: 'About TechFrontier',
    description:
      'TechFrontier is an independent tech media platform at the edge of innovation, delivering up-to-the-minute news, unbiased reviews, and expert analysis.',
  },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500">
                <span className="text-3xl font-bold text-white">TF</span>
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                About TechFrontier
              </h1>
              <p className="text-xl italic text-muted-foreground">
                Exploring Tomorrow&apos;s Tech, Today
              </p>
            </div>

            <Separator className="mb-12" />

            {/* Who We Are Section */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">Who We Are</h2>
              <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                TechFrontier is an independent tech media platform at the edge of
                innovation. Our mission is to decode and showcase tomorrow&apos;s
                breakthroughs—delivering up-to-the-minute news, unbiased reviews, and
                expert analysis powered by both editorial expertise and AI intelligence.
              </p>
            </section>

            {/* What We Cover Section */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">What We Cover</h2>
              <ul className="grid gap-3 text-lg md:grid-cols-2">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Artificial Intelligence and Machine Learning
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Emerging Gadgets and Consumer Electronics
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Major Tech Industry News & Trends
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Startups, Innovators, and Product Launches
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Comparative Reviews, Buying Guides, and Trends
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Cloud, LLMs, Automation, and Connected Devices
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-muted-foreground">
                    Tech Deals and Buying Advice
                  </span>
                </li>
              </ul>
            </section>

            {/* What Users Can Expect Section */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">What Users Can Expect</h2>
              <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                At TechFrontier, readers find:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-lg text-muted-foreground">
                    <strong className="text-foreground">
                      Timely stories curated and generated with advanced AI
                    </strong>
                    , backed by human editors for accuracy and insight.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-lg text-muted-foreground">
                    <strong className="text-foreground">
                      Comprehensive, jargon-free coverage
                    </strong>{' '}
                    for both early adopters and mainstream consumers.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-lg text-muted-foreground">
                    <strong className="text-foreground">
                      Real reviews, hands-on comparisons, and actionable guides
                    </strong>{' '}
                    to help users make smarter tech choices.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-lg text-muted-foreground">
                    <strong className="text-foreground">
                      A transparent affiliate and advertising approach
                    </strong>
                    —clearly marking sponsored content and recommendations.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span className="text-lg text-muted-foreground">
                    <strong className="text-foreground">
                      Community features, newsletters, trending topics
                    </strong>
                    , and regular deal roundups.
                  </span>
                </li>
              </ul>
            </section>

            {/* Our Mission Section */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                To empower people to confidently navigate the future of
                technology—keeping our community at the frontier of what&apos;s possible.
              </p>
            </section>

            {/* Call to Action */}
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <h3 className="mb-2 text-2xl font-bold">Join the Frontier</h3>
              <p className="mb-4 text-muted-foreground">
                Stay ahead with the latest tech news, reviews, and insights delivered to
                your inbox.
              </p>
              <a
                href="/newsletter"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe to Newsletter
              </a>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

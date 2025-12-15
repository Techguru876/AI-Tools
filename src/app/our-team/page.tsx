import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Our Team | TechBlog USA',
  description:
    'Meet the team behind TechBlog USA - passionate tech journalists, editors, and analysts dedicated to bringing you the latest in technology.',
  openGraph: {
    title: 'Our Team | TechBlog USA',
    description:
      'Meet the team behind TechBlog USA - passionate tech journalists, editors, and analysts dedicated to bringing you the latest in technology.',
  },
}

export default function OurTeamPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Our Team
              </h1>
              <p className="text-xl text-muted-foreground">
                Meet the people driving innovation in tech journalism
              </p>
            </div>

            <Separator className="mb-12" />

            {/* Team Introduction */}
            <section className="mb-12">
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                TechBlog USA is powered by a passionate team of tech journalists,
                editors, reviewers, and AI specialists who live and breathe innovation.
                We combine decades of editorial experience with cutting-edge AI
                technology to deliver content that&apos;s timely, accurate, and actionable.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Our team includes former writers and editors from leading tech
                publications, hardware reviewers with years of hands-on experience, data
                scientists specializing in AI/ML, and product experts who test and
                evaluate the latest gadgets.
              </p>
            </section>

            {/* Team Values */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">What Drives Us</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Accuracy First</h3>
                  <p className="text-muted-foreground">
                    Every story is fact-checked and verified. We blend AI efficiency
                    with human oversight to ensure the highest standards.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Reader-Centric</h3>
                  <p className="text-muted-foreground">
                    We write for you—whether you&apos;re a tech enthusiast or just
                    curious about the latest gadgets. Clear, jargon-free content.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Independence</h3>
                  <p className="text-muted-foreground">
                    Our reviews are unbiased and honest. We clearly mark all sponsored
                    content and affiliate relationships.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-2 text-xl font-bold">Innovation</h3>
                  <p className="text-muted-foreground">
                    We embrace AI and automation to deliver more content faster—without
                    sacrificing quality or editorial standards.
                  </p>
                </div>
              </div>
            </section>

            {/* Join Our Team CTA */}
            <section>
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Join Our Team</h2>
                <p className="mb-4 text-muted-foreground">
                  Interested in contributing to TechBlog USA? We&apos;re always looking
                  for talented writers, reviewers, and tech experts.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get in Touch
                </a>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

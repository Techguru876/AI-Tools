import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Download, Image as ImageIcon, FileText, Palette } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Media Kit | TechBlog USA',
  description: 'Download TechBlog USA brand assets, logos, and press materials for media coverage.',
}

export default function MediaKitPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Media Kit
              </h1>
              <p className="text-xl text-muted-foreground">
                Brand assets, logos, and press materials for TechBlog USA
              </p>
            </div>

            <Separator className="mb-12" />

            {/* About TechBlog USA */}
            <section className="mb-12">
              <h2 className="mb-4 text-3xl font-bold">About TechBlog USA</h2>
              <div className="rounded-lg border bg-card p-6">
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">TechBlog USA</strong> is an independent tech media platform at the edge of innovation, delivering up-to-the-minute news, unbiased reviews, and expert analysis powered by both editorial expertise and AI intelligence.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Tagline:</strong> Exploring Tomorrow&apos;s Tech, Today
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Founded:</strong> 2025
                </p>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">Audience & Reach</h2>
              <div className="grid gap-4 md:grid-cols-3">
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

            {/* Logo Assets */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">Logo Assets</h2>
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-bold">TechBlog USA Logo (SVG)</h3>
                      <p className="text-sm text-muted-foreground">
                        Primary logo in vector format - use for all digital applications
                      </p>
                    </div>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/logos/header/tech_frontier.svg" download>
                        <Download className="mr-2 h-4 w-4" />
                        Light Mode
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/logos/header/tech_frontier_white.svg" download>
                        <Download className="mr-2 h-4 w-4" />
                        Dark Mode
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-bold">TechBlog USA Logo (PNG)</h3>
                      <p className="text-sm text-muted-foreground">
                        High-resolution PNG versions for presentations and print
                      </p>
                    </div>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/logos/brand/tech_frontier_512x512.png" download>
                        <Download className="mr-2 h-4 w-4" />
                        512x512
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/logos/brand/tech_frontier_transparent.png" download>
                        <Download className="mr-2 h-4 w-4" />
                        Transparent
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-bold">Social Media Assets</h3>
                      <p className="text-sm text-muted-foreground">
                        Optimized for social media profiles and sharing
                      </p>
                    </div>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/og-image.png" download>
                        <Download className="mr-2 h-4 w-4" />
                        OG Image (1200x630)
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/logos/social/tech_frontier_512x512.png" download>
                        <Download className="mr-2 h-4 w-4" />
                        Square (512x512)
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Brand Colors */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">Brand Colors</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <Palette className="h-5 w-5" />
                    Primary Gradient
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Blue</p>
                          <p className="text-xs text-muted-foreground">#3B82F6</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-teal-500" />
                        <div>
                          <p className="text-sm font-medium">Teal</p>
                          <p className="text-xs text-muted-foreground">#14B8A6</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <Palette className="h-5 w-5" />
                    Usage Guidelines
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use gradient for primary branding</li>
                    <li>• Maintain clear space around logo</li>
                    <li>• Don&apos;t distort or recolor the logo</li>
                    <li>• Use white logo on dark backgrounds</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Press Contact */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">Press Contact</h2>
              <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 font-bold">Editorial Inquiries</h3>
                    <a
                      href="mailto:editorial@techblogusa.com"
                      className="text-primary hover:underline"
                    >
                      editorial@techblogusa.com
                    </a>
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">Partnership Opportunities</h3>
                    <a
                      href="mailto:advertising@techblogusa.com"
                      className="text-primary hover:underline"
                    >
                      advertising@techblogusa.com
                    </a>
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">General Press</h3>
                    <a
                      href="mailto:hello@techblogusa.com"
                      className="text-primary hover:underline"
                    >
                      hello@techblogusa.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage Terms */}
            <section>
              <div className="rounded-lg border bg-muted/50 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                  <FileText className="h-5 w-5" />
                  Usage Terms
                </h3>
                <p className="text-sm text-muted-foreground">
                  These assets are provided for press and media use only. By downloading, you agree to use TechBlog USA branding assets solely for editorial coverage, reviews, or news reporting. Commercial use requires prior written permission. For questions about usage rights, contact{' '}
                  <a href="mailto:hello@techblogusa.com" className="text-primary hover:underline">
                    hello@techblogusa.com
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | TechBlog USA',
  description: 'TechBlog USA Affiliate Disclosure - Learn about our affiliate relationships and how we earn commissions.',
}

export default function AffiliateDisclosurePage() {
  const lastUpdated = 'November 20, 2025'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Affiliate Disclosure
            </h1>
            <p className="mb-8 text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>

            <Separator className="mb-8" />

            <div className="prose prose-gray max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Our Commitment to Transparency</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  At TechBlog USA, we believe in transparency and honesty with our
                  readers. This disclosure explains how we earn revenue through affiliate
                  relationships and how it affects our content.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  <strong>
                    TechBlog USA participates in affiliate marketing programs.
                  </strong>{' '}
                  This means that when you click on certain links on our website and make
                  a purchase, we may receive a commission at no extra cost to you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">What Are Affiliate Links?</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Affiliate links are special URLs that contain a unique tracking code.
                  When you click these links and make a purchase, the merchant can
                  identify that the sale came from TechBlog USA, and we receive a small
                  commission.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  These commissions help us maintain the website, create quality content,
                  and continue providing valuable tech news, reviews, and buying guides.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Affiliate Programs We Participate In</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TechBlog USA is a participant in various affiliate programs, including
                  but not limited to:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>• Amazon Associates Program</li>
                  <li>• Technology manufacturer affiliate programs (Apple, Microsoft, etc.)</li>
                  <li>• Retailer affiliate networks (Best Buy, B&H Photo, etc.)</li>
                  <li>• Software and SaaS affiliate programs</li>
                  <li>• Commission Junction, ShareASale, and other affiliate networks</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Our Editorial Independence</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  <strong>
                    Our affiliate relationships do NOT influence our editorial content,
                    reviews, or recommendations.
                  </strong>
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We maintain strict editorial independence:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • Our reviews are honest, unbiased, and based on thorough testing and
                    research
                  </li>
                  <li>
                    • We recommend products based on merit, not commission rates
                  </li>
                  <li>
                    • Negative reviews are published even if they affect potential affiliate
                    income
                  </li>
                  <li>
                    • Our editorial team operates independently from our business
                    operations
                  </li>
                  <li>
                    • We clearly distinguish between editorial content and sponsored/paid
                    content
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  How We Identify Affiliate Content
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We strive to be transparent about affiliate relationships:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • Articles containing affiliate links include a disclosure notice
                  </li>
                  <li>
                    • &quot;Deals&quot; sections prominently feature products with
                    affiliate links
                  </li>
                  <li>
                    • Buying guides and product roundups may contain affiliate links
                  </li>
                  <li>
                    • We clearly mark sponsored content as &quot;Sponsored&quot; or
                    &quot;Partner Content&quot;
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Your Purchase Decisions</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Whether or not you use our affiliate links is entirely up to you. You
                  are under no obligation to purchase through our links. The price you pay
                  is the same whether you use an affiliate link or go directly to the
                  merchant.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  By using our affiliate links, you&apos;re supporting TechBlog USA at no
                  additional cost to you, which helps us continue providing free, quality
                  content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Sponsored Content</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  In addition to affiliate links, TechBlog USA may publish sponsored
                  content, including:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>• Paid product reviews or features</li>
                  <li>• Sponsored articles or advertorials</li>
                  <li>• Brand partnerships</li>
                </ul>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  All sponsored content is clearly labeled as &quot;Sponsored,&quot;
                  &quot;Partner Content,&quot; &quot;Paid Partnership,&quot; or similar
                  designations. Sponsored content follows the same editorial standards as
                  our regular content, but the sponsoring company may have input on the
                  topic or messaging.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Amazon Associates Disclosure</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TechBlog USA is a participant in the Amazon Services LLC Associates
                  Program, an affiliate advertising program designed to provide a means
                  for sites to earn advertising fees by advertising and linking to
                  Amazon.com and affiliated international sites (e.g., Amazon.co.uk,
                  Amazon.ca).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">FTC Compliance</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  This disclosure is in accordance with the Federal Trade Commission&apos;s
                  16 CFR Part 255: &quot;Guides Concerning the Use of Endorsements and
                  Testimonials in Advertising.&quot;
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Questions?</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  If you have questions about our affiliate relationships or this
                  disclosure, please contact us:
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Email: editorial@techblogusa.com
                  <br />
                  Or visit our{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact Page
                  </a>
                </p>
              </section>

              <section>
                <div className="rounded-lg border bg-muted/50 p-6">
                  <h3 className="mb-2 text-lg font-bold">Bottom Line</h3>
                  <p className="text-sm text-muted-foreground">
                    We only recommend products and services we genuinely believe in.
                    Whether a product has an affiliate program or not, our primary goal is
                    to provide honest, accurate information to help you make informed tech
                    purchasing decisions.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

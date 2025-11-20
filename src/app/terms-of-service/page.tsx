import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Terms of Service | TechFrontier',
  description: 'TechFrontier Terms of Service - Please read these terms carefully before using our website.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'November 20, 2025'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Terms of Service
            </h1>
            <p className="mb-8 text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>

            <Separator className="mb-8" />

            <div className="prose prose-gray max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Agreement to Terms</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  By accessing or using TechFrontier (&quot;the Site&quot;), you agree to
                  be bound by these Terms of Service and our Privacy Policy. If you do
                  not agree with any part of these terms, you may not access the Site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Use of the Site</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TechFrontier grants you a limited, non-exclusive, non-transferable
                  license to access and use the Site for personal, non-commercial
                  purposes. You agree not to:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • Reproduce, distribute, or create derivative works from our content
                    without permission
                  </li>
                  <li>• Use automated systems to access the Site without authorization</li>
                  <li>
                    • Attempt to gain unauthorized access to any portion of the Site
                  </li>
                  <li>
                    • Use the Site for any illegal purpose or to violate any laws
                  </li>
                  <li>• Interfere with or disrupt the Site or servers</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Intellectual Property</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  All content on TechFrontier, including but not limited to text,
                  graphics, logos, images, and software, is the property of TechFrontier
                  or its content suppliers and is protected by copyright, trademark, and
                  other intellectual property laws.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  You may not republish, redistribute, or repurpose our content for
                  commercial use without our express written permission. Brief excerpts
                  and links for non-commercial purposes with proper attribution are
                  permitted.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">User Content</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  If you submit comments, feedback, or other content to the Site, you
                  grant TechFrontier a worldwide, non-exclusive, royalty-free license to
                  use, reproduce, and publish such content. You represent that you own or
                  have permission to share the content you submit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Third-Party Links</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  The Site may contain links to third-party websites. These links are
                  provided for your convenience only. TechFrontier does not endorse or
                  assume responsibility for the content, privacy policies, or practices of
                  third-party sites.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  Affiliate Relationships and Advertising
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TechFrontier participates in affiliate marketing programs and may earn
                  commissions on purchases made through links on our Site. We also
                  display advertising and sponsored content. All sponsored content is
                  clearly marked. See our{' '}
                  <a href="/affiliate-disclosure" className="text-primary hover:underline">
                    Affiliate Disclosure
                  </a>{' '}
                  for more information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Disclaimer of Warranties</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  THE SITE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                  WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TechFrontier
                  DOES NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR
                  FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  While we strive for accuracy, we do not warrant the completeness,
                  reliability, or accuracy of any content on the Site. Product reviews and
                  recommendations are based on our editorial judgment and testing.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Limitation of Liability</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, TechFrontier SHALL NOT BE
                  LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                  PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Indemnification</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  You agree to indemnify and hold harmless TechFrontier and its
                  affiliates, officers, agents, and employees from any claim, demand,
                  loss, or damages arising out of your use of the Site or violation of
                  these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Governing Law</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the
                  laws of the United States, without regard to its conflict of law
                  provisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Changes to Terms</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We reserve the right to modify these Terms at any time. Changes will be
                  effective immediately upon posting. Your continued use of the Site after
                  changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Contact Us</h2>
                <p className="leading-relaxed text-muted-foreground">
                  If you have questions about these Terms of Service, please contact us
                  at:
                  <br />
                  Email: legal@techfrontier.com
                  <br />
                  Or visit our{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact Page
                  </a>
                </p>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

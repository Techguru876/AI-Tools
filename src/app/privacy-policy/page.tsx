import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Privacy Policy | TechFrontier',
  description: 'TechFrontier Privacy Policy - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 20, 2025'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mb-8 text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>

            <Separator className="mb-8" />

            <div className="prose prose-gray max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Introduction</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TechFrontier (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                  respects your privacy and is committed to protecting your personal data.
                  This privacy policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Information We Collect</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>• Name and email address when you subscribe to our newsletter</li>
                  <li>• Contact information when you fill out forms or contact us</li>
                  <li>
                    • Usage data and analytics (pages viewed, time spent, browser type,
                    etc.)
                  </li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• IP address and device information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">How We Use Your Information</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We use the information we collect to:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>• Provide, maintain, and improve our services</li>
                  <li>• Send you newsletters and marketing communications (with consent)</li>
                  <li>• Respond to your comments, questions, and requests</li>
                  <li>• Analyze usage patterns and optimize user experience</li>
                  <li>• Detect, prevent, and address technical issues or fraud</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Cookies and Tracking</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on
                  our website and store certain information. You can instruct your browser
                  to refuse all cookies or to indicate when a cookie is being sent. See
                  our{' '}
                  <a href="/cookie-policy" className="text-primary hover:underline">
                    Cookie Policy
                  </a>{' '}
                  for more details.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Third-Party Services</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We may employ third-party companies and services for analytics,
                  advertising, and other purposes. These third parties have access to your
                  personal information only to perform specific tasks on our behalf and
                  are obligated not to disclose or use it for other purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Data Security</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We implement appropriate security measures to protect your personal
                  information. However, no method of transmission over the internet or
                  electronic storage is 100% secure. While we strive to use commercially
                  acceptable means to protect your data, we cannot guarantee absolute
                  security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Your Rights</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>• Access the personal information we hold about you</li>
                  <li>• Request correction of inaccurate data</li>
                  <li>• Request deletion of your personal information</li>
                  <li>• Opt-out of marketing communications</li>
                  <li>• Object to or restrict certain processing activities</li>
                </ul>
                <p className="leading-relaxed text-muted-foreground">
                  To exercise these rights, please contact us at privacy@techfrontier.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Children&apos;s Privacy</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Our website is not intended for children under 13 years of age. We do
                  not knowingly collect personal information from children under 13. If
                  you become aware that a child has provided us with personal information,
                  please contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  Changes to This Privacy Policy
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We may update our Privacy Policy from time to time. We will notify you
                  of any changes by posting the new Privacy Policy on this page and
                  updating the &quot;Last Updated&quot; date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Contact Us</h2>
                <p className="leading-relaxed text-muted-foreground">
                  If you have questions about this Privacy Policy, please contact us at:
                  <br />
                  Email: privacy@techfrontier.com
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

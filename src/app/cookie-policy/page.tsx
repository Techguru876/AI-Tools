import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Cookie Policy | TechFrontier',
  description: 'TechFrontier Cookie Policy - Learn how we use cookies and similar technologies on our website.',
}

export default function CookiePolicyPage() {
  const lastUpdated = 'November 20, 2025'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Cookie Policy</h1>
            <p className="mb-8 text-muted-foreground">
              Last Updated: {lastUpdated}
            </p>

            <Separator className="mb-8" />

            <div className="prose prose-gray max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">What Are Cookies?</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Cookies are small text files that are placed on your device when you
                  visit a website. They are widely used to make websites work more
                  efficiently, provide a better user experience, and provide information
                  to the website owners.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">How We Use Cookies</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  TechFrontier uses cookies and similar technologies for the following
                  purposes:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Essential Cookies:</strong> Required for the website to
                    function properly (e.g., remembering your login status, theme
                    preference)
                  </li>
                  <li>
                    • <strong>Analytics Cookies:</strong> Help us understand how visitors
                    use our site (page views, time spent, navigation patterns)
                  </li>
                  <li>
                    • <strong>Advertising Cookies:</strong> Used to deliver relevant ads
                    and measure ad campaign effectiveness
                  </li>
                  <li>
                    • <strong>Functionality Cookies:</strong> Remember your preferences
                    and settings for a better experience
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Types of Cookies We Use</h2>

                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold">Session Cookies</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Temporary cookies that expire when you close your browser. These help
                    us maintain your session while navigating the site.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold">Persistent Cookies</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Remain on your device for a set period or until you delete them. These
                    remember your preferences across visits.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold">First-Party Cookies</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Set by TechFrontier directly. We use these for site functionality and
                    analytics.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold">Third-Party Cookies</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Set by external services like Google Analytics, advertising networks,
                    and social media platforms.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  Third-Party Cookies and Services
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We use the following third-party services that may set cookies:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Google Analytics:</strong> To understand site usage and
                    improve user experience
                  </li>
                  <li>
                    • <strong>Advertising Networks:</strong> To display relevant ads and
                    measure campaign effectiveness
                  </li>
                  <li>
                    • <strong>Social Media Platforms:</strong> For social sharing features
                    and social login
                  </li>
                  <li>
                    • <strong>Content Delivery Networks:</strong> For faster content
                    delivery
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">Managing Cookies</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  You have the right to decide whether to accept or reject cookies. You
                  can exercise your cookie preferences by:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Browser Settings:</strong> Most browsers allow you to refuse
                    or delete cookies through their settings. Visit your browser&apos;s
                    help pages for instructions.
                  </li>
                  <li>
                    • <strong>Opt-Out Tools:</strong> You can opt out of advertising
                    cookies through industry opt-out pages like the Network Advertising
                    Initiative (NAI) or Digital Advertising Alliance (DAA).
                  </li>
                  <li>
                    • <strong>Do Not Track:</strong> Some browsers offer a &quot;Do Not
                    Track&quot; (DNT) option. We respect DNT signals where technically
                    feasible.
                  </li>
                </ul>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Please note that disabling cookies may affect the functionality of
                  TechFrontier and limit your access to certain features.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  How to Delete Cookies
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  If you want to delete cookies already stored on your device:
                </p>
                <ul className="mb-4 space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Chrome:</strong> Settings → Privacy and security → Clear
                    browsing data
                  </li>
                  <li>
                    • <strong>Firefox:</strong> Options → Privacy & Security → Cookies
                    and Site Data → Clear Data
                  </li>
                  <li>
                    • <strong>Safari:</strong> Preferences → Privacy → Manage Website
                    Data → Remove All
                  </li>
                  <li>
                    • <strong>Edge:</strong> Settings → Privacy, search, and services →
                    Clear browsing data
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  Changes to This Cookie Policy
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in
                  our practices or for legal, regulatory, or operational reasons. The
                  &quot;Last Updated&quot; date at the top indicates when the policy was
                  last revised.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">More Information</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  For more information about how we handle your data, please see our{' '}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  If you have questions about our use of cookies, please contact us at:
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

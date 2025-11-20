import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'
import { Search, Mail, MessageSquare, Book, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support & Help Center | TechFrontier',
  description: 'Get help with TechFrontier. Find answers to common questions, contact support, and access resources.',
}

export default function SupportPage() {
  const faqs = [
    {
      question: 'How do I subscribe to the newsletter?',
      answer: (
        <>
          Visit our <Link href="/newsletter" className="text-primary hover:underline">Newsletter page</Link> and enter your email address. You&apos;ll receive a confirmation email with a link to verify your subscription.
        </>
      ),
    },
    {
      question: 'How can I submit a news tip or story idea?',
      answer: (
        <>
          We welcome news tips and story ideas! Email our editorial team at{' '}
          <a href="mailto:editorial@techfrontier.com" className="text-primary hover:underline">
            editorial@techfrontier.com
          </a>{' '}
          with details, sources, and any relevant links.
        </>
      ),
    },
    {
      question: 'How do I report an error in an article?',
      answer: (
        <>
          We take accuracy seriously. If you spot an error, please email{' '}
          <a href="mailto:editorial@techfrontier.com" className="text-primary hover:underline">
            editorial@techfrontier.com
          </a>{' '}
          with the article URL and details of the correction needed.
        </>
      ),
    },
    {
      question: 'Can I write for TechFrontier?',
      answer: (
        <>
          We&apos;re always looking for talented contributors! Check our{' '}
          <Link href="/our-team" className="text-primary hover:underline">Our Team page</Link> or contact us at{' '}
          <a href="mailto:hello@techfrontier.com" className="text-primary hover:underline">
            hello@techfrontier.com
          </a>{' '}
          with writing samples and areas of expertise.
        </>
      ),
    },
    {
      question: 'How do I advertise on TechFrontier?',
      answer: (
        <>
          Visit our <Link href="/advertise" className="text-primary hover:underline">Advertise page</Link> to learn about opportunities, or contact our advertising team at{' '}
          <a href="mailto:advertising@techfrontier.com" className="text-primary hover:underline">
            advertising@techfrontier.com
          </a>.
        </>
      ),
    },
    {
      question: 'How do I unsubscribe from the newsletter?',
      answer: 'Every newsletter email contains an unsubscribe link at the bottom. Click it to instantly unsubscribe. If you need assistance, contact us at hello@techfrontier.com.',
    },
    {
      question: 'Do you accept product submissions for review?',
      answer: (
        <>
          We review a wide range of tech products. Email{' '}
          <a href="mailto:editorial@techfrontier.com" className="text-primary hover:underline">
            editorial@techfrontier.com
          </a>{' '}
          with product details, press materials, and availability. Note that we cannot guarantee coverage.
        </>
      ),
    },
    {
      question: 'How is TechFrontier funded?',
      answer: (
        <>
          TechFrontier is funded through advertising, affiliate partnerships, and sponsored content (clearly marked). Read our{' '}
          <Link href="/affiliate-disclosure" className="text-primary hover:underline">
            Affiliate Disclosure
          </Link>{' '}
          for full transparency.
        </>
      ),
    },
    {
      question: 'Where can I find your RSS feeds?',
      answer: (
        <>
          Our RSS feeds are available at{' '}
          <Link href="/rss" className="text-primary hover:underline">/rss</Link>. We offer feeds for different categories and content types.
        </>
      ),
    },
    {
      question: 'How do I contact TechFrontier for other inquiries?',
      answer: (
        <>
          For general inquiries, visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link> or email{' '}
          <a href="mailto:hello@techfrontier.com" className="text-primary hover:underline">
            hello@techfrontier.com
          </a>.
        </>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Support & Help Center
              </h1>
              <p className="text-xl text-muted-foreground">
                Find answers, get help, and connect with our team
              </p>
            </div>

            <Separator className="mb-12" />

            {/* Quick Links */}
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Quick Links</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href="/contact"
                  className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold group-hover:text-primary">
                      Contact Us
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get in touch with our team for general inquiries
                  </p>
                </Link>

                <Link
                  href="/newsletter"
                  className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold group-hover:text-primary">
                      Newsletter
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to our daily and weekly newsletters
                  </p>
                </Link>

                <Link
                  href="/about"
                  className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Book className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold group-hover:text-primary">
                      About TechFrontier
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Learn more about our mission and team
                  </p>
                </Link>

                <Link
                  href="/media-kit"
                  className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Search className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold group-hover:text-primary">
                      Media Kit
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Download logos, brand assets, and press materials
                  </p>
                </Link>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-12">
              <h2 className="mb-6 text-3xl font-bold">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-lg border bg-card p-6">
                    <h3 className="mb-2 flex items-start gap-2 font-bold">
                      <HelpCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      {faq.question}
                    </h3>
                    <p className="ml-7 text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Still Need Help */}
            <section>
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">Still Need Help?</h2>
                <p className="mb-4 text-muted-foreground">
                  Can&apos;t find what you&apos;re looking for? Our team is here to help.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Contact Support
                  </Link>
                  <a
                    href="mailto:hello@techfrontier.com"
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

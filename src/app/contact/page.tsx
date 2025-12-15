'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MessageSquare, Building2 } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // TODO: Implement actual form submission
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <article className="container py-12">
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Contact Us
              </h1>
              <p className="text-xl text-muted-foreground">
                Get in touch with the TechBlog USA team
              </p>
            </div>

            <Separator className="mb-12" />

            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <section>
                <h2 className="mb-6 text-2xl font-bold">Send Us a Message</h2>
                {submitted ? (
                  <div className="rounded-lg border bg-green-50 p-6 text-green-900 dark:bg-green-900/20 dark:text-green-100">
                    <h3 className="mb-2 text-lg font-bold">Message Sent!</h3>
                    <p>
                      Thank you for contacting TechBlog USA. We&apos;ll get back to you
                      within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium"
                      >
                        Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium"
                      >
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-1 block text-sm font-medium"
                      >
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="What is this regarding?"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-1 block text-sm font-medium"
                      >
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more..."
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                )}
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="mb-6 text-2xl font-bold">Other Ways to Reach Us</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold">General Inquiries</h3>
                      <a
                        href="mailto:hello@techblogusa.com"
                        className="text-muted-foreground hover:text-primary"
                      >
                        hello@techblogusa.com
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold">Editorial & Tips</h3>
                      <a
                        href="mailto:editorial@techblogusa.com"
                        className="text-muted-foreground hover:text-primary"
                      >
                        editorial@techblogusa.com
                      </a>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Have a story tip or press release? Send it here.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold">Advertising & Partnerships</h3>
                      <a
                        href="mailto:advertising@techblogusa.com"
                        className="text-muted-foreground hover:text-primary"
                      >
                        advertising@techblogusa.com
                      </a>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Interested in advertising or partnerships?
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3 font-bold">FAQs</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">
                          How do I submit a product for review?
                        </p>
                        <p className="text-muted-foreground">
                          Email editorial@techblogusa.com with product details and
                          press materials.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Can I write for TechBlog USA?</p>
                        <p className="text-muted-foreground">
                          We&apos;re always looking for talented contributors. Reach out
                          to our team with writing samples.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">How do I report an error?</p>
                        <p className="text-muted-foreground">
                          Please email editorial@techblogusa.com with the article URL
                          and correction details.
                        </p>
                      </div>
                    </div>
                  </div>
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

'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const footerSections = [
  {
    title: 'Categories',
    links: [
      { label: 'Tech', href: '/tech' },
      { label: 'Science', href: '/science' },
      { label: 'Culture', href: '/culture' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Deals', href: '/deals' },
      { label: 'AI News', href: '/ai-news' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/our-team' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'RSS Feeds', href: '/rss' },
      { label: 'Media Kit', href: '/media-kit' },
      { label: 'Support', href: '/support' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  },
]

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        {/* Newsletter Signup Section */}
        <div className="mb-12 rounded-lg border bg-card p-6 md:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="mb-2 text-2xl font-bold">Stay Updated</h3>
            <p className="mb-4 text-muted-foreground">
              Get the latest tech news, reviews, and deals delivered to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                required
              />
              <Button type="submit">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500">
                <span className="text-lg font-bold text-white">TF</span>
              </div>
              <span className="text-xl font-bold">TechFrontier</span>
            </Link>
            <p className="mb-2 text-xs italic text-muted-foreground">
              Exploring Tomorrow&apos;s Tech, Today
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Your premier destination for AI-powered tech news, in-depth reviews, and expert analysis at the edge of innovation.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-md border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-semibold">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} TechFrontier. All rights reserved.
          </p>
          <p className="text-center md:text-right">
            Built with Next.js • Powered by AI
          </p>
        </div>
      </div>
    </footer>
  )
}

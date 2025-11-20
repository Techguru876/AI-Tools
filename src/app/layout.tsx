import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'TechFrontier - Exploring Tomorrow\'s Tech, Today',
    template: '%s | TechFrontier',
  },
  description:
    'TechFrontier is your premier destination for AI-powered tech news, in-depth product reviews, buying guides, and expert analysis on emerging technology, AI, gadgets, and innovation.',
  keywords: [
    'technology',
    'tech news',
    'gadgets',
    'reviews',
    'buying guides',
    'AI',
    'artificial intelligence',
    'machine learning',
    'smartphones',
    'laptops',
    'innovation',
    'emerging tech',
  ],
  authors: [{ name: 'TechFrontier' }],
  creator: 'TechFrontier',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TechFrontier',
    title: 'TechFrontier - Exploring Tomorrow\'s Tech, Today',
    description:
      'Your premier destination for AI-powered tech news, in-depth product reviews, and expert analysis at the edge of innovation.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TechFrontier - Exploring Tomorrow\'s Tech, Today',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechFrontier - Exploring Tomorrow\'s Tech, Today',
    description:
      'Your premier destination for AI-powered tech news, in-depth product reviews, and expert analysis at the edge of innovation.',
    images: ['/og-image.png'],
    creator: '@techfrontier',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

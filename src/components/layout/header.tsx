'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search, Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { SearchDialog } from '@/components/search-dialog'

// Primary navigation categories
const primaryNav = [
  { label: 'Tech', href: '/tech' },
  { label: 'Science', href: '/science' },
  { label: 'Culture', href: '/culture' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Deals', href: '/deals' },
  { label: 'AI News', href: '/ai-news' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">AI</span>
            </div>
            <span className="hidden text-xl font-bold sm:inline-block">
              Tech Blog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav id="navigation" className="hidden items-center space-x-6 lg:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label="User account"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              className="hidden md:flex"
              size="sm"
              asChild
            >
              <Link href="/subscribe">Subscribe</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="container border-t py-4 lg:hidden">
            <nav className="flex flex-col space-y-3">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-3">
                <Button variant="default" className="w-full" asChild>
                  <Link href="/subscribe">Subscribe</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search, Menu, User } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">AI</span>
          </div>
          <span className="hidden text-xl font-bold sm:inline-block">Tech Blog</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <Link href="/news" className="text-sm font-medium transition-colors hover:text-primary">
            News
          </Link>
          <Link href="/reviews" className="text-sm font-medium transition-colors hover:text-primary">
            Reviews
          </Link>
          <Link href="/guides" className="text-sm font-medium transition-colors hover:text-primary">
            Guides
          </Link>
          <Link href="/roundups" className="text-sm font-medium transition-colors hover:text-primary">
            Roundups
          </Link>
          <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
            Categories
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="User account">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="default" className="hidden md:flex" asChild>
            <Link href="/subscribe">Subscribe</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container border-t py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/news"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <Link
              href="/reviews"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/guides"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Guides
            </Link>
            <Link
              href="/roundups"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Roundups
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <div className="border-t pt-3">
              <Button variant="default" className="w-full" asChild>
                <Link href="/subscribe">Subscribe</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search, Menu, User, X, Home, ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchDialog } from '@/components/search-dialog'
import { useTheme } from 'next-themes'

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
  const [searchQuery, setSearchQuery] = useState('')
  const { resolvedTheme } = useTheme()
  const router = useRouter()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Left: Logo + Nav Controls */}
          <div className="flex items-center gap-2">
            {/* Browser Navigation (Back/Forward/Home) */}
            <div className="hidden items-center gap-1 md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.forward()}
                aria-label="Go forward"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
                aria-label="Go to homepage"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* TechFrontier Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src={resolvedTheme === 'dark' ? '/logos/header/tech_frontier_white.svg' : '/logos/header/tech_frontier.svg'}
                  alt="TechFrontier"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                  priority
                />
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-xl font-bold leading-tight">TechFrontier</span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  Exploring Tomorrow&apos;s Tech, Today
                </span>
              </div>
            </Link>
          </div>

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
          <div className="flex items-center gap-2">
            {/* Inline Search Bar (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 pl-9 xl:w-64"
                />
              </div>
            </form>

            {/* Search Button (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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

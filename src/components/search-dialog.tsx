'use client'

import { useState } from 'react'
import { Search, TrendingUp, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock trending searches - will be replaced with real data
const trendingSearches = [
  'AI breakthroughs',
  'Latest smartphones',
  'Tech deals',
  'Gaming news',
  'Science discoveries',
]

// Mock recent searches - will be stored in localStorage
const recentSearches = [
  'iPhone 15 review',
  'Best laptops 2024',
  'ChatGPT updates',
]

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles, topics, products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query)
              }
            }}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Search Suggestions */}
        {!query && (
          <div className="space-y-6">
            {/* Trending Searches */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Trending Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <Badge
                    key={search}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <Link
                    key={search}
                    href={`/search?q=${encodeURIComponent(search)}`}
                    className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                    onClick={() => onOpenChange(false)}
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Results (shown when typing) */}
        {query && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Press Enter to search for &quot;{query}&quot;
            </div>
            {/* TODO: Add live search results here */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

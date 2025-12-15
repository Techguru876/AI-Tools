'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SearchResult {
    id: string
    title: string
    excerpt: string | null
    slug: string
    category: string
    categorySlug: string
}

export function SearchBar() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open search with Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            // Close with Escape
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const performSearch = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                const data = await response.json()
                setResults(data.results || [])
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsLoading(false)
            }
        }

        const debounce = setTimeout(performSearch, 300)
        return () => clearTimeout(debounce)
    }, [query])

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="w-64 justify-start text-muted-foreground"
            >
                <Search className="mr-2 h-4 w-4" />
                <span>Search...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="container py-20">
                <div className="mx-auto max-w-2xl rounded-lg border bg-card shadow-2xl">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-4 py-3">
                        <Search className="mr-2 h-5 w-5 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="flex-1 bg-transparent text-lg outline-none"
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-full p-2 hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto p-4">
                        {isLoading ? (
                            <p className="text-center text-sm text-muted-foreground">Searching...</p>
                        ) : results.length > 0 ? (
                            <div className="space-y-3">
                                {results.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={`/${result.categorySlug}/${result.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="block rounded-lg border p-4 transition-colors hover:bg-muted"
                                    >
                                        <h3 className="font-semibold">{result.title}</h3>
                                        {result.excerpt && (
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                {result.excerpt}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-primary">{result.category}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : query.length >= 2 ? (
                            <p className="text-center text-sm text-muted-foreground">
                                No results found for "{query}"
                            </p>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground">
                                Type at least 2 characters to search
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

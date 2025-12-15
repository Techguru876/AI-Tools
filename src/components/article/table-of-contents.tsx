'use client'

import { useEffect, useState } from 'react'
import { List } from 'lucide-react'

interface TOCItem {
    id: string
    text: string
    level: number
}

interface TableOfContentsProps {
    content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TOCItem[]>([])
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        // Extract headings from markdown content
        const headingRegex = /^(#{2,3})\s+(.+)$/gm
        const extractedHeadings: TOCItem[] = []
        let match

        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length // Number of # symbols
            const text = match[2]
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            extractedHeadings.push({ id, text, level })
        }

        setHeadings(extractedHeadings)

        // Intersection Observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: '-80px 0px -80% 0px' }
        )

        // Observe all h2 and h3 elements
        const headingElements = document.querySelectorAll('.article-content h2, .article-content h3')
        headingElements.forEach((elem) => observer.observe(elem))

        return () => observer.disconnect()
    }, [content])

    if (headings.length < 3) {
        // Don't show TOC for short articles
        return null
    }

    return (
        <div className="sticky top-24 hidden xl:block">
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                    <List className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Table of Contents</h3>
                </div>

                <nav className="space-y-2">
                    {headings.map((heading) => (
                        <a
                            key={heading.id}
                            href={`#${heading.id}`}
                            className={`block text-sm transition-colors hover:text-primary ${heading.level === 3 ? 'pl-4' : ''
                                } ${activeId === heading.id ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                            onClick={(e) => {
                                e.preventDefault()
                                const element = document.getElementById(heading.id)
                                if (element) {
                                    const yOffset = -80
                                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
                                    window.scrollTo({ top: y, behavior: 'smooth' })
                                }
                            }}
                        >
                            {heading.text}
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    )
}

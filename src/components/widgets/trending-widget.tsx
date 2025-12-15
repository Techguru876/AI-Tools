'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

interface TrendingPost {
    id: string
    title: string
    slug: string
    categorySlug: string
    viewCount: number
}

export function TrendingWidget() {
    const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // TODO: Implement API call to fetch trending posts
        // For now, using mock data
        const mockData: TrendingPost[] = [
            {
                id: '1',
                title: 'Apple Unveils Revolutionary M4 Pro Chip',
                slug: 'apple-m4-pro-chip-ai-december-2025',
                categorySlug: 'tech',
                viewCount: 12500
            },
            {
                id: '2',
                title: 'OpenAI Unveils GPT-5: Breakthrough in Reasoning',
                slug: 'openai-gpt5-launch-december-2025',
                categorySlug: 'ai-news',
                viewCount: 10200
            },
            {
                id: '3',
                title: 'Meta Llama 4 Challenges Proprietary Models',
                slug: 'meta-llama-4-release-december-2025',
                categorySlug: 'ai-news',
                viewCount: 8900
            }
        ]

        setTimeout(() => {
            setTrendingPosts(mockData)
            setIsLoading(false)
        }, 500)
    }, [])

    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Trending Now</h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Trending Now</h3>
            </div>

            <div className="space-y-4">
                {trendingPosts.map((post, index) => (
                    <Link
                        key={post.id}
                        href={`/${post.categorySlug}/${post.slug}`}
                        className="group block"
                    >
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {post.viewCount.toLocaleString()} views
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

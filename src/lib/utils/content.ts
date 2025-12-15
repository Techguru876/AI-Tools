/**
 * Calculate estimated reading time for content
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 225
    const words = content.trim().split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
}

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
    if (minutes === 1) return '1 min read'
    return `${minutes} min read`
}

/**
 * Check if a post is trending
 * @param viewCount - Total view count
 * @param publishedAt - Publication date
 * @returns true if post has high views in last 24 hours
 */
export function isTrending(viewCount: number, publishedAt: Date | null): boolean {
    if (!publishedAt) return false

    const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)

    // Post must be less than 7 days old
    if (hoursSincePublished > 168) return false

    // High engagement threshold (adjust based on site traffic)
    return viewCount > 1000
}

/**
 * Check if a post was recently published
 * @param publishedAt - Publication date
 * @returns true if published within last 24 hours
 */
export function isRecentlyPublished(publishedAt: Date | null): boolean {
    if (!publishedAt) return false

    const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
    return hoursSincePublished < 24
}

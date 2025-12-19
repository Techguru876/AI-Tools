/**
 * Research Tools for Blog Management Agent
 * 
 * Tools for researching trending topics, fetching RSS feeds, and avoiding duplicates.
 */

import { ai, z } from '../genkit'
import { db } from '@/lib/db'
import { RSS_FEEDS } from '../config/rss-feeds'
import Parser from 'rss-parser'

const rssParser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'TechBlog-RSS-Reader/1.0',
    },
})

// ============================================
// Fetch RSS Feeds Tool
// ============================================

export const fetchRSSFeedsTool = ai.defineTool(
    {
        name: 'fetchRSSFeeds',
        description: 'Fetch latest articles from RSS feeds for a specific category. Returns recent headlines and links for research.',
        inputSchema: z.object({
            category: z.enum(['NEWS', 'AI_NEWS', 'REVIEW', 'GUIDE'])
                .describe('Content category to fetch feeds for'),
            limit: z.number().min(1).max(30).default(10)
                .describe('Maximum number of items to return'),
        }),
        outputSchema: z.object({
            items: z.array(z.object({
                title: z.string(),
                link: z.string(),
                pubDate: z.string().nullable(),
                source: z.string(),
                snippet: z.string().nullable(),
            })),
            fetchedAt: z.string(),
        }),
    },
    async (input) => {
        const feeds = RSS_FEEDS[input.category] || RSS_FEEDS.NEWS
        const allItems: Array<{
            title: string
            link: string
            pubDate: string | null
            source: string
            snippet: string | null
        }> = []

        for (const feedUrl of feeds) {
            try {
                const feed = await rssParser.parseURL(feedUrl)
                const sourceName = extractSourceName(feedUrl)

                for (const item of feed.items.slice(0, 5)) {
                    allItems.push({
                        title: item.title || '',
                        link: item.link || '',
                        pubDate: item.pubDate || item.isoDate || null,
                        source: sourceName,
                        snippet: item.contentSnippet?.slice(0, 200) || null,
                    })
                }
            } catch (error) {
                console.warn(`Failed to fetch ${feedUrl}:`, error)
            }
        }

        // Sort by date (newest first) and limit
        allItems.sort((a, b) => {
            const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
            const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
            return dateB - dateA
        })

        return {
            items: allItems.slice(0, input.limit),
            fetchedAt: new Date().toISOString(),
        }
    }
)

// ============================================
// Get Trending Topics Tool
// ============================================

export const getTrendingTopicsTool = ai.defineTool(
    {
        name: 'getTrendingTopics',
        description: 'Analyze RSS feeds to identify trending topics worth covering. Returns deduplicated, ranked topics.',
        inputSchema: z.object({
            category: z.enum(['NEWS', 'AI_NEWS', 'REVIEW', 'GUIDE'])
                .describe('Category to find trending topics for'),
            count: z.number().min(1).max(20).default(10)
                .describe('Number of topics to return'),
        }),
        outputSchema: z.object({
            topics: z.array(z.object({
                topic: z.string(),
                mentions: z.number(),
                sources: z.array(z.string()),
                sampleHeadlines: z.array(z.string()),
                suggestedAngle: z.string(),
            })),
        }),
    },
    async (input) => {
        // Fetch recent RSS items
        const feeds = RSS_FEEDS[input.category] || RSS_FEEDS.NEWS
        const allHeadlines: Array<{ title: string; source: string }> = []

        for (const feedUrl of feeds) {
            try {
                const feed = await rssParser.parseURL(feedUrl)
                const sourceName = extractSourceName(feedUrl)

                for (const item of feed.items.slice(0, 10)) {
                    if (item.title) {
                        allHeadlines.push({ title: item.title, source: sourceName })
                    }
                }
            } catch (error) {
                // Skip failed feeds
            }
        }

        // Use AI to analyze and cluster topics
        const { text } = await ai.generate({
            prompt: `Analyze these recent tech headlines and identify the top ${input.count} trending topics worth covering.

Headlines:
${allHeadlines.map(h => `- [${h.source}] ${h.title}`).join('\n')}

For each topic:
1. Identify the core topic/theme
2. Count how many headlines relate to it
3. List which sources covered it
4. Suggest a unique angle for our coverage

Respond in JSON:
{
  "topics": [
    {
      "topic": "Topic name",
      "mentions": 3,
      "sources": ["verge", "techcrunch"],
      "sampleHeadlines": ["Headline 1", "Headline 2"],
      "suggestedAngle": "Our unique angle..."
    }
  ]
}`,
            config: { temperature: 0.3 },
        })

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0])
                return { topics: parsed.topics || [] }
            }
        } catch {
            // Parsing failed
        }

        return { topics: [] }
    }
)

// ============================================
// Check Topic Coverage Tool
// ============================================

export const checkTopicCoverageTool = ai.defineTool(
    {
        name: 'checkTopicCoverage',
        description: 'Check if we have recently covered a topic to avoid duplicates.',
        inputSchema: z.object({
            topic: z.string().describe('Topic to check'),
            daysBack: z.number().min(1).max(30).default(7)
                .describe('Number of days to look back'),
        }),
        outputSchema: z.object({
            alreadyCovered: z.boolean(),
            similarPosts: z.array(z.object({
                id: z.string(),
                title: z.string(),
                publishedAt: z.string().nullable(),
                similarity: z.string(),
            })),
            recommendation: z.string(),
        }),
    },
    async (input) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - input.daysBack)

        // Search for similar posts
        const recentPosts = await db.post.findMany({
            where: {
                publishedAt: { gte: cutoffDate },
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: input.topic, mode: 'insensitive' } },
                    { content: { contains: input.topic, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                title: true,
                publishedAt: true,
            },
            take: 5,
        })

        const similarPosts = recentPosts.map(post => ({
            id: post.id,
            title: post.title,
            publishedAt: post.publishedAt?.toISOString() || null,
            similarity: 'keyword match',
        }))

        const alreadyCovered = similarPosts.length > 0

        let recommendation = ''
        if (alreadyCovered) {
            recommendation = `Topic appears to be covered in ${similarPosts.length} recent post(s). Consider a different angle or skip.`
        } else {
            recommendation = 'Topic not recently covered. Good to proceed.'
        }

        return {
            alreadyCovered,
            similarPosts,
            recommendation,
        }
    }
)

// ============================================
// Helper Functions
// ============================================

function extractSourceName(url: string): string {
    try {
        const hostname = new URL(url).hostname
        if (hostname.includes('techcrunch')) return 'techcrunch'
        if (hostname.includes('theverge')) return 'verge'
        if (hostname.includes('gizmodo')) return 'gizmodo'
        if (hostname.includes('arstechnica')) return 'arstechnica'
        if (hostname.includes('wired')) return 'wired'
        if (hostname.includes('venturebeat')) return 'venturebeat'
        return hostname.replace('www.', '').split('.')[0]
    } catch {
        return 'unknown'
    }
}

// Export all research tools
export const researchTools = [
    fetchRSSFeedsTool,
    getTrendingTopicsTool,
    checkTopicCoverageTool,
]

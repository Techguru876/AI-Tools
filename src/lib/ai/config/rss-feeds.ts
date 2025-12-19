/**
 * RSS Feed Configuration
 * 
 * Defines RSS feeds for each content category.
 */

export const RSS_FEEDS: Record<string, string[]> = {
    NEWS: [
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
        'https://feeds.arstechnica.com/arstechnica/technology-lab',
        'https://www.wired.com/feed/rss',
        'https://gizmodo.com/rss',
    ],
    AI_NEWS: [
        'https://techcrunch.com/category/artificial-intelligence/feed/',
        'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
        'https://venturebeat.com/category/ai/feed/',
        'https://www.wired.com/feed/tag/ai/latest/rss',
        'https://feeds.arstechnica.com/arstechnica/technology-lab',
    ],
    REVIEW: [
        'https://www.theverge.com/rss/reviews/index.xml',
        'https://www.wired.com/feed/category/gear/latest/rss',
        'https://gizmodo.com/reviews/rss',
    ],
    GUIDE: [
        'https://www.wired.com/feed/category/gear/latest/rss',
        'https://www.theverge.com/rss/tech/index.xml',
    ],
}

export const SOURCE_URLS: Record<string, string[]> = {
    techcrunch: [
        'https://techcrunch.com/',
        'https://techcrunch.com/category/artificial-intelligence/',
        'https://techcrunch.com/category/apps/',
    ],
    verge: [
        'https://www.theverge.com/tech',
        'https://www.theverge.com/ai-artificial-intelligence',
        'https://www.theverge.com/reviews',
    ],
    gizmodo: [
        'https://gizmodo.com/',
        'https://gizmodo.com/tech',
    ],
    arstechnica: [
        'https://arstechnica.com/gadgets/',
        'https://arstechnica.com/information-technology/',
    ],
    wired: [
        'https://www.wired.com/tag/artificial-intelligence/',
        'https://www.wired.com/category/gear/',
    ],
}

/**
 * Article Scraper
 * 
 * Scrapes articles from top tech publications for RAG training.
 */

import * as cheerio from 'cheerio'

export interface ScrapedArticle {
    url: string
    source: 'techcrunch' | 'verge' | 'gizmodo' | 'arstechnica' | 'wired'
    title: string
    content: string
    excerpt: string
    category: string
    publishedAt: Date | null
    author: string | null
}

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Scrape an article from its URL
 */
export async function scrapeArticle(url: string): Promise<ScrapedArticle | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
        })

        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.status}`)
            return null
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Detect source and use appropriate selectors
        const source = detectSource(url)
        if (!source) return null

        const selectors = getSelectors(source)

        const title = $(selectors.title).first().text().trim()
        const content = extractContent($, selectors.content)
        const excerpt = $(selectors.excerpt).first().text().trim() || content.slice(0, 200)
        const author = $(selectors.author).first().text().trim() || null
        const category = extractCategory(url, $, source)
        const publishedAt = extractPublishDate($, selectors.date)

        if (!title || !content || content.length < 500) {
            console.warn(`Insufficient content from ${url}`)
            return null
        }

        return {
            url,
            source,
            title,
            content,
            excerpt,
            category,
            publishedAt,
            author,
        }
    } catch (error) {
        console.error(`Error scraping ${url}:`, error)
        return null
    }
}

function detectSource(url: string): ScrapedArticle['source'] | null {
    if (url.includes('techcrunch.com')) return 'techcrunch'
    if (url.includes('theverge.com')) return 'verge'
    if (url.includes('gizmodo.com')) return 'gizmodo'
    if (url.includes('arstechnica.com')) return 'arstechnica'
    if (url.includes('wired.com')) return 'wired'
    return null
}

interface Selectors {
    title: string
    content: string
    excerpt: string
    author: string
    date: string
}

function getSelectors(source: ScrapedArticle['source']): Selectors {
    const selectors: Record<ScrapedArticle['source'], Selectors> = {
        techcrunch: {
            title: 'h1.article-hero__title, h1.article__title',
            content: '.article-content, .article__content',
            excerpt: '.article-hero__excerpt',
            author: '.article__byline a',
            date: 'time[datetime]',
        },
        verge: {
            title: 'h1',
            content: '.duet--article--article-body-component',
            excerpt: '.duet--article--dangerously-set-cms-markup p:first-child',
            author: '.duet--article--article-byline a',
            date: 'time[datetime]',
        },
        gizmodo: {
            title: 'h1.sc-1efpnfq-0',
            content: '.js_post-content, .sc-77igqf-0',
            excerpt: '.sc-1efpnfq-1',
            author: '.sc-1out364-0 a',
            date: 'time[datetime]',
        },
        arstechnica: {
            title: 'h1.heading',
            content: '.article-content',
            excerpt: '.intro',
            author: '.author a',
            date: 'time[datetime]',
        },
        wired: {
            title: 'h1[data-testid="ContentHeaderHed"]',
            content: '.body__inner-container',
            excerpt: '.content-header__dek',
            author: '.byline__name a',
            date: 'time[datetime]',
        },
    }
    return selectors[source]
}

function extractContent($: cheerio.CheerioAPI, selector: string): string {
    const contentEl = $(selector).first()

    // Remove unwanted elements
    contentEl.find('script, style, iframe, .ad, .advertisement, .social-share').remove()

    // Extract text from paragraphs
    const paragraphs: string[] = []
    contentEl.find('p').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 20) {
            paragraphs.push(text)
        }
    })

    return paragraphs.join('\n\n')
}

function extractCategory(url: string, $: cheerio.CheerioAPI, source: ScrapedArticle['source']): string {
    // Try to extract from URL path
    const urlParts = new URL(url).pathname.split('/').filter(Boolean)

    // Common category mappings
    const categoryMappings: Record<string, string> = {
        'ai': 'AI_NEWS',
        'artificial-intelligence': 'AI_NEWS',
        'machine-learning': 'AI_NEWS',
        'apps': 'NEWS',
        'gadgets': 'NEWS',
        'tech': 'NEWS',
        'reviews': 'REVIEW',
        'science': 'NEWS',
        'gaming': 'NEWS',
        'security': 'NEWS',
        'mobile': 'NEWS',
    }

    for (const part of urlParts) {
        const lower = part.toLowerCase()
        if (categoryMappings[lower]) {
            return categoryMappings[lower]
        }
    }

    return 'NEWS' // Default
}

function extractPublishDate($: cheerio.CheerioAPI, selector: string): Date | null {
    const dateEl = $(selector).first()
    const datetime = dateEl.attr('datetime')

    if (datetime) {
        const date = new Date(datetime)
        if (!isNaN(date.getTime())) {
            return date
        }
    }

    return null
}

/**
 * Batch scrape multiple articles with rate limiting
 */
export async function scrapeArticles(
    urls: string[],
    delayMs = 2000
): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = []

    for (const url of urls) {
        const article = await scrapeArticle(url)
        if (article) {
            articles.push(article)
        }
        await delay(delayMs) // Rate limiting
    }

    return articles
}

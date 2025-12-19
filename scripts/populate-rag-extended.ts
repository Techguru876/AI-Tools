/**
 * Enhanced RAG Training Data Population
 * 
 * Fetches 50-100 articles from multiple sources for comprehensive style training.
 * Run with: npx tsx scripts/populate-rag-extended.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import Parser from 'rss-parser'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

const parser = new Parser({
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechBlog/1.0)' },
})

// Extended list of RSS feeds for more diverse training
const FEEDS = [
    // General Tech
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/technology-lab',
    'https://feeds.arstechnica.com/arstechnica/gadgets',
    'https://feeds.arstechnica.com/arstechnica/science',
    'https://www.engadget.com/rss.xml',
    'https://www.cnet.com/rss/news/',

    // AI Focused
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://venturebeat.com/category/ai/feed/',
    'https://www.marktechpost.com/feed/',

    // Reviews & Gear
    'https://www.theverge.com/rss/reviews/index.xml',
    'https://www.theverge.com/rss/tech/index.xml',

    // Apple/Google focused
    'https://9to5mac.com/feed/',
    'https://9to5google.com/feed/',

    // Business/Industry
    'https://techcrunch.com/category/startups/feed/',
    'https://techcrunch.com/category/apps/feed/',
    'https://www.zdnet.com/news/rss.xml',
]

const MAX_ARTICLES_PER_FEED = 15
const TARGET_TOTAL_ARTICLES = 100
const DELAY_BETWEEN_EMBEDDINGS = 300 // ms

interface TrainingArticle {
    title: string
    content: string
    excerpt: string
    source: string
    category: string
    url: string
    publishedAt?: string
    embedding?: number[]
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function extractSource(url: string): string {
    if (url.includes('techcrunch')) return 'techcrunch'
    if (url.includes('theverge')) return 'verge'
    if (url.includes('arstechnica')) return 'arstechnica'
    if (url.includes('wired')) return 'wired'
    if (url.includes('venturebeat')) return 'venturebeat'
    if (url.includes('engadget')) return 'engadget'
    if (url.includes('cnet')) return 'cnet'
    if (url.includes('9to5mac')) return '9to5mac'
    if (url.includes('9to5google')) return '9to5google'
    if (url.includes('zdnet')) return 'zdnet'
    if (url.includes('marktechpost')) return 'marktechpost'
    return 'unknown'
}

function categorizeContent(url: string, title: string): string {
    const lowerUrl = url.toLowerCase()
    const lowerTitle = title.toLowerCase()

    if (lowerUrl.includes('ai') || lowerUrl.includes('artificial-intelligence') ||
        lowerTitle.includes('ai') || lowerTitle.includes('gpt') || lowerTitle.includes('machine learning')) {
        return 'AI_NEWS'
    }
    if (lowerUrl.includes('review') || lowerTitle.includes('review')) {
        return 'REVIEW'
    }
    if (lowerUrl.includes('gear') || lowerUrl.includes('gadget')) {
        return 'GUIDE'
    }
    return 'NEWS'
}

async function main() {
    console.log('🚀 Extended RAG Training Data Population\n')
    console.log(`   Target: ${TARGET_TOTAL_ARTICLES} articles from ${FEEDS.length} feeds\n`)
    console.log('═'.repeat(60))

    const apiKey = process.env.GOOGLE_GENAI_API_KEY
    if (!apiKey) {
        console.error('❌ GOOGLE_GENAI_API_KEY not found')
        process.exit(1)
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })

    const articles: TrainingArticle[] = []
    const seenUrls = new Set<string>()

    // Step 1: Collect articles from all feeds
    console.log('\n📡 Fetching RSS feeds...\n')

    for (const feedUrl of FEEDS) {
        if (articles.length >= TARGET_TOTAL_ARTICLES) break

        try {
            process.stdout.write(`   ${extractSource(feedUrl).padEnd(15)} `)
            const feed = await parser.parseURL(feedUrl)

            let added = 0
            for (const item of feed.items.slice(0, MAX_ARTICLES_PER_FEED)) {
                if (articles.length >= TARGET_TOTAL_ARTICLES) break
                if (!item.link || seenUrls.has(item.link)) continue

                if (item.title && (item.content || item.contentSnippet || item['content:encoded'])) {
                    let content = ''
                    if (item['content:encoded']) {
                        content = stripHtml(item['content:encoded'] as string)
                    } else if (item.content) {
                        content = stripHtml(item.content)
                    } else if (item.contentSnippet) {
                        content = item.contentSnippet
                    }

                    // Only include articles with substantial content
                    if (content.length > 300) {
                        seenUrls.add(item.link)
                        articles.push({
                            title: item.title,
                            content: content.slice(0, 3000), // Limit content size
                            excerpt: content.slice(0, 400),
                            source: extractSource(feedUrl),
                            category: categorizeContent(feedUrl, item.title),
                            url: item.link,
                            publishedAt: item.pubDate || item.isoDate,
                        })
                        added++
                    }
                }
            }
            console.log(`✓ ${added} articles`)
        } catch (error) {
            console.log(`✗ Failed`)
        }
    }

    console.log(`\n📄 Total articles collected: ${articles.length}\n`)

    // Show breakdown by source
    const bySource: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    for (const article of articles) {
        bySource[article.source] = (bySource[article.source] || 0) + 1
        byCategory[article.category] = (byCategory[article.category] || 0) + 1
    }

    console.log('   By Source:')
    for (const [source, count] of Object.entries(bySource)) {
        console.log(`      ${source}: ${count}`)
    }
    console.log('\n   By Category:')
    for (const [cat, count] of Object.entries(byCategory)) {
        console.log(`      ${cat}: ${count}`)
    }

    console.log('\n' + '─'.repeat(60))

    // Step 2: Generate embeddings
    console.log('\n🧠 Generating embeddings...\n')

    let successful = 0
    const processedArticles: TrainingArticle[] = []

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i]
        try {
            process.stdout.write(`   [${(i + 1).toString().padStart(3)}/${articles.length}] `)

            const textForEmbedding = `${article.title}\n\n${article.excerpt}`
            const result = await embeddingModel.embedContent(textForEmbedding)
            const embedding = result.embedding.values

            article.embedding = embedding
            processedArticles.push(article)

            console.log(`✓ ${article.source.padEnd(12)} "${article.title.slice(0, 40)}..."`)
            successful++

            await delay(DELAY_BETWEEN_EMBEDDINGS)
        } catch (error) {
            console.log(`✗ Error`)
        }
    }

    // Step 3: Load existing data and merge
    const outputPath = path.join(__dirname, '../data/rag-training.json')

    let existingArticles: TrainingArticle[] = []
    if (fs.existsSync(outputPath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
            existingArticles = existing.filter((a: TrainingArticle) =>
                !seenUrls.has(a.url) // Don't duplicate
            )
            console.log(`\n   Loaded ${existingArticles.length} existing articles`)
        } catch { /* Fresh start */ }
    }

    // Merge and save
    const allArticles = [...existingArticles, ...processedArticles]

    const dataDir = path.dirname(outputPath)
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2))

    console.log('\n' + '═'.repeat(60))
    console.log(`\n✅ Complete!`)
    console.log(`   New embeddings generated: ${successful}`)
    console.log(`   Total articles in training set: ${allArticles.length}`)
    console.log(`   Saved to: ${outputPath}`)
    console.log('═'.repeat(60))
}

main().catch(console.error)

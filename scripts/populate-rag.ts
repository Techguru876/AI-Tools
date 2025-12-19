/**
 * Populate RAG Training Data
 * 
 * Fetches recent articles from RSS feeds and generates embeddings.
 * Run with: npx tsx scripts/populate-rag.ts
 */

// Load environment variables first
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

// RSS feeds to use
const FEEDS = [
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/technology-lab',
]

interface TrainingArticle {
    title: string
    content: string
    excerpt: string
    source: string
    category: string
    url: string
    embedding?: number[]
}

async function main() {
    console.log('🚀 Starting RAG training data population...\n')

    // Check for required env vars
    const apiKey = process.env.GOOGLE_GENAI_API_KEY
    if (!apiKey) {
        console.error('❌ GOOGLE_GENAI_API_KEY not found in .env.local')
        process.exit(1)
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })

    const articles: TrainingArticle[] = []

    // Step 1: Collect articles from RSS feeds
    console.log('📡 Fetching RSS feeds...\n')

    for (const feedUrl of FEEDS) {
        try {
            console.log(`   Fetching: ${feedUrl}`)
            const feed = await parser.parseURL(feedUrl)

            for (const item of feed.items.slice(0, 15)) {
                if (item.title && (item.content || item.contentSnippet || item['content:encoded'])) {
                    // Get content - prefer full content, fallback to snippet
                    let content = ''
                    if (item['content:encoded']) {
                        content = stripHtml(item['content:encoded'] as string)
                    } else if (item.content) {
                        content = stripHtml(item.content)
                    } else if (item.contentSnippet) {
                        content = item.contentSnippet
                    }

                    if (content.length > 200) {
                        articles.push({
                            title: item.title,
                            content,
                            excerpt: content.slice(0, 300),
                            source: extractSource(feedUrl),
                            category: 'NEWS',
                            url: item.link || '',
                        })
                    }
                }
            }
            console.log(`   ✓ Extracted articles from ${feed.title || feedUrl}`)
        } catch (error) {
            console.log(`   ✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    console.log(`\n📄 Total articles extracted: ${articles.length}\n`)
    console.log('─'.repeat(60))

    // Step 2: Generate embeddings
    console.log('\n🧠 Generating embeddings...\n')

    let successful = 0
    const processedArticles: TrainingArticle[] = []

    for (const article of articles.slice(0, 25)) { // Limit for testing
        try {
            process.stdout.write(`   [${successful + 1}] ${article.title.slice(0, 45)}... `)

            // Generate embedding
            const textForEmbedding = `${article.title}\n\n${article.excerpt}`

            const result = await embeddingModel.embedContent(textForEmbedding)
            const embedding = result.embedding.values

            article.embedding = embedding
            processedArticles.push(article)

            console.log(`✓ (${embedding.length} dims)`)
            successful++

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error) {
            console.log(`✗ ${error instanceof Error ? error.message : 'Unknown'}`)
        }
    }

    // Step 3: Save to local file (until Firebase is configured)
    const outputPath = path.join(__dirname, '../data/rag-training.json')

    // Ensure directory exists
    const dataDir = path.dirname(outputPath)
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(processedArticles, null, 2))

    console.log('\n' + '─'.repeat(60))
    console.log(`\n✅ Complete!`)
    console.log(`   Generated ${successful} embeddings`)
    console.log(`   Saved to: ${outputPath}`)
    console.log('\n💡 Run npx tsx scripts/upload-to-firebase.ts to upload to Firestore')
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
}

function extractSource(url: string): string {
    if (url.includes('techcrunch')) return 'techcrunch'
    if (url.includes('theverge')) return 'verge'
    if (url.includes('arstechnica')) return 'arstechnica'
    if (url.includes('wired')) return 'wired'
    return 'unknown'
}

main().catch(console.error)

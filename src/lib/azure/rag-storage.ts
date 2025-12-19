/**
 * Azure Blob RAG Storage
 * 
 * Stores and retrieves RAG training data from Azure Blob Storage.
 * Falls back to local file if Azure is unavailable.
 */

import { BlobServiceClient } from '@azure/storage-blob'
import * as fs from 'fs'
import * as path from 'path'

const CONTAINER_NAME = 'rag-data'
const BLOB_NAME = 'rag-training.json'
const LOCAL_FALLBACK_PATH = path.join(process.cwd(), 'data', 'rag-training.json')

export interface RAGArticle {
    id: string
    url: string
    source: string
    title: string
    content: string
    excerpt: string
    category: string
    embedding: number[]
    createdAt: string
}

/**
 * Get Azure Blob client
 */
function getBlobClient() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING not configured')
    }
    return BlobServiceClient.fromConnectionString(connectionString)
}

/**
 * Upload RAG data to Azure Blob Storage
 */
export async function uploadRAGData(articles: RAGArticle[]): Promise<string> {
    const blobServiceClient = getBlobClient()
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME)

    // Create container if it doesn't exist
    await containerClient.createIfNotExists({ access: 'blob' })

    const blockBlobClient = containerClient.getBlockBlobClient(BLOB_NAME)

    const data = JSON.stringify(articles, null, 2)
    await blockBlobClient.upload(data, Buffer.byteLength(data), {
        blobHTTPHeaders: { blobContentType: 'application/json' }
    })

    console.log(`[RAG] Uploaded ${articles.length} articles to Azure Blob`)
    return blockBlobClient.url
}

/**
 * Download RAG data from Azure Blob Storage
 */
export async function downloadRAGData(): Promise<RAGArticle[]> {
    try {
        const blobServiceClient = getBlobClient()
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME)
        const blockBlobClient = containerClient.getBlockBlobClient(BLOB_NAME)

        const exists = await blockBlobClient.exists()
        if (!exists) {
            console.log('[RAG] No RAG data in Azure Blob, checking local fallback...')
            return loadLocalRAGData()
        }

        const response = await blockBlobClient.download(0)
        const downloaded = await streamToBuffer(response.readableStreamBody!)
        const articles = JSON.parse(downloaded.toString()) as RAGArticle[]

        console.log(`[RAG] Loaded ${articles.length} articles from Azure Blob`)
        return articles
    } catch (error) {
        console.warn('[RAG] Azure Blob unavailable, using local fallback:', error)
        return loadLocalRAGData()
    }
}

/**
 * Load RAG data from local file (fallback)
 */
function loadLocalRAGData(): RAGArticle[] {
    try {
        if (fs.existsSync(LOCAL_FALLBACK_PATH)) {
            const data = fs.readFileSync(LOCAL_FALLBACK_PATH, 'utf-8')
            const articles = JSON.parse(data) as RAGArticle[]
            console.log(`[RAG] Loaded ${articles.length} articles from local file`)
            return articles
        }
    } catch (error) {
        console.warn('[RAG] Local fallback also unavailable:', error)
    }
    return []
}

/**
 * Helper to convert stream to buffer
 */
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data))
        })
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks))
        })
        readableStream.on('error', reject)
    })
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
}

/**
 * Find similar articles based on embedding similarity
 */
export async function findSimilarArticles(
    queryEmbedding: number[],
    category?: string,
    limit = 3
): Promise<RAGArticle[]> {
    const articles = await downloadRAGData()

    if (articles.length === 0) {
        return []
    }

    // Filter by category if specified
    let filtered = category
        ? articles.filter(a => a.category.toLowerCase() === category.toLowerCase())
        : articles

    // If no articles in category, use all articles
    if (filtered.length === 0) {
        filtered = articles
    }

    // Calculate similarity scores
    const withScores = filtered.map(article => ({
        article,
        score: article.embedding ? cosineSimilarity(queryEmbedding, article.embedding) : 0
    }))

    // Sort by similarity and return top results
    withScores.sort((a, b) => b.score - a.score)

    return withScores.slice(0, limit).map(({ article }) => article)
}

/**
 * Get RAG context for content generation
 */
export async function getRAGContextFromBlob(
    topic: string,
    category: string,
    generateEmbeddingFn: (text: string) => Promise<number[]>
): Promise<string> {
    try {
        // Generate embedding for the query topic
        const queryEmbedding = await generateEmbeddingFn(topic)

        // Find similar articles
        const similarArticles = await findSimilarArticles(queryEmbedding, category, 3)

        if (similarArticles.length === 0) {
            console.log('[RAG] No similar articles found')
            return ''
        }

        // Build context from similar articles
        const context = similarArticles.map((article, i) => {
            return `--- Example ${i + 1} from ${article.source} ---
Title: ${article.title}
Excerpt: ${article.excerpt}
Style sample (first 500 chars):
${article.content.slice(0, 500)}
---`
        }).join('\n\n')

        return `Use the following high-quality tech journalism examples as style references:

${context}

Now write your article matching this professional standard.`
    } catch (error) {
        console.error('[RAG] Error getting context:', error)
        return ''
    }
}

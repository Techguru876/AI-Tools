/**
 * Embeddings Generator & Storage
 * 
 * Generates vector embeddings using Gemini and stores them in Firestore.
 */

import { ai } from '../genkit'
import { firestore, COLLECTIONS } from '../config/firebase-admin'
import type { ScrapedArticle } from './article-scraper'
import { FieldValue } from 'firebase-admin/firestore'

// Embedding dimension for Gemini text-embedding-004
const EMBEDDING_DIMENSION = 768

export interface ArticleEmbedding {
    id: string
    url: string
    source: string
    title: string
    content: string
    excerpt: string
    category: string
    embedding: number[]
    createdAt: Date
}

/**
 * Generate embedding for text using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    // Truncate text to fit embedding model limits (~8000 tokens)
    const truncatedText = text.slice(0, 25000)

    const response = await ai.embed({
        embedder: 'googleai/text-embedding-004',
        content: truncatedText,
    })

    return response.embedding
}

/**
 * Store article with embedding in Firestore
 */
export async function storeArticleEmbedding(article: ScrapedArticle): Promise<string> {
    // Check if already exists
    const existing = await firestore
        .collection(COLLECTIONS.ARTICLE_EMBEDDINGS)
        .where('url', '==', article.url)
        .limit(1)
        .get()

    if (!existing.empty) {
        console.log(`Article already exists: ${article.url}`)
        return existing.docs[0].id
    }

    // Generate embedding from title + excerpt + first part of content
    const textForEmbedding = `${article.title}\n\n${article.excerpt}\n\n${article.content.slice(0, 3000)}`
    const embedding = await generateEmbedding(textForEmbedding)

    // Store in Firestore with vector field
    const docRef = await firestore.collection(COLLECTIONS.ARTICLE_EMBEDDINGS).add({
        url: article.url,
        source: article.source,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        embedding: FieldValue.vector(embedding),
        createdAt: FieldValue.serverTimestamp(),
    })

    console.log(`Stored article: ${article.title} (${docRef.id})`)
    return docRef.id
}

/**
 * Batch process articles and store embeddings
 */
export async function processArticlesForRAG(articles: ScrapedArticle[]): Promise<{
    processed: number
    failed: number
}> {
    let processed = 0
    let failed = 0

    for (const article of articles) {
        try {
            await storeArticleEmbedding(article)
            processed++
        } catch (error) {
            console.error(`Failed to process ${article.url}:`, error)
            failed++
        }
    }

    return { processed, failed }
}

/**
 * Retrieve similar articles for RAG context
 */
export async function retrieveSimilarArticles(
    query: string,
    category?: string,
    limit = 3
): Promise<ArticleEmbedding[]> {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Build Firestore query with vector similarity
    let collectionRef = firestore.collection(COLLECTIONS.ARTICLE_EMBEDDINGS)

    // Note: Firestore vector search requires a composite index
    // For now, we'll do a simple fetch and compute similarity client-side
    // In production, use Firestore's findNearest() with proper indexes

    let query_ref = collectionRef.limit(50)
    if (category) {
        query_ref = collectionRef.where('category', '==', category).limit(50)
    }

    const snapshot = await query_ref.get()

    // Calculate cosine similarity for each document
    const articlesWithScores: Array<ArticleEmbedding & { score: number }> = []

    snapshot.forEach(doc => {
        const data = doc.data()
        const embedding = data.embedding?.toArray?.() || data.embedding

        if (embedding && Array.isArray(embedding)) {
            const score = cosineSimilarity(queryEmbedding, embedding)
            articlesWithScores.push({
                id: doc.id,
                url: data.url,
                source: data.source,
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                category: data.category,
                embedding,
                createdAt: data.createdAt?.toDate() || new Date(),
                score,
            })
        }
    })

    // Sort by similarity and return top results
    articlesWithScores.sort((a, b) => b.score - a.score)

    return articlesWithScores.slice(0, limit).map(({ score, ...article }) => article)
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

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
 * Get RAG context for content generation
 */
export async function getRAGContext(
    topic: string,
    category: string
): Promise<string> {
    const similarArticles = await retrieveSimilarArticles(topic, category, 3)

    if (similarArticles.length === 0) {
        return ''
    }

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
}

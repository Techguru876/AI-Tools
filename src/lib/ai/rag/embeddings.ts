/**
 * Embeddings Generator & Storage
 * 
 * Generates vector embeddings using Gemini and retrieves RAG context from Azure Blob.
 */

import { ai } from '../genkit'
import { getRAGContextFromBlob, findSimilarArticles, type RAGArticle } from '@/lib/azure/rag-storage'

export type { RAGArticle as ArticleEmbedding }

// Re-export ScrapedArticle type for compatibility
export interface ScrapedArticle {
    url: string
    source: string
    title: string
    content: string
    excerpt: string
    category: string
}

/**
 * Generate embedding for text using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    // Truncate text to fit embedding model limits (~8000 tokens)
    const truncatedText = text.slice(0, 25000)

    try {
        const response = await ai.embed({
            embedder: 'googleai/text-embedding-004',
            content: truncatedText,
        })

        // ai.embed returns different structures - handle both
        return (response as unknown as { embedding: number[] }).embedding || []
    } catch (error) {
        console.error('[Embeddings] Failed to generate embedding:', error)
        return []
    }
}

/**
 * Store article with embedding - delegated to Azure Blob
 * This is now handled by the populate-rag script uploading to Azure
 */
export async function storeArticleEmbedding(article: ScrapedArticle): Promise<string> {
    console.log(`[Embeddings] Article storage now handled by Azure Blob: ${article.title}`)
    return article.url
}

/**
 * Batch process articles - delegated to Azure Blob
 */
export async function processArticlesForRAG(articles: ScrapedArticle[]): Promise<{
    processed: number
    failed: number
}> {
    console.log(`[Embeddings] Batch processing now handled by Azure Blob upload`)
    return { processed: articles.length, failed: 0 }
}

/**
 * Retrieve similar articles for RAG context
 */
export async function retrieveSimilarArticles(
    query: string,
    category?: string,
    limit = 3
): Promise<RAGArticle[]> {
    try {
        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query)

        if (queryEmbedding.length === 0) {
            console.warn('[Embeddings] Could not generate query embedding')
            return []
        }

        // Find similar articles from Azure Blob storage
        return await findSimilarArticles(queryEmbedding, category, limit)
    } catch (error) {
        console.error('[Embeddings] Error retrieving similar articles:', error)
        return []
    }
}

/**
 * Get RAG context for content generation
 */
export async function getRAGContext(
    topic: string,
    category: string
): Promise<string> {
    return getRAGContextFromBlob(topic, category, generateEmbedding)
}

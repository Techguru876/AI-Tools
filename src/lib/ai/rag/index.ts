/**
 * RAG Module Index
 */

export { scrapeArticle, scrapeArticles, type ScrapedArticle } from './article-scraper'
export {
    generateEmbedding,
    storeArticleEmbedding,
    processArticlesForRAG,
    retrieveSimilarArticles,
    getRAGContext,
    type ArticleEmbedding
} from './embeddings'

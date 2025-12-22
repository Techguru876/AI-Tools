/**
 * Database Tools for Blog Management Agent
 * 
 * These tools allow the AI agent to query and manipulate posts in the database.
 */

import { ai, z } from '../genkit'
import { db } from '@/lib/db'
import { posts, categories, postCategories } from '@/lib/db/schema'
import { eq, desc, lt, sql, and, ilike, or } from 'drizzle-orm'

// Type definitions
type PostStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
type ContentType = 'ARTICLE' | 'REVIEW' | 'COMPARISON' | 'GUIDE' | 'NEWS' | 'AI_NEWS' | 'ROUNDUP' | 'SPONSORED'

// ============================================
// Query Posts Tool
// ============================================

export const queryPostsTool = ai.defineTool(
    {
        name: 'queryPosts',
        description: 'Search and retrieve blog posts from the database. Use this to find existing content, check for duplicates, or get posts that need refreshing.',
        inputSchema: z.object({
            status: z.enum(['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional()
                .describe('Filter by post status'),
            contentType: z.enum(['ARTICLE', 'REVIEW', 'COMPARISON', 'GUIDE', 'NEWS', 'AI_NEWS', 'ROUNDUP', 'SPONSORED']).optional()
                .describe('Filter by content type'),
            category: z.string().optional()
                .describe('Filter by category slug'),
            searchQuery: z.string().optional()
                .describe('Search in title and content'),
            olderThanDays: z.number().optional()
                .describe('Find posts older than X days (useful for content refresh)'),
            limit: z.number().default(10)
                .describe('Maximum number of posts to return'),
        }),
        outputSchema: z.object({
            posts: z.array(z.object({
                id: z.string(),
                title: z.string(),
                slug: z.string(),
                status: z.string(),
                contentType: z.string(),
                publishedAt: z.string().nullable(),
                lastRefreshedAt: z.string().nullable(),
                viewCount: z.number(),
            })),
            totalCount: z.number(),
        }),
    },
    async (input: any) => {
        // Build conditions array
        const conditions: any[] = []

        if (input.status) {
            conditions.push(eq(posts.status, input.status as PostStatus))
        }
        if (input.contentType) {
            conditions.push(eq(posts.contentType, input.contentType as ContentType))
        }
        if (input.olderThanDays) {
            const threshold = new Date()
            threshold.setDate(threshold.getDate() - input.olderThanDays)
            conditions.push(lt(posts.updatedAt, threshold))
        }

        // Fetch posts
        let postsResult = await db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                status: posts.status,
                contentType: posts.contentType,
                publishedAt: posts.publishedAt,
                lastRefreshedAt: posts.lastRefreshedAt,
                viewCount: posts.viewCount,
            })
            .from(posts)
            .orderBy(desc(posts.createdAt))
            .limit(input.limit * 2) // Get extra for filtering

        // Filter by conditions in JS (Drizzle's conditions work differently)
        if (input.status) {
            postsResult = postsResult.filter(p => p.status === input.status)
        }
        if (input.contentType) {
            postsResult = postsResult.filter(p => p.contentType === input.contentType)
        }
        if (input.searchQuery) {
            const query = input.searchQuery.toLowerCase()
            postsResult = postsResult.filter(p =>
                p.title.toLowerCase().includes(query)
            )
        }

        // Filter by category if provided
        if (input.category) {
            const catResult = await db
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.slug, input.category))
                .limit(1)

            if (catResult[0]) {
                const postIdsInCat = await db
                    .select({ postId: postCategories.postId })
                    .from(postCategories)
                    .where(eq(postCategories.categoryId, catResult[0].id))

                const catPostIds = new Set(postIdsInCat.map(p => p.postId))
                postsResult = postsResult.filter(p => catPostIds.has(p.id))
            }
        }

        const finalPosts = postsResult.slice(0, input.limit)

        // Get total count
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(posts)

        return {
            posts: finalPosts.map(p => ({
                ...p,
                status: p.status as string,
                contentType: p.contentType as string,
                publishedAt: p.publishedAt?.toISOString() ?? null,
                lastRefreshedAt: p.lastRefreshedAt?.toISOString() ?? null,
                viewCount: p.viewCount ?? 0,
            })),
            totalCount: Number(countResult[0]?.count ?? 0),
        }
    }
)

// ============================================
// Create Post Tool
// ============================================

export const createPostTool = ai.defineTool(
    {
        name: 'createPost',
        description: 'Create a new blog post in the database. Posts are created as DRAFT by default.',
        inputSchema: z.object({
            title: z.string().describe('The post title'),
            slug: z.string().describe('URL-friendly slug for the post'),
            content: z.string().describe('The full markdown content of the post'),
            excerpt: z.string().optional().describe('Short summary/excerpt'),
            contentType: z.enum(['ARTICLE', 'REVIEW', 'COMPARISON', 'GUIDE', 'NEWS', 'AI_NEWS', 'ROUNDUP'])
                .describe('Type of content'),
            categorySlug: z.string().optional().describe('Category slug to assign'),
            keywords: z.array(z.string()).optional().describe('SEO keywords'),
            metaDescription: z.string().optional().describe('SEO meta description'),
            coverImage: z.string().optional().describe('URL of the cover image'),
            publishImmediately: z.boolean().default(false)
                .describe('If true, publish immediately instead of creating as draft'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            postId: z.string().optional(),
            slug: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            // Check for duplicate slug
            const existing = await db
                .select({ id: posts.id })
                .from(posts)
                .where(eq(posts.slug, input.slug))
                .limit(1)

            if (existing.length > 0) {
                return {
                    success: false,
                    error: `A post with slug "${input.slug}" already exists`,
                }
            }

            // Find category if provided
            let categoryId: string | null = null
            if (input.categorySlug) {
                const category = await db
                    .select({ id: categories.id })
                    .from(categories)
                    .where(eq(categories.slug, input.categorySlug))
                    .limit(1)
                if (category[0]) {
                    categoryId = category[0].id
                }
            }

            // Create post
            const newPost = await db.insert(posts).values({
                title: input.title,
                slug: input.slug,
                content: input.content,
                excerpt: input.excerpt,
                contentType: input.contentType as ContentType,
                keywords: input.keywords || [],
                metaDescription: input.metaDescription,
                coverImage: input.coverImage,
                isAiGenerated: true,
                status: input.publishImmediately ? 'PUBLISHED' : 'DRAFT',
                publishedAt: input.publishImmediately ? new Date() : null,
            }).returning({ id: posts.id, slug: posts.slug })

            const post = newPost[0]

            // Connect category if found
            if (categoryId && post) {
                await db.insert(postCategories).values({
                    postId: post.id,
                    categoryId,
                })
            }

            return {
                success: true,
                postId: post.id,
                slug: post.slug,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
)

// ============================================
// Update Post Tool
// ============================================

export const updatePostTool = ai.defineTool(
    {
        name: 'updatePost',
        description: 'Update an existing blog post. Use this for content refresh or corrections.',
        inputSchema: z.object({
            postId: z.string().describe('The ID of the post to update'),
            title: z.string().optional().describe('New title'),
            content: z.string().optional().describe('New content'),
            excerpt: z.string().optional().describe('New excerpt'),
            keywords: z.array(z.string()).optional().describe('New keywords'),
            metaDescription: z.string().optional().describe('New meta description'),
            coverImage: z.string().optional().describe('New cover image URL'),
            markAsRefreshed: z.boolean().default(false)
                .describe('Update the lastRefreshedAt timestamp'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            const updateData: Partial<typeof posts.$inferInsert> = {}

            if (input.title) updateData.title = input.title
            if (input.content) updateData.content = input.content
            if (input.excerpt) updateData.excerpt = input.excerpt
            if (input.keywords) updateData.keywords = input.keywords
            if (input.metaDescription) updateData.metaDescription = input.metaDescription
            if (input.coverImage) updateData.coverImage = input.coverImage
            if (input.markAsRefreshed) updateData.lastRefreshedAt = new Date()

            await db.update(posts)
                .set(updateData)
                .where(eq(posts.id, input.postId))

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
)

// ============================================
// Get Categories Tool
// ============================================

export const getCategoriesTool = ai.defineTool(
    {
        name: 'getCategories',
        description: 'Get all available blog categories. Use this to determine where to place new content.',
        inputSchema: z.object({}),
        outputSchema: z.object({
            categories: z.array(z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                postCount: z.number(),
            })),
        }),
    },
    async () => {
        const categoriesResult = await db
            .select()
            .from(categories)

        // Get post counts for each category
        const categoriesWithCounts = await Promise.all(
            categoriesResult.map(async (c) => {
                const countResult = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(postCategories)
                    .where(eq(postCategories.categoryId, c.id))

                return {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    postCount: Number(countResult[0]?.count ?? 0),
                }
            })
        )

        return { categories: categoriesWithCounts }
    }
)

// ============================================
// Get Post Stats Tool
// ============================================

export const getPostStatsTool = ai.defineTool(
    {
        name: 'getPostStats',
        description: 'Get statistics about blog posts. Useful for making content decisions.',
        inputSchema: z.object({}),
        outputSchema: z.object({
            totalPosts: z.number(),
            publishedPosts: z.number(),
            draftPosts: z.number(),
            postsNeedingRefresh: z.number().describe('Posts not updated in 30+ days'),
            postsByType: z.record(z.string(), z.number()),
        }),
    },
    async () => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const totalResult = await db.select({ count: sql<number>`count(*)` }).from(posts)
        const publishedResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(posts)
            .where(eq(posts.status, 'PUBLISHED'))
        const draftResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(posts)
            .where(eq(posts.status, 'DRAFT'))
        const needsRefreshResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(posts)
            .where(and(
                eq(posts.status, 'PUBLISHED'),
                lt(posts.updatedAt, thirtyDaysAgo)
            ))

        // Get posts by type
        const byTypeResult = await db
            .select({
                contentType: posts.contentType,
                count: sql<number>`count(*)`,
            })
            .from(posts)
            .groupBy(posts.contentType)

        const postsByType: Record<string, number> = {}
        byTypeResult.forEach(item => {
            if (item.contentType) {
                postsByType[item.contentType] = Number(item.count)
            }
        })

        return {
            totalPosts: Number(totalResult[0]?.count ?? 0),
            publishedPosts: Number(publishedResult[0]?.count ?? 0),
            draftPosts: Number(draftResult[0]?.count ?? 0),
            postsNeedingRefresh: Number(needsRefreshResult[0]?.count ?? 0),
            postsByType,
        }
    }
)

// Export all database tools
export const databaseTools = [
    queryPostsTool,
    createPostTool,
    updatePostTool,
    getCategoriesTool,
    getPostStatsTool,
]

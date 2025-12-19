/**
 * Database Tools for Blog Management Agent
 * 
 * These tools allow the AI agent to query and manipulate posts in the database.
 */

import { ai, z } from '../genkit'
import { db } from '@/lib/db'
import type { PostStatus, ContentType } from '@prisma/client'

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
    async (input) => {
        const where: Record<string, unknown> = {}

        if (input.status) {
            where.status = input.status as PostStatus
        }
        if (input.contentType) {
            where.contentType = input.contentType as ContentType
        }
        if (input.category) {
            where.categories = { some: { slug: input.category } }
        }
        if (input.searchQuery) {
            where.OR = [
                { title: { contains: input.searchQuery, mode: 'insensitive' } },
                { content: { contains: input.searchQuery, mode: 'insensitive' } },
            ]
        }
        if (input.olderThanDays) {
            const threshold = new Date()
            threshold.setDate(threshold.getDate() - input.olderThanDays)
            where.updatedAt = { lt: threshold }
        }

        const [posts, totalCount] = await Promise.all([
            db.post.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    contentType: true,
                    publishedAt: true,
                    lastRefreshedAt: true,
                    viewCount: true,
                },
                orderBy: { createdAt: 'desc' },
                take: input.limit,
            }),
            db.post.count({ where }),
        ])

        return {
            posts: posts.map(p => ({
                ...p,
                status: p.status as string,
                contentType: p.contentType as string,
                publishedAt: p.publishedAt?.toISOString() ?? null,
                lastRefreshedAt: p.lastRefreshedAt?.toISOString() ?? null,
            })),
            totalCount,
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
    async (input) => {
        try {
            // Check for duplicate slug
            const existing = await db.post.findUnique({
                where: { slug: input.slug },
            })
            if (existing) {
                return {
                    success: false,
                    error: `A post with slug "${input.slug}" already exists`,
                }
            }

            // Find category if provided
            let categoryConnect = undefined
            if (input.categorySlug) {
                const category = await db.category.findUnique({
                    where: { slug: input.categorySlug },
                })
                if (category) {
                    categoryConnect = { connect: [{ id: category.id }] }
                }
            }

            const post = await db.post.create({
                data: {
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
                    categories: categoryConnect,
                },
            })

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
    async (input) => {
        try {
            const updateData: Record<string, unknown> = {}

            if (input.title) updateData.title = input.title
            if (input.content) updateData.content = input.content
            if (input.excerpt) updateData.excerpt = input.excerpt
            if (input.keywords) updateData.keywords = input.keywords
            if (input.metaDescription) updateData.metaDescription = input.metaDescription
            if (input.coverImage) updateData.coverImage = input.coverImage
            if (input.markAsRefreshed) updateData.lastRefreshedAt = new Date()

            await db.post.update({
                where: { id: input.postId },
                data: updateData,
            })

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
        const categories = await db.category.findMany({
            include: {
                _count: { select: { posts: true } },
            },
            orderBy: { name: 'asc' },
        })

        return {
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                postCount: c._count.posts,
            })),
        }
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

        const [total, published, drafts, needsRefresh, byType] = await Promise.all([
            db.post.count(),
            db.post.count({ where: { status: 'PUBLISHED' } }),
            db.post.count({ where: { status: 'DRAFT' } }),
            db.post.count({
                where: {
                    status: 'PUBLISHED',
                    updatedAt: { lt: thirtyDaysAgo },
                },
            }),
            db.post.groupBy({
                by: ['contentType'],
                _count: true,
            }),
        ])

        const postsByType: Record<string, number> = {}
        byType.forEach(item => {
            postsByType[item.contentType] = item._count
        })

        return {
            totalPosts: total,
            publishedPosts: published,
            draftPosts: drafts,
            postsNeedingRefresh: needsRefresh,
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

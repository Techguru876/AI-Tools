/**
 * Publishing Tools for Blog Management Agent
 * 
 * These tools handle the publishing workflow: moving posts through
 * draft → review → publish stages, scheduling, and image sourcing.
 */

import { ai, z } from '../genkit'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

// ============================================
// Publish Post Tool
// ============================================

export const publishPostTool = ai.defineTool(
    {
        name: 'publishPost',
        description: 'Publish a draft or scheduled post immediately. Changes status to PUBLISHED and sets publishedAt.',
        inputSchema: z.object({
            postId: z.string().describe('The ID of the post to publish'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            slug: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            const postResult = await db
                .select({ status: posts.status, slug: posts.slug })
                .from(posts)
                .where(eq(posts.id, input.postId))
                .limit(1)

            const post = postResult[0]

            if (!post) {
                return { success: false, error: 'Post not found' }
            }

            if (post.status === 'PUBLISHED') {
                return { success: true, slug: post.slug } // Already published
            }

            await db.update(posts)
                .set({
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                })
                .where(eq(posts.id, input.postId))

            return { success: true, slug: post.slug }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
)

// ============================================
// Schedule Post Tool
// ============================================

export const schedulePostTool = ai.defineTool(
    {
        name: 'schedulePost',
        description: 'Schedule a post to be published at a specific date and time.',
        inputSchema: z.object({
            postId: z.string().describe('The ID of the post to schedule'),
            publishAt: z.string().describe('ISO 8601 date string for when to publish'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            scheduledFor: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            const scheduleDate = new Date(input.publishAt)

            if (scheduleDate <= new Date()) {
                return { success: false, error: 'Schedule date must be in the future' }
            }

            await db.update(posts)
                .set({
                    status: 'SCHEDULED',
                    scheduledFor: scheduleDate,
                })
                .where(eq(posts.id, input.postId))

            return {
                success: true,
                scheduledFor: scheduleDate.toISOString(),
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
// Move to Review Tool
// ============================================

export const moveToReviewTool = ai.defineTool(
    {
        name: 'moveToReview',
        description: 'Move a draft post to the review queue for editorial approval.',
        inputSchema: z.object({
            postId: z.string().describe('The ID of the post to move to review'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            await db.update(posts)
                .set({ status: 'IN_REVIEW' })
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
// Archive Post Tool
// ============================================

export const archivePostTool = ai.defineTool(
    {
        name: 'archivePost',
        description: 'Archive a post (removes from public view but retains in database).',
        inputSchema: z.object({
            postId: z.string().describe('The ID of the post to archive'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            await db.update(posts)
                .set({ status: 'ARCHIVED' })
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
// Fetch Cover Image Tool
// ============================================

export const fetchCoverImageTool = ai.defineTool(
    {
        name: 'fetchCoverImage',
        description: 'Search for and return a relevant cover image URL from Unsplash based on keywords.',
        inputSchema: z.object({
            query: z.string().describe('Search query for the image (e.g., "smartphone technology")'),
            orientation: z.enum(['landscape', 'portrait', 'squarish']).default('landscape')
                .describe('Preferred image orientation'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            imageUrl: z.string().optional(),
            photographerName: z.string().optional(),
            photographerUrl: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        try {
            const accessKey = process.env.UNSPLASH_ACCESS_KEY

            if (!accessKey) {
                return { success: false, error: 'Unsplash API key not configured' }
            }

            const params = new URLSearchParams({
                query: input.query,
                orientation: input.orientation,
                per_page: '1',
            })

            const response = await fetch(
                `https://api.unsplash.com/search/photos?${params}`,
                {
                    headers: {
                        Authorization: `Client-ID ${accessKey}`,
                    },
                }
            )

            if (!response.ok) {
                return { success: false, error: `Unsplash API error: ${response.status}` }
            }

            const data = await response.json()

            if (!data.results || data.results.length === 0) {
                return { success: false, error: 'No images found for query' }
            }

            const image = data.results[0]

            return {
                success: true,
                imageUrl: image.urls.regular,
                photographerName: image.user.name,
                photographerUrl: image.user.links.html,
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
// Get Pending Reviews Tool
// ============================================

export const getPendingReviewsTool = ai.defineTool(
    {
        name: 'getPendingReviews',
        description: 'Get all posts currently in the review queue awaiting approval.',
        inputSchema: z.object({}),
        outputSchema: z.object({
            posts: z.array(z.object({
                id: z.string(),
                title: z.string(),
                contentType: z.string(),
                createdAt: z.string(),
                excerpt: z.string().nullable(),
            })),
            count: z.number(),
        }),
    },
    async () => {
        const postsResult = await db
            .select({
                id: posts.id,
                title: posts.title,
                contentType: posts.contentType,
                createdAt: posts.createdAt,
                excerpt: posts.excerpt,
            })
            .from(posts)
            .where(eq(posts.status, 'IN_REVIEW'))
            .orderBy(asc(posts.createdAt))

        return {
            posts: postsResult.map(p => ({
                id: p.id,
                title: p.title,
                contentType: p.contentType as string,
                createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
                excerpt: p.excerpt,
            })),
            count: postsResult.length,
        }
    }
)

// Export all publishing tools
export const publishingTools = [
    publishPostTool,
    schedulePostTool,
    moveToReviewTool,
    archivePostTool,
    fetchCoverImageTool,
    getPendingReviewsTool,
]

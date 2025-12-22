import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, postAnalytics, comments, affiliateLinks, postCategories, postTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Update post status (approve/reject/publish)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json()
        const { action, scheduledFor } = body

        const { id: postId } = await params

        // Verify post exists
        const postResult = await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.id, postId))
            .limit(1)

        if (postResult.length === 0) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        let updateData: Partial<typeof posts.$inferInsert> = {}

        switch (action) {
            case 'approve':
                // Move to approved/scheduled status
                updateData = {
                    status: 'PUBLISHED',
                    publishedAt: scheduledFor ? new Date(scheduledFor) : new Date(),
                }
                break

            case 'reject':
                updateData = {
                    status: 'ARCHIVED', // Using ARCHIVED as REJECTED doesn't exist in enum
                }
                break

            case 'draft':
                updateData = {
                    status: 'DRAFT',
                    publishedAt: null,
                }
                break

            case 'schedule':
                if (!scheduledFor) {
                    return NextResponse.json(
                        { error: 'scheduledFor is required for scheduling' },
                        { status: 400 }
                    )
                }
                updateData = {
                    status: 'SCHEDULED',
                    scheduledFor: new Date(scheduledFor),
                }
                break

            case 'update':
                // Handle content updates (title, excerpt, content, coverImage)
                const { title, excerpt, content, coverImage } = body
                updateData = {}
                if (title !== undefined) updateData.title = title
                if (excerpt !== undefined) updateData.excerpt = excerpt
                if (content !== undefined) updateData.content = content
                if (coverImage !== undefined) updateData.coverImage = coverImage

                if (Object.keys(updateData).length === 0) {
                    return NextResponse.json(
                        { error: 'No fields to update. Provide title, excerpt, content, or coverImage.' },
                        { status: 400 }
                    )
                }
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: approve, reject, draft, schedule, or update' },
                    { status: 400 }
                )
        }

        await db.update(posts)
            .set(updateData)
            .where(eq(posts.id, postId))

        // Fetch updated post
        const updatedPost = await db
            .select({
                id: posts.id,
                title: posts.title,
                status: posts.status,
                publishedAt: posts.publishedAt,
            })
            .from(posts)
            .where(eq(posts.id, postId))
            .limit(1)

        return NextResponse.json({
            success: true,
            post: updatedPost[0],
        })
    } catch (error: any) {
        console.error('Error updating post:', error)
        return NextResponse.json(
            { error: 'Failed to update post', details: error.message },
            { status: 500 }
        )
    }
}

// Delete post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params

        // Delete in correct order to handle foreign key constraints
        // 1. Delete post analytics
        await db.delete(postAnalytics).where(eq(postAnalytics.postId, postId))

        // 2. Delete comments
        await db.delete(comments).where(eq(comments.postId, postId))

        // 3. Delete affiliate links
        await db.delete(affiliateLinks).where(eq(affiliateLinks.postId, postId))

        // 4. Delete junction table entries
        await db.delete(postCategories).where(eq(postCategories.postId, postId))
        await db.delete(postTags).where(eq(postTags.postId, postId))

        // 5. Delete the post
        await db.delete(posts).where(eq(posts.id, postId))

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting post:', error)
        return NextResponse.json(
            { error: 'Failed to delete post', details: error.message },
            { status: 500 }
        )
    }
}

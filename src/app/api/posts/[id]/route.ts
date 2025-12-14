import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { PostStatus } from '@prisma/client'

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
        const post = await db.post.findUnique({
            where: { id: postId },
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        let updateData: any = {}

        switch (action) {
            case 'approve':
                // Move to approved/scheduled status
                updateData = {
                    status: 'PUBLISHED' as PostStatus,
                    publishedAt: scheduledFor ? new Date(scheduledFor) : new Date(),
                }
                break

            case 'reject':
                updateData = {
                    status: 'REJECTED' as PostStatus,
                }
                break

            case 'draft':
                updateData = {
                    status: 'DRAFT' as PostStatus,
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
                    status: 'SCHEDULED' as PostStatus,
                    scheduledFor: new Date(scheduledFor),
                }
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: approve, reject, draft, or schedule' },
                    { status: 400 }
                )
        }

        const updatedPost = await db.post.update({
            where: { id: postId },
            data: updateData,
        })

        return NextResponse.json({
            success: true,
            post: {
                id: updatedPost.id,
                title: updatedPost.title,
                status: updatedPost.status,
                publishedAt: updatedPost.publishedAt,
            },
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
        await db.postAnalytics.deleteMany({
            where: { postId },
        })

        // 2. Delete comments
        await db.comment.deleteMany({
            where: { postId },
        })

        // 3. Delete affiliate links
        await db.affiliateLink.deleteMany({
            where: { postId },
        })

        // 4. Delete the post (tags relationship will be handled by Prisma's implicit many-to-many)
        await db.post.delete({
            where: { id: postId },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting post:', error)
        return NextResponse.json(
            { error: 'Failed to delete post', details: error.message },
            { status: 500 }
        )
    }
}

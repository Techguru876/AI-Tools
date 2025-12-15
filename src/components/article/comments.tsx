'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
    id: string
    content: string
    author: string
    createdAt: Date
}

interface CommentsProps {
    postId: string
}

export function Comments({ postId }: Comm entsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmitting(true)
        // TODO: Implement API call to save comment
        await new Promise(resolve => setTimeout(resolve, 500))

        const comment: Comment = {
            id: Date.now().toString(),
            content: newComment,
            author: 'Anonymous',
            createdAt: new Date()
        }

        setComments([comment, ...comments])
        setNewComment('')
        setIsSubmitting(false)
    }

    return (
        <div className="mt-12">
            <div className="mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8 rounded-lg border bg-card p-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full rounded-md border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-3 flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            {comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg border bg-card p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{comment.author}</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                </p>
            )}
        </div>
    )
}

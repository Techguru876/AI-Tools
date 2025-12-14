'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Check, X, Clock, Eye, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    status: string
    contentType: string
    createdAt: Date
    categories: { name: string; slug: string; color: string | null }[]
    tags: { name: string; slug: string }[]
}

interface ReviewQueueClientProps {
    initialPosts: Post[]
}

export function ReviewQueueClient({ initialPosts }: ReviewQueueClientProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const { toast } = useToast()

    const handleAction = async (postId: string, action: string) => {
        setLoadingId(postId)

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Action failed')
            }

            // Remove from list or update status
            if (action === 'approve' || action === 'reject') {
                setPosts(posts.filter((p) => p.id !== postId))
            }

            toast({
                title: 'Success!',
                description: `Article ${action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'updated'}`,
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return

        setLoadingId(postId)

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Delete failed')
            }

            setPosts(posts.filter((p) => p.id !== postId))

            toast({
                title: 'Deleted',
                description: 'Article has been removed',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setLoadingId(null)
        }
    }

    if (posts.length === 0) {
        return (
            <Card>
                <CardContent className="flex min-h-[300px] items-center justify-center">
                    <div className="text-center">
                        <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
                        <h3 className="text-lg font-semibold">All caught up!</h3>
                        <p className="text-muted-foreground">
                            No articles pending review. Generate more content to fill the queue.
                        </p>
                        <Link href="/admin/batch">
                            <Button className="mt-4">Generate Batch</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    {post.categories[0] && (
                                        <Badge
                                            style={{
                                                backgroundColor: post.categories[0].color || '#6b7280',
                                                color: 'white',
                                            }}
                                        >
                                            {post.categories[0].name}
                                        </Badge>
                                    )}
                                    <Badge variant="outline">{post.contentType}</Badge>
                                    <Badge
                                        variant="outline"
                                        className={
                                            post.status === 'IN_REVIEW'
                                                ? 'border-yellow-500 text-yellow-600'
                                                : 'border-gray-500'
                                        }
                                    >
                                        {post.status}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-2 text-xl">
                                    {post.title}
                                </CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Created {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {expandedId === post.id && (
                        <CardContent className="border-t bg-muted/20 pt-4">
                            {post.excerpt && (
                                <div className="mb-4">
                                    <h4 className="mb-1 font-semibold">Excerpt:</h4>
                                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="mb-1 font-semibold">Content Preview:</h4>
                                <div className="prose prose-sm max-h-64 overflow-y-auto rounded border bg-background p-4 dark:prose-invert">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: post.content.slice(0, 1500).replace(/\n/g, '<br/>') + '...',
                                        }}
                                    />
                                </div>
                            </div>
                            {post.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1">
                                    {post.tags.map((tag) => (
                                        <Badge key={tag.slug} variant="secondary" className="text-xs">
                                            #{tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    )}

                    <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-3">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(post.id)}
                            disabled={loadingId === post.id}
                        >
                            {loadingId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleAction(post.id, 'reject')}
                                disabled={loadingId === post.id}
                            >
                                {loadingId === post.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <X className="mr-1 h-4 w-4" />
                                        Reject
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(post.id, 'approve')}
                                disabled={loadingId === post.id}
                            >
                                {loadingId === post.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="mr-1 h-4 w-4" />
                                        Approve & Publish
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

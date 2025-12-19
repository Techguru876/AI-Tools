'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2, Eye } from 'lucide-react'
import { MarkdownToolbar } from '@/components/ui/markdown-toolbar'

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    status: string
    contentType: string
    categories: { name: string; slug: string }[]
    tags: { name: string; slug: string }[]
}

interface PostEditClientProps {
    post: Post
}

export function PostEditClient({ post }: PostEditClientProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSaving, setIsSaving] = useState(false)
    const contentRef = useRef<HTMLTextAreaElement>(null)
    const [formData, setFormData] = useState({
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        coverImage: post.coverImage || '',
    })

    const handleSave = async () => {
        setIsSaving(true)

        try {
            const response = await fetch(`/api/posts/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    title: formData.title,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    coverImage: formData.coverImage,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Save failed')
            }

            toast({
                title: 'Saved!',
                description: 'Post has been updated successfully',
            })

            router.refresh()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const wordCount = formData.content.split(/\s+/).filter(Boolean).length

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild>
                    <Link href="/admin/posts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Posts
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={
                        post.status === 'PUBLISHED'
                            ? 'border-green-500 text-green-600'
                            : 'border-yellow-500 text-yellow-600'
                    }>
                        {post.status}
                    </Badge>
                    <Button variant="outline" asChild>
                        <Link href={`/${post.categories[0]?.slug || 'tech'}/${post.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View Live
                        </Link>
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Edit Form */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Excerpt</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Brief description of the article..."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium">Content (Markdown)</label>
                                    <span className="text-sm text-muted-foreground">{wordCount} words</span>
                                </div>
                                <MarkdownToolbar
                                    textareaRef={contentRef}
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                                <textarea
                                    ref={contentRef}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={25}
                                    className="w-full rounded-b-lg rounded-t-none border border-t-0 bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                                    placeholder="Article content in markdown..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input
                                type="text"
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.coverImage && (
                                <img
                                    src={formData.coverImage}
                                    alt="Cover preview"
                                    className="w-full h-40 object-cover rounded-lg border"
                                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span>{post.contentType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <span>{post.categories[0]?.name || 'None'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Slug</span>
                                <span className="font-mono text-xs">{post.slug}</span>
                            </div>
                            {post.tags.length > 0 && (
                                <div>
                                    <span className="text-muted-foreground block mb-2">Tags</span>
                                    <div className="flex flex-wrap gap-1">
                                        {post.tags.map((tag) => (
                                            <Badge key={tag.slug} variant="secondary" className="text-xs">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'

// Force dynamic rendering - admin pages need database access
export const dynamic = 'force-dynamic'

export default async function PostsPage() {
    const posts = await db.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            author: { select: { name: true } },
            categories: { select: { name: true, slug: true } },
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Posts</h2>
                    <p className="text-muted-foreground">Manage all your articles</p>
                </div>
                <Button asChild>
                    <Link href="/admin/generate">+ New Article</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Posts ({posts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center">
                            No posts yet. <Link href="/admin/generate" className="text-primary hover:underline">Create your first article</Link>
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Title</th>
                                        <th className="px-4 py-3 text-left font-medium">Category</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Author</th>
                                        <th className="px-4 py-3 text-left font-medium">Views</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post) => (
                                        <tr key={post.id} className="border-t hover:bg-muted/20">
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{post.title}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {post.categories[0]?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded px-2 py-1 text-xs ${post.status === 'PUBLISHED'
                                                    ? 'bg-green-500/10 text-green-600'
                                                    : 'bg-yellow-500/10 text-yellow-600'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {post.author?.name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {post.viewCount || 0}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/posts/${post.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/${post.categories[0]?.slug || 'tech'}/${post.slug}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

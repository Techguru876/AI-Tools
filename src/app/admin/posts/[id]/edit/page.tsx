import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PostEditClient } from './client'

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
    const { id } = await params

    const post = await db.post.findUnique({
        where: { id },
        include: {
            categories: { select: { name: true, slug: true } },
            tags: { select: { name: true, slug: true } },
        },
    })

    if (!post) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Edit Post</h2>
                <p className="text-muted-foreground">
                    Editing: {post.title}
                </p>
            </div>

            <PostEditClient post={post} />
        </div>
    )
}

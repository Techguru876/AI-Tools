import { db } from '@/lib/db'
import { posts, categories, tags, postCategories, postTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PostEditClient } from './client'

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
    const { id } = await params

    const postResult = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1)

    const post = postResult[0]

    if (!post) {
        notFound()
    }

    // Fetch categories
    const postCats = await db
        .select({
            name: categories.name,
            slug: categories.slug,
        })
        .from(categories)
        .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .where(eq(postCategories.postId, post.id))

    // Fetch tags
    const postTagsResult = await db
        .select({
            name: tags.name,
            slug: tags.slug,
        })
        .from(tags)
        .innerJoin(postTags, eq(tags.id, postTags.tagId))
        .where(eq(postTags.postId, post.id))

    const postWithRelations = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        status: post.status ?? 'DRAFT',
        contentType: post.contentType ?? 'ARTICLE',
        categories: postCats,
        tags: postTagsResult,
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Edit Post</h2>
                <p className="text-muted-foreground">
                    Editing: {post.title}
                </p>
            </div>

            <PostEditClient post={postWithRelations} />
        </div>
    )
}

/**
 * Quick DB check and quality grade
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { db } from '../src/lib/db'
import { posts } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

async function main() {
    const postId = 'cmjc2uwcn0000mgvp5v0umsid'

    const postResult = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
            excerpt: posts.excerpt,
            coverImage: posts.coverImage,
            status: posts.status,
            contentType: posts.contentType,
            keywords: posts.keywords,
            metaDescription: posts.metaDescription,
            createdAt: posts.createdAt,
        })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1)

    const post = postResult[0]

    if (!post) {
        console.log('Post not found')
        return
    }

    console.log('═'.repeat(60))
    console.log('📋 POST DETAILS')
    console.log('═'.repeat(60))
    console.log(`ID: ${post.id}`)
    console.log(`Title: ${post.title}`)
    console.log(`Slug: ${post.slug}`)
    console.log(`Status: ${post.status}`)
    console.log(`Content Type: ${post.contentType}`)
    console.log(`Content Length: ${post.content?.length || 0} chars`)
    console.log(`Word Count: ~${post.content?.split(/\s+/).length || 0}`)
    console.log(`Cover Image: ${post.coverImage ? 'YES (DALL-E)' : 'No'}`)
    console.log(`Keywords: ${(post.keywords as string[])?.join(', ') || 'None'}`)
    console.log(`Meta Description: ${post.metaDescription?.slice(0, 100)}...`)

    console.log('\n' + '─'.repeat(60))
    console.log('📄 FULL ARTICLE CONTENT')
    console.log('─'.repeat(60) + '\n')
    console.log(post.content)

    console.log('\n' + '─'.repeat(60))
    console.log('🖼️ COVER IMAGE URL')
    console.log('─'.repeat(60))
    console.log(post.coverImage || 'No image')
}

main().catch(console.error)

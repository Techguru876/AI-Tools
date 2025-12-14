import 'dotenv/config'
import { db } from '../src/lib/db'

async function analyzeContent() {
    console.log('🔍 Analyzing database content...\n')

    // Get all posts
    const allPosts = await db.post.findMany({
        include: {
            categories: { select: { name: true, slug: true } },
            tags: { select: { name: true } },
        },
    })

    console.log(`📊 Total Posts: ${allPosts.length}\n`)

    // Group by category
    const techPosts = allPosts.filter(p => p.categories.some(c => c.slug === 'tech'))
    const aiNewsPosts = allPosts.filter(p => p.categories.some(c => c.slug === 'ai-news'))
    const reviewsPosts = allPosts.filter(p => p.categories.some(c => c.slug === 'reviews'))
    const sciencePosts = allPosts.filter(p => p.categories.some(c => c.slug === 'science'))
    const culturePosts = allPosts.filter(p => p.categories.some(c => c.slug === 'culture'))
    const dealsPosts = allPosts.filter(p => p.categories.some(c => c.slug === 'deals'))

    console.log('📂 Posts by Category:')
    console.log(`- Tech: ${techPosts.length}`)
    console.log(`- AI News: ${aiNewsPosts.length}`)
    console.log(`- Reviews: ${reviewsPosts.length}`)
    console.log(`- Science: ${sciencePosts.length}`)
    console.log(`- Culture: ${culturePosts.length}`)
    console.log(`- Deals: ${dealsPosts.length}\n`)

    // List all posts
    console.log('📝 All Posts:\n')
    allPosts.forEach((post, i) => {
        console.log(`${i + 1}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Category: ${post.categories.map(c => c.name).join(', ')}`)
        console.log(`   Status: ${post.status}`)
        console.log(`   Published: ${post.publishedAt}`)
        console.log(`   Image: ${post.coverImage}`)
        console.log('')
    })

    await db.$disconnect()
}

analyzeContent().catch(console.error)

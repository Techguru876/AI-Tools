import 'dotenv/config'
import { db } from '../src/lib/db'

async function cleanupDatabase() {
    console.log('🧹 Starting database cleanup...\n')

    // Step 1: Delete older duplicate articles (keep the newer December 2025 versions)
    console.log('📝 Step 1: Removing duplicate articles...')

    const duplicateSlugs = [
        'apple-m4-pro-chip-ai-capabilities',
        'google-algorithm-update-ai-content',
        'openai-gpt5-release',
        'meta-llama-4-coding-benchmarks',
        'macbook-pro-m4-review',
        'samsung-galaxy-s25-ultra-review',
    ]

    for (const slug of duplicateSlugs) {
        const deleted = await db.post.deleteMany({
            where: { slug },
        })
        if (deleted.count > 0) {
            console.log(`  ✅ Deleted: ${slug} (${deleted.count} article(s))`)
        }
    }

    // Step 2: Delete the auto-generated articles with null images
    console.log('\n📝 Step 2: Removing auto-generated articles with null images...')

    const nullImageSlugs = [
        'major-tech-giants-roll-out-groundbreaking-software-updates-as-2026-approaches',
        'tech-industry-rocked-by-major-ai-chip-breakthrough-and-regulatory-shakeup',
        'smartphone-innovation-surges-as-2026-approaches-foldables-ai-and-battery-breakthroughs-reshape-the-mobile-landscape',
    ]

    for (const slug of nullImageSlugs) {
        const deleted = await db.post.deleteMany({
            where: { slug },
        })
        if (deleted.count > 0) {
            console.log(`  ✅ Deleted: ${slug}`)
        }
    }

    // Step 3: Fix the Meta Llama 4 image
    console.log('\n📝 Step 3: Fixing Meta Llama 4 image...')

    const llamaPost = await db.post.updateMany({
        where: { slug: 'meta-llama-4-release-december-2025' },
        data: {
            coverImage: 'https://source.unsplash.com/1200x630/?artificial-intelligence-code',
        },
    })

    if (llamaPost.count > 0) {
        console.log(`  ✅ Updated Meta Llama 4 image (${llamaPost.count} article(s))`)
    }

    // Step 4: Verify final count
    console.log('\n📊 Final database state:')

    const finalCount = await db.post.count({
        where: { status: 'PUBLISHED' },
    })

    console.log(`  Total published articles: ${finalCount}`)

    // Show breakdown by category
    const categories = ['tech', 'ai-news', 'reviews', 'science', 'culture', 'deals']
    console.log('\n  By category:')

    for (const cat of categories) {
        const count = await db.post.count({
            where: {
                status: 'PUBLISHED',
                categories: { some: { slug: cat } },
            },
        })
        if (count > 0) {
            console.log(`    - ${cat}: ${count} articles`)
        }
    }

    // List remaining articles
    console.log('\n📝 Remaining articles:')
    const remainingPosts = await db.post.findMany({
        where: { status: 'PUBLISHED' },
        include: {
            categories: { select: { name: true } },
        },
        orderBy: { publishedAt: 'desc' },
    })

    remainingPosts.forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.title}`)
        console.log(`     Category: ${post.categories.map(c => c.name).join(', ')}`)
        console.log(`     Image: ${post.coverImage ? '✅' : '❌ NULL'}`)
    })

    console.log('\n✨ Cleanup complete!')

    await db.$disconnect()
}

cleanupDatabase()
    .catch((error) => {
        console.error('❌ Cleanup failed:', error)
        process.exit(1)
    })

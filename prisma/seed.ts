import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Check if categories already exist
    const existingCategories = await prisma.category.count()
    if (existingCategories > 0) {
        console.log('📁 Categories already exist, skipping category seed')
    } else {
        // Create Categories
        console.log('📁 Creating categories...')
        await prisma.category.createMany({
            data: [
                { name: 'Tech', slug: 'tech', description: 'Latest technology news, gadgets, and innovations', color: '#3B82F6' },
                { name: 'Science', slug: 'science', description: 'Scientific discoveries and breakthroughs', color: '#10B981' },
                { name: 'Culture', slug: 'culture', description: 'Entertainment, gaming, movies, and pop culture', color: '#8B5CF6' },
                { name: 'Reviews', slug: 'reviews', description: 'In-depth product reviews and comparisons', color: '#F59E0B' },
                { name: 'Deals', slug: 'deals', description: 'Best tech deals and shopping guides', color: '#EF4444' },
                { name: 'AI News', slug: 'ai-news', description: 'Artificial intelligence and machine learning updates', color: '#06B6D4' },
            ],
        })
        console.log('✅ Created 6 categories')
    }

    // Check if tags already exist
    const existingTags = await prisma.tag.count()
    if (existingTags > 0) {
        console.log('🏷️  Tags already exist, skipping tag seed')
    } else {
        // Create Tags
        console.log('🏷️  Creating tags...')
        await prisma.tag.createMany({
            data: [
                { name: 'apple', slug: 'apple' },
                { name: 'google', slug: 'google' },
                { name: 'microsoft', slug: 'microsoft' },
                { name: 'artificial intelligence', slug: 'artificial-intelligence' },
                { name: 'machine learning', slug: 'machine-learning' },
                { name: 'smartphones', slug: 'smartphones' },
                { name: 'laptops', slug: 'laptops' },
                { name: 'gaming', slug: 'gaming' },
                { name: 'cybersecurity', slug: 'cybersecurity' },
                { name: 'space', slug: 'space' },
                { name: 'climate tech', slug: 'climate-tech' },
                { name: 'electric vehicles', slug: 'electric-vehicles' },
                { name: 'vr ar', slug: 'vr-ar' },
                { name: 'blockchain', slug: 'blockchain' },
                { name: 'quantum computing', slug: 'quantum-computing' },
                { name: 'robotics', slug: 'robotics' },
                { name: 'biotechnology', slug: 'biotechnology' },
                { name: 'social media', slug: 'social-media' },
                { name: 'cloud computing', slug: 'cloud-computing' },
                { name: 'software', slug: 'software' },
            ],
        })
        console.log('✅ Created 20 tags')
    }

    // Summary
    const categoryCount = await prisma.category.count()
    const tagCount = await prisma.tag.count()
    const postCount = await prisma.post.count()

    console.log('\n🎉 Database seed complete!')
    console.log(`   Categories: ${categoryCount}`)
    console.log(`   Tags: ${tagCount}`)
    console.log(`   Posts: ${postCount}`)
    console.log('\n💡 Use the admin dashboard at /admin/generate to create articles!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

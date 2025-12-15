// Fix broken images - update source.unsplash.com to working images.unsplash.com URLs
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_n8FUMHebA9Tg@ep-mute-hat-a8akcexl-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

const pool = new pg.Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

// Working Unsplash image URLs (direct links, not source.unsplash.com)
const imageUpdates: Record<string, string> = {
    'apple-m4-pro-chip-ai-december-2025': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=630&fit=crop',
    'openai-gpt5-launch-december-2025': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    'meta-llama-4-release-december-2025': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=630&fit=crop',
    'macbook-pro-m4-2025-review': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=630&fit=crop',
    'samsung-s25-ultra-review-december-2025': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&h=630&fit=crop',
    'google-algorithm-update-ai-content-december-2025': 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&h=630&fit=crop',
    'microsoft-copilot-december-2025-update': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
    'nasa-mars-water-discovery-december-2025': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&h=630&fit=crop',
    'fusion-energy-breakthrough-december-2025': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=630&fit=crop',
    'most-anticipated-games-2026-december-2025': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=630&fit=crop',
    'netflix-december-2025-new-releases': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&h=630&fit=crop',
    'december-2025-tech-deals-black-friday': 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=630&fit=crop',
}

async function main() {
    console.log('🔧 Fixing broken images in database...\n')

    // Get all posts
    const posts = await db.post.findMany({
        select: { id: true, slug: true, coverImage: true, title: true }
    })

    console.log(`Found ${posts.length} posts to check\n`)

    let updated = 0
    let skipped = 0

    for (const post of posts) {
        // Check if this post has a mapped image update
        if (imageUpdates[post.slug]) {
            await db.post.update({
                where: { id: post.id },
                data: { coverImage: imageUpdates[post.slug] }
            })
            console.log(`✅ Updated: ${post.title.substring(0, 50)}...`)
            updated++
        }
        // Check if current image uses source.unsplash.com (broken)
        else if (post.coverImage?.includes('source.unsplash.com')) {
            // Use a generic tech image as fallback
            await db.post.update({
                where: { id: post.id },
                data: { coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop' }
            })
            console.log(`⚠️ Fixed with fallback: ${post.title.substring(0, 50)}...`)
            updated++
        }
        else {
            console.log(`⏭️ Skipped (already OK): ${post.title.substring(0, 50)}...`)
            skipped++
        }
    }

    console.log(`\n🎉 Done! Updated: ${updated}, Skipped: ${skipped}`)
}

main()
    .catch(console.error)
    .finally(async () => {
        await pool.end()
        await db.$disconnect()
        process.exit(0)
    })

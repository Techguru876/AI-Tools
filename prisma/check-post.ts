
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_n8FUMHebA9Tg@ep-mute-hat-a8akcexl-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

const pool = new pg.Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
    const post = await db.post.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' }
    })

    if (post) {
        console.log('Title:', post.title)
        console.log('Length:', post.content.length)
        console.log('--- CONTENT START ---')
        console.log(post.content.substring(0, 500)) // Show first 500 chars
        console.log('--- CONTENT END ---')
    } else {
        console.log('No posts found')
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await pool.end()
        await db.$disconnect()
    })

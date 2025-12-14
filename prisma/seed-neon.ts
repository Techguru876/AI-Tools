// Standalone production seeder - runs with explicit Neon connection
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const DATABASE_URL = 'postgresql://neondb_owner:npg_n8FUMHebA9Tg@ep-mute-hat-a8akcexl-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

const pool = new pg.Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
    console.log('🚀 Connecting to Neon production database...')

    // Create categories
    const categories = [
        { name: 'Tech', slug: 'tech', description: 'Technology news', color: '#3b82f6' },
        { name: 'AI News', slug: 'ai-news', description: 'AI and ML updates', color: '#8b5cf6' },
        { name: 'Reviews', slug: 'reviews', description: 'Product reviews', color: '#10b981' },
        { name: 'Science', slug: 'science', description: 'Science discoveries', color: '#06b6d4' },
        { name: 'Culture', slug: 'culture', description: 'Entertainment', color: '#f59e0b' },
        { name: 'Deals', slug: 'deals', description: 'Tech deals', color: '#ef4444' },
    ]

    console.log('📁 Creating categories...')
    for (const cat of categories) {
        try {
            await db.category.upsert({
                where: { slug: cat.slug },
                create: cat,
                update: cat,
            })
            console.log(`  ✅ ${cat.name}`)
        } catch (e) {
            console.log(`  ⚠️ ${cat.name} - ${e}`)
        }
    }

    // Articles data
    const articles = [
        {
            title: 'Apple Unveils Revolutionary M4 Pro Chip with 40% Faster AI Processing',
            slug: 'apple-m4-pro-chip-ai-december-2025',
            excerpt: 'Apple announces the M4 Pro chip in December 2025, featuring groundbreaking neural engine improvements.',
            content: '# Apple M4 Pro Chip\n\nApple has announced its latest breakthrough in silicon technology with the M4 Pro chip.\n\n## Key Features\n- 40% faster ML performance\n- Enhanced Neural Engine with 32 cores\n- 20% improvement in power efficiency\n- Support for up to 192GB unified memory',
            contentType: 'NEWS',
            categorySlug: 'tech',
            coverImage: 'https://source.unsplash.com/1200x630/?apple-technology-device',
            viewCount: 1250,
        },
        {
            title: 'OpenAI Unveils GPT-5 in December 2025: Breakthrough in Reasoning',
            slug: 'openai-gpt5-launch-december-2025',
            excerpt: 'OpenAI officially launches GPT-5, marking a quantum leap in language understanding.',
            content: '# GPT-5 Launches\n\nOpenAI has officially launched GPT-5, the most significant advancement in AI language models.\n\n## Major Improvements\n- 3x better reasoning\n- 1 million token context\n- Native multimodal capabilities',
            contentType: 'AI_NEWS',
            categorySlug: 'ai-news',
            coverImage: 'https://source.unsplash.com/1200x630/?artificial-intelligence-future',
            viewCount: 2150,
        },
        {
            title: 'Meta Llama 4 December 2025 Release Challenges Proprietary Models',
            slug: 'meta-llama-4-release-december-2025',
            excerpt: 'Meta releases Llama 4, achieving state-of-the-art coding performance.',
            content: '# Llama 4: Open Source AI\n\nMeta has released Llama 4, achieving remarkable performance that challenges proprietary models.\n\n## Benchmarks\n- HumanEval: 89.2%\n- MBPP: 86.5%',
            contentType: 'AI_NEWS',
            categorySlug: 'ai-news',
            coverImage: 'https://source.unsplash.com/1200x630/?artificial-intelligence-code',
            viewCount: 1567,
        },
        {
            title: '2025 MacBook Pro M4 Review: The Ultimate Creative Powerhouse',
            slug: 'macbook-pro-m4-2025-review',
            excerpt: 'After two weeks with the MacBook Pro M4, here is our comprehensive review.',
            content: '# MacBook Pro M4 Review\n\nThe 2025 MacBook Pro M4 is the best laptop Apple has ever made.\n\n## Score: 9.5/10\n\n### Pros\n- Incredible performance\n- Amazing display\n- All-day battery\n\n### Cons\n- Expensive\n- Heavy',
            contentType: 'REVIEW',
            categorySlug: 'reviews',
            coverImage: 'https://source.unsplash.com/1200x630/?macbook-pro-workspace',
            viewCount: 1890,
        },
        {
            title: 'Samsung Galaxy S25 Ultra Review: December 2025 Best Android',
            slug: 'samsung-s25-ultra-review-december-2025',
            excerpt: 'The S25 Ultra is the best Android phone you can buy in late 2025.',
            content: '# Samsung S25 Ultra Review\n\nThe Galaxy S25 Ultra sets a new standard for Android flagships.\n\n## Score: 9.3/10\n\n### Pros\n- Best Android display\n- Exceptional cameras\n- S Pen included',
            contentType: 'REVIEW',
            categorySlug: 'reviews',
            coverImage: 'https://source.unsplash.com/1200x630/?samsung-galaxy-smartphone',
            viewCount: 2890,
        },
        {
            title: 'Google December 2025 Search Algorithm Update',
            slug: 'google-algorithm-update-ai-content-december-2025',
            excerpt: 'Google latest algorithm update targets AI content quality.',
            content: '# Google December 2025 Update\n\nGoogle has rolled out a major algorithm update addressing AI-generated content quality.\n\n## Key Changes\n- Advanced AI content detection\n- Quality scoring improvements\n- Rewards for human-reviewed content',
            contentType: 'NEWS',
            categorySlug: 'tech',
            coverImage: 'https://source.unsplash.com/1200x630/?google-workspace-technology',
            viewCount: 890,
        },
        {
            title: 'Microsoft Copilot Gets Major December 2025 Update',
            slug: 'microsoft-copilot-december-2025-update',
            excerpt: 'Microsoft Copilot receives its biggest update yet with new AI capabilities.',
            content: '# Microsoft Copilot Update\n\nMicrosoft has released a major update to Copilot across all platforms.\n\n## New Features\n- GPT-5 integration\n- Enhanced coding assistance\n- Multi-file editing support',
            contentType: 'NEWS',
            categorySlug: 'tech',
            coverImage: 'https://source.unsplash.com/1200x630/?coding-programming-ai',
            viewCount: 756,
        },
        {
            title: 'NASA Confirms Liquid Water Beneath Mars Surface',
            slug: 'nasa-mars-water-discovery-december-2025',
            excerpt: 'NASA announces liquid water deposits found meters below Mars surface.',
            content: '# NASA Mars Water Discovery\n\nNASA announced today one of the most significant discoveries in planetary science.\n\n## Key Findings\n- Liquid water 3-5 meters below surface\n- Reservoirs spanning hundreds of square kilometers\n- Potential for microbial life',
            contentType: 'NEWS',
            categorySlug: 'science',
            coverImage: 'https://source.unsplash.com/1200x630/?mars-planet-space',
            viewCount: 1456,
        },
        {
            title: 'Fusion Energy Breakthrough: December 2025 Net Gain',
            slug: 'fusion-energy-breakthrough-december-2025',
            excerpt: 'National Ignition Facility achieves fusion net energy gain for third time.',
            content: '# Fusion Energy Breakthrough\n\nNIF has achieved fusion energy net gain for the third time in 2025.\n\n## Achievement\n- 1.8x energy gain\n- Third successful run\n- Stable plasma maintained',
            contentType: 'NEWS',
            categorySlug: 'science',
            coverImage: 'https://source.unsplash.com/1200x630/?nuclear-fusion-energy',
            viewCount: 987,
        },
        {
            title: '2025 Most Anticipated Games: 2026 Preview',
            slug: 'most-anticipated-games-2026-december-2025',
            excerpt: 'From GTA VI to Zelda, here are the most anticipated games for 2026.',
            content: '# Most Anticipated Games 2026\n\nAs we approach 2026, gaming is buzzing with excitement.\n\n## Top Releases\n1. GTA VI (Q1 2026)\n2. Legend of Zelda: Echoes of Time\n3. Fable 4\n4. Final Fantasy VII Rebirth Part 2',
            contentType: 'ROUNDUP',
            categorySlug: 'culture',
            coverImage: 'https://source.unsplash.com/1200x630/?gaming-console-entertainment',
            viewCount: 2134,
        },
        {
            title: 'Netflix December 2025 Releases: Squid Game S3',
            slug: 'netflix-december-2025-new-releases',
            excerpt: 'Netflix caps off 2025 with Squid Game Season 3 and major releases.',
            content: '# Netflix December 2025\n\nNetflix ends the year strong with blockbuster releases.\n\n## Highlights\n- Squid Game Season 3 (Dec 15)\n- The Witcher Season 4 (Dec 22)\n- New series: The Last Colony',
            contentType: 'ROUNDUP',
            categorySlug: 'culture',
            coverImage: 'https://source.unsplash.com/1200x630/?netflix-streaming-entertainment',
            viewCount: 1623,
        },
        {
            title: 'December 2025 Tech Deals: Black Friday Extended',
            slug: 'december-2025-tech-deals-black-friday',
            excerpt: 'Black Friday deals extended through December! Best discounts available now.',
            content: '# Best Tech Deals December 2025\n\nBlack Friday deals extended through mid-December.\n\n## Hot Deals\n- MacBook Air M3: $999 (was $1,199)\n- iPhone 15 Pro Max: $899 (was $1,199)\n- PS5 Slim: $449 (was $499)\n- AirPods Pro 2: $189 (was $249)',
            contentType: 'ROUNDUP',
            categorySlug: 'deals',
            coverImage: 'https://source.unsplash.com/1200x630/?black-friday-shopping-deals',
            viewCount: 3421,
        },
    ]

    console.log('\n📝 Creating articles...')
    for (const article of articles) {
        const { categorySlug, ...data } = article

        try {
            const category = await db.category.findUnique({ where: { slug: categorySlug } })
            if (!category) {
                console.log(`  ⚠️ Category ${categorySlug} not found`)
                continue
            }

            const existing = await db.post.findUnique({ where: { slug: article.slug } })
            if (existing) {
                console.log(`  ⏭️ Exists: ${article.title.substring(0, 40)}...`)
                continue
            }

            await db.post.create({
                data: {
                    ...data,
                    status: 'PUBLISHED',
                    publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                    isAiGenerated: false,
                    categories: { connect: { id: category.id } },
                },
            })
            console.log(`  ✅ ${article.title.substring(0, 40)}...`)
        } catch (e: any) {
            console.log(`  ❌ Error: ${e.message?.substring(0, 50)}`)
        }
    }

    // Final count
    const count = await db.post.count({ where: { status: 'PUBLISHED' } })
    console.log(`\n🎉 Done! Total published articles: ${count}`)
}

main()
    .catch(console.error)
    .finally(async () => {
        await pool.end()
        await db.$disconnect()
        process.exit(0)
    })

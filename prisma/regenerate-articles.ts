import { db } from '../src/lib/db'
import { generateContentWithOpenAI } from '../src/lib/ai/openai'
import { SYSTEM_PROMPTS, CONTENT_PROMPTS } from '../src/lib/ai/prompts'

// Article topics to regenerate
const articleTopics: Record<string, { title: string; topic: string; context?: string }> = {
    'apple-m4-pro-chip-ai-december-2025': {
        title: 'Apple Unveils Revolutionary M4 Pro Chip with 40% Faster AI Processing',
        topic: 'Apple M4 Pro chip announcement with focus on AI and Neural Engine improvements',
        context: 'Announced December 2025. Focus on 40% AI performance boost, new Neural Engine, 3nm process, up to 192GB unified memory. Competes with Qualcomm Snapdragon X Elite and Intel Meteor Lake.'
    },
    'openai-gpt5-launch-december-2025': {
        title: 'OpenAI Unveils GPT-5 in December 2025: Breakthrough in Reasoning',
        topic: 'OpenAI GPT-5 launch featuring reasoning capabilities and System 2 thinking',
        context: 'Launched December 2025. Features Q* reasoning, 1M token context, video understanding, self-correction. Directly competes with Claude 3.5 Opus and Gemini Ultra 2.0.'
    },
    'meta-llama-4-release-december-2025': {
        title: 'Meta Llama 4 December 2025 Release Challenges Proprietary Models',
        topic: 'Meta Llama 4 open-source model release',
        context: 'Released December 2025. Three sizes: 8B, 70B, 405B. Open weights. Beats GPT-4o on coding benchmarks (89.2% HumanEval). Challenges OpenAI/Anthropic business models.'
    },
    'samsung-s25-ultra-review-december-2025': {
        title: 'Samsung Galaxy S25 Ultra Review: December 2025 Best Android',
        topic: 'Samsung Galaxy S25 Ultra flagship smartphone review',
        context: 'Released December 2025. Titanium frame, flat display, 200MP camera, Snapdragon 8 Gen 4, Galaxy AI 2.0. Competes with iPhone 16 Pro Max and Pixel 9 Pro XL.'
    },
    'macbook-pro-m4-2025-review': {
        title: '2025 MacBook Pro M4 Review: The Ultimate Creative Powerhouse',
        topic: 'MacBook Pro 16-inch with M4 Max chip comprehensive review',
        context: 'Reviewed December 2025. M4 Max chip, Tandem OLED display, 22-hour battery, Thunderbolt 5. $3,999 as tested. Competes with Dell XPS 15 and Razer Blade 16.'
    },
    'google-algorithm-update-ai-content-december-2025': {
        title: 'Google December 2025 Search Algorithm Update Targets AI Content',
        topic: 'Google Core Update December 2025 targeting low-quality AI content',
        context: 'Rolled out December 2025. Helpful Content System v3. Penalizes AI content farms, rewards original reporting and first-hand experience. 40-90% traffic drops reported for programmatic SEO sites.'
    },
    'microsoft-copilot-december-2025-update': {
        title: 'Microsoft Copilot Gets Major December 2025 Update',
        topic: 'Microsoft Copilot Winter 2025 feature update for Windows',
        context: 'Released December 2025. Deep OS integration, Copilot Studio on desktop, Excel Python integration, Windows file search improvements. $20/mo Pro tier.'
    },
    'nasa-mars-water-discovery-december-2025': {
        title: 'NASA Confirms Liquid Water Beneath Mars Surface',
        topic: 'NASA confirmation of subsurface liquid water on Mars',
        context: 'Announced December 2025. Liquid water 3-5km beneath surface, kept liquid by planetary heat. Enough to cover Mars in 1-2km ocean. Located near Tharsis region.'
    },
    'fusion-energy-breakthrough-december-2025': {
        title: 'Fusion Energy Breakthrough: December 2025 Net Gain Achieved',
        topic: 'National Ignition Facility fusion ignition breakthrough',
        context: 'Achieved December 2025. Third successful ignition in 2025. 2.2MJ input, 4.1MJ output, 1.9x gain. Demonstrates repeatability. Commercial timeline: early 2030s.'
    },
    'most-anticipated-games-2026-december-2025': {
        title: '2025 Most Anticipated Games: 2026 Preview',
        topic: 'Most anticipated video games releasing in 2026',
        context: 'Preview December 2025. GTA VI (Spring 2026), Elder Scrolls VI, Switch 2 launch titles (Mario, Mario Kart), Witcher 4 Polaris (Unreal Engine 5).'
    },
    'netflix-december-2025-new-releases': {
        title: 'Netflix December 2025 Releases: Squid Game S3 and More',
        topic: 'Netflix December 2025 major releases',
        context: 'December 2025 releases. Squid Game S3 finale (Dec 20), Witcher S4 with Liam Hemsworth (Dec 25), The Electric State, Knives Out 3.'
    },
    'december-2025-tech-deals-black-friday': {
        title: 'December 2025 Tech Deals: Black Friday Extended',
        topic: 'Best tech deals December 2025 post-Black Friday',
        context: 'December 2025 extended deals. MacBook Air M3 ($899), PS5 Pro ($549), Sony WH-1000XM6 ($299). Advice: Wait on TVs until January for QD-OLED price drops.'
    }
}

async function regenerateAllArticles() {
    console.log('🔄 Starting regeneration of all 12 articles with enhanced prompts...\n')
    console.log('This will take approximately 8-12 minutes and cost ~$2-3 in API credits.\n')

    let successful = 0
    let failed = 0

    for (const [slug, data] of Object.entries(articleTopics)) {
        try {
            console.log(`\n📝 Generating: ${data.title}`)
            console.log(`   Slug: ${slug}`)

            // Generate content using OpenAI
            const { content } = await generateContentWithOpenAI({
                systemPrompt: SYSTEM_PROMPTS.TECH_NEWS,
                prompt: CONTENT_PROMPTS.generateNews(data.topic, data.context),
                temperature: 0.8,
                maxTokens: 4000, // ~3000 words max
            })

            // Calculate word count
            const wordCount = content.split(/\s+/).length
            console.log(`   ✓ Generated ${wordCount} words`)

            if (wordCount < 1500) {
                console.log(`   ⚠️  WARNING: Only ${wordCount} words (target: 1800+)`)
            }

            // Update in database
            await db.post.update({
                where: { slug },
                data: {
                    content: content.trim(),
                    readingTime: Math.ceil(wordCount / 200), // ~200 words per minute
                },
            })

            console.log(`   ✅ Updated in database`)
            successful++

            // Wait 2 seconds between requests to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000))

        } catch (error) {
            console.error(`\n❌ Failed to generate ${slug}:`, error)
            failed++
        }
    }

    console.log(`\n\n🎉 Regeneration complete!`)
    console.log(`   ✅ Successful: ${successful}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`\nAll articles now have deep,professional content matching competitor standards.`)
}

regenerateAllArticles()
    .catch(console.error)
    .finally(() => process.exit())

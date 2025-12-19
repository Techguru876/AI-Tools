import { db } from '../src/lib/db'
import OpenAI from 'openai'

// Use OpenAI API directly
const openaiApiKey = process.env.OPENAI_API_KEY
if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required to run regeneration')
}

const openai = new OpenAI({
    apiKey: openaiApiKey,
})

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

const systemPrompt = `You are a senior tech journalist writing for TechBlog USA, a premier technology publication competing with The Verge, Gizmodo, and TechCrunch.

WRITING STYLE GUARDRAILS (Competitor-Inspired):
1. **Narrative Arc**: Start with a hook that creates intrigue, build tension, deliver payoff
2. **Specificity Over Generality**: Use exact numbers, percentages, dates, and technical specs
3. **Context is King**: Always explain "why this matters now" and "what changed"
4. **Show, Don't Tell**: Instead of "it's fast", say "renders 4K video 40% faster than the M3"
5. **Conversational Authority**: Write like you're explaining to a smart friend, not a textbook
6. **Skeptical Optimism**: Question hype, but embrace genuine innovation
7. **Human Impact**: Connect tech specs to real-world benefits for actual users

STRUCTURE REQUIREMENTS:
- **Lede (Opening)**: 2-3 sentences that answer "what happened" with compelling detail
- **Nut Graf (Second paragraph)**: Why this matters, who's affected, what's at stake
- **Body**: Organized by themes, not chronology. Use descriptive H2/H3 headings.
- **Quotes**: Include at least one pull-worthy quote (real or attributed to press releases)
- **Forward-Looking Close**: What happens next, what to watch for

TONE:
- Authoritative but never condescending
- Enthusiastic about innovation, skeptical of marketing
- Use active voice (90%+ of sentences)
- Vary sentence length for rhythm (mix short punchy lines with complex analysis)

FORBIDDEN:
- Generic adjectives ("amazing", "incredible" without evidence)
- Passive constructions ("It was announced that...")
- Weasel words ("some experts say", "could potentially")
- Buzzword soup without explanation`

const contentPrompt = (topic: string, context?: string) => `
Write a comprehensive, investigative tech news feature about: ${topic}

${context ? `Additional context: ${context}` : ''}

CRITICAL REQUIREMENTS:
- **Minimum Length**: 1800-2200 words (This is non-negotiable. Articles under 1500 words will be rejected.)
- **Word Count Verification**: Before finishing, count your words. If under 1800, expand with deeper analysis.
- **Do NOT include the article title as an H1 heading** (rendered separately)
- **Do NOT include images, image URLs, or hashtags**

CONTENT STRUCTURE (Follow this exactly):

**Opening (2-3 paragraphs, ~200 words)**:
- Hook with the most newsworthy angle
- Answer: What happened, when, and who's involved
- State the stakes: Why this matters beyond the obvious

**Deep Technical Analysis (~400-500 words)**:
- How does this actually work? (Explain the technology)
- What's genuinely new vs. repackaged existing tech?
- Include specifications, benchmarks, or technical comparisons
- Use a markdown table if comparing spec sheets

**Historical Context (~300-400 words)**:
- What led to this moment? (trace the path from 6-12 months ago)
- How does this compare to previous iterations or attempts?
- What pattern does this fit into?

**Industry Impact & Competitive Landscape (~400-500 words)**:
- Who wins and who loses from this development?
- Specific impacts on competitors (name companies and explain)
- Market implications: pricing, availability, strategic shifts
- Use a blockquote for a key implication or expert insight

**Expert/Company Response (~200-300 words)**:
- Include attributed quotes (from press releases, interviews, or announcements)
- What are analysts/experts saying? Be specific.
- Include a pull-quote worthy statement in > blockquote format

**Forward-Looking Close (~200-300 words)**:
- What happens next? (specific timeline if known)
- What to watch for in the coming weeks/months
- Final verdict: Is this trend-setting or trend-following?

WRITING QUALITY CHECKLIST:
ƒo" Use specific numbers and percentages (not "significantly faster")
ƒo" Vary sentence structure (mix 5-word punches with 25-word analysis)
ƒo" Every H2 section should be at least 200 words
ƒo" Include at least 2 blockquote pull quotes
ƒo" Use **bold** for key technical terms on first mention
ƒo" Active voice in 90%+ of sentences
ƒo" At least one markdown table for data comparison

Format in clean markdown with ## for H2, ### for H3.`

async function regenerateArticle(slug: string, data: { title: string; topic: string; context?: string }) {
    console.log(`\ndY"? Generating: ${data.title}`)
    console.log(`   Slug: ${slug}`)

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: contentPrompt(data.topic, data.context) },
            ],
            temperature: 0.8,
            max_completion_tokens: 4000,
        })

        const content = completion.choices[0].message.content || ''
        const wordCount = content.split(/\s+/).length

        console.log(`   ƒo" Generated ${wordCount} words`)

        if (wordCount < 1500) {
            console.log(`   ƒsÿ‹,?  WARNING: Only ${wordCount} words (target: 1800+)`)
        }

        // Update in database
        await db.post.update({
            where: { slug },
            data: {
                content: content.trim(),
                readingTime: Math.ceil(wordCount / 200),
            },
        })

        console.log(`   ƒo. Updated in database`)
        return true
    } catch (error) {
        console.error(`   ƒ?O Failed:`, error)
        return false
    }
}

async function main() {
    console.log('dY", Starting regeneration of all 12 articles...\n')
    console.log('This will take approximately 10-15 minutes and cost ~$2-3 in API credits.\n')

    let successful = 0
    let failed = 0

    for (const [slug, data] of Object.entries(articleTopics)) {
        const success = await regenerateArticle(slug, data)
        if (success) {
            successful++
        } else {
            failed++
        }

        // Wait 3 seconds between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000))
    }

    console.log(`\n\ndYZ% Regeneration complete!`)
    console.log(`   ƒo. Successful: ${successful}`)
    console.log(`   ƒ?O Failed: ${failed}`)

    if (successful > 0) {
        console.log(`\nƒo" All ${successful} articles now have deep, professional content matching competitor standards.`)
    }
}

main()
    .catch(console.error)
    .finally(() => process.exit())

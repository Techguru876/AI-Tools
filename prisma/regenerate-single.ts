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

const slug = 'apple-m4-pro-chip-ai-december-2025'
const data = {
    title: 'Apple Unveils Revolutionary M4 Pro Chip with 40% Faster AI Processing',
    topic: 'Apple M4 Pro chip announcement with focus on AI and Neural Engine improvements',
    context: 'Announced December 2025. Focus on 40% AI performance boost, new Neural Engine, 3nm process, up to 192GB unified memory. Competes with Qualcomm Snapdragon X Elite and Intel Meteor Lake.'
}

const systemPrompt = `You are a senior tech journalist writing for TechBlog USA.

WRITING STYLE GUARDRAILS:
1. **Narrative Arc**: Start with a hook, build tension, payoff.
2. **Specificity**: Use exact numbers, specs.
3. **Context**: Explain "why this matters".
4. **Show, Don't Tell**: "Renders 4K video 40% faster", not "It is fast".
5. **Conversational Authority**: Smart friend tone.
6. **Skeptical Optimism**: Question hype.

STRUCTURE:
- **Lede**: 2-3 sentences hook.
- **Nut Graf**: Why it matters.
- **Body**: Thematic sections (H2/H3).
- **Quotes**: At least one pull-quote.
- **Close**: Forward-looking.

TONE: Authoritative, active voice, varied sentence length.
FORBIDDEN: Generic adjectives, passive voice, weasel words.`

const contentPrompt = (topic: string, context?: string) => `
Write a comprehensive, investigative tech news feature about: ${topic}

${context ? `Additional context: ${context}` : ''}

CRITICAL REQUIREMENTS:
- **Minimum Length**: 1800-2200 words.
- **Content**: Deep technical analysis, historical context, industry impact.
- **No H1**: Title is separate.
- **No Images/Hashtags**.

STRUCTURE:
1. Opening (Hook, Answer, Stakes)
2. Deep Technical Analysis (How it works, Specs table)
3. Historical Context (Evolution)
4. Industry Impact (Winners/Losers, Market)
5. Expert/Company Response (Quotes)
6. Forward-Looking Close (What's next)

Format in clean markdown.`

async function regenerateSingle() {
    console.log(`\ndY"? Generating Single Article: ${data.title}`)
    console.log(`   Slug: ${slug}`)

    try {
        console.log('   Sending request to OpenAI API...')
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

        console.log(`   ƒo" Received response! Generated ${wordCount} words`)

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

        console.log(`   ƒo. Database updated successfully`)

    } catch (error) {
        console.error(`   ƒ?O Failed:`, error)
        if (error instanceof OpenAI.APIError) {
            console.error('API Error Details:', {
                status: error.status,
                message: error.message,
                code: error.code,
                type: error.type
            })
        }
    }
}

regenerateSingle()
    .catch(console.error)
    .finally(() => process.exit())

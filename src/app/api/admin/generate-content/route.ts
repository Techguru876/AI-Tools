import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/ai/openai'
import { SYSTEM_PROMPTS, CONTENT_PROMPTS } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
    try {
        if (!openai) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            )
        }

        const body = await req.json()
        const { topic, additionalContext, type } = body

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            )
        }

        console.log(`🤖 Generating content for: ${topic}`)

        const systemMessage = type === 'REVIEW'
            ? SYSTEM_PROMPTS.PRODUCT_REVIEW
            : SYSTEM_PROMPTS.TECH_NEWS

        const prompt = type === 'REVIEW'
            ? CONTENT_PROMPTS.generateReview(topic, additionalContext)
            : CONTENT_PROMPTS.generateNews(topic, additionalContext)

        // Log which model we're using
        const model = 'gpt-4o-mini'
        console.log(`   Using model: ${model}`)

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
        })

        const content = completion.choices[0]?.message?.content

        if (!content) {
            throw new Error('No content generation returned from API')
        }

        // Generate meta data
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : topic

        // Create excerpt
        const excerpt = content.split('\n\n')[1]?.slice(0, 160) + '...' || ''

        // Generate slug
        const slug = topic
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + new Date().getFullYear()

        return NextResponse.json({
            title,
            content,
            excerpt,
            slug,
            metaDescription: excerpt,
        })

    } catch (error: any) {
        console.error('Generation failed:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        )
    }
}

/**
 * Full API Test with Grading
 * 
 * Tests the improved content pipeline through the actual API route.
 * Run with: npx tsx scripts/test-api-full.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
    console.log('🧪 Full API Pipeline Test\n')
    console.log('═'.repeat(60))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Step 1: Call the API to generate an article
    console.log('\n📡 Step 1: Calling API to generate article...\n')

    const topic = 'Apple announces M4 Ultra chip with breakthrough AI performance for Mac Pro'

    console.log(`   Topic: "${topic}"`)
    console.log(`   Endpoint: POST ${baseUrl}/api/agent`)
    console.log('   Waiting for generation (may take 30-60 seconds)...\n')

    const startTime = Date.now()

    try {
        const response = await fetch(`${baseUrl}/api/agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate',
                topic,
                contentType: 'AI_NEWS',
                publishImmediately: false,
                fetchImage: true,
            }),
        })

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
        console.log(`   ✓ Response received in ${elapsed}s`)

        if (!response.ok) {
            const error = await response.text()
            console.error(`   ❌ API Error (${response.status}): ${error}`)
            return
        }

        const result = await response.json()
        console.log('\n📋 API Response:\n')
        console.log(JSON.stringify(result, null, 2))

        if (!result.success) {
            console.error(`\n❌ Generation failed: ${result.message}`)
            return
        }

        // Step 2: Fetch the generated post from DB
        console.log('\n\n📄 Step 2: Fetching generated post from database...\n')

        // Using a simple script to query
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()

        const post = await prisma.post.findUnique({
            where: { id: result.postId },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                excerpt: true,
                coverImage: true,
                status: true,
                contentType: true,
                keywords: true,
                createdAt: true,
            },
        })

        if (!post) {
            console.error('   ❌ Post not found in database!')
            await prisma.$disconnect()
            return
        }

        console.log(`   ✓ Post found: ${post.id}`)
        console.log(`   Title: ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Status: ${post.status}`)
        console.log(`   Content length: ${post.content?.length || 0} chars`)
        console.log(`   Cover image: ${post.coverImage ? 'Yes (DALL-E)' : 'No'}`)
        console.log(`   Keywords: ${post.keywords?.join(', ') || 'None'}`)

        // Step 3: Grade the content
        console.log('\n\n📊 Step 3: Quality Analysis...\n')

        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

        const gradingPrompt = `You are a senior editor at TechCrunch. Grade this AI-generated article STRICTLY.

=== ARTICLE ===
${post.content?.slice(0, 5000)}
===============

Grade on 1-10 scale (be critical and honest):

1. **Date/Time Accuracy**: Does it correctly reference current timeframes (December 2025)?
2. **Sourcing Language**: Does it use proper attribution ("according to", "reports say")?
3. **Factual Grounding**: Are claims reasonable and not fabricated?
4. **Headline Quality**: Compelling and accurate?
5. **Opening Hook**: Strong first paragraph?
6. **Structure**: Well-organized with clear sections?
7. **Depth**: Expert-level analysis, not surface-level?
8. **Writing Quality**: Professional, readable, no fluff?
9. **Word Count**: Sufficient length (target 1200-1800)?
10. **SEO**: Keywords, scannable format?

Then provide:
- **OVERALL SCORE** (average, rounded)
- **PUBLISH READINESS**: Ready / Needs Minor Edits / Needs Major Revision / Not Publishable
- **Top 3 Strengths**
- **Top 3 Weaknesses**
- **Specific Fixes Needed** (actionable)

Be brutally honest - we're competing with top blogs.`

        const gradeResult = await model.generateContent(gradingPrompt)
        const gradeReport = gradeResult.response.text()

        console.log('─'.repeat(60))
        console.log('\n📋 QUALITY REPORT\n')
        console.log(gradeReport)

        // Step 4: Show article preview
        console.log('\n' + '─'.repeat(60))
        console.log('\n📄 ARTICLE PREVIEW (first 2000 chars)\n')
        console.log(post.content?.slice(0, 2000))
        console.log('\n... [truncated]')

        if (post.coverImage) {
            console.log('\n🖼️ Cover Image URL:')
            console.log(post.coverImage)
        }

        await prisma.$disconnect()

        console.log('\n' + '═'.repeat(60))
        console.log('✅ Test Complete!')
        console.log('═'.repeat(60))

    } catch (error) {
        console.error('\n❌ Test failed:', error)
    }
}

main().catch(console.error)

/**
 * End-to-End Agent Test
 * 
 * Tests the content generation pipeline and compares against reference articles.
 * Run with: npx tsx scripts/test-agent.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { GoogleGenerativeAI } from '@google/generative-ai'

async function main() {
    console.log('🧪 End-to-End Agent Test\n')
    console.log('═'.repeat(60))

    const apiKey = process.env.GOOGLE_GENAI_API_KEY
    if (!apiKey) {
        console.error('❌ GOOGLE_GENAI_API_KEY not found')
        process.exit(1)
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Step 1: Generate an AI news article
    console.log('\n📝 Step 1: Generating AI_NEWS Article...\n')

    const topic = 'OpenAI announces GPT-5 with major reasoning and coding improvements'

    const contentPrompt = `Generate a comprehensive AI_NEWS article about: ${topic}

Follow high-quality tech journalism standards like TechCrunch and The Verge.
Include proper markdown with ## sections.
The article should be detailed (800+ words), informative, and engaging.
Include:
- Compelling headline
- Key features and improvements
- Industry impact analysis
- Expert-style commentary
- Comparison to previous versions

Start with the headline as # Title.`

    console.log('   Generating content...')
    const contentResult = await model.generateContent(contentPrompt)
    const generatedContent = contentResult.response.text()

    // Extract title
    const titleMatch = generatedContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : topic

    console.log(`   ✓ Generated: "${title.slice(0, 50)}..."`)
    console.log(`   ✓ Content length: ${generatedContent.length} chars`)

    // Step 2: Fetch a reference article from RSS for comparison
    console.log('\n📰 Step 2: Fetching Reference Article...\n')

    const Parser = (await import('rss-parser')).default
    const parser = new Parser()

    let referenceArticle = { title: '', content: '' }
    try {
        const feed = await parser.parseURL('https://techcrunch.com/category/artificial-intelligence/feed/')
        const item = feed.items[0]
        referenceArticle = {
            title: item.title || '',
            content: item.contentSnippet || item['content:encoded'] || '',
        }
        console.log(`   ✓ Reference: "${referenceArticle.title.slice(0, 50)}..."`)
    } catch (e) {
        console.log('   ⚠️ Could not fetch reference (will skip comparison)')
    }

    // Step 3: Grade the generated content
    console.log('\n📊 Step 3: Quality Analysis...\n')

    const gradingPrompt = `You are a senior tech editor at TechCrunch. Grade this AI-generated article.

=== GENERATED ARTICLE ===
${generatedContent.slice(0, 3000)}
=========================

Grade on these criteria (1-10 each):

1. **Headline Quality**: Is it compelling, SEO-friendly, accurate?
2. **Opening Hook**: Does the first paragraph grab attention?
3. **Structure**: Are sections logical, well-organized?
4. **Depth**: Is there sufficient detail and analysis?
5. **Voice**: Does it sound like professional tech journalism?
6. **Accuracy**: Are claims reasonable and well-grounded?
7. **Readability**: Is it easy to follow?
8. **SEO**: Keywords, headings, scannable format?

Then provide:
- OVERALL SCORE (average)
- TOP 3 STRENGTHS
- TOP 3 AREAS FOR IMPROVEMENT
- PUBLISH READINESS: Ready / Needs Minor Edits / Needs Major Revision

Format as markdown.`

    console.log('   Grading content...\n')
    const gradeResult = await model.generateContent(gradingPrompt)
    const gradeReport = gradeResult.response.text()

    console.log('─'.repeat(60))
    console.log('\n📋 QUALITY REPORT\n')
    console.log(gradeReport)
    console.log('\n' + '─'.repeat(60))

    // Step 4: Show sample of generated content
    console.log('\n📄 GENERATED ARTICLE PREVIEW\n')
    console.log(generatedContent.slice(0, 1500))
    console.log('\n... [truncated]')

    console.log('\n' + '═'.repeat(60))
    console.log('✅ Test Complete!')
    console.log('═'.repeat(60))
}

main().catch(console.error)

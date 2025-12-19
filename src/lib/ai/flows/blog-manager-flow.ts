/**
 * Blog Manager Flow - The Autonomous Agent Brain
 * 
 * This is the main orchestration flow that powers the autonomous blog management agent.
 * It receives natural language instructions and decides which tools to invoke.
 */

import { ai, z } from '../genkit'
import { allTools } from '../tools'

// System prompt for the blog management agent
const BLOG_MANAGER_SYSTEM_PROMPT = `You are an autonomous AI agent responsible for managing a tech blog called TechBlog USA. 
You have access to various tools to query the database, generate content, and publish posts.

Your responsibilities include:
1. **Content Generation**: Creating high-quality tech articles, news, reviews, and guides
2. **Content Management**: Publishing, scheduling, and organizing posts
3. **Quality Control**: Analyzing content quality and suggesting improvements
4. **Strategic Planning**: Suggesting topics based on trends and gaps in coverage

When given a task, think step by step:
1. First, understand what is being asked
2. Use the appropriate tools to gather information if needed
3. Execute the required actions using the available tools
4. Report back on what was accomplished

Important guidelines:
- Always check for duplicate content before creating new posts
- Use meaningful, SEO-friendly slugs for new posts
- Fetch cover images for posts that don't have them
- When generating content, always include proper metadata (keywords, meta description)
- Respect the existing category structure
- Posts should go through the review queue unless explicitly told to publish immediately

Available content types: NEWS, AI_NEWS, REVIEW, GUIDE, COMPARISON, ROUNDUP, ARTICLE

Today's date is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

// ============================================
// Blog Manager Flow
// ============================================

export const blogManagerFlow = ai.defineFlow(
    {
        name: 'blogManagerFlow',
        inputSchema: z.object({
            instruction: z.string()
                .describe('Natural language instruction for the agent'),
            context: z.object({
                previousActions: z.array(z.string()).optional()
                    .describe('Previous actions taken in this session'),
                constraints: z.array(z.string()).optional()
                    .describe('Any constraints or limitations to respect'),
            }).optional(),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            actions: z.array(z.object({
                tool: z.string(),
                input: z.record(z.string(), z.unknown()),
                result: z.record(z.string(), z.unknown()),
            })),
            suggestions: z.array(z.string()).optional(),
        }),
    },
    async (input) => {
        const actions: Array<{
            tool: string
            input: Record<string, unknown>
            result: Record<string, unknown>
        }> = []

        try {
            // Build context message if provided
            let contextMessage = ''
            if (input.context?.previousActions?.length) {
                contextMessage += `\n\nPrevious actions in this session:\n${input.context.previousActions.map(a => `- ${a}`).join('\n')}`
            }
            if (input.context?.constraints?.length) {
                contextMessage += `\n\nConstraints to respect:\n${input.context.constraints.map(c => `- ${c}`).join('\n')}`
            }

            // Use Genkit's agent capability with tools
            const { text, toolRequests } = await ai.generate({
                system: BLOG_MANAGER_SYSTEM_PROMPT,
                prompt: `${input.instruction}${contextMessage}`,
                tools: allTools,
                config: {
                    temperature: 0.3, // Lower temperature for more deterministic tool use
                },
            })

            // Process tool requests and collect results
            if (toolRequests && toolRequests.length > 0) {
                for (const request of toolRequests) {
                    // Genkit returns toolRequest nested inside the request object
                    const toolReq = request.toolRequest
                    actions.push({
                        tool: toolReq.name,
                        input: (toolReq.input as Record<string, unknown>) || {},
                        result: (request.data as Record<string, unknown>) || {},
                    })
                }
            }

            return {
                success: true,
                message: text || 'Task completed successfully',
                actions,
                suggestions: [],
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                actions,
            }
        }
    }
)

// ============================================
// Content Pipeline Flow
// ============================================

// Get current date info for time-aware content
function getDateContext() {
    const now = new Date()
    return {
        fullDate: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        month: now.toLocaleDateString('en-US', { month: 'long' }),
        year: now.getFullYear(),
        quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
    }
}

// High-quality journalism prompt for content generation
function buildContentPrompt(topic: string, contentType: string, dateContext: ReturnType<typeof getDateContext>) {
    return `You are a senior tech journalist at a top-tier publication like TechCrunch, The Verge, or Wired.

TODAY'S DATE: ${dateContext.fullDate}
CURRENT YEAR: ${dateContext.year}

Generate a comprehensive ${contentType} article about: ${topic}

## CRITICAL REQUIREMENTS:

### Accuracy & Sourcing (MANDATORY)
- Use phrases like "according to sources", "reports indicate", "the company stated"
- Include specific data points, percentages, or figures where relevant
- Reference time frames accurately ("as of ${dateContext.month} ${dateContext.year}", "this ${dateContext.quarter}")
- If information is speculative, clearly state "reportedly", "allegedly", or "rumored"
- Never fabricate quotes from real people without attribution

### Content Quality Standards
- **Word count**: 1200-1800 words minimum
- **Structure**: Use clear ## headings and ### subheadings
- **Opening**: Start with a compelling hook that establishes newsworthiness
- **Context**: Provide background on why this matters NOW
- **Analysis**: Include expert-level insight, not just surface facts
- **Comparison**: Reference competitors or previous versions when relevant
- **Future implications**: End with forward-looking analysis

### Writing Style
- Professional yet accessible tone
- Active voice preferred
- Short paragraphs (2-4 sentences max)
- Include bullet points for key features/specs
- Avoid clichés like "game-changer", "revolutionary" unless truly warranted

### SEO Requirements
- Natural keyword integration
- Descriptive subheadings
- Include a clear value proposition in opening

## FORMAT:
Start with: # [Compelling Headline]
Then structured sections with ## headings.
End with ## What This Means / ## Looking Ahead

Generate the article now:`
}

export const contentPipelineFlow = ai.defineFlow(
    {
        name: 'contentPipelineFlow',
        inputSchema: z.object({
            topic: z.string().describe('Topic for the article'),
            contentType: z.enum(['NEWS', 'AI_NEWS', 'REVIEW', 'GUIDE', 'COMPARISON', 'ROUNDUP', 'ARTICLE'])
                .describe('Type of content to create'),
            category: z.string().optional().describe('Category slug'),
            publishImmediately: z.boolean().default(false),
            fetchImage: z.boolean().default(true),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            postId: z.string().optional(),
            slug: z.string().optional(),
            title: z.string().optional(),
            coverImage: z.string().optional(),
            message: z.string(),
        }),
    },
    async (input) => {
        console.log(`[ContentPipeline] Starting generation for: ${input.topic}`)

        try {
            const dateContext = getDateContext()

            // Step 1: Generate high-quality article content
            console.log('[ContentPipeline] Step 1: Generating content...')
            const contentPrompt = buildContentPrompt(input.topic, input.contentType, dateContext)

            const { text: generatedContent } = await ai.generate({
                prompt: contentPrompt,
                config: { temperature: 0.7 },
            })

            // Extract title from content
            const titleMatch = generatedContent.match(/^#\s+(.+)$/m)
            const title = titleMatch ? titleMatch[1].trim() : input.topic
            console.log(`[ContentPipeline] Generated title: ${title}`)

            // Create slug
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 100)

            // Create excerpt (first substantial paragraph after title)
            const contentWithoutTitle = generatedContent.replace(/^#\s+.+$/m, '').trim()
            const paragraphs = contentWithoutTitle.split('\n\n').filter(p => p.length > 50 && !p.startsWith('#'))
            const excerpt = paragraphs[0]?.slice(0, 250) || ''

            // Step 2: Generate AI cover image using DALL-E + upload to Azure
            let coverImage: string | undefined
            if (input.fetchImage && process.env.OPENAI_API_KEY) {
                console.log('[ContentPipeline] Step 2: Generating DALL-E image...')
                try {
                    const OpenAI = (await import('openai')).default
                    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

                    // Create image prompt based on article
                    const imagePrompt = `Professional tech blog header image for article: "${title}". Modern, clean, abstract technology visualization. 16:9 ratio, vibrant colors, no text or words in image.`

                    const imageResponse = await openai.images.generate({
                        model: 'dall-e-3',
                        prompt: imagePrompt,
                        n: 1,
                        size: '1792x1024',
                        quality: 'hd',
                    })

                    const tempImageUrl = imageResponse.data?.[0]?.url
                    console.log('[ContentPipeline] DALL-E image generated successfully')

                    // Upload to Azure Blob Storage for permanent URL
                    if (tempImageUrl) {
                        const { uploadImageFromUrl, isAzureStorageConfigured } = await import('@/lib/azure')

                        if (isAzureStorageConfigured()) {
                            console.log('[ContentPipeline] Uploading to Azure Blob Storage...')
                            const blobName = `covers/${slug}.png`
                            const permanentUrl = await uploadImageFromUrl(tempImageUrl, blobName)

                            if (permanentUrl) {
                                coverImage = permanentUrl
                                console.log('[ContentPipeline] ✓ Saved to Azure:', permanentUrl)
                            } else {
                                coverImage = tempImageUrl // Fallback to temporary URL
                                console.warn('[ContentPipeline] Azure upload failed, using temporary URL')
                            }
                        } else {
                            coverImage = tempImageUrl
                            console.log('[ContentPipeline] Azure not configured, using temporary DALL-E URL')
                        }
                    }
                } catch (imgError) {
                    console.warn('[ContentPipeline] DALL-E failed, falling back to Unsplash:', imgError)
                    // Fallback to Unsplash
                    if (process.env.UNSPLASH_ACCESS_KEY) {
                        const imageResult = await fetch(
                            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(input.topic)}&orientation=landscape&per_page=1`,
                            { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
                        )
                        if (imageResult.ok) {
                            const imageData = await imageResult.json()
                            coverImage = imageData.results?.[0]?.urls?.regular
                        }
                    }
                }
            }

            // Step 3: Generate SEO metadata
            console.log('[ContentPipeline] Step 3: Generating SEO metadata...')
            const { text: metadataJson } = await ai.generate({
                prompt: `Generate SEO metadata for this tech article.
Title: ${title}
Topic: ${input.topic}
Date: ${dateContext.fullDate}

Respond ONLY with valid JSON (no markdown):
{"keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"], "metaDescription": "Compelling 150-character description for search results..."}`,
                config: { temperature: 0.2 },
            })

            let keywords: string[] = []
            let metaDescription = excerpt.slice(0, 155)
            try {
                const jsonMatch = metadataJson.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0])
                    keywords = parsed.keywords || []
                    metaDescription = parsed.metaDescription || metaDescription
                }
            } catch { /* Use defaults */ }

            // Step 4: Run Quality Gate
            console.log('[ContentPipeline] Step 4: Running quality gate...')
            const { runQualityGate } = await import('@/lib/ai/quality')
            const qualityResult = await runQualityGate(generatedContent, title, metaDescription)

            console.log(`[ContentPipeline] Quality Score: ${qualityResult.overallScore}/100`)
            console.log(`[ContentPipeline] SEO: ${qualityResult.seoScore}, Facts: ${qualityResult.factScore}`)
            console.log(`[ContentPipeline] Recommendation: ${qualityResult.recommendation}`)

            if (qualityResult.issues.length > 0) {
                console.log(`[ContentPipeline] Issues: ${qualityResult.issues.join(', ')}`)
            }

            // Determine status based on quality gate
            let postStatus: 'DRAFT' | 'PUBLISHED' | 'IN_REVIEW' = 'DRAFT'
            if (input.publishImmediately && qualityResult.recommendation === 'PUBLISH') {
                postStatus = 'PUBLISHED'
            } else if (qualityResult.recommendation === 'NEEDS_REVISION' || qualityResult.recommendation === 'REJECT') {
                postStatus = 'IN_REVIEW' // Needs human attention
            }

            // Step 5: Save to database
            console.log('[ContentPipeline] Step 5: Saving to database...')
            const { db } = await import('@/lib/db')

            // Check for duplicate slug
            const existing = await db.post.findUnique({ where: { slug } })
            const finalSlug = existing ? `${slug}-${Date.now()}` : slug

            // Find category
            let categoryConnect = undefined
            if (input.category) {
                const category = await db.category.findUnique({
                    where: { slug: input.category },
                })
                if (category) {
                    categoryConnect = { connect: [{ id: category.id }] }
                }
            }

            const post = await db.post.create({
                data: {
                    title,
                    slug: finalSlug,
                    content: generatedContent,
                    excerpt,
                    contentType: input.contentType,
                    keywords,
                    metaDescription,
                    coverImage,
                    isAiGenerated: true,
                    status: postStatus,
                    publishedAt: postStatus === 'PUBLISHED' ? new Date() : null,
                    categories: categoryConnect,
                },
            })

            console.log(`[ContentPipeline] ✓ Created post: ${post.id} (status: ${postStatus})`)

            // Build response message
            let message = ''
            if (postStatus === 'PUBLISHED') {
                message = `Article "${title}" published (quality score: ${qualityResult.overallScore}/100)`
            } else if (postStatus === 'IN_REVIEW') {
                message = `Article "${title}" needs review - ${qualityResult.issues.join('; ')}`
            } else {
                message = `Article "${title}" created as draft (quality score: ${qualityResult.overallScore}/100)`
            }

            return {
                success: true,
                postId: post.id,
                slug: post.slug,
                title: post.title,
                coverImage,
                message,
            }
        } catch (error) {
            console.error('[ContentPipeline] Error:', error)
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create content',
            }
        }
    }
)

// ============================================
// Scheduled Tasks Flow
// ============================================

export const processScheduledPostsFlow = ai.defineFlow(
    {
        name: 'processScheduledPostsFlow',
        inputSchema: z.object({}),
        outputSchema: z.object({
            publishedCount: z.number(),
            publishedPosts: z.array(z.string()),
        }),
    },
    async () => {
        const { db } = await import('@/lib/db')

        const now = new Date()

        // Find all posts scheduled to be published by now
        const postsToPublish = await db.post.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledFor: { lte: now },
            },
            select: { id: true, title: true },
        })

        const publishedPosts: string[] = []

        for (const post of postsToPublish) {
            await db.post.update({
                where: { id: post.id },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: now,
                    scheduledFor: null,
                },
            })
            publishedPosts.push(post.title)
        }

        return {
            publishedCount: publishedPosts.length,
            publishedPosts,
        }
    }
)

import { generateContent } from './claude'
import { generateContentWithOpenAI } from './openai'
import { SYSTEM_PROMPTS, CONTENT_PROMPTS } from './prompts'
import { slugify } from '@/lib/utils'
import type { ContentType } from '@prisma/client'

export interface GenerateArticleInput {
  type: ContentType
  topic: string
  additionalContext?: string
  specifications?: string
  difficulty?: string
  priceRange?: string
  product1?: string
  product2?: string
  criteria?: string
  aiProvider?: 'claude' | 'openai' // Allow choosing AI provider
}

export interface GeneratedArticle {
  title: string
  content: string
  excerpt: string
  slug: string
  keywords: string[]
  metaDescription: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

export async function generateArticle(input: GenerateArticleInput): Promise<GeneratedArticle> {
  let systemPrompt: string
  let userPrompt: string

  // Select appropriate system prompt and generate user prompt based on content type
  switch (input.type) {
    case 'NEWS':
      systemPrompt = SYSTEM_PROMPTS.TECH_NEWS
      userPrompt = CONTENT_PROMPTS.generateNews(input.topic, input.additionalContext)
      break

    case 'AI_NEWS':
      systemPrompt = SYSTEM_PROMPTS.AI_NEWS
      userPrompt = CONTENT_PROMPTS.generateAINews(input.topic, input.additionalContext)
      break

    case 'REVIEW':
      systemPrompt = SYSTEM_PROMPTS.PRODUCT_REVIEW
      userPrompt = CONTENT_PROMPTS.generateReview(input.topic, input.specifications)
      break

    case 'GUIDE':
      if (input.topic.toLowerCase().includes('buying') || input.topic.toLowerCase().includes('best')) {
        systemPrompt = SYSTEM_PROMPTS.BUYING_GUIDE
        userPrompt = CONTENT_PROMPTS.generateBuyingGuide(input.topic, input.priceRange)
      } else {
        systemPrompt = SYSTEM_PROMPTS.HOW_TO_GUIDE
        userPrompt = CONTENT_PROMPTS.generateHowTo(input.topic, input.difficulty)
      }
      break

    case 'COMPARISON':
      systemPrompt = SYSTEM_PROMPTS.COMPARISON
      userPrompt = CONTENT_PROMPTS.generateComparison(
        input.product1 || '',
        input.product2 || ''
      )
      break

    case 'ROUNDUP':
      systemPrompt = SYSTEM_PROMPTS.BUYING_GUIDE
      userPrompt = CONTENT_PROMPTS.generateRoundup(input.topic, input.criteria)
      break

    case 'ARTICLE':
    default:
      systemPrompt = SYSTEM_PROMPTS.TECH_NEWS
      userPrompt = CONTENT_PROMPTS.generateNews(input.topic, input.additionalContext)
      break
  }

  // Generate the article content using selected AI provider
  // Prioritize OpenAI; fall back to Claude if not configured
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  const provider = input.aiProvider || (hasOpenAI ? 'openai' : 'claude')
  let result

  if (provider === 'openai') {
    // This uses the openai instance from @/lib/ai/openai.ts (OpenAI direct)
    result = await generateContentWithOpenAI({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    })
  } else {
    result = await generateContent({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    })
  }

  // Extract title from the generated content (first H1)
  const titleMatch = result.content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : input.topic

  // Generate excerpt (first paragraph after title)
  const contentWithoutTitle = result.content.replace(/^#\s+.+$/m, '').trim()
  const firstParagraph = contentWithoutTitle.split('\n\n')[0]
  const excerpt = firstParagraph.replace(/^#+\s+/gm, '').trim().slice(0, 160)

  // Generate slug
  const slug = slugify(title)

  // Extract keywords (simple approach - can be enhanced)
  const keywords = extractKeywords(input.topic, title, contentWithoutTitle)

  // Generate meta description
  const metaDescription = excerpt.slice(0, 155) + '...'

  return {
    title,
    content: result.content,
    excerpt,
    slug,
    keywords,
    metaDescription,
    usage: result.usage,
  }
}

export async function generateMetadata(content: string): Promise<{
  keywords: string[]
  metaDescription: string
}> {
  const prompt = `Analyze the following article and provide:
1. 5-10 relevant SEO keywords
2. A compelling meta description (150-155 characters)

Article:
${content.slice(0, 1000)}...

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "metaDescription": "description here"
}`

  const result = await generateContent({
    prompt,
    systemPrompt: 'You are an SEO expert. Provide JSON responses only.',
    temperature: 0.5,
    maxTokens: 500,
  })

  try {
    const parsed = JSON.parse(result.content)
    return {
      keywords: parsed.keywords || [],
      metaDescription: parsed.metaDescription || '',
    }
  } catch (error) {
    console.error('Failed to parse metadata JSON:', error)
    return {
      keywords: [],
      metaDescription: '',
    }
  }
}

export async function refreshArticle(
  originalContent: string,
  topic: string
): Promise<{ content: string; changes: string[] }> {
  const prompt = `Review and refresh the following article about "${topic}".

Update it with:
1. Latest information and developments
2. Corrected pricing or specifications if outdated
3. New relevant details
4. Improved clarity and structure

Keep the same general structure and tone, but ensure all information is current and accurate.

Original article:
${originalContent}

Provide the refreshed article in the same markdown format, and list the key changes made.

Format:
# Refreshed Article

[article content here]

---

# Changes Made
- Change 1
- Change 2
...`

  const result = await generateContent({
    prompt,
    systemPrompt: SYSTEM_PROMPTS.TECH_NEWS,
    temperature: 0.6,
    maxTokens: 4000,
  })

  // Parse out the article and changes
  const parts = result.content.split('# Changes Made')
  const refreshedContent = parts[0].replace(/^#\s+Refreshed Article\s*/m, '').trim()
  const changesSection = parts[1] || ''
  const changes = changesSection
    .split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.replace(/^-\s*/, '').trim())

  return {
    content: refreshedContent,
    changes,
  }
}

function extractKeywords(topic: string, title: string, content: string): string[] {
  // Simple keyword extraction - can be enhanced with NLP
  const text = `${topic} ${title} ${content}`.toLowerCase()
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'could',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
    'it',
    'its',
  ])

  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))

  const frequency: Record<string, number> = {}
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

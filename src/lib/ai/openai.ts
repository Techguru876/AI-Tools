import OpenAI from 'openai'

// Lazy-loaded OpenAI client to avoid MessagePort errors at module load time
// (Note: OpenAI SDK may use MessagePort internally)
let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment.')
    }
    console.log('[AI] Initializing OpenAI client (lazy)')
    _openai = new OpenAI({
      apiKey: openaiKey,
      fetch: globalThis.fetch, // Force use of global fetch for Cloudflare Workers compatibility
    })
  }
  return _openai
}

// For backwards compatibility - will throw if no API key
export const openai = null as unknown as OpenAI | null

export interface GenerateContentOptionsOpenAI {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface GeneratedContentOpenAI {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

/**
 * Generate content using OpenAI's GPT models
 * This provides an alternative to Claude for content generation
 */
export async function generateContentWithOpenAI(
  options: GenerateContentOptionsOpenAI
): Promise<GeneratedContentOpenAI> {
  const openai = getOpenAI()

  const defaultModel = 'gpt-4o-mini'


  const {
    prompt,
    model = defaultModel,
    temperature = 0.7,
    maxTokens = 4000,
    systemPrompt,
  } = options

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    })
  }

  messages.push({
    role: 'user',
    content: prompt,
  })

  const completionParams: any = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  }

  const completion = await openai.chat.completions.create(completionParams)

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content generated from OpenAI')
  }

  return {
    content,
    usage: {
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    },
  }
}

/**
 * Generate embeddings for semantic search and content recommendations
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })

  return response.data.map((item) => item.embedding)
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Used for finding similar content
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Generate an image using DALL-E 3
 */
export async function generateImage(
  prompt: string,
  options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792'
    quality?: 'standard' | 'hd'
    style?: 'vivid' | 'natural'
  }
): Promise<{ url: string; revisedPrompt: string }> {
  const openai = getOpenAI()

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: options?.size || '1024x1024',
    quality: options?.quality || 'standard',
    style: options?.style || 'vivid',
  })

  if (!response.data || response.data.length === 0) {
    throw new Error('No image data returned from OpenAI')
  }

  const image = response.data[0]
  if (!image.url) {
    throw new Error('No image URL returned from OpenAI')
  }

  return {
    url: image.url,
    revisedPrompt: image.revised_prompt || prompt,
  }
}

/**
 * Analyze sentiment of text using GPT-4
 */
export async function analyzeSentiment(
  text: string
): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  explanation: string
}> {
  const openai = getOpenAI()

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content:
          'You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with JSON only.',
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this text and respond with JSON in this format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": 0.0 to 1.0,
  "explanation": "brief explanation"
}

Text: ${text}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No sentiment analysis returned')
  }

  return JSON.parse(content)
}

/**
 * Moderate content for inappropriate material
 */
export async function moderateContent(text: string): Promise<{
  flagged: boolean
  categories: {
    hate: boolean
    hateThreatening: boolean
    harassment: boolean
    harassmentThreatening: boolean
    selfHarm: boolean
    selfHarmIntent: boolean
    selfHarmInstructions: boolean
    sexual: boolean
    sexualMinors: boolean
    violence: boolean
    violenceGraphic: boolean
  }
}> {
  const openai = getOpenAI()

  const moderation = await openai.moderations.create({
    input: text,
  })

  const result = moderation.results[0]

  return {
    flagged: result.flagged,
    categories: {
      hate: result.categories.hate,
      hateThreatening: result.categories['hate/threatening'],
      harassment: result.categories.harassment,
      harassmentThreatening: result.categories['harassment/threatening'],
      selfHarm: result.categories['self-harm'],
      selfHarmIntent: result.categories['self-harm/intent'],
      selfHarmInstructions: result.categories['self-harm/instructions'],
      sexual: result.categories.sexual,
      sexualMinors: result.categories['sexual/minors'],
      violence: result.categories.violence,
      violenceGraphic: result.categories['violence/graphic'],
    },
  }
}

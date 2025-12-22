// Claude/Anthropic SDK is disabled for Cloudflare Workers compatibility
// (The SDK uses MessagePort which is not available in Cloudflare Workers)
// Use OpenAI instead via the aiProvider option

export interface GenerateContentOptions {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface GeneratedContent {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

export async function generateContent(options: GenerateContentOptions): Promise<GeneratedContent> {
  throw new Error(
    'Claude/Anthropic SDK is disabled for Cloudflare Workers compatibility. ' +
    'Please use OpenAI instead by setting aiProvider: "openai" or ensuring OPENAI_API_KEY is set.'
  )
}

import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

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
  const {
    prompt,
    model = 'claude-sonnet-4-5-20250929',
    temperature = 0.7,
    maxTokens = 4000,
    systemPrompt,
  } = options

  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  return {
    content: content.text,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { generateArticle } from '@/lib/ai/content-generator'
import type { ContentType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      type,
      topic,
      additionalContext,
      specifications,
      difficulty,
      priceRange,
      product1,
      product2,
      criteria,
    } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const result = await generateArticle({
      type: type as ContentType,
      topic,
      additionalContext,
      specifications,
      difficulty,
      priceRange,
      product1,
      product2,
      criteria,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

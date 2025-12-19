/**
 * Agent API Route
 * 
 * Provides an HTTP endpoint for interacting with the blog management AI agent.
 */

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time initialization
export const dynamic = 'force-dynamic'

// POST /api/agent - Send instructions to the agent
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, instruction, ...params } = body

        // Dynamic import to avoid build-time Genkit initialization
        const { blogManagerFlow, contentPipelineFlow } = await import('@/lib/ai/flows')

        // Route to appropriate flow based on action type
        switch (action) {
            case 'chat':
            case 'instruct': {
                // General agent instructions
                if (!instruction) {
                    return NextResponse.json(
                        { error: 'instruction is required' },
                        { status: 400 }
                    )
                }

                const result = await blogManagerFlow({
                    instruction,
                    context: params.context,
                })

                return NextResponse.json(result)
            }

            case 'generate': {
                // Direct content generation pipeline
                const { topic, contentType, category, publishImmediately, fetchImage } = params

                if (!topic || !contentType) {
                    return NextResponse.json(
                        { error: 'topic and contentType are required for generate action' },
                        { status: 400 }
                    )
                }

                const result = await contentPipelineFlow({
                    topic,
                    contentType,
                    category,
                    publishImmediately: publishImmediately ?? false,
                    fetchImage: fetchImage ?? true,
                })

                return NextResponse.json(result)
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}. Use 'instruct' or 'generate'` },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Agent API error:', error)
        return NextResponse.json(
            {
                error: 'Agent execution failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// GET /api/agent - Health check and info
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        agent: 'TechBlog AI Manager',
        version: '1.0.0',
        capabilities: [
            'Content generation (NEWS, AI_NEWS, REVIEW, GUIDE, COMPARISON, ROUNDUP)',
            'Post management (create, update, publish, schedule)',
            'Topic suggestions',
            'Content quality analysis',
            'SEO optimization',
        ],
        endpoints: {
            'POST /api/agent': {
                actions: {
                    instruct: 'Send natural language instructions to the agent',
                    generate: 'Generate content using the content pipeline',
                },
                examples: [
                    {
                        action: 'instruct',
                        instruction: 'Generate a news article about the latest iPhone release',
                    },
                    {
                        action: 'generate',
                        topic: 'Best AI coding assistants in 2025',
                        contentType: 'ROUNDUP',
                        category: 'ai',
                        publishImmediately: false,
                    },
                ],
            },
        },
    })
}


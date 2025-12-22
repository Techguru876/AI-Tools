/**
 * Cron API Route for Scheduled Content Generation
 * 
 * This endpoint is designed to be called by Vercel Cron or external schedulers.
 * Recommended: Run every 4 hours to distribute content throughout the day.
 */

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time initialization
export const dynamic = 'force-dynamic'

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
        console.warn('CRON_SECRET not set - allowing request in development')
        return process.env.NODE_ENV === 'development'
    }

    return authHeader === `Bearer ${cronSecret}`
}

// GET /api/cron - Check quota status
export async function GET(request: NextRequest) {
    try {
        // Dynamic import to avoid build-time initialization
        const { getAllCategoryQuotas } = await import('@/lib/ai/scheduler/quota-tracker')
        const quotas = await getAllCategoryQuotas()

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            quotas,
            message: 'Use POST to trigger content generation',
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get quota status' },
            { status: 500 }
        )
    }
}

// POST /api/cron - Trigger content generation
export async function POST(request: NextRequest) {
    // Verify authorization
    if (!verifyCronSecret(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json().catch(() => ({}))
        const maxArticles = body.maxArticles || 10

        console.log(`[CRON] Starting daily generation with max ${maxArticles} articles`)

        // Dynamic import to avoid build-time initialization
        const { runDailyGeneration } = await import('@/lib/ai/scheduler')
        const result = await runDailyGeneration()

        console.log(`[CRON] Generated ${result.totalGenerated} articles`)

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            totalGenerated: result.totalGenerated,
            results: result.results,
            categoriesProcessed: result.categoriesProcessed,
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : ''

        console.error('[CRON] Generation failed:', errorMessage)
        if (errorStack) console.error('[CRON] Error Stack:', errorStack)

        return NextResponse.json(
            {
                error: 'Generation failed',
                details: errorMessage,
            },
            { status: 500 }
        )
    }
}

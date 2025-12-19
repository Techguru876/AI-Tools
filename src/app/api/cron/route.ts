/**
 * Cron API Route for Scheduled Content Generation
 * 
 * This endpoint is designed to be called by Vercel Cron or external schedulers.
 * Recommended: Run every 4 hours to distribute content throughout the day.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runDailyGeneration } from '@/lib/ai/scheduler'
import { getAllCategoryQuotas } from '@/lib/ai/scheduler/quota-tracker'

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
        console.error('[CRON] Generation failed:', error)
        return NextResponse.json(
            {
                error: 'Generation failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

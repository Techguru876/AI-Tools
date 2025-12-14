import { NextRequest, NextResponse } from 'next/server'

// Cron job endpoint for automated content generation
// Runs every 2 hours (configured in vercel.json)
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            console.log('Unauthorized cron attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🕐 Cron job triggered: generating content batch')

        // Determine how many articles to generate based on time of day
        const hour = new Date().getHours()
        let count = 2 // Default: 2 articles per run

        // Generate more during peak hours (9 AM - 9 PM)
        if (hour >= 9 && hour <= 21) {
            count = 3
        }

        // Call the batch generation endpoint
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/generate/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                count,
                autoPublish: false, // Send to review queue
                cronSecret: cronSecret,
            }),
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Batch generation failed')
        }

        console.log(`✅ Cron complete: ${result.generated} articles generated`)

        return NextResponse.json({
            success: true,
            message: `Generated ${result.generated} articles`,
            details: result,
            timestamp: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error('❌ Cron job failed:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}

// Allow manual trigger via POST (for admin testing)
export async function POST(request: NextRequest) {
    return GET(request)
}

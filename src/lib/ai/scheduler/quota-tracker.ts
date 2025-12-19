/**
 * Daily Content Quota Tracker
 * 
 * Tracks how many articles have been generated per category per day.
 * Uses in-memory storage (quota resets when deployed).
 */

export interface DailyQuota {
    date: string // YYYY-MM-DD
    category: string
    generated: number
    target: number
}

const DEFAULT_DAILY_TARGET = 5

// In-memory quota storage
const memoryQuotas: Map<string, DailyQuota> = new Map()

/**
 * Get today's date string
 */
function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Get the quota document ID
 */
function getQuotaId(date: string, category: string): string {
    return `${date}_${category}`
}

/**
 * Get remaining quota for a category today
 */
export async function getRemainingQuota(category: string): Promise<{
    remaining: number
    generated: number
    target: number
}> {
    const today = getTodayString()
    const docId = getQuotaId(today, category)

    const quota = memoryQuotas.get(docId)
    if (!quota) {
        return {
            remaining: DEFAULT_DAILY_TARGET,
            generated: 0,
            target: DEFAULT_DAILY_TARGET,
        }
    }

    const remaining = Math.max(0, quota.target - quota.generated)
    return {
        remaining,
        generated: quota.generated,
        target: quota.target,
    }
}

/**
 * Record a successful generation
 */
export async function recordGeneration(category: string): Promise<void> {
    const today = getTodayString()
    const docId = getQuotaId(today, category)

    const existing = memoryQuotas.get(docId)
    if (!existing) {
        memoryQuotas.set(docId, {
            date: today,
            category,
            generated: 1,
            target: DEFAULT_DAILY_TARGET,
        })
    } else {
        existing.generated++
    }
}

/**
 * Get quotas for all categories today
 */
export async function getAllCategoryQuotas(): Promise<Record<string, {
    remaining: number
    generated: number
    target: number
}>> {
    const categories = ['NEWS', 'AI_NEWS', 'REVIEW', 'GUIDE', 'COMPARISON', 'ROUNDUP']
    const quotas: Record<string, { remaining: number; generated: number; target: number }> = {}

    for (const category of categories) {
        quotas[category] = await getRemainingQuota(category)
    }

    return quotas
}

/**
 * Get categories that still need content today
 */
export async function getCategoriesNeedingContent(): Promise<string[]> {
    const quotas = await getAllCategoryQuotas()

    return Object.entries(quotas)
        .filter(([_, quota]) => quota.remaining > 0)
        .sort((a, b) => b[1].remaining - a[1].remaining) // Most needed first
        .map(([category]) => category)
}

/**
 * Set custom target for a category
 */
export async function setDailyTarget(category: string, target: number): Promise<void> {
    const today = getTodayString()
    const docId = getQuotaId(today, category)

    const existing = memoryQuotas.get(docId)
    if (existing) {
        existing.target = target
    } else {
        memoryQuotas.set(docId, {
            date: today,
            category,
            generated: 0,
            target,
        })
    }
}

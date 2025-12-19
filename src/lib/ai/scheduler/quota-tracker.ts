/**
 * Daily Content Quota Tracker
 * 
 * Tracks how many articles have been generated per category per day.
 */

import { firestore, COLLECTIONS } from '../config/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface DailyQuota {
    date: string // YYYY-MM-DD
    category: string
    generated: number
    target: number
}

const DEFAULT_DAILY_TARGET = 5

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

    const doc = await firestore
        .collection(COLLECTIONS.DAILY_QUOTAS)
        .doc(docId)
        .get()

    if (!doc.exists) {
        return {
            remaining: DEFAULT_DAILY_TARGET,
            generated: 0,
            target: DEFAULT_DAILY_TARGET,
        }
    }

    const data = doc.data() as DailyQuota
    const remaining = Math.max(0, data.target - data.generated)

    return {
        remaining,
        generated: data.generated,
        target: data.target,
    }
}

/**
 * Record a successful generation
 */
export async function recordGeneration(category: string): Promise<void> {
    const today = getTodayString()
    const docId = getQuotaId(today, category)

    const docRef = firestore.collection(COLLECTIONS.DAILY_QUOTAS).doc(docId)

    await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef)

        if (!doc.exists) {
            transaction.set(docRef, {
                date: today,
                category,
                generated: 1,
                target: DEFAULT_DAILY_TARGET,
            })
        } else {
            transaction.update(docRef, {
                generated: FieldValue.increment(1),
            })
        }
    })
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

    await firestore.collection(COLLECTIONS.DAILY_QUOTAS).doc(docId).set(
        {
            date: today,
            category,
            target,
        },
        { merge: true }
    )
}

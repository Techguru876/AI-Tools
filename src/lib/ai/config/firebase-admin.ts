/**
 * Firebase Admin Configuration
 * 
 * Initializes Firebase Admin SDK for server-side operations.
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin only once
function getFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApps()[0]
    }

    // Check for service account credentials
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (serviceAccountJson) {
        try {
            const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount
            return initializeApp({
                credential: cert(serviceAccount),
            })
        } catch (error) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error)
        }
    }

    // Fallback: Initialize with default credentials (works on GCP)
    return initializeApp()
}

export const firebaseAdmin = getFirebaseAdmin()
export const firestore = getFirestore(firebaseAdmin)

// Collection names for RAG
export const COLLECTIONS = {
    ARTICLE_EMBEDDINGS: 'article_embeddings',
    DAILY_QUOTAS: 'daily_quotas',
    GENERATION_LOGS: 'generation_logs',
} as const

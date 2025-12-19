/**
 * Firebase Genkit Configuration
 * 
 * This module initializes Genkit with the Google AI (Gemini) plugin
 * and exports the AI instance for use across agent tools and flows.
 */

import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/google-genai'

// Initialize Genkit with Google AI plugin
// Uses GOOGLE_GENAI_API_KEY from environment
export const ai = genkit({
    plugins: [googleAI()],
    // Default model configuration - can be overridden per-flow
    model: googleAI.model('gemini-2.0-flash', {
        temperature: 0.7,
    }),
})

// Re-export commonly used types and utilities from genkit
export { z } from 'genkit'

// Model options for different use cases
export const MODELS = {
    // Fast, cost-effective for simple tasks
    FLASH: googleAI.model('gemini-2.0-flash', { temperature: 0.7 }),
    // More capable for complex content generation
    PRO: googleAI.model('gemini-1.5-pro', { temperature: 0.7 }),
    // Lower temperature for structured data extraction
    STRUCTURED: googleAI.model('gemini-2.0-flash', { temperature: 0.3 }),
} as const

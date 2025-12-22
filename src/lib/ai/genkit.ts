/**
 * Minimal AI Utility (Cloudflare Workers Compatible)
 * 
 * Replaces Genkit with direct Google AI SDK usage to avoid 
 * EvalError and MessagePort issues in Cloudflare Workers.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

// Initialize Google AI with API key and fetch transport
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '')

export const ai = {
    /**
     * Minimal generate implementation matching Genkit's signature used in this project
     */
    async generate(options: {
        prompt: string;
        system?: string;
        model?: { name: string };
        config?: { temperature?: number };
        tools?: unknown[];
    }): Promise<{ text: string; toolRequests?: unknown[] }> {
        const modelName = options.model?.name || 'gemini-1.5-flash'
        const model = genAI.getGenerativeModel({
            model: modelName,
            // @ts-ignore - Required for Cloudflare Workers compatibility
            transport: 'fetch'
        })

        // Combine system prompt with user prompt if provided
        const fullPrompt = options.system
            ? `${options.system}\n\n${options.prompt}`
            : options.prompt

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
                temperature: options.config?.temperature ?? 0.7,
            }
        })

        const response = await result.response
        // Return empty toolRequests array for compatibility (tools not supported in minimal version)
        return { text: response.text(), toolRequests: [] }
    },

    /**
     * Minimal embed implementation matching Genkit's signature
     */
    async embed(options: { embedder: string; content: string }) {
        const model = genAI.getGenerativeModel({
            model: options.embedder || 'text-embedding-004',
            // @ts-ignore
            transport: 'fetch'
        })

        const result = await model.embedContent(options.content)
        return { embedding: { values: result.embedding.values } }
    },

    /**
     * Stubs for Genkit flow and tool definitions
     */
    defineFlow(config: any, handler: any) {
        // In this minimal version, we just return the handler function
        const flow = async (input: any) => await handler(input)
        Object.assign(flow, config)
        return flow
    },

    defineTool(config: any, handler: any) {
        return handler
    }
}

// Re-export zod for schema definitions
export { z }

// Model options mapping to simplify migration from Genkit
export const MODELS = {
    FLASH: { name: 'gemini-1.5-flash' },
    STANDARD: { name: 'gemini-1.5-flash' },
    PRO: { name: 'gemini-1.5-pro' },
    STRUCTURED: { name: 'gemini-1.5-flash' },
} as const


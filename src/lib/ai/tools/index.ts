/**
 * Tools Index
 * 
 * Aggregates all agent tools for easy import.
 */

export * from './database-tools'
export * from './content-tools'
export * from './publishing-tools'
export * from './research-tools'
export * from './image-gen-tools'
export * from './quality-tools'
export * from './social-tools'

import { databaseTools } from './database-tools'
import { contentTools } from './content-tools'
import { publishingTools } from './publishing-tools'
import { researchTools } from './research-tools'
import { imageGenTools } from './image-gen-tools'
import { qualityTools } from './quality-tools'
import { socialTools } from './social-tools'

// All tools combined for the blog manager agent
export const allTools = [
    ...databaseTools,
    ...contentTools,
    ...publishingTools,
    ...researchTools,
    ...imageGenTools,
    ...qualityTools,
    ...socialTools,
]

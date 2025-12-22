import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Connection string from environment
const connectionString = process.env.DATABASE_URL ?? ''

// Create Neon serverless connection (compatible with Cloudflare Workers)
const sql = neon(connectionString)

// Create drizzle instance with schema for relations
export const db = drizzle(sql, { schema })

// Re-export schema for convenience
export * from './schema'

// Export type for db instance
export type Database = typeof db

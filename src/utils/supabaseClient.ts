/**
 * Supabase Client
 * Handles cloud database connection with graceful fallback
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables (configure in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'))
}

// Create Supabase client (only if configured)
let supabaseInstance: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Export singleton instance
export const supabase = getSupabase()

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const client = getSupabase()
  if (!client) return false

  try {
    const { data: { session } } = await client.auth.getSession()
    return !!session
  } catch (error) {
    console.error('Authentication check failed:', error)
    return false
  }
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const client = getSupabase()
  if (!client) return null

  try {
    const { data: { user } } = await client.auth.getUser()
    return user?.id || null
  } catch (error) {
    console.error('Failed to get user ID:', error)
    return null
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<{
  success: boolean
  message: string
  user?: any
}> {
  const client = getSupabase()
  if (!client) {
    return {
      success: false,
      message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file.',
    }
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    return {
      success: true,
      message: 'Sign up successful! Check your email for verification.',
      user: data.user,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign up failed',
    }
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{
  success: boolean
  message: string
  user?: any
}> {
  const client = getSupabase()
  if (!client) {
    return {
      success: false,
      message: 'Supabase not configured. Add credentials to .env file.',
    }
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return {
      success: true,
      message: 'Sign in successful!',
      user: data.user,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign in failed',
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase()
  if (!client) {
    return {
      success: false,
      message: 'Supabase not configured',
    }
  }

  try {
    const { error } = await client.auth.signOut()
    if (error) throw error

    return {
      success: true,
      message: 'Signed out successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign out failed',
    }
  }
}

/**
 * Get Supabase configuration instructions
 */
export function getConfigurationInstructions(): string {
  return `
Cloud Sync is not configured. To enable cloud sync:

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your project URL and anon key from Settings → API
4. Create a .env file in the project root with:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

5. Run the database migration (see database-schema.sql)
6. Restart the application

Until configured, projects will be saved locally only.
  `.trim()
}

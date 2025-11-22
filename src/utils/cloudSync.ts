/**
 * Cloud Sync Utility
 * Handles project synchronization with Supabase cloud storage
 * Gracefully falls back to localStorage when cloud is unavailable
 */

import { getSupabase, isSupabaseConfigured, getCurrentUserId } from './supabaseClient'

export interface CloudProject {
  id: string
  user_id: string
  studio_type: StudioType
  title: string
  data: any
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

export type StudioType = 'lofi' | 'horror' | 'quotes' | 'explainer' | 'asmr' | 'storytelling' | 'productivity' | 'news' | 'meme'

export interface SyncStatus {
  enabled: boolean
  lastSync: string | null
  status: 'synced' | 'syncing' | 'error' | 'offline'
  message?: string
}

/**
 * Save project to cloud
 * Falls back to localStorage if cloud unavailable
 */
export async function saveProjectToCloud(
  project: any,
  studioType: StudioType,
  thumbnailUrl?: string
): Promise<{ success: boolean; message: string; data?: CloudProject }> {
  const supabase = getSupabase()

  // Check if configured
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Cloud sync not configured. Project saved locally only.',
    }
  }

  try {
    // Get current user
    const userId = await getCurrentUserId()
    if (!userId) {
      return {
        success: false,
        message: 'Not signed in. Please sign in to sync to cloud.',
      }
    }

    // Upsert project (insert or update)
    const { data, error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        user_id: userId,
        studio_type: studioType,
        title: project.title || 'Untitled Project',
        data: project,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: 'Project saved to cloud',
      data,
    }
  } catch (error: any) {
    console.error('Cloud save error:', error)
    return {
      success: false,
      message: `Cloud save failed: ${error.message}`,
    }
  }
}

/**
 * Load projects from cloud
 * Returns empty array if cloud unavailable (fallback to local)
 */
export async function loadProjectsFromCloud(
  studioType?: StudioType
): Promise<{ success: boolean; message: string; data: CloudProject[] }> {
  const supabase = getSupabase()

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Cloud sync not configured',
      data: [],
    }
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return {
        success: false,
        message: 'Not signed in',
        data: [],
      }
    }

    // Build query
    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (studioType) {
      query = query.eq('studio_type', studioType)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      message: `Loaded ${data?.length || 0} projects from cloud`,
      data: data || [],
    }
  } catch (error: any) {
    console.error('Cloud load error:', error)
    return {
      success: false,
      message: `Cloud load failed: ${error.message}`,
      data: [],
    }
  }
}

/**
 * Load single project from cloud
 */
export async function loadProjectFromCloud(
  projectId: string
): Promise<{ success: boolean; message: string; data?: CloudProject }> {
  const supabase = getSupabase()

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Cloud sync not configured',
    }
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return {
        success: false,
        message: 'Not signed in',
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return {
      success: true,
      message: 'Project loaded from cloud',
      data,
    }
  } catch (error: any) {
    console.error('Cloud load error:', error)
    return {
      success: false,
      message: `Failed to load project: ${error.message}`,
    }
  }
}

/**
 * Delete project from cloud
 */
export async function deleteProjectFromCloud(
  projectId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase()

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Cloud sync not configured',
    }
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return {
        success: false,
        message: 'Not signed in',
      }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) throw error

    return {
      success: true,
      message: 'Project deleted from cloud',
    }
  } catch (error: any) {
    console.error('Cloud delete error:', error)
    return {
      success: false,
      message: `Failed to delete project: ${error.message}`,
    }
  }
}

/**
 * Sync all local projects to cloud (bulk upload)
 */
export async function syncLocalProjectsToCloud(
  projects: any[],
  studioType: StudioType
): Promise<{ success: boolean; synced: number; failed: number; message: string }> {
  const supabase = getSupabase()

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      synced: 0,
      failed: projects.length,
      message: 'Cloud sync not configured',
    }
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return {
        success: false,
        synced: 0,
        failed: projects.length,
        message: 'Not signed in',
      }
    }

    let synced = 0
    let failed = 0

    // Sync each project individually
    for (const project of projects) {
      const result = await saveProjectToCloud(project, studioType)
      if (result.success) {
        synced++
      } else {
        failed++
      }
    }

    return {
      success: failed === 0,
      synced,
      failed,
      message: `Synced ${synced} projects, ${failed} failed`,
    }
  } catch (error: any) {
    console.error('Bulk sync error:', error)
    return {
      success: false,
      synced: 0,
      failed: projects.length,
      message: `Bulk sync failed: ${error.message}`,
    }
  }
}

/**
 * Merge cloud and local projects (conflict resolution)
 * Uses "last updated wins" strategy
 */
export async function mergeCloudAndLocalProjects(
  localProjects: any[],
  studioType: StudioType
): Promise<{ merged: any[]; conflicts: number }> {
  const cloudResult = await loadProjectsFromCloud(studioType)

  if (!cloudResult.success) {
    // Cloud unavailable, use local only
    return { merged: localProjects, conflicts: 0 }
  }

  const cloudProjects = cloudResult.data
  const merged = new Map<string, any>()
  let conflicts = 0

  // Add all local projects
  for (const project of localProjects) {
    merged.set(project.id, {
      ...project,
      _source: 'local',
      _updated: project.updated_at || project.created_at || new Date(0).toISOString(),
    })
  }

  // Merge cloud projects (newer wins)
  for (const cloudProject of cloudProjects) {
    const existing = merged.get(cloudProject.id)

    if (!existing) {
      // Cloud-only project
      merged.set(cloudProject.id, {
        ...cloudProject.data,
        _source: 'cloud',
        _updated: cloudProject.updated_at,
      })
    } else {
      // Conflict: compare timestamps
      const localTime = new Date(existing._updated).getTime()
      const cloudTime = new Date(cloudProject.updated_at).getTime()

      if (cloudTime > localTime) {
        // Cloud is newer
        merged.set(cloudProject.id, {
          ...cloudProject.data,
          _source: 'cloud',
          _updated: cloudProject.updated_at,
        })
        conflicts++
      } else if (localTime > cloudTime) {
        // Local is newer, keep local but mark for sync
        conflicts++
      }
      // If equal, keep existing (local)
    }
  }

  // Remove metadata fields
  const mergedArray = Array.from(merged.values()).map((p) => {
    const { _source, _updated, ...project } = p
    return project
  })

  return { merged: mergedArray, conflicts }
}

/**
 * Get cloud sync status
 */
export async function getCloudSyncStatus(): Promise<SyncStatus> {
  if (!isSupabaseConfigured()) {
    return {
      enabled: false,
      lastSync: null,
      status: 'offline',
      message: 'Cloud sync not configured',
    }
  }

  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      enabled: false,
      lastSync: null,
      status: 'offline',
      message: 'Not signed in',
    }
  }

  const lastSync = localStorage.getItem('infinitystudio_last_sync')

  return {
    enabled: true,
    lastSync,
    status: 'synced',
    message: 'Cloud sync active',
  }
}

/**
 * Update last sync timestamp
 */
export function updateLastSyncTimestamp(): void {
  localStorage.setItem('infinitystudio_last_sync', new Date().toISOString())
}

/**
 * Check if cloud sync is available
 */
export async function isCloudSyncAvailable(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  const userId = await getCurrentUserId()
  return !!userId
}

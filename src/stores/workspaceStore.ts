/**
 * Workspace Store
 * Manages workspace layouts, panel configurations, and workspace presets
 * Supports saving/loading custom workspaces like Premiere Pro
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PanelConfig {
  id: string
  title: string
  icon?: string
  position: 'left' | 'right' | 'bottom' | 'floating'
  width: number
  height: number
  x?: number // For floating panels
  y?: number // For floating panels
  isCollapsed: boolean
  isVisible: boolean
  order: number // Z-index for floating panels
}

export interface Workspace {
  id: string
  name: string
  mode: 'video' | 'photo' | 'animation' | 'lofi'
  panels: PanelConfig[]
  layout: LayoutConfig
}

export interface LayoutConfig {
  leftSidebarWidth: number
  rightSidebarWidth: number
  bottomPanelHeight: number
  timelineHeight: number
}

// Predefined workspace presets
export const workspacePresets: Record<string, Workspace> = {
  video: {
    id: 'video-editing',
    name: 'Video Editing',
    mode: 'video',
    panels: [
      { id: 'project', title: 'Project', icon: '📁', position: 'left', width: 280, height: 300, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'effects', title: 'Effects', icon: '✨', position: 'left', width: 280, height: 400, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'properties', title: 'Properties', icon: '⚙', position: 'right', width: 320, height: 400, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'scopes', title: 'Scopes', icon: '📊', position: 'right', width: 320, height: 300, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'audio-mixer', title: 'Audio Mixer', icon: '🎚', position: 'bottom', width: 0, height: 200, isCollapsed: true, isVisible: true, order: 0 },
    ],
    layout: {
      leftSidebarWidth: 280,
      rightSidebarWidth: 320,
      bottomPanelHeight: 0,
      timelineHeight: 250,
    },
  },

  photo: {
    id: 'photo-editing',
    name: 'Photo Editing',
    mode: 'photo',
    panels: [
      { id: 'tools', title: 'Tools', icon: '🛠', position: 'left', width: 260, height: 0, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'layers', title: 'Layers', icon: '📚', position: 'right', width: 300, height: 400, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'adjustments', title: 'Adjustments', icon: '🎨', position: 'right', width: 300, height: 300, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'history', title: 'History', icon: '⏱', position: 'right', width: 300, height: 200, isCollapsed: false, isVisible: true, order: 0 },
    ],
    layout: {
      leftSidebarWidth: 260,
      rightSidebarWidth: 300,
      bottomPanelHeight: 0,
      timelineHeight: 0,
    },
  },

  animation: {
    id: 'motion-graphics',
    name: 'Motion Graphics',
    mode: 'animation',
    panels: [
      { id: 'project', title: 'Project', icon: '📁', position: 'left', width: 280, height: 250, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'effects', title: 'Effects', icon: '✨', position: 'left', width: 280, height: 300, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'character', title: 'Character', icon: '🎭', position: 'left', width: 280, height: 200, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'properties', title: 'Properties', icon: '⚙', position: 'right', width: 340, height: 500, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'align', title: 'Align', icon: '◫', position: 'right', width: 340, height: 200, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'preview', title: 'Preview', icon: '▶', position: 'bottom', width: 0, height: 180, isCollapsed: false, isVisible: true, order: 0 },
    ],
    layout: {
      leftSidebarWidth: 280,
      rightSidebarWidth: 340,
      bottomPanelHeight: 180,
      timelineHeight: 280,
    },
  },

  lofi: {
    id: 'lofi-studio',
    name: 'Lofi Studio',
    mode: 'lofi',
    panels: [
      { id: 'loops', title: 'Loop Library', icon: '🔁', position: 'left', width: 300, height: 350, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'playlist', title: 'Playlist', icon: '📻', position: 'left', width: 300, height: 350, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'vibe-controls', title: 'Vibe Controls', icon: '🎛', position: 'right', width: 280, height: 300, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'visualizer', title: 'Visualizer', icon: '📈', position: 'right', width: 280, height: 250, isCollapsed: false, isVisible: true, order: 0 },
      { id: 'stream-setup', title: 'Stream Setup', icon: '📡', position: 'bottom', width: 0, height: 200, isCollapsed: false, isVisible: true, order: 0 },
    ],
    layout: {
      leftSidebarWidth: 300,
      rightSidebarWidth: 280,
      bottomPanelHeight: 200,
      timelineHeight: 220,
    },
  },
}

interface WorkspaceStore {
  currentWorkspace: Workspace
  customWorkspaces: Workspace[]
  panels: PanelConfig[]

  // Actions
  setWorkspace: (workspaceId: string) => void
  createCustomWorkspace: (name: string, mode: Workspace['mode']) => void
  saveCurrentWorkspace: (name: string) => void
  deleteWorkspace: (workspaceId: string) => void

  // Panel actions
  addPanel: (panel: PanelConfig) => void
  updatePanel: (panelId: string, updates: Partial<PanelConfig>) => void
  removePanel: (panelId: string) => void
  togglePanelVisibility: (panelId: string) => void
  resetPanels: () => void

  // Layout actions
  updateLayout: (updates: Partial<LayoutConfig>) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      currentWorkspace: workspacePresets.video,
      customWorkspaces: [],
      panels: workspacePresets.video.panels,

      setWorkspace: (workspaceId) => {
        const preset = workspacePresets[workspaceId]
        const custom = get().customWorkspaces.find(w => w.id === workspaceId)
        const workspace = preset || custom

        if (workspace) {
          set({ currentWorkspace: workspace, panels: workspace.panels })
        }
      },

      createCustomWorkspace: (name, mode) => {
        const newWorkspace: Workspace = {
          id: `custom-${Date.now()}`,
          name,
          mode,
          panels: [...get().panels],
          layout: get().currentWorkspace.layout,
        }

        set(state => ({
          customWorkspaces: [...state.customWorkspaces, newWorkspace],
        }))
      },

      saveCurrentWorkspace: (name) => {
        const current = get().currentWorkspace
        const updated: Workspace = {
          ...current,
          id: `custom-${Date.now()}`,
          name,
          panels: [...get().panels],
        }

        set(state => ({
          customWorkspaces: [...state.customWorkspaces, updated],
        }))
      },

      deleteWorkspace: (workspaceId) => {
        set(state => ({
          customWorkspaces: state.customWorkspaces.filter(w => w.id !== workspaceId),
        }))
      },

      addPanel: (panel) => {
        set(state => ({
          panels: [...state.panels, panel],
        }))
      },

      updatePanel: (panelId, updates) => {
        set(state => ({
          panels: state.panels.map(panel =>
            panel.id === panelId ? { ...panel, ...updates } : panel
          ),
        }))
      },

      removePanel: (panelId) => {
        set(state => ({
          panels: state.panels.filter(p => p.id !== panelId),
        }))
      },

      togglePanelVisibility: (panelId) => {
        set(state => ({
          panels: state.panels.map(panel =>
            panel.id === panelId ? { ...panel, isVisible: !panel.isVisible } : panel
          ),
        }))
      },

      resetPanels: () => {
        set(state => ({
          panels: [...state.currentWorkspace.panels],
        }))
      },

      updateLayout: (updates) => {
        set(state => ({
          currentWorkspace: {
            ...state.currentWorkspace,
            layout: { ...state.currentWorkspace.layout, ...updates },
          },
        }))
      },
    }),
    {
      name: 'infinity-studio-workspace',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        customWorkspaces: state.customWorkspaces,
      }),
    }
  )
)

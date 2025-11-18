/**
 * Project Store - Global State Management
 * Manages the current project, timeline, layers, and editing state using Zustand
 */

import { create } from 'zustand'

export interface Project {
  id: string
  name: string
  path: string
  created_at: number
  modified_at: number
  timeline: Timeline | null
  layers: Layer[]
  settings: ProjectSettings
}

export interface Timeline {
  id: string
  tracks: Track[]
  duration: number
  fps: number
}

export interface Track {
  id: string
  track_type: 'Video' | 'Audio' | 'Graphics' | 'Text'
  clips: Clip[]
  locked: boolean
  muted: boolean
}

export interface Clip {
  id: string
  source_path: string
  start_time: number
  end_time: number
  duration: number
  offset: number
  effects: string[]
  transition_in?: string
  transition_out?: string
}

export interface Layer {
  id: string
  name: string
  layer_type: any
  visible: boolean
  opacity: number
  blend_mode: string
  transform: Transform
  mask?: any
}

export interface Transform {
  x: number
  y: number
  scale_x: number
  scale_y: number
  rotation: number
  skew_x: number
  skew_y: number
}

export interface ProjectSettings {
  width: number
  height: number
  fps: number
  sample_rate: number
  color_space: string
}

interface ProjectStore {
  project: Project | null
  selectedLayerId: string | null
  selectedClipId: string | null
  currentTime: number
  isPlaying: boolean
  zoom: number

  // Actions
  initProject: (project: Project) => void
  updateProject: (updates: Partial<Project>) => void
  selectLayer: (layerId: string | null) => void
  selectClip: (clipId: string | null) => void
  setCurrentTime: (time: number) => void
  setPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
  addLayer: (layer: Layer) => void
  removeLayer: (layerId: string) => void
  addClip: (trackId: string, clip: Clip) => void
  removeClip: (clipId: string) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  selectedLayerId: null,
  selectedClipId: null,
  currentTime: 0,
  isPlaying: false,
  zoom: 1.0,

  initProject: (project) => set({ project }),

  updateProject: (updates) =>
    set((state) => ({
      project: state.project ? { ...state.project, ...updates } : null,
    })),

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  selectClip: (clipId) => set({ selectedClipId: clipId }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setZoom: (zoom) => set({ zoom }),

  addLayer: (layer) =>
    set((state) => ({
      project: state.project
        ? { ...state.project, layers: [...state.project.layers, layer] }
        : null,
    })),

  removeLayer: (layerId) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            layers: state.project.layers.filter((l) => l.id !== layerId),
          }
        : null,
    })),

  addClip: (trackId, clip) =>
    set((state) => {
      if (!state.project?.timeline) return state

      const timeline = { ...state.project.timeline }
      const track = timeline.tracks.find((t) => t.id === trackId)
      if (track) {
        track.clips = [...track.clips, clip]
      }

      return {
        project: { ...state.project, timeline },
      }
    }),

  removeClip: (clipId) =>
    set((state) => {
      if (!state.project?.timeline) return state

      const timeline = { ...state.project.timeline }
      timeline.tracks = timeline.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      }))

      return {
        project: { ...state.project, timeline },
      }
    }),
}))

/**
 * Lofi Studio State Management
 * Zustand store for managing lofi scenes, templates, animations, and playback
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Scene element types
export interface SceneElement {
  id: string
  name: string
  element_type: 'Background' | 'Character' | 'Prop' | 'Overlay' | 'Foreground'
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  z_index: number
  source: ElementSource
  animations: string[] // Animation preset IDs
  blend_mode?: BlendMode
}

export type ElementSource =
  | { type: 'Image'; path: string }
  | { type: 'Video'; path: string }
  | { type: 'Animation'; composition_id: string }
  | { type: 'Generated'; prompt: string; url?: string }

export type BlendMode = 'Normal' | 'Multiply' | 'Screen' | 'Overlay' | 'Add'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  file_path: string
  duration: number
  bpm: number
  loop_start?: number
  loop_end?: number
}

export interface AnimationPreset {
  id: string
  name: string
  description: string
  category: 'Motion' | 'Effects' | 'Transitions'
  preset_type: AnimationPresetType
  thumbnail?: string
}

export type AnimationPresetType =
  | { type: 'Breathing'; amplitude: number; speed: number }
  | { type: 'Blinking'; frequency: number; duration: number }
  | { type: 'Rain'; density: number; angle: number; speed: number }
  | { type: 'Parallax'; layers: Array<[string, number]> }
  | { type: 'Float'; amplitude: number; speed: number }
  | { type: 'Glow'; intensity: number; color: [number, number, number] }
  | { type: 'Fade'; duration: number }
  | { type: 'Slide'; direction: 'Left' | 'Right' | 'Up' | 'Down'; speed: number }
  | { type: 'Rotate'; speed: number; clockwise: boolean }
  | { type: 'Bounce'; amplitude: number; speed: number }

export interface LofiScene {
  id: string
  name: string
  background?: SceneElement
  characters: SceneElement[]
  props: SceneElement[]
  overlays: SceneElement[]
  foreground?: SceneElement
  music_track?: MusicTrack
  lighting?: {
    ambient_color: [number, number, number]
    time_of_day: 'Morning' | 'Day' | 'Evening' | 'Night'
  }
  loop_settings: {
    duration: number
    visual_loop_point?: number
    audio_loop_point?: number
    auto_sync: boolean
  }
  created_at: string
  modified_at: string
}

export interface LofiTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  thumbnail: string
  scene: LofiScene
  customization_options: CustomizationOption[]
  tags: string[]
  popularity: number
}

export type TemplateCategory =
  | 'CozyRoom'
  | 'RainyWindow'
  | 'Cityscape'
  | 'NatureScene'
  | 'SpaceTheme'
  | 'Custom'

export interface CustomizationOption {
  id: string
  label: string
  option_type: 'Color' | 'Texture' | 'Element' | 'Animation'
  default_value: any
  options: any[]
}

export interface ColorPalette {
  name: string
  colors: Array<[number, number, number]>
  mood: string
}

// State interface
interface LofiStoreState {
  // Current scene
  currentScene: LofiScene | null
  sceneHistory: LofiScene[]
  historyIndex: number

  // Selection
  selectedElement: string | null
  selectedElements: string[]

  // Playback
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number

  // Templates
  templates: LofiTemplate[]
  favoriteTemplates: string[]

  // Animation presets
  animationPresets: AnimationPreset[]

  // UI state
  showGrid: boolean
  showGuides: boolean
  snapToGrid: boolean
  gridSize: number
  zoom: number
  mode: 'beginner' | 'advanced'

  // Asset library
  assetLibrary: {
    backgrounds: SceneElement[]
    characters: SceneElement[]
    props: SceneElement[]
    overlays: SceneElement[]
    music: MusicTrack[]
  }

  // AI suggestions
  suggestedPalettes: ColorPalette[]
  suggestedMusic: MusicTrack[]

  // Actions
  createNewScene: (name: string) => void
  loadScene: (scene: LofiScene) => void
  updateScene: (updates: Partial<LofiScene>) => void

  addElement: (element: SceneElement) => void
  updateElement: (id: string, updates: Partial<SceneElement>) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void

  selectElement: (id: string | null) => void
  selectMultiple: (ids: string[]) => void

  applyTemplate: (template: LofiTemplate) => void
  saveAsTemplate: (name: string, category: TemplateCategory) => void

  applyAnimationPreset: (elementId: string, presetId: string) => void
  removeAnimation: (elementId: string, presetId: string) => void

  setMusicTrack: (track: MusicTrack | null) => void
  detectLoopPoints: () => void

  play: () => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void

  undo: () => void
  redo: () => void

  setMode: (mode: 'beginner' | 'advanced') => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleGuides: () => void

  exportScene: (format: 'video' | 'gif' | 'frames') => Promise<string>
}

// Create the store
export const useLofiStore = create<LofiStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentScene: null,
      sceneHistory: [],
      historyIndex: -1,
      selectedElement: null,
      selectedElements: [],
      isPlaying: false,
      currentTime: 0,
      playbackSpeed: 1.0,
      templates: [],
      favoriteTemplates: [],
      animationPresets: getDefaultAnimationPresets(),
      showGrid: true,
      showGuides: true,
      snapToGrid: false,
      gridSize: 50,
      zoom: 1.0,
      mode: 'beginner',
      assetLibrary: {
        backgrounds: [],
        characters: [],
        props: [],
        overlays: [],
        music: [],
      },
      suggestedPalettes: [],
      suggestedMusic: [],

      // Actions
      createNewScene: (name: string) => {
        const newScene: LofiScene = {
          id: crypto.randomUUID(),
          name,
          characters: [],
          props: [],
          overlays: [],
          loop_settings: {
            duration: 60,
            auto_sync: true,
          },
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }
        set({ currentScene: newScene, sceneHistory: [newScene], historyIndex: 0 })
      },

      loadScene: (scene: LofiScene) => {
        set({ currentScene: scene, sceneHistory: [scene], historyIndex: 0 })
      },

      updateScene: (updates: Partial<LofiScene>) => {
        const { currentScene, sceneHistory, historyIndex } = get()
        if (!currentScene) return

        const updatedScene = {
          ...currentScene,
          ...updates,
          modified_at: new Date().toISOString(),
        }

        const newHistory = sceneHistory.slice(0, historyIndex + 1)
        newHistory.push(updatedScene)

        set({
          currentScene: updatedScene,
          sceneHistory: newHistory,
          historyIndex: newHistory.length - 1,
        })
      },

      addElement: (element: SceneElement) => {
        const { currentScene, updateScene } = get()
        if (!currentScene) return

        const elementType = element.element_type
        let updates: Partial<LofiScene> = {}

        switch (elementType) {
          case 'Background':
            updates = { background: element }
            break
          case 'Foreground':
            updates = { foreground: element }
            break
          case 'Character':
            updates = { characters: [...currentScene.characters, element] }
            break
          case 'Prop':
            updates = { props: [...currentScene.props, element] }
            break
          case 'Overlay':
            updates = { overlays: [...currentScene.overlays, element] }
            break
        }

        updateScene(updates)
      },

      updateElement: (id: string, updates: Partial<SceneElement>) => {
        const { currentScene, updateScene } = get()
        if (!currentScene) return

        const updateArray = (arr: SceneElement[]) =>
          arr.map((el) => (el.id === id ? { ...el, ...updates } : el))

        let sceneUpdates: Partial<LofiScene> = {}

        if (currentScene.background?.id === id) {
          sceneUpdates.background = { ...currentScene.background, ...updates }
        } else if (currentScene.foreground?.id === id) {
          sceneUpdates.foreground = { ...currentScene.foreground, ...updates }
        } else {
          sceneUpdates = {
            characters: updateArray(currentScene.characters),
            props: updateArray(currentScene.props),
            overlays: updateArray(currentScene.overlays),
          }
        }

        updateScene(sceneUpdates)
      },

      removeElement: (id: string) => {
        const { currentScene, updateScene, selectedElement } = get()
        if (!currentScene) return

        const removeFromArray = (arr: SceneElement[]) => arr.filter((el) => el.id !== id)

        let updates: Partial<LofiScene> = {}

        if (currentScene.background?.id === id) {
          updates.background = undefined
        } else if (currentScene.foreground?.id === id) {
          updates.foreground = undefined
        } else {
          updates = {
            characters: removeFromArray(currentScene.characters),
            props: removeFromArray(currentScene.props),
            overlays: removeFromArray(currentScene.overlays),
          }
        }

        updateScene(updates)

        if (selectedElement === id) {
          set({ selectedElement: null })
        }
      },

      duplicateElement: (id: string) => {
        const { currentScene, addElement } = get()
        if (!currentScene) return

        const allElements = [
          currentScene.background,
          ...currentScene.characters,
          ...currentScene.props,
          ...currentScene.overlays,
          currentScene.foreground,
        ].filter(Boolean) as SceneElement[]

        const element = allElements.find((el) => el.id === id)
        if (!element) return

        const duplicate: SceneElement = {
          ...element,
          id: crypto.randomUUID(),
          name: `${element.name} Copy`,
          x: element.x + 20,
          y: element.y + 20,
        }

        addElement(duplicate)
      },

      selectElement: (id: string | null) => {
        set({ selectedElement: id, selectedElements: id ? [id] : [] })
      },

      selectMultiple: (ids: string[]) => {
        set({ selectedElements: ids, selectedElement: ids[0] || null })
      },

      applyTemplate: (template: LofiTemplate) => {
        const scene: LofiScene = {
          ...template.scene,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }
        get().loadScene(scene)
      },

      saveAsTemplate: (name: string, category: TemplateCategory) => {
        const { currentScene, templates } = get()
        if (!currentScene) return

        const template: LofiTemplate = {
          id: crypto.randomUUID(),
          name,
          description: 'Custom template',
          category,
          thumbnail: '', // Would generate thumbnail
          scene: currentScene,
          customization_options: [],
          tags: [],
          popularity: 0,
        }

        set({ templates: [...templates, template] })
      },

      applyAnimationPreset: (elementId: string, presetId: string) => {
        const { currentScene, updateElement } = get()
        if (!currentScene) return

        const allElements = [
          currentScene.background,
          ...currentScene.characters,
          ...currentScene.props,
          ...currentScene.overlays,
          currentScene.foreground,
        ].filter(Boolean) as SceneElement[]

        const element = allElements.find((el) => el.id === elementId)
        if (!element) return

        const animations = [...element.animations]
        if (!animations.includes(presetId)) {
          animations.push(presetId)
          updateElement(elementId, { animations })
        }
      },

      removeAnimation: (elementId: string, presetId: string) => {
        const { currentScene, updateElement } = get()
        if (!currentScene) return

        const allElements = [
          currentScene.background,
          ...currentScene.characters,
          ...currentScene.props,
          ...currentScene.overlays,
          currentScene.foreground,
        ].filter(Boolean) as SceneElement[]

        const element = allElements.find((el) => el.id === elementId)
        if (!element) return

        const animations = element.animations.filter((id) => id !== presetId)
        updateElement(elementId, { animations })
      },

      setMusicTrack: (track: MusicTrack | null) => {
        get().updateScene({ music_track: track })
      },

      detectLoopPoints: async () => {
        const { currentScene } = get()
        if (!currentScene?.music_track) return

        // In real implementation, would call Rust backend
        // const result = await invoke('detect_loop_points', {
        //   audioPath: currentScene.music_track.file_path
        // })

        // For now, set default loop points
        const duration = currentScene.music_track.duration
        get().updateScene({
          loop_settings: {
            ...currentScene.loop_settings,
            visual_loop_point: duration,
            audio_loop_point: duration,
          },
        })
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      stop: () => set({ isPlaying: false, currentTime: 0 }),
      seek: (time: number) => set({ currentTime: time }),

      undo: () => {
        const { sceneHistory, historyIndex } = get()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          set({
            currentScene: sceneHistory[newIndex],
            historyIndex: newIndex,
          })
        }
      },

      redo: () => {
        const { sceneHistory, historyIndex } = get()
        if (historyIndex < sceneHistory.length - 1) {
          const newIndex = historyIndex + 1
          set({
            currentScene: sceneHistory[newIndex],
            historyIndex: newIndex,
          })
        }
      },

      setMode: (mode: 'beginner' | 'advanced') => set({ mode }),
      setZoom: (zoom: number) => set({ zoom }),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

      exportScene: async (format: 'video' | 'gif' | 'frames') => {
        // Would call Rust backend for actual export
        return '/path/to/exported/file'
      },
    }),
    {
      name: 'lofi-studio-storage',
      partialize: (state) => ({
        templates: state.templates,
        favoriteTemplates: state.favoriteTemplates,
        mode: state.mode,
        showGrid: state.showGrid,
        showGuides: state.showGuides,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
      }),
    }
  )
)

// Default animation presets
function getDefaultAnimationPresets(): AnimationPreset[] {
  return [
    {
      id: 'breathing',
      name: 'Breathing',
      description: 'Gentle scale breathing effect',
      category: 'Motion',
      preset_type: { type: 'Breathing', amplitude: 0.05, speed: 2.0 },
    },
    {
      id: 'blinking',
      name: 'Blinking',
      description: 'Natural blinking animation',
      category: 'Motion',
      preset_type: { type: 'Blinking', frequency: 3.0, duration: 0.15 },
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Animated rainfall effect',
      category: 'Effects',
      preset_type: { type: 'Rain', density: 100, angle: 75, speed: 500 },
    },
    {
      id: 'parallax',
      name: 'Parallax',
      description: 'Multi-layer parallax scrolling',
      category: 'Motion',
      preset_type: { type: 'Parallax', layers: [] },
    },
    {
      id: 'float',
      name: 'Float',
      description: 'Gentle floating motion',
      category: 'Motion',
      preset_type: { type: 'Float', amplitude: 10, speed: 1.5 },
    },
    {
      id: 'glow',
      name: 'Glow',
      description: 'Pulsing glow effect',
      category: 'Effects',
      preset_type: { type: 'Glow', intensity: 0.5, color: [255, 200, 100] },
    },
    {
      id: 'fade',
      name: 'Fade In/Out',
      description: 'Smooth opacity transition',
      category: 'Transitions',
      preset_type: { type: 'Fade', duration: 1.0 },
    },
    {
      id: 'slide',
      name: 'Slide',
      description: 'Slide in from direction',
      category: 'Transitions',
      preset_type: { type: 'Slide', direction: 'Left', speed: 1.0 },
    },
    {
      id: 'rotate',
      name: 'Rotate',
      description: 'Continuous rotation',
      category: 'Motion',
      preset_type: { type: 'Rotate', speed: 30, clockwise: true },
    },
    {
      id: 'bounce',
      name: 'Bounce',
      description: 'Bouncing motion',
      category: 'Motion',
      preset_type: { type: 'Bounce', amplitude: 20, speed: 2.0 },
    },
  ]
}

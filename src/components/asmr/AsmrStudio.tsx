/**
 * ASMR Studio - Relaxation & Ambient Content
 * Features: Ambient backgrounds, soundscape generator, visual filters, animation controls, live stream mode
 */

import { useState } from 'react'
// Unused imports removed
import './AsmrStudio.css'

interface SoundLayer {
  id: string
  name: string
  type: 'nature' | 'ambient' | 'white-noise' | 'music'
  volume: number
  enabled: boolean
}

interface VisualFilter {
  id: string
  name: string
  enabled: boolean
  intensity: number
}

interface Animation {
  id: string
  name: string
  type: 'ripple' | 'parallax' | 'breathing' | 'particles' | 'drift'
  speed: number
  enabled: boolean
}

interface ASMRScene {
  id: string
  title: string
  background: string
  backgroundUrl?: string
  soundLayers: SoundLayer[]
  visualFilters: VisualFilter[]
  animations: Animation[]
  duration: number
  status: 'editing' | 'ready' | 'streaming'
}

export default function AsmrStudio() {
  const [scenes, setScenes] = useState<ASMRScene[]>([])
  const [selectedBackground, setSelectedBackground] = useState('night-sky')
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamMode, setStreamMode] = useState(false)
  const [currentScene, setCurrentScene] = useState<ASMRScene | null>(null)

  const backgrounds = [
    { id: 'night-sky', name: 'Night Sky', preview: 'linear-gradient(180deg, #0a0e27 0%, #16213e 100%)', category: 'nature' },
    { id: 'rain-window', name: 'Rain on Window', preview: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)', category: 'nature' },
    { id: 'forest', name: 'Forest Path', preview: 'linear-gradient(180deg, #134e5e 0%, #71b280 100%)', category: 'nature' },
    { id: 'ocean-waves', name: 'Ocean Waves', preview: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)', category: 'nature' },
    { id: 'fireplace', name: 'Cozy Fireplace', preview: 'linear-gradient(180deg, #2d1b00 0%, #563112 100%)', category: 'ambient' },
    { id: 'aurora', name: 'Northern Lights', preview: 'linear-gradient(180deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)', category: 'nature' },
    { id: 'clouds', name: 'Drifting Clouds', preview: 'linear-gradient(180deg, #e0eafc 0%, #cfdef3 100%)', category: 'ambient' },
    { id: 'space', name: 'Deep Space', preview: 'linear-gradient(180deg, #000000 0%, #0f2027 100%)', category: 'ambient' },
  ]

  const soundPresets = [
    { id: 'rain', name: 'Rain', type: 'nature' as const, icon: '🌧️' },
    { id: 'thunder', name: 'Thunder', type: 'nature' as const, icon: '⛈️' },
    { id: 'ocean', name: 'Ocean', type: 'nature' as const, icon: '🌊' },
    { id: 'forest', name: 'Forest', type: 'nature' as const, icon: '🌲' },
    { id: 'fire', name: 'Crackling Fire', type: 'ambient' as const, icon: '🔥' },
    { id: 'wind', name: 'Wind', type: 'nature' as const, icon: '💨' },
    { id: 'white-noise', name: 'White Noise', type: 'white-noise' as const, icon: '📻' },
    { id: 'pink-noise', name: 'Pink Noise', type: 'white-noise' as const, icon: '📻' },
    { id: 'brown-noise', name: 'Brown Noise', type: 'white-noise' as const, icon: '📻' },
    { id: 'ambient-music', name: 'Ambient Music', type: 'music' as const, icon: '🎵' },
  ]

  const filterPresets = [
    { id: 'soft-blur', name: 'Soft Blur', defaultIntensity: 30 },
    { id: 'glow', name: 'Ethereal Glow', defaultIntensity: 40 },
    { id: 'warm', name: 'Warm Overlay', defaultIntensity: 25 },
    { id: 'cool', name: 'Cool Overlay', defaultIntensity: 25 },
    { id: 'vignette', name: 'Vignette', defaultIntensity: 35 },
    { id: 'grain', name: 'Film Grain', defaultIntensity: 15 },
  ]

  const animationPresets = [
    { id: 'ripple', name: 'Ripple Effect', type: 'ripple' as const, defaultSpeed: 50 },
    { id: 'parallax', name: 'Parallax Motion', type: 'parallax' as const, defaultSpeed: 30 },
    { id: 'breathing', name: 'Breathing Pulse', type: 'breathing' as const, defaultSpeed: 40 },
    { id: 'particles', name: 'Floating Particles', type: 'particles' as const, defaultSpeed: 35 },
    { id: 'drift', name: 'Slow Drift', type: 'drift' as const, defaultSpeed: 25 },
  ]

  const handleCreateScene = () => {
    const newScene: ASMRScene = {
      id: `scene-${Date.now()}`,
      title: `ASMR Scene ${scenes.length + 1}`,
      background: selectedBackground,
      soundLayers: [],
      visualFilters: [],
      animations: [],
      duration: 600, // 10 minutes default
      status: 'editing'
    }

    setScenes([...scenes, newScene])
    setCurrentScene(newScene)
  }

  const handleAddSoundLayer = (sceneId: string, soundPresetId: string) => {
    const preset = soundPresets.find(p => p.id === soundPresetId)
    if (!preset) return

    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        const newLayer: SoundLayer = {
          id: `sound-${Date.now()}`,
          name: preset.name,
          type: preset.type,
          volume: 50,
          enabled: true
        }
        scene.soundLayers.push(newLayer)
      }
      return scene
    }))
  }

  const handleAddVisualFilter = (sceneId: string, filterPresetId: string) => {
    const preset = filterPresets.find(p => p.id === filterPresetId)
    if (!preset) return

    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        const newFilter: VisualFilter = {
          id: `filter-${Date.now()}`,
          name: preset.name,
          enabled: true,
          intensity: preset.defaultIntensity
        }
        scene.visualFilters.push(newFilter)
      }
      return scene
    }))
  }

  const handleAddAnimation = (sceneId: string, animationPresetId: string) => {
    const preset = animationPresets.find(p => p.id === animationPresetId)
    if (!preset) return

    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        const newAnimation: Animation = {
          id: `anim-${Date.now()}`,
          name: preset.name,
          type: preset.type,
          speed: preset.defaultSpeed,
          enabled: true
        }
        scene.animations.push(newAnimation)
      }
      return scene
    }))
  }

  const handleUpdateSoundLayer = (sceneId: string, layerId: string, field: 'volume' | 'enabled', value: number | boolean) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        scene.soundLayers = scene.soundLayers.map(layer => {
          if (layer.id === layerId) {
            return { ...layer, [field]: value }
          }
          return layer
        })
      }
      return scene
    }))
  }

  const handleUpdateFilter = (sceneId: string, filterId: string, field: 'intensity' | 'enabled', value: number | boolean) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        scene.visualFilters = scene.visualFilters.map(filter => {
          if (filter.id === filterId) {
            return { ...filter, [field]: value }
          }
          return filter
        })
      }
      return scene
    }))
  }

  const handleUpdateAnimation = (sceneId: string, animId: string, field: 'speed' | 'enabled', value: number | boolean) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        scene.animations = scene.animations.map(anim => {
          if (anim.id === animId) {
            return { ...anim, [field]: value }
          }
          return anim
        })
      }
      return scene
    }))
  }

  const handleDeleteSoundLayer = (sceneId: string, layerId: string) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        scene.soundLayers = scene.soundLayers.filter(l => l.id !== layerId)
      }
      return scene
    }))
  }

  const handleDeleteFilter = (sceneId: string, filterId: string) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        scene.visualFilters = scene.visualFilters.filter(f => f.id !== filterId)
      }
      return scene
    }))
  }

  const handleDeleteAnimation = (sceneId: string, animId: string) => {
    setScenes(scenes.map(scene => {
      if (scene.id === sceneId) {
        scene.animations = scene.animations.filter(a => a.id !== animId)
      }
      return scene
    }))
  }

  const handleProcessScene = async (sceneId: string) => {
    setIsProcessing(true)

    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    // Simulate processing (generate audio mix, render effects)
    await new Promise(resolve => setTimeout(resolve, 2000))

    scene.status = 'ready'
    setScenes([...scenes])
    setIsProcessing(false)
  }

  const handleStartStream = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    scene.status = 'streaming'
    setScenes([...scenes])
    setStreamMode(true)
    setCurrentScene(scene)
  }

  const handleStopStream = () => {
    if (currentScene) {
      currentScene.status = 'ready'
      setScenes([...scenes])
    }
    setStreamMode(false)
    setCurrentScene(null)
  }

  const handleDeleteScene = (sceneId: string) => {
    setScenes(scenes.filter(s => s.id !== sceneId))
    if (currentScene?.id === sceneId) {
      setCurrentScene(null)
    }
  }

  return (
    <div className="asmr-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>🎧 ASMR Studio</h2>
          <p>Create relaxing ambient content with soundscapes, visual filters, and soothing animations</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{scenes.length}</span>
            <span className="stat-label">Scenes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{scenes.filter(s => s.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat">
            <span className={`stat-value ${streamMode ? 'streaming' : ''}`}>
              {streamMode ? '🔴 LIVE' : '⚫ OFF'}
            </span>
            <span className="stat-label">Stream</span>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          <div className="section">
            <h3>🖼️ Backgrounds</h3>
            <div className="background-grid">
              {backgrounds.map(bg => (
                <div
                  key={bg.id}
                  className={`background-card ${selectedBackground === bg.id ? 'active' : ''}`}
                  onClick={() => setSelectedBackground(bg.id)}
                  style={{ background: bg.preview }}
                >
                  <span className="background-name">{bg.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎬 Actions</h3>
            <button className="create-btn" onClick={handleCreateScene}>
              ➕ Create New Scene
            </button>
            {currentScene && currentScene.status === 'ready' && !streamMode && (
              <button className="stream-btn" onClick={() => handleStartStream(currentScene.id)}>
                🔴 Start Live Stream
              </button>
            )}
            {streamMode && (
              <button className="stop-stream-btn" onClick={handleStopStream}>
                ⏹️ Stop Stream
              </button>
            )}
          </div>

          <div className="section">
            <h3>💡 Tips</h3>
            <ul className="tips-list">
              <li>Layer multiple sounds for richer soundscapes</li>
              <li>Use filters to create mood and atmosphere</li>
              <li>Subtle animations enhance relaxation</li>
              <li>Stream mode supports 24/7 content</li>
            </ul>
          </div>
        </div>

        <div className="studio-main">
          {scenes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎧</div>
              <h3>No Scenes Yet</h3>
              <p>Create a new ASMR scene to start building your relaxing content</p>
            </div>
          ) : (
            <div className="scenes-list">
              {scenes.map(scene => (
                <div key={scene.id} className={`scene-card ${currentScene?.id === scene.id ? 'active' : ''}`}>
                  <div className="scene-header">
                    <input
                      type="text"
                      className="scene-title-input"
                      value={scene.title}
                      onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, title: e.target.value } : s))}
                      placeholder="Scene title..."
                    />
                    <div className="scene-actions">
                      <button
                        className="icon-btn"
                        onClick={() => handleProcessScene(scene.id)}
                        disabled={scene.status === 'ready' || scene.status === 'streaming'}
                      >
                        {scene.status === 'ready' ? '✓' : scene.status === 'streaming' ? '🔴' : '▶️'}
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDeleteScene(scene.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="scene-preview" style={{ background: backgrounds.find(b => b.id === scene.background)?.preview }}>
                    <div className="preview-info">
                      <span>{backgrounds.find(b => b.id === scene.background)?.name}</span>
                      <span>•</span>
                      <span>{Math.floor(scene.duration / 60)}:{(scene.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="scene-controls">
                    {/* Sound Layers */}
                    <div className="control-section">
                      <div className="control-header">
                        <h4>🔊 Sound Layers</h4>
                        <select
                          className="add-select"
                          onChange={e => {
                            if (e.target.value) {
                              handleAddSoundLayer(scene.id, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        >
                          <option value="">+ Add Sound</option>
                          {soundPresets.map(preset => (
                            <option key={preset.id} value={preset.id}>
                              {preset.icon} {preset.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="layers-list">
                        {scene.soundLayers.map(layer => (
                          <div key={layer.id} className="layer-item">
                            <div className="layer-info">
                              <label className="layer-checkbox">
                                <input
                                  type="checkbox"
                                  checked={layer.enabled}
                                  onChange={e => handleUpdateSoundLayer(scene.id, layer.id, 'enabled', e.target.checked)}
                                />
                                <span>{layer.name}</span>
                              </label>
                              <button
                                className="layer-delete"
                                onClick={() => handleDeleteSoundLayer(scene.id, layer.id)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="layer-slider">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={layer.volume}
                                onChange={e => handleUpdateSoundLayer(scene.id, layer.id, 'volume', parseInt(e.target.value))}
                                disabled={!layer.enabled}
                              />
                              <span className="slider-value">{layer.volume}%</span>
                            </div>
                          </div>
                        ))}
                        {scene.soundLayers.length === 0 && (
                          <p className="empty-text">No sounds added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Visual Filters */}
                    <div className="control-section">
                      <div className="control-header">
                        <h4>✨ Visual Filters</h4>
                        <select
                          className="add-select"
                          onChange={e => {
                            if (e.target.value) {
                              handleAddVisualFilter(scene.id, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        >
                          <option value="">+ Add Filter</option>
                          {filterPresets.map(preset => (
                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="layers-list">
                        {scene.visualFilters.map(filter => (
                          <div key={filter.id} className="layer-item">
                            <div className="layer-info">
                              <label className="layer-checkbox">
                                <input
                                  type="checkbox"
                                  checked={filter.enabled}
                                  onChange={e => handleUpdateFilter(scene.id, filter.id, 'enabled', e.target.checked)}
                                />
                                <span>{filter.name}</span>
                              </label>
                              <button
                                className="layer-delete"
                                onClick={() => handleDeleteFilter(scene.id, filter.id)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="layer-slider">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={filter.intensity}
                                onChange={e => handleUpdateFilter(scene.id, filter.id, 'intensity', parseInt(e.target.value))}
                                disabled={!filter.enabled}
                              />
                              <span className="slider-value">{filter.intensity}%</span>
                            </div>
                          </div>
                        ))}
                        {scene.visualFilters.length === 0 && (
                          <p className="empty-text">No filters added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Animations */}
                    <div className="control-section">
                      <div className="control-header">
                        <h4>🌊 Animations</h4>
                        <select
                          className="add-select"
                          onChange={e => {
                            if (e.target.value) {
                              handleAddAnimation(scene.id, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        >
                          <option value="">+ Add Animation</option>
                          {animationPresets.map(preset => (
                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="layers-list">
                        {scene.animations.map(anim => (
                          <div key={anim.id} className="layer-item">
                            <div className="layer-info">
                              <label className="layer-checkbox">
                                <input
                                  type="checkbox"
                                  checked={anim.enabled}
                                  onChange={e => handleUpdateAnimation(scene.id, anim.id, 'enabled', e.target.checked)}
                                />
                                <span>{anim.name}</span>
                              </label>
                              <button
                                className="layer-delete"
                                onClick={() => handleDeleteAnimation(scene.id, anim.id)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="layer-slider">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={anim.speed}
                                onChange={e => handleUpdateAnimation(scene.id, anim.id, 'speed', parseInt(e.target.value))}
                                disabled={!anim.enabled}
                              />
                              <span className="slider-value">{anim.speed}%</span>
                            </div>
                          </div>
                        ))}
                        {scene.animations.length === 0 && (
                          <p className="empty-text">No animations added yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="scene-footer">
                    <div className={`status-badge ${scene.status}`}>
                      {scene.status === 'editing' && '✏️ Editing'}
                      {scene.status === 'ready' && '✓ Ready'}
                      {scene.status === 'streaming' && '🔴 Live Streaming'}
                    </div>
                    <div className="duration-control">
                      <label>Duration:</label>
                      <input
                        type="number"
                        value={scene.duration}
                        onChange={e => setScenes(scenes.map(s => s.id === scene.id ? { ...s, duration: parseInt(e.target.value) || 600 } : s))}
                        min="60"
                        max="86400"
                      />
                      <span>sec</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {scenes.length > 0 && !streamMode && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={() => scenes.filter(s => s.status === 'editing').forEach(s => handleProcessScene(s.id))}
                disabled={isProcessing || scenes.filter(s => s.status === 'editing').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${scenes.filter(s => s.status === 'editing').length} Scene(s)`}
              </button>
              <button
                className="export-btn"
                disabled={scenes.filter(s => s.status === 'ready').length === 0}
              >
                📤 Export {scenes.filter(s => s.status === 'ready').length} Scene(s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

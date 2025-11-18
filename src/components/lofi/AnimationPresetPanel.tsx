/**
 * Animation Preset Panel
 * Apply one-click animation presets to scene elements
 * No manual keyframe editing required - just sliders and toggles
 */

import { useState } from 'react'
import { useLofiStore, AnimationPreset } from '../../stores/lofiStore'
import './AnimationPresetPanel.css'

interface AnimationPresetPanelProps {
  elementId?: string // If provided, shows presets for this element
}

export default function AnimationPresetPanel({ elementId }: AnimationPresetPanelProps) {
  const {
    animationPresets,
    selectedElement,
    currentScene,
    applyAnimationPreset,
    removeAnimation,
  } = useLofiStore()

  const [selectedCategory, setSelectedCategory] = useState<
    'All' | 'Motion' | 'Effects' | 'Transitions'
  >('All')
  const [searchQuery, setSearchQuery] = useState('')

  const targetElementId = elementId || selectedElement

  // Get the target element
  const targetElement = currentScene
    ? [
        currentScene.background,
        ...currentScene.characters,
        ...currentScene.props,
        ...currentScene.overlays,
        currentScene.foreground,
      ]
        .filter(Boolean)
        .find((el) => el?.id === targetElementId)
    : null

  // Filter presets
  const filteredPresets = animationPresets.filter((preset) => {
    if (selectedCategory !== 'All' && preset.category !== selectedCategory) return false
    if (searchQuery && !preset.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false
    return true
  })

  const isPresetApplied = (presetId: string) => {
    return targetElement?.animations.includes(presetId) || false
  }

  const handleTogglePreset = (preset: AnimationPreset) => {
    if (!targetElementId) return

    if (isPresetApplied(preset.id)) {
      removeAnimation(targetElementId, preset.id)
    } else {
      applyAnimationPreset(targetElementId, preset.id)
    }
  }

  return (
    <div className="animation-preset-panel">
      {/* Header */}
      <div className="panel-header">
        <h3>✨ Animation Presets</h3>
        <p className="panel-subtitle">
          {targetElement
            ? `Animating: ${targetElement.name}`
            : 'Select an element to apply animations'}
        </p>
      </div>

      {/* Search and filters */}
      <div className="preset-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search animations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {(['All', 'Motion', 'Effects', 'Transitions'] as const).map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Preset list */}
      <div className="preset-list">
        {!targetElement ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <p>No element selected</p>
            <p className="hint">Select an element on the canvas to apply animations</p>
          </div>
        ) : filteredPresets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No presets found</p>
            <p className="hint">Try adjusting your filters</p>
          </div>
        ) : (
          filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isApplied={isPresetApplied(preset.id)}
              onToggle={() => handleTogglePreset(preset)}
            />
          ))
        )}
      </div>

      {/* Quick tips */}
      {targetElement && (
        <div className="tips-section">
          <div className="tip">
            💡 <strong>Tip:</strong> You can apply multiple animations to the same element
          </div>
          <div className="tip">
            🎨 <strong>Pro tip:</strong> Combine motion presets with effect presets for more
            dynamic scenes
          </div>
        </div>
      )}
    </div>
  )
}

// Preset card component
interface PresetCardProps {
  preset: AnimationPreset
  isApplied: boolean
  onToggle: () => void
}

function PresetCard({ preset, isApplied, onToggle }: PresetCardProps) {
  const [showSettings, setShowSettings] = useState(false)

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Motion':
        return '🏃'
      case 'Effects':
        return '✨'
      case 'Transitions':
        return '🎬'
      default:
        return '🎨'
    }
  }

  // Get preset-specific settings UI
  const renderPresetSettings = () => {
    const { preset_type } = preset

    if ('type' in preset_type) {
      switch (preset_type.type) {
        case 'Breathing':
          return (
            <>
              <div className="setting">
                <label>Amplitude</label>
                <input
                  type="range"
                  min="0"
                  max="0.2"
                  step="0.01"
                  defaultValue={preset_type.amplitude}
                />
                <span>{(preset_type.amplitude * 100).toFixed(0)}%</span>
              </div>
              <div className="setting">
                <label>Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  defaultValue={preset_type.speed}
                />
                <span>{preset_type.speed.toFixed(1)}x</span>
              </div>
            </>
          )

        case 'Blinking':
          return (
            <>
              <div className="setting">
                <label>Frequency</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  defaultValue={preset_type.frequency}
                />
                <span>{preset_type.frequency.toFixed(1)}/min</span>
              </div>
              <div className="setting">
                <label>Duration</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  defaultValue={preset_type.duration}
                />
                <span>{(preset_type.duration * 1000).toFixed(0)}ms</span>
              </div>
            </>
          )

        case 'Rain':
          return (
            <>
              <div className="setting">
                <label>Density</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  defaultValue={preset_type.density}
                />
                <span>{preset_type.density}</span>
              </div>
              <div className="setting">
                <label>Angle</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  defaultValue={preset_type.angle}
                />
                <span>{preset_type.angle}°</span>
              </div>
              <div className="setting">
                <label>Speed</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  defaultValue={preset_type.speed}
                />
                <span>{preset_type.speed}px/s</span>
              </div>
            </>
          )

        case 'Float':
          return (
            <>
              <div className="setting">
                <label>Amplitude</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  defaultValue={preset_type.amplitude}
                />
                <span>{preset_type.amplitude}px</span>
              </div>
              <div className="setting">
                <label>Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  defaultValue={preset_type.speed}
                />
                <span>{preset_type.speed.toFixed(1)}x</span>
              </div>
            </>
          )

        case 'Glow':
          return (
            <>
              <div className="setting">
                <label>Intensity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue={preset_type.intensity}
                />
                <span>{(preset_type.intensity * 100).toFixed(0)}%</span>
              </div>
              <div className="setting">
                <label>Color</label>
                <input
                  type="color"
                  defaultValue={`#${preset_type.color
                    .map((c) => c.toString(16).padStart(2, '0'))
                    .join('')}`}
                />
              </div>
            </>
          )

        case 'Fade':
          return (
            <div className="setting">
              <label>Duration</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                defaultValue={preset_type.duration}
              />
              <span>{preset_type.duration.toFixed(1)}s</span>
            </div>
          )

        case 'Slide':
          return (
            <>
              <div className="setting">
                <label>Direction</label>
                <select defaultValue={preset_type.direction}>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                  <option value="Up">Up</option>
                  <option value="Down">Down</option>
                </select>
              </div>
              <div className="setting">
                <label>Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  defaultValue={preset_type.speed}
                />
                <span>{preset_type.speed.toFixed(1)}x</span>
              </div>
            </>
          )

        case 'Rotate':
          return (
            <>
              <div className="setting">
                <label>Speed</label>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  defaultValue={preset_type.speed}
                />
                <span>{preset_type.speed}°/s</span>
              </div>
              <div className="setting">
                <label>Direction</label>
                <select defaultValue={preset_type.clockwise ? 'clockwise' : 'counter'}>
                  <option value="clockwise">Clockwise</option>
                  <option value="counter">Counter-clockwise</option>
                </select>
              </div>
            </>
          )

        case 'Bounce':
          return (
            <>
              <div className="setting">
                <label>Amplitude</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  defaultValue={preset_type.amplitude}
                />
                <span>{preset_type.amplitude}px</span>
              </div>
              <div className="setting">
                <label>Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  defaultValue={preset_type.speed}
                />
                <span>{preset_type.speed.toFixed(1)}x</span>
              </div>
            </>
          )

        default:
          return null
      }
    }

    return null
  }

  return (
    <div className={`preset-card ${isApplied ? 'applied' : ''}`}>
      <div className="preset-header">
        <div className="preset-info">
          <span className="preset-icon">{getCategoryIcon(preset.category)}</span>
          <div className="preset-text">
            <h4>{preset.name}</h4>
            <p>{preset.description}</p>
          </div>
        </div>

        <div className="preset-actions">
          {isApplied && (
            <button
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              ⚙️
            </button>
          )}
          <button
            className={`toggle-button ${isApplied ? 'active' : ''}`}
            onClick={onToggle}
            title={isApplied ? 'Remove' : 'Apply'}
          >
            {isApplied ? '✓' : '+'}
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {isApplied && showSettings && (
        <div className="preset-settings">{renderPresetSettings()}</div>
      )}

      {/* Category badge */}
      <div className="preset-footer">
        <span className="category-badge">{preset.category}</span>
        {isApplied && <span className="applied-badge">Applied</span>}
      </div>
    </div>
  )
}

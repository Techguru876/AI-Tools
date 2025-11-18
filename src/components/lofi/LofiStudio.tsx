/**
 * Lofi Studio - Main Workspace Component
 * Complete lofi video creation workspace integrating:
 * - Drag-and-drop canvas
 * - Template library
 * - Animation presets
 * - Asset management
 * - Export automation
 * - Zero technical skill required - guided workflow
 */

import { useState } from 'react'
import { useLofiStore } from '../../stores/lofiStore'
import LofiCanvas from './LofiCanvas'
import TemplateLibrary from './TemplateLibrary'
import AnimationPresetPanel from './AnimationPresetPanel'
import AssetLibrary from './AssetLibrary'
import ExportAutomation from './ExportAutomation'
import './LofiStudio.css'

type ActivePanel = 'canvas' | 'templates' | 'animations' | 'assets' | 'export' | 'wizard'

export default function LofiStudio() {
  const {
    currentScene,
    createNewScene,
    selectedElement,
    mode,
    setMode,
    isPlaying,
    play,
    pause,
    stop,
    currentTime,
    undo,
    redo,
    sceneHistory,
    historyIndex,
  } = useLofiStore()

  const [activePanel, setActivePanel] = useState<ActivePanel>('canvas')
  const [showWelcome, setShowWelcome] = useState(!currentScene)

  // Handle welcome screen actions
  const handleNewScene = () => {
    createNewScene('Untitled Scene')
    setShowWelcome(false)
    setActivePanel('canvas')
  }

  const handleBrowseTemplates = () => {
    setShowWelcome(false)
    setActivePanel('templates')
  }

  // Playback controls
  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="lofi-studio-welcome">
        <div className="welcome-content">
          <div className="welcome-hero">
            <div className="hero-icon">🎵</div>
            <h1>Welcome to Lofi Studio</h1>
            <p className="hero-subtitle">
              Create beautiful lofi videos with zero technical skills
            </p>
          </div>

          <div className="welcome-actions">
            <button className="action-card primary" onClick={handleNewScene}>
              <div className="action-icon">✨</div>
              <h3>Start from Scratch</h3>
              <p>Build your scene from the ground up</p>
            </button>

            <button className="action-card" onClick={handleBrowseTemplates}>
              <div className="action-icon">📚</div>
              <h3>Choose a Template</h3>
              <p>Start with a professional preset</p>
            </button>

            <button className="action-card">
              <div className="action-icon">🎓</div>
              <h3>Take a Tour</h3>
              <p>Learn the basics in 5 minutes</p>
            </button>
          </div>

          <div className="welcome-features">
            <div className="feature">
              <span>🎨</span>
              <span>Drag & Drop Scene Builder</span>
            </div>
            <div className="feature">
              <span>✨</span>
              <span>One-Click Animations</span>
            </div>
            <div className="feature">
              <span>🤖</span>
              <span>AI-Powered Tools</span>
            </div>
            <div className="feature">
              <span>📤</span>
              <span>Export to Any Platform</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main workspace
  return (
    <div className="lofi-studio">
      {/* Top toolbar */}
      <div className="lofi-toolbar">
        <div className="toolbar-left">
          <h2 className="scene-title">{currentScene?.name || 'Lofi Studio'}</h2>
          <div className="mode-toggle">
            <button
              className={`mode-button ${mode === 'beginner' ? 'active' : ''}`}
              onClick={() => setMode('beginner')}
              title="Beginner Mode - Simplified controls"
            >
              🎓 Beginner
            </button>
            <button
              className={`mode-button ${mode === 'advanced' ? 'active' : ''}`}
              onClick={() => setMode('advanced')}
              title="Advanced Mode - Full control"
            >
              ⚡ Advanced
            </button>
          </div>
        </div>

        <div className="toolbar-center">
          {/* Playback controls */}
          <div className="playback-controls">
            <button onClick={stop} title="Stop" disabled={!isPlaying && currentTime === 0}>
              ⏹️
            </button>
            <button onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <span className="time-display">{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="toolbar-right">
          {/* History controls */}
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            disabled={historyIndex <= 0}
            className="icon-button"
          >
            ↶
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            disabled={historyIndex >= sceneHistory.length - 1}
            className="icon-button"
          >
            ↷
          </button>

          {/* Export button */}
          <button
            className="export-button-toolbar"
            onClick={() => setActivePanel('export')}
            title="Export Scene"
          >
            📤 Export
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="lofi-content">
        {/* Left sidebar - Navigation */}
        <div className="lofi-sidebar-left">
          <div className="sidebar-nav">
            <button
              className={`nav-button ${activePanel === 'canvas' ? 'active' : ''}`}
              onClick={() => setActivePanel('canvas')}
              title="Canvas"
            >
              <span className="nav-icon">🎨</span>
              <span className="nav-label">Canvas</span>
            </button>

            <button
              className={`nav-button ${activePanel === 'templates' ? 'active' : ''}`}
              onClick={() => setActivePanel('templates')}
              title="Templates"
            >
              <span className="nav-icon">📚</span>
              <span className="nav-label">Templates</span>
            </button>

            <button
              className={`nav-button ${activePanel === 'animations' ? 'active' : ''}`}
              onClick={() => setActivePanel('animations')}
              title="Animations"
            >
              <span className="nav-icon">✨</span>
              <span className="nav-label">Animations</span>
            </button>

            <button
              className={`nav-button ${activePanel === 'assets' ? 'active' : ''}`}
              onClick={() => setActivePanel('assets')}
              title="Assets"
            >
              <span className="nav-icon">📦</span>
              <span className="nav-label">Assets</span>
            </button>

            {mode === 'beginner' && (
              <button
                className={`nav-button ${activePanel === 'wizard' ? 'active' : ''}`}
                onClick={() => setActivePanel('wizard')}
                title="Guided Wizard"
              >
                <span className="nav-icon">🧙</span>
                <span className="nav-label">Wizard</span>
              </button>
            )}
          </div>
        </div>

        {/* Center panel - Main workspace */}
        <div className="lofi-main-panel">
          {activePanel === 'canvas' && (
            <div className="canvas-container">
              <LofiCanvas width={1920} height={1080} showGrid={true} showGuides={true} />
            </div>
          )}

          {activePanel === 'templates' && (
            <TemplateLibrary onClose={() => setActivePanel('canvas')} />
          )}

          {activePanel === 'animations' && <AnimationPresetPanel />}

          {activePanel === 'assets' && <AssetLibrary />}

          {activePanel === 'export' && <ExportAutomation />}

          {activePanel === 'wizard' && (
            <div className="wizard-panel">
              <div className="wizard-content">
                <h2>🧙 Guided Wizard</h2>
                <p>Step-by-step workflow coming soon!</p>
                <div className="wizard-steps">
                  <div className="wizard-step">
                    <span className="step-number">1</span>
                    <span className="step-label">Choose Template or Start Fresh</span>
                  </div>
                  <div className="wizard-step">
                    <span className="step-number">2</span>
                    <span className="step-label">Customize Your Scene</span>
                  </div>
                  <div className="wizard-step">
                    <span className="step-number">3</span>
                    <span className="step-label">Add Music & Animations</span>
                  </div>
                  <div className="wizard-step">
                    <span className="step-number">4</span>
                    <span className="step-label">Preview & Export</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar - Properties/Info */}
        {selectedElement && activePanel === 'canvas' && (
          <div className="lofi-sidebar-right">
            <div className="properties-panel">
              <h3>Element Properties</h3>
              <div className="property-section">
                <label>Name</label>
                <input
                  type="text"
                  defaultValue={
                    [
                      currentScene?.background,
                      ...(currentScene?.characters || []),
                      ...(currentScene?.props || []),
                      ...(currentScene?.overlays || []),
                      currentScene?.foreground,
                    ]
                      .filter(Boolean)
                      .find((el) => el?.id === selectedElement)?.name || ''
                  }
                  readOnly
                />
              </div>

              <div className="property-grid">
                <div className="property">
                  <label>X Position</label>
                  <input type="number" defaultValue={0} />
                </div>
                <div className="property">
                  <label>Y Position</label>
                  <input type="number" defaultValue={0} />
                </div>
                <div className="property">
                  <label>Scale</label>
                  <input type="number" min="0" step="0.1" defaultValue={1} />
                </div>
                <div className="property">
                  <label>Rotation</label>
                  <input type="number" min="0" max="360" defaultValue={0} />
                </div>
                <div className="property">
                  <label>Opacity</label>
                  <input type="number" min="0" max="1" step="0.1" defaultValue={1} />
                </div>
              </div>

              <button className="quick-animate-button">
                ✨ Quick Animate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint bar */}
      {mode === 'beginner' && (
        <div className="hint-bar">
          <span className="hint-icon">💡</span>
          <span className="hint-text">
            {activePanel === 'canvas' && 'Click on the canvas to select elements, drag to move them'}
            {activePanel === 'templates' && 'Choose a template to start with a professional preset'}
            {activePanel === 'animations' && 'Select an element first, then apply animations with one click'}
            {activePanel === 'assets' && 'Import your own files or generate assets with AI'}
            {activePanel === 'export' && 'Choose a platform preset or customize your export settings'}
          </span>
        </div>
      )}
    </div>
  )
}

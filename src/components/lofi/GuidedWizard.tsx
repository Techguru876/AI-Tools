/**
 * Guided Wizard Component
 * Full step-by-step workflow for creating lofi videos
 * Perfect for beginners - walks through entire process
 */

import { useState } from 'react'
import { useLofiStore, LofiTemplate, AnimationPreset, MusicTrack } from '../../stores/lofiStore'
import './GuidedWizard.css'

type WizardStep = 'welcome' | 'choose-start' | 'customize' | 'add-music' | 'add-animations' | 'preview' | 'export' | 'complete'

interface WizardState {
  currentStep: WizardStep
  selectedTemplate?: LofiTemplate
  startFromScratch: boolean
  hasMusic: boolean
  hasAnimations: boolean
  isExporting: boolean
  exportComplete: boolean
}

export default function GuidedWizard() {
  const {
    currentScene,
    createNewScene,
    applyTemplate,
    setMusicTrack,
    applyAnimationPreset,
    selectedElement,
    animationPresets,
  } = useLofiStore()

  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 'welcome',
    startFromScratch: false,
    hasMusic: false,
    hasAnimations: false,
    isExporting: false,
    exportComplete: false,
  })

  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrack | null>(null)
  const [selectedAnimations, setSelectedAnimations] = useState<string[]>([])

  // Navigation
  const goToStep = (step: WizardStep) => {
    setWizardState({ ...wizardState, currentStep: step })
  }

  const nextStep = () => {
    const steps: WizardStep[] = [
      'welcome',
      'choose-start',
      'customize',
      'add-music',
      'add-animations',
      'preview',
      'export',
      'complete',
    ]
    const currentIndex = steps.indexOf(wizardState.currentStep)
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: WizardStep[] = [
      'welcome',
      'choose-start',
      'customize',
      'add-music',
      'add-animations',
      'preview',
      'export',
      'complete',
    ]
    const currentIndex = steps.indexOf(wizardState.currentStep)
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1])
    }
  }

  // Step handlers
  const handleStartFromScratch = () => {
    createNewScene('My Lofi Scene')
    setWizardState({ ...wizardState, startFromScratch: true })
    nextStep()
  }

  const handleSelectTemplate = (template: LofiTemplate) => {
    applyTemplate(template)
    setWizardState({ ...wizardState, selectedTemplate: template, startFromScratch: false })
    nextStep()
  }

  const handleAddMusic = () => {
    if (selectedMusicTrack) {
      setMusicTrack(selectedMusicTrack)
      setWizardState({ ...wizardState, hasMusic: true })
    }
    nextStep()
  }

  const handleAddAnimations = () => {
    selectedAnimations.forEach((presetId) => {
      if (selectedElement) {
        applyAnimationPreset(selectedElement, presetId)
      }
    })
    setWizardState({ ...wizardState, hasAnimations: true })
    nextStep()
  }

  const handleExport = async () => {
    setWizardState({ ...wizardState, isExporting: true })
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setWizardState({ ...wizardState, isExporting: false, exportComplete: true })
    nextStep()
  }

  const handleRestart = () => {
    setWizardState({
      currentStep: 'welcome',
      startFromScratch: false,
      hasMusic: false,
      hasAnimations: false,
      isExporting: false,
      exportComplete: false,
    })
    setSelectedMusicTrack(null)
    setSelectedAnimations([])
  }

  // Mock templates for wizard
  const quickTemplates: LofiTemplate[] = [
    {
      id: 'wizard-cozy',
      name: 'Cozy Study Room',
      description: 'Perfect for study beats',
      category: 'CozyRoom',
      thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      scene: {
        id: 'scene-wizard-1',
        name: 'Cozy Study Room',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [],
      tags: ['cozy', 'study', 'warm'],
      popularity: 1500,
    },
    {
      id: 'wizard-rain',
      name: 'Rainy Window',
      description: 'Chill rainy vibes',
      category: 'RainyWindow',
      thumbnail: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      scene: {
        id: 'scene-wizard-2',
        name: 'Rainy Window',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [],
      tags: ['rain', 'chill', 'relaxing'],
      popularity: 2000,
    },
    {
      id: 'wizard-city',
      name: 'City Nights',
      description: 'Urban lofi atmosphere',
      category: 'Cityscape',
      thumbnail: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      scene: {
        id: 'scene-wizard-3',
        name: 'City Nights',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [],
      tags: ['city', 'urban', 'night'],
      popularity: 1800,
    },
  ]

  // Progress indicator
  const getProgress = () => {
    const steps: WizardStep[] = [
      'welcome',
      'choose-start',
      'customize',
      'add-music',
      'add-animations',
      'preview',
      'export',
      'complete',
    ]
    const currentIndex = steps.indexOf(wizardState.currentStep)
    return Math.round(((currentIndex + 1) / steps.length) * 100)
  }

  return (
    <div className="guided-wizard">
      {/* Progress bar */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
        </div>
        <span className="progress-text">{getProgress()}% Complete</span>
      </div>

      {/* Step content */}
      <div className="wizard-content">
        {/* Step 1: Welcome */}
        {wizardState.currentStep === 'welcome' && (
          <div className="wizard-step-content">
            <div className="step-hero">
              <div className="step-icon">🧙</div>
              <h1>Welcome to the Lofi Video Creator!</h1>
              <p className="step-subtitle">
                I'll guide you through creating your first lofi video in just a few easy steps.
                <br />
                No technical skills needed - just follow along!
              </p>
            </div>

            <div className="step-features">
              <div className="feature-item">
                <span className="feature-icon">⏱️</span>
                <span className="feature-text">5 minutes to complete</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <span className="feature-text">Beautiful templates included</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span className="feature-text">One-click animations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📤</span>
                <span className="feature-text">Export ready for YouTube</span>
              </div>
            </div>

            <button className="wizard-button primary large" onClick={nextStep}>
              Let's Get Started! 🚀
            </button>
          </div>
        )}

        {/* Step 2: Choose Starting Point */}
        {wizardState.currentStep === 'choose-start' && (
          <div className="wizard-step-content">
            <div className="step-header">
              <h2>Step 1: Choose Your Starting Point</h2>
              <p>Would you like to start with a template or build from scratch?</p>
            </div>

            <div className="choice-cards">
              <div className="choice-card large">
                <div className="choice-icon">📚</div>
                <h3>Use a Template</h3>
                <p>Start with a professionally designed scene (Recommended for beginners)</p>

                <div className="template-previews">
                  {quickTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="template-preview-card"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div
                        className="template-preview-thumb"
                        style={{ background: template.thumbnail }}
                      />
                      <span className="template-preview-name">{template.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="choice-divider">OR</div>

              <div className="choice-card">
                <div className="choice-icon">✨</div>
                <h3>Start from Scratch</h3>
                <p>Build your scene from the ground up with full creative control</p>
                <button className="wizard-button secondary" onClick={handleStartFromScratch}>
                  Create Blank Scene
                </button>
              </div>
            </div>

            <div className="wizard-nav">
              <button className="wizard-button" onClick={prevStep}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customize Scene */}
        {wizardState.currentStep === 'customize' && (
          <div className="wizard-step-content">
            <div className="step-header">
              <h2>Step 2: Customize Your Scene</h2>
              <p>
                {wizardState.selectedTemplate
                  ? `Great choice! You can customize the "${wizardState.selectedTemplate.name}" template.`
                  : 'Add elements to your scene using the canvas.'}
              </p>
            </div>

            <div className="customize-area">
              <div className="customize-preview">
                <div className="preview-box">
                  <div className="preview-placeholder">
                    <span className="placeholder-icon">🎨</span>
                    <span className="placeholder-text">
                      Your scene will appear here
                      <br />
                      (Canvas integration)
                    </span>
                  </div>
                </div>
              </div>

              <div className="customize-tips">
                <h4>💡 Quick Tips:</h4>
                <ul>
                  <li>Click elements to select them</li>
                  <li>Drag elements to reposition</li>
                  <li>Use the properties panel to adjust size and rotation</li>
                  <li>Add new elements from the Assets panel</li>
                </ul>
              </div>
            </div>

            <div className="wizard-nav">
              <button className="wizard-button" onClick={prevStep}>
                ← Back
              </button>
              <button className="wizard-button primary" onClick={nextStep}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Add Music */}
        {wizardState.currentStep === 'add-music' && (
          <div className="wizard-step-content">
            <div className="step-header">
              <h2>Step 3: Add Background Music</h2>
              <p>Choose a lofi beat to set the mood</p>
            </div>

            <div className="music-selection">
              <div className="music-options">
                <div className="music-option-card">
                  <div className="option-icon">🎼</div>
                  <h4>Generate with AI</h4>
                  <p>Create a unique lofi beat with Suno AI</p>
                  <button className="wizard-button secondary">Generate Music</button>
                </div>

                <div className="music-option-card">
                  <div className="option-icon">📁</div>
                  <h4>Upload Your Own</h4>
                  <p>Use your own audio file</p>
                  <input
                    type="file"
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="music-upload"
                  />
                  <label htmlFor="music-upload" className="wizard-button secondary">
                    Choose File
                  </label>
                </div>

                <div className="music-option-card">
                  <div className="option-icon">📚</div>
                  <h4>Browse Library</h4>
                  <p>Select from our collection</p>
                  <button className="wizard-button secondary">Browse Tracks</button>
                </div>
              </div>

              {selectedMusicTrack && (
                <div className="selected-music">
                  <div className="music-player">
                    <div className="player-icon">🎵</div>
                    <div className="player-info">
                      <strong>{selectedMusicTrack.title}</strong>
                      <span>{selectedMusicTrack.artist}</span>
                    </div>
                    <button className="player-button">▶️</button>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-nav">
              <button className="wizard-button" onClick={prevStep}>
                ← Back
              </button>
              <button className="wizard-button primary" onClick={handleAddMusic}>
                Continue →
              </button>
              <button className="wizard-button tertiary" onClick={nextStep}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Add Animations */}
        {wizardState.currentStep === 'add-animations' && (
          <div className="wizard-step-content">
            <div className="step-header">
              <h2>Step 4: Add Animations</h2>
              <p>Bring your scene to life with one-click animations</p>
            </div>

            <div className="animation-selection">
              <div className="animation-grid">
                {animationPresets.slice(0, 6).map((preset) => (
                  <div
                    key={preset.id}
                    className={`animation-card ${
                      selectedAnimations.includes(preset.id) ? 'selected' : ''
                    }`}
                    onClick={() => {
                      if (selectedAnimations.includes(preset.id)) {
                        setSelectedAnimations(selectedAnimations.filter((id) => id !== preset.id))
                      } else {
                        setSelectedAnimations([...selectedAnimations, preset.id])
                      }
                    }}
                  >
                    <div className="animation-icon">
                      {preset.category === 'Motion' && '🏃'}
                      {preset.category === 'Effects' && '✨'}
                      {preset.category === 'Transitions' && '🎬'}
                    </div>
                    <h4>{preset.name}</h4>
                    <p>{preset.description}</p>
                    {selectedAnimations.includes(preset.id) && (
                      <div className="selected-badge">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="animation-tip">
                💡 <strong>Tip:</strong> You can select multiple animations. They'll be applied to
                your elements automatically.
              </div>
            </div>

            <div className="wizard-nav">
              <button className="wizard-button" onClick={prevStep}>
                ← Back
              </button>
              <button className="wizard-button primary" onClick={handleAddAnimations}>
                Continue →
              </button>
              <button className="wizard-button tertiary" onClick={nextStep}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Preview */}
        {wizardState.currentStep === 'preview' && (
          <div className="wizard-step-content">
            <div className="step-header">
              <h2>Step 5: Preview Your Creation</h2>
              <p>See how your lofi video looks before exporting</p>
            </div>

            <div className="preview-section">
              <div className="preview-player">
                <div className="player-screen">
                  <div className="screen-placeholder">
                    <span className="placeholder-icon">▶️</span>
                    <span className="placeholder-text">Preview playback</span>
                  </div>
                </div>

                <div className="player-controls">
                  <button className="control-button">⏮️</button>
                  <button className="control-button large">▶️</button>
                  <button className="control-button">⏭️</button>
                </div>

                <div className="timeline">
                  <div className="timeline-bar">
                    <div className="timeline-progress" style={{ width: '30%' }} />
                  </div>
                  <div className="timeline-time">0:18 / 1:00</div>
                </div>
              </div>

              <div className="preview-details">
                <h4>Scene Summary</h4>
                <div className="summary-item">
                  <span className="summary-label">Template:</span>
                  <span className="summary-value">
                    {wizardState.selectedTemplate?.name || 'Custom Scene'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Music:</span>
                  <span className="summary-value">
                    {wizardState.hasMusic ? '✓ Added' : '✗ Not added'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Animations:</span>
                  <span className="summary-value">
                    {selectedAnimations.length} preset{selectedAnimations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="wizard-nav">
              <button className="wizard-button" onClick={prevStep}>
                ← Back to Edit
              </button>
              <button className="wizard-button primary" onClick={nextStep}>
                Looks Good! Export →
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Export */}
        {wizardState.currentStep === 'export' && (
          <div className="wizard-step-content">
            <div className="step-header">
              <h2>Step 6: Export Your Video</h2>
              <p>Choose your export settings</p>
            </div>

            <div className="export-section">
              <div className="export-presets">
                <div className="export-preset-card">
                  <div className="preset-header">
                    <span className="preset-platform-icon">📺</span>
                    <h4>YouTube</h4>
                  </div>
                  <p>1080p • 30fps • 16:9</p>
                  <button className="wizard-button secondary" onClick={handleExport}>
                    Export for YouTube
                  </button>
                </div>

                <div className="export-preset-card">
                  <div className="preset-header">
                    <span className="preset-platform-icon">🎵</span>
                    <h4>TikTok</h4>
                  </div>
                  <p>1080p • 30fps • 9:16</p>
                  <button className="wizard-button secondary" onClick={handleExport}>
                    Export for TikTok
                  </button>
                </div>

                <div className="export-preset-card">
                  <div className="preset-header">
                    <span className="preset-platform-icon">📸</span>
                    <h4>Instagram</h4>
                  </div>
                  <p>1080p • 30fps • 1:1</p>
                  <button className="wizard-button secondary" onClick={handleExport}>
                    Export for Instagram
                  </button>
                </div>
              </div>

              {wizardState.isExporting && (
                <div className="export-progress">
                  <div className="export-spinner" />
                  <p>Exporting your video... This may take a few minutes.</p>
                  <div className="export-progress-bar">
                    <div className="export-progress-fill" />
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-nav">
              <button className="wizard-button" onClick={prevStep} disabled={wizardState.isExporting}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Complete */}
        {wizardState.currentStep === 'complete' && (
          <div className="wizard-step-content">
            <div className="step-hero">
              <div className="step-icon success">🎉</div>
              <h1>Congratulations!</h1>
              <p className="step-subtitle">Your lofi video is ready!</p>
            </div>

            <div className="completion-details">
              <div className="completion-card">
                <div className="completion-icon">📁</div>
                <h4>Your video has been saved</h4>
                <p>Location: /exports/my-lofi-scene.mp4</p>
                <button className="wizard-button secondary">Open Folder</button>
              </div>

              <div className="completion-actions">
                <h4>What's next?</h4>
                <button className="action-button">
                  <span>📤</span>
                  <span>Upload to YouTube</span>
                </button>
                <button className="action-button">
                  <span>🎨</span>
                  <span>Create Another Video</span>
                </button>
                <button className="action-button">
                  <span>📚</span>
                  <span>Browse Community Templates</span>
                </button>
              </div>
            </div>

            <div className="wizard-nav">
              <button className="wizard-button primary large" onClick={handleRestart}>
                Start New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

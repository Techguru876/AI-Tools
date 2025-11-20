/**
 * Horror Studio - Horror Story & Creepypasta Videos
 * Features: Script-to-scene flow, visual templates, voice selection, SFX library, animation effects
 */

import { useState } from 'react'
import { generateTTS, searchStockMedia, batchProcess } from '../../utils/studioUtils'
import './HorrorStudio.css'

interface Scene {
  id: string
  order: number
  text: string
  visualTemplate: string
  visualUrl?: string
  voiceId: string
  emotion: 'eerie' | 'panicked' | 'calm' | 'whisper' | 'intense'
  sfxIds: string[]
  animations: string[]
  duration: number
  status: 'pending' | 'ready'
}

interface HorrorProject {
  id: string
  title: string
  subGenre: string
  script: string
  scenes: Scene[]
  primaryVoice: string
  enableSubtitles: boolean
  brandingPack: string
  status: 'editing' | 'ready' | 'exporting'
}

export default function HorrorStudio() {
  const [projects, setProjects] = useState<HorrorProject[]>([])
  const [selectedSubGenre, setSelectedSubGenre] = useState('haunted-house')
  const [selectedVoice, setSelectedVoice] = useState('eerie-male')
  const [showScriptImport, setShowScriptImport] = useState(false)
  const [scriptText, setScriptText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showVisualSearch, setShowVisualSearch] = useState<string | null>(null)
  const [visualSearchQuery, setVisualSearchQuery] = useState('')
  const [visualSearchResults, setVisualSearchResults] = useState<any[]>([])
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const subGenres = [
    { id: 'haunted-house', name: 'Haunted House', icon: '🏚️', color: '#8b4513' },
    { id: 'forest-horror', name: 'Forest Horror', icon: '🌲', color: '#2d5016' },
    { id: 'urban-legend', name: 'Urban Legend', icon: '🌃', color: '#1a1a2e' },
    { id: 'psychological', name: 'Psychological', icon: '🧠', color: '#4a148c' },
    { id: 'ghost-story', name: 'Ghost Story', icon: '👻', color: '#263238' },
    { id: 'creature', name: 'Creature/Monster', icon: '👹', color: '#b71c1c' },
    { id: 'supernatural', name: 'Supernatural', icon: '✨', color: '#311b92' },
    { id: 'slasher', name: 'Slasher/Gore', icon: '🔪', color: '#c62828' },
  ]

  const horrorVoices = [
    { id: 'eerie-male', name: 'Eerie Male', desc: 'Deep, unsettling narrator', sample: '🎧' },
    { id: 'eerie-female', name: 'Eerie Female', desc: 'Haunting, mysterious voice', sample: '🎧' },
    { id: 'monster', name: 'Monster Voice', desc: 'Growling, distorted', sample: '🎧' },
    { id: 'whisper', name: 'Whisper', desc: 'Barely audible, creepy', sample: '🎧' },
    { id: 'child-ghost', name: 'Child Ghost', desc: 'Young, ethereal voice', sample: '🎧' },
    { id: 'old-narrator', name: 'Old Narrator', desc: 'Weathered storyteller', sample: '🎧' },
    { id: 'demon', name: 'Demonic', desc: 'Deep, menacing growl', sample: '🎧' },
    { id: 'victim', name: 'Panicked Victim', desc: 'Scared, breathless', sample: '🎧' },
  ]

  const sfxLibrary = [
    { id: 'footsteps', name: 'Footsteps', category: 'movement', keywords: ['walk', 'step', 'approach'] },
    { id: 'door-creak', name: 'Door Creak', category: 'environment', keywords: ['door', 'open', 'creak'] },
    { id: 'thunder', name: 'Thunder', category: 'weather', keywords: ['storm', 'thunder', 'lightning'] },
    { id: 'whisper-ambient', name: 'Whispers', category: 'voice', keywords: ['whisper', 'voice', 'murmur'] },
    { id: 'heartbeat', name: 'Heartbeat', category: 'body', keywords: ['heart', 'beat', 'pulse', 'scared'] },
    { id: 'scream', name: 'Scream', category: 'voice', keywords: ['scream', 'yell', 'terror'] },
    { id: 'wind-howl', name: 'Wind Howl', category: 'weather', keywords: ['wind', 'howl', 'gust'] },
    { id: 'chains', name: 'Chains Rattling', category: 'metal', keywords: ['chain', 'rattle', 'metal'] },
    { id: 'breathing', name: 'Heavy Breathing', category: 'body', keywords: ['breath', 'pant', 'gasp'] },
    { id: 'glass-break', name: 'Glass Breaking', category: 'impact', keywords: ['glass', 'break', 'shatter'] },
  ]

  const animationEffects = [
    { id: 'glitch', name: 'Glitch', desc: 'Digital distortion effect' },
    { id: 'flicker', name: 'Flicker', desc: 'Light flickering' },
    { id: 'fade-black', name: 'Fade to Black', desc: 'Slow fade out' },
    { id: 'slow-zoom', name: 'Slow Zoom', desc: 'Gradual zoom in' },
    { id: 'shake', name: 'Camera Shake', desc: 'Sudden movement' },
    { id: 'blur', name: 'Motion Blur', desc: 'Fast movement blur' },
    { id: 'vhs', name: 'VHS Effect', desc: 'Retro tape distortion' },
    { id: 'static', name: 'Static Noise', desc: 'TV static overlay' },
  ]

  // Branding packs feature - reserved for future use
  // const brandingPacks = [
  //   { id: 'minimal', name: 'Minimal Dark' },
  //   { id: 'blood-red', name: 'Blood Red' },
  //   { id: 'gothic', name: 'Gothic' },
  //   { id: 'vhs-retro', name: 'VHS Retro' },
  // ]

  // Play voice sample using Web Speech API or fallback
  const handlePlayVoiceSample = async (voiceId: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      if (playingVoice === voiceId) {
        setPlayingVoice(null)
        return
      }
    }

    setPlayingVoice(voiceId)

    // Sample text for each voice type
    const sampleTexts: Record<string, string> = {
      'eerie-male': 'The door creaked open slowly, revealing nothing but darkness within.',
      'eerie-female': 'She whispered my name from somewhere in the shadows.',
      'monster': 'It watched me from the corner, breathing heavily.',
      'whisper': 'Can you hear them? They are getting closer.',
      'child-ghost': 'Will you play with me? I have been alone for so long.',
      'old-narrator': 'This tale begins on a dark and stormy night, many years ago.',
      'demon': 'Your soul belongs to me now.',
      'victim': 'Help me! Please, someone help me!'
    }

    const text = sampleTexts[voiceId] || 'This is a sample of the horror narration voice.'

    try {
      // Use Web Speech API for quick demo
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)

        // Configure voice characteristics based on type
        switch(voiceId) {
          case 'eerie-male':
          case 'old-narrator':
          case 'demon':
            utterance.pitch = 0.7
            utterance.rate = 0.8
            break
          case 'eerie-female':
          case 'child-ghost':
            utterance.pitch = 1.3
            utterance.rate = 0.9
            break
          case 'monster':
            utterance.pitch = 0.4
            utterance.rate = 0.7
            break
          case 'whisper':
            utterance.pitch = 0.9
            utterance.rate = 0.6
            utterance.volume = 0.5
            break
          case 'victim':
            utterance.pitch = 1.4
            utterance.rate = 1.3
            break
        }

        utterance.onend = () => {
          setPlayingVoice(null)
        }

        window.speechSynthesis.speak(utterance)
      } else {
        console.warn('Speech synthesis not supported')
        setPlayingVoice(null)
      }
    } catch (error) {
      console.error('Error playing voice sample:', error)
      setPlayingVoice(null)
    }
  }

  const handleCreateProject = () => {
    const newProject: HorrorProject = {
      id: `project-${Date.now()}`,
      title: `Horror Story ${projects.length + 1}`,
      subGenre: selectedSubGenre,
      script: '',
      scenes: [],
      primaryVoice: selectedVoice,
      enableSubtitles: true,
      brandingPack: 'minimal',
      status: 'editing'
    }
    setProjects([...projects, newProject])
    setSelectedProject(newProject.id)
  }

  const handleImportScript = () => {
    if (!scriptText.trim() || !selectedProject) return

    const project = projects.find(p => p.id === selectedProject)
    if (!project) return

    // Auto-split script into scenes (by double line breaks or ### markers)
    const sceneSections = scriptText.split(/\n\n+|^###\s+/m).filter(Boolean)

    const scenes: Scene[] = sceneSections.map((text, i) => {
      // Auto-detect SFX based on keywords
      const detectedSfx = sfxLibrary
        .filter(sfx => sfx.keywords.some(kw => text.toLowerCase().includes(kw)))
        .map(sfx => sfx.id)
        .slice(0, 3) // Max 3 auto-detected SFX per scene

      // Estimate duration based on word count (150 words per minute)
      const wordCount = text.split(/\s+/).length
      const duration = Math.ceil((wordCount / 150) * 60)

      return {
        id: `scene-${Date.now()}-${i}`,
        order: i,
        text: text.trim(),
        visualTemplate: selectedSubGenre,
        voiceId: selectedVoice,
        emotion: detectEmotion(text),
        sfxIds: detectedSfx,
        animations: [],
        duration,
        status: 'pending'
      }
    })

    project.script = scriptText
    project.scenes = scenes
    setProjects([...projects])
    setScriptText('')
    setShowScriptImport(false)
  }

  const detectEmotion = (text: string): 'eerie' | 'panicked' | 'calm' | 'whisper' | 'intense' => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('scream') || lowerText.includes('run') || lowerText.includes('!')) return 'panicked'
    if (lowerText.includes('whisper') || lowerText.includes('quiet')) return 'whisper'
    if (lowerText.includes('sudden') || lowerText.includes('attack')) return 'intense'
    if (lowerText.includes('calm') || lowerText.includes('peaceful')) return 'calm'
    return 'eerie'
  }

  const handleUpdateScene = (projectId: string, sceneId: string, field: keyof Scene, value: any) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        p.scenes = p.scenes.map(s => {
          if (s.id === sceneId) {
            return { ...s, [field]: value }
          }
          return s
        })
      }
      return p
    }))
  }

  const handleToggleSfx = (projectId: string, sceneId: string, sfxId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        p.scenes = p.scenes.map(s => {
          if (s.id === sceneId) {
            const sfxIds = s.sfxIds.includes(sfxId)
              ? s.sfxIds.filter(id => id !== sfxId)
              : [...s.sfxIds, sfxId]
            return { ...s, sfxIds }
          }
          return s
        })
      }
      return p
    }))
  }

  const handleToggleAnimation = (projectId: string, sceneId: string, animId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        p.scenes = p.scenes.map(s => {
          if (s.id === sceneId) {
            const animations = s.animations.includes(animId)
              ? s.animations.filter(id => id !== animId)
              : [...s.animations, animId]
            return { ...s, animations }
          }
          return s
        })
      }
      return p
    }))
  }

  const handleSearchVisuals = async (_sceneId: string) => {
    if (!visualSearchQuery.trim()) return
    const results = await searchStockMedia(visualSearchQuery, 'image', 12, 'pixabay')
    setVisualSearchResults(results)
  }

  const handleAssignVisual = (projectId: string, sceneId: string, visualUrl: string) => {
    handleUpdateScene(projectId, sceneId, 'visualUrl', visualUrl)
    setShowVisualSearch(null)
    setVisualSearchResults([])
  }

  const handleProcessProject = async (projectId: string) => {
    setIsProcessing(true)

    const project = projects.find(p => p.id === projectId)
    if (!project) return

    // Process each scene
    await batchProcess(project.scenes, async (scene) => {
      // Generate narration
      if (scene.text) {
        await generateTTS(scene.text, {
          provider: 'openai',
          voice: scene.voiceId,
          speed: 1.0,
          pitch: scene.emotion === 'whisper' ? 0.8 : 1.0,
          language: 'en-US'
        })
      }
      scene.status = 'ready'
    })

    project.status = 'ready'
    setProjects([...projects])
    setIsProcessing(false)
  }

  const handleDeleteScene = (projectId: string, sceneId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        p.scenes = p.scenes.filter(s => s.id !== sceneId)
        // Reorder remaining scenes
        p.scenes = p.scenes.map((s, i) => ({ ...s, order: i }))
      }
      return p
    }))
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId))
    if (selectedProject === projectId) setSelectedProject(null)
  }

  const handleReorderScene = (projectId: string, sceneId: string, direction: 'up' | 'down') => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const sceneIndex = p.scenes.findIndex(s => s.id === sceneId)
        if (sceneIndex === -1) return p

        const newScenes = [...p.scenes]
        if (direction === 'up' && sceneIndex > 0) {
          [newScenes[sceneIndex], newScenes[sceneIndex - 1]] = [newScenes[sceneIndex - 1], newScenes[sceneIndex]]
        } else if (direction === 'down' && sceneIndex < newScenes.length - 1) {
          [newScenes[sceneIndex], newScenes[sceneIndex + 1]] = [newScenes[sceneIndex + 1], newScenes[sceneIndex]]
        }

        // Update order numbers
        p.scenes = newScenes.map((s, i) => ({ ...s, order: i }))
      }
      return p
    }))
  }

  return (
    <div className="horror-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>🎃 Horror Studio</h2>
          <p>Create horror stories and creepypasta videos with AI narration, visuals, and spine-chilling effects</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{projects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat">
            <span className="stat-value">{projects.reduce((acc, p) => acc + p.scenes.length, 0)}</span>
            <span className="stat-label">Scenes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{projects.filter(p => p.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          <div className="section">
            <h3>👻 Horror Sub-Genre</h3>
            <div className="genre-grid">
              {subGenres.map(genre => (
                <div
                  key={genre.id}
                  className={`genre-card ${selectedSubGenre === genre.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubGenre(genre.id)}
                  style={{ background: `linear-gradient(135deg, ${genre.color} 0%, #000 100%)` }}
                >
                  <span className="genre-icon">{genre.icon}</span>
                  <span className="genre-name">{genre.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎙️ Primary Voice</h3>
            <div className="voice-list">
              {horrorVoices.map(voice => (
                <div
                  key={voice.id}
                  className={`voice-item ${selectedVoice === voice.id ? 'active' : ''}`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                  <div className="voice-info">
                    <div className="voice-name">{voice.name}</div>
                    <div className="voice-desc">{voice.desc}</div>
                  </div>
                  <button
                    className="sample-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayVoiceSample(voice.id)
                    }}
                    title={playingVoice === voice.id ? "Stop playing" : "Play sample"}
                  >
                    {playingVoice === voice.id ? '⏸️' : '🎧'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎬 Actions</h3>
            <button className="create-btn" onClick={handleCreateProject}>
              ➕ New Horror Project
            </button>
            {selectedProject && (
              <button className="import-btn" onClick={() => setShowScriptImport(true)}>
                📝 Import Script
              </button>
            )}
          </div>
        </div>

        <div className="studio-main">
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎃</div>
              <h3>No Horror Projects Yet</h3>
              <p>Create a new project to start crafting your horror story</p>
            </div>
          ) : (
            <div className="projects-list">
              {projects.map(project => (
                <div key={project.id} className={`project-card ${selectedProject === project.id ? 'active' : ''}`} onClick={() => setSelectedProject(project.id)}>
                  <div className="project-header">
                    <input
                      type="text"
                      className="project-title-input"
                      value={project.title}
                      onChange={e => {
                        e.stopPropagation()
                        setProjects(projects.map(p => p.id === project.id ? { ...p, title: e.target.value } : p))
                      }}
                      onClick={e => e.stopPropagation()}
                      placeholder="Project title..."
                    />
                    <div className="project-actions">
                      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleProcessProject(project.id); }} disabled={project.status === 'ready'}>
                        {project.status === 'ready' ? '✓' : '▶️'}
                      </button>
                      <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  {selectedProject === project.id && (
                    <>
                      {project.scenes.length === 0 ? (
                        <div className="no-scenes">
                          <p>No scenes yet. Import a script to auto-generate scenes.</p>
                        </div>
                      ) : (
                        <div className="scenes-container">
                          {project.scenes.map((scene, index) => (
                            <div key={scene.id} className="scene-card">
                              <div className="scene-header">
                                <div className="scene-order">
                                  <button className="order-btn" onClick={() => handleReorderScene(project.id, scene.id, 'up')} disabled={index === 0}>↑</button>
                                  <span className="scene-number">{index + 1}</span>
                                  <button className="order-btn" onClick={() => handleReorderScene(project.id, scene.id, 'down')} disabled={index === project.scenes.length - 1}>↓</button>
                                </div>
                                <button className="icon-btn-small delete" onClick={() => handleDeleteScene(project.id, scene.id)}>×</button>
                              </div>

                              <div className="scene-content">
                                <textarea
                                  className="scene-text-input"
                                  value={scene.text}
                                  onChange={e => handleUpdateScene(project.id, scene.id, 'text', e.target.value)}
                                  placeholder="Scene text..."
                                  rows={3}
                                />

                                {/* Visual Assignment */}
                                <div className="visual-section">
                                  <label>Visual:</label>
                                  {scene.visualUrl ? (
                                    <div className="visual-preview">
                                      <img src={scene.visualUrl} alt="Scene visual" />
                                      <button onClick={() => handleUpdateScene(project.id, scene.id, 'visualUrl', undefined)}>×</button>
                                    </div>
                                  ) : (
                                    <button className="assign-visual-btn" onClick={() => { setShowVisualSearch(scene.id); setVisualSearchQuery(scene.text.slice(0, 50)); }}>
                                      🖼️ Assign Visual
                                    </button>
                                  )}
                                </div>

                                {/* Voice & Emotion */}
                                <div className="voice-emotion-row">
                                  <select value={scene.voiceId} onChange={e => handleUpdateScene(project.id, scene.id, 'voiceId', e.target.value)} className="voice-select">
                                    {horrorVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                  </select>
                                  <select value={scene.emotion} onChange={e => handleUpdateScene(project.id, scene.id, 'emotion', e.target.value)} className="emotion-select">
                                    <option value="eerie">Eerie</option>
                                    <option value="panicked">Panicked</option>
                                    <option value="calm">Calm</option>
                                    <option value="whisper">Whisper</option>
                                    <option value="intense">Intense</option>
                                  </select>
                                </div>

                                {/* SFX Selection */}
                                <div className="sfx-section">
                                  <label>Sound Effects:</label>
                                  <div className="sfx-grid">
                                    {sfxLibrary.slice(0, 6).map(sfx => (
                                      <button
                                        key={sfx.id}
                                        className={`sfx-chip ${scene.sfxIds.includes(sfx.id) ? 'active' : ''}`}
                                        onClick={() => handleToggleSfx(project.id, scene.id, sfx.id)}
                                      >
                                        {sfx.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Animation Effects */}
                                <div className="animation-section">
                                  <label>Effects:</label>
                                  <div className="animation-grid">
                                    {animationEffects.slice(0, 4).map(anim => (
                                      <button
                                        key={anim.id}
                                        className={`anim-chip ${scene.animations.includes(anim.id) ? 'active' : ''}`}
                                        onClick={() => handleToggleAnimation(project.id, scene.id, anim.id)}
                                      >
                                        {anim.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="scene-meta">
                                  <span>~{scene.duration}s</span>
                                  <span>•</span>
                                  <span>{scene.sfxIds.length} SFX</span>
                                  <span>•</span>
                                  <span>{scene.animations.length} FX</span>
                                  {scene.status === 'ready' && <span className="ready-badge">✓ Ready</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="project-footer">
                        <div className={`status-badge ${project.status}`}>
                          {project.status === 'editing' && '✏️ Editing'}
                          {project.status === 'ready' && '✓ Ready to Export'}
                          {project.status === 'exporting' && '📤 Exporting'}
                        </div>
                        <div className="project-info">
                          <span>{subGenres.find(g => g.id === project.subGenre)?.name}</span>
                          <span>•</span>
                          <span>{project.scenes.length} scenes</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={() => projects.filter(p => p.status === 'editing').forEach(p => handleProcessProject(p.id))}
                disabled={isProcessing || projects.filter(p => p.status === 'editing').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${projects.filter(p => p.status === 'editing').length} Project(s)`}
              </button>
              <button className="export-btn" disabled={projects.filter(p => p.status === 'ready').length === 0}>
                📤 Export {projects.filter(p => p.status === 'ready').length} Project(s)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Script Import Modal */}
      {showScriptImport && (
        <div className="modal-overlay" onClick={() => setShowScriptImport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Import Horror Script</h3>
              <button className="modal-close" onClick={() => setShowScriptImport(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-hint">
                Paste your horror script below. Scenes will be auto-split by double line breaks. Use "### Scene Title" for manual markers.
              </p>
              <textarea
                className="script-textarea"
                value={scriptText}
                onChange={e => setScriptText(e.target.value)}
                placeholder="The old house stood at the end of the street...&#10;&#10;### The Discovery&#10;I found the door was unlocked..."
                rows={15}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowScriptImport(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleImportScript}>✨ Auto-Split Scenes</button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Search Modal */}
      {showVisualSearch && (
        <div className="modal-overlay" onClick={() => { setShowVisualSearch(null); setVisualSearchResults([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🖼️ Search Visuals</h3>
              <button className="modal-close" onClick={() => { setShowVisualSearch(null); setVisualSearchResults([]); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="search-bar">
                <input
                  type="text"
                  value={visualSearchQuery}
                  onChange={e => setVisualSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearchVisuals(showVisualSearch)}
                  placeholder="haunted house, dark forest, ghost..."
                />
                <button onClick={() => handleSearchVisuals(showVisualSearch)}>🔍 Search</button>
              </div>
              {visualSearchResults.length > 0 && (
                <div className="visual-results-grid">
                  {visualSearchResults.map(result => (
                    <div key={result.id} className="visual-result-item" onClick={() => handleAssignVisual(selectedProject!, showVisualSearch, result.url)}>
                      <img src={result.thumbnail} alt={result.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Explainer Studio - Educational & Top 10 Videos
 * Features: Script-to-video, infographics, voiceover, B-roll, auto subtitles, batch series builder
 */

import { useState } from 'react'
import { generateTTS, parseCSV, searchStockMedia, generateMetadata, batchProcess } from '../../utils/studioUtils'
import './ExplainerStudio.css'

interface Slide {
  id: string
  title: string
  content: string
  visualType: 'text' | 'image' | 'chart' | 'broll'
  visualUrl?: string
  duration: number
  voiceoverUrl?: string
  status: 'pending' | 'ready' | 'exporting'
}

interface ExplainerVideo {
  id: string
  title: string
  slides: Slide[]
  template: string
  ttsVoice: string
  ttsLanguage: string
  enableSubtitles: boolean
  verticalFormat: boolean
  status: 'pending' | 'ready' | 'exporting'
}

export default function ExplainerStudio() {
  const [videos, setVideos] = useState<ExplainerVideo[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('modern-slides')
  const [scriptInput, setScriptInput] = useState('')
  const [ttsVoice, setTtsVoice] = useState('nova')
  const [ttsLanguage, setTtsLanguage] = useState('en-US')
  const [enableSubtitles, setEnableSubtitles] = useState(true)
  const [verticalFormat, setVerticalFormat] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showScriptConverter, setShowScriptConverter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const templates = [
    { id: 'modern-slides', name: 'Modern Slides', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'minimal-clean', name: 'Minimal Clean', preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
    { id: 'tech-futuristic', name: 'Tech Futuristic', preview: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
    { id: 'education-bright', name: 'Education Bright', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'corporate-blue', name: 'Corporate Blue', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'dark-elegant', name: 'Dark Elegant', preview: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
  ]

  const ttsVoices = [
    { id: 'nova', name: 'Nova (Female, Energetic)', provider: 'OpenAI' },
    { id: 'alloy', name: 'Alloy (Neutral, Clear)', provider: 'OpenAI' },
    { id: 'echo', name: 'Echo (Male, Professional)', provider: 'OpenAI' },
    { id: 'onyx', name: 'Onyx (Male, Deep)', provider: 'OpenAI' },
    { id: 'shimmer', name: 'Shimmer (Female, Warm)', provider: 'OpenAI' },
  ]

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'pt-BR', name: 'Portuguese (BR)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
  ]

  const handleScriptToVideo = () => {
    if (!scriptInput.trim()) return

    // Parse script into slides (split by paragraphs or bullet points)
    const lines = scriptInput.split('\n').filter(line => line.trim())
    const slides: Slide[] = lines.map((line, i) => {
      // Detect if line is a title (starts with #, *, or is all caps)
      const isTitle = line.startsWith('#') || line.startsWith('*') || line === line.toUpperCase()

      return {
        id: `slide-${Date.now()}-${i}`,
        title: isTitle ? line.replace(/^[#*]\s*/, '') : `Point ${i + 1}`,
        content: isTitle ? '' : line,
        visualType: 'text',
        duration: 5,
        status: 'pending'
      }
    })

    const newVideo: ExplainerVideo = {
      id: `video-${Date.now()}`,
      title: generateMetadata(scriptInput).title,
      slides,
      template: selectedTemplate,
      ttsVoice,
      ttsLanguage,
      enableSubtitles,
      verticalFormat,
      status: 'pending'
    }

    setVideos([...videos, newVideo])
    setScriptInput('')
    setShowScriptConverter(false)
  }

  const handleBatchImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const rows = parseCSV(text)

    // Expected format: Title, Slide1, Slide2, Slide3...
    const newVideos: ExplainerVideo[] = rows.map((row, i) => {
      const title = row[0] || `Video ${i + 1}`
      const slides: Slide[] = row.slice(1).filter(Boolean).map((content, j) => ({
        id: `slide-${Date.now()}-${i}-${j}`,
        title: `Slide ${j + 1}`,
        content,
        visualType: 'text',
        duration: 5,
        status: 'pending'
      }))

      return {
        id: `video-${Date.now()}-${i}`,
        title,
        slides,
        template: selectedTemplate,
        ttsVoice,
        ttsLanguage,
        enableSubtitles,
        verticalFormat,
        status: 'pending'
      }
    })

    setVideos([...videos, ...newVideos])
  }

  const handleProcessVideo = async (videoId: string) => {
    setIsProcessing(true)

    const video = videos.find(v => v.id === videoId)
    if (!video) return

    // Process each slide
    await batchProcess(video.slides, async (slide) => {
      // Generate voiceover for content
      if (slide.content) {
        slide.voiceoverUrl = await generateTTS(slide.content, {
          provider: 'openai',
          voice: video.ttsVoice,
          speed: 1.0,
          pitch: 1.0,
          language: video.ttsLanguage
        })
      }

      slide.status = 'ready'
    })

    // Update video status
    video.status = 'ready'
    setVideos([...videos])
    setIsProcessing(false)
  }

  const handleSearchBRoll = async () => {
    if (!searchQuery.trim()) return

    const results = await searchStockMedia(searchQuery, 'video', 12, 'pixabay')
    setSearchResults(results)
  }

  const handleUpdateSlide = (videoId: string, slideId: string, field: 'title' | 'content' | 'duration', value: string | number) => {
    setVideos(videos.map(v => {
      if (v.id === videoId) {
        v.slides = v.slides.map(s => {
          if (s.id === slideId) {
            return { ...s, [field]: value }
          }
          return s
        })
      }
      return v
    }))
  }

  const handleDeleteVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId))
  }

  const handleDeleteSlide = (videoId: string, slideId: string) => {
    setVideos(videos.map(v => {
      if (v.id === videoId) {
        v.slides = v.slides.filter(s => s.id !== slideId)
      }
      return v
    }))
  }

  return (
    <div className="explainer-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>📚 Explainer Studio</h2>
          <p>Create educational videos, top 10 lists, and explainers with AI voiceovers and auto subtitles</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{videos.length}</span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{videos.filter(v => v.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat">
            <span className="stat-value">{videos.reduce((acc, v) => acc + v.slides.length, 0)}</span>
            <span className="stat-label">Total Slides</span>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          <div className="section">
            <h3>📐 Templates</h3>
            <div className="template-grid">
              {templates.map(t => (
                <div
                  key={t.id}
                  className={`template-card ${selectedTemplate === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(t.id)}
                  style={{ background: t.preview }}
                >
                  <span className="template-name">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎙️ Voiceover</h3>
            <label className="input-label">Voice</label>
            <select value={ttsVoice} onChange={e => setTtsVoice(e.target.value)} className="select-input">
              {ttsVoices.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            <label className="input-label">Language</label>
            <select value={ttsLanguage} onChange={e => setTtsLanguage(e.target.value)} className="select-input">
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>

            <label className="checkbox">
              <input type="checkbox" checked={enableSubtitles} onChange={e => setEnableSubtitles(e.target.checked)} />
              <span>Auto-generate Subtitles</span>
            </label>

            <label className="checkbox">
              <input type="checkbox" checked={verticalFormat} onChange={e => setVerticalFormat(e.target.checked)} />
              <span>Vertical Format (9:16)</span>
            </label>
          </div>

          <div className="section">
            <h3>📥 Create Video</h3>
            <button className="create-btn" onClick={() => setShowScriptConverter(true)}>
              ✍️ Script to Video
            </button>

            <input type="file" accept=".csv,.txt" onChange={handleBatchImport} style={{ display: 'none' }} id="batch-upload" />
            <label htmlFor="batch-upload" className="import-btn">
              📁 Batch Import CSV
            </label>
            <p className="hint">Format: Title, Slide1, Slide2...</p>
          </div>

          <div className="section">
            <h3>🎬 B-Roll Search</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search stock footage..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearchBRoll()}
            />
            <button className="search-btn" onClick={handleSearchBRoll}>
              🔍 Search
            </button>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.slice(0, 4).map(result => (
                  <div key={result.id} className="search-result-item">
                    <img src={result.thumbnail} alt={result.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="studio-main">
          {videos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Videos Yet</h3>
              <p>Click "Script to Video" to paste your content and auto-generate slides</p>
            </div>
          ) : (
            <div className="videos-list">
              {videos.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-header">
                    <h3 className="video-title">{video.title}</h3>
                    <div className="video-actions">
                      <button className="icon-btn" onClick={() => handleProcessVideo(video.id)} disabled={video.status === 'ready'}>
                        {video.status === 'ready' ? '✓' : '▶️'}
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDeleteVideo(video.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="slides-container">
                    {video.slides.map((slide, index) => (
                      <div key={slide.id} className="slide-card">
                        <div className="slide-number">{index + 1}</div>
                        <div className="slide-content">
                          <input
                            type="text"
                            className="slide-title-input"
                            value={slide.title}
                            onChange={e => handleUpdateSlide(video.id, slide.id, 'title', e.target.value)}
                            placeholder="Slide title..."
                          />
                          <textarea
                            className="slide-content-input"
                            value={slide.content}
                            onChange={e => handleUpdateSlide(video.id, slide.id, 'content', e.target.value)}
                            placeholder="Slide content..."
                            rows={2}
                          />
                          <div className="slide-meta">
                            <span className="visual-type">{slide.visualType === 'text' ? '📝 Text' : slide.visualType === 'image' ? '🖼️ Image' : '🎬 B-Roll'}</span>
                            <input
                              type="number"
                              className="duration-input"
                              value={slide.duration}
                              onChange={e => handleUpdateSlide(video.id, slide.id, 'duration', parseInt(e.target.value))}
                              min={1}
                              max={30}
                            />
                            <span className="duration-label">sec</span>
                            <button className="icon-btn-small delete" onClick={() => handleDeleteSlide(video.id, slide.id)}>
                              ×
                            </button>
                          </div>
                          {slide.status === 'ready' && (
                            <div className="slide-status ready">✓ Voiceover Ready</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="video-footer">
                    <div className={`status-badge ${video.status}`}>
                      {video.status === 'pending' && '⏳ Pending'}
                      {video.status === 'ready' && '✓ Ready to Export'}
                      {video.status === 'exporting' && '📤 Exporting'}
                    </div>
                    <div className="video-info">
                      <span>{video.slides.length} slides</span>
                      <span>•</span>
                      <span>{video.slides.reduce((acc, s) => acc + s.duration, 0)}s total</span>
                      <span>•</span>
                      <span>{video.verticalFormat ? '9:16' : '16:9'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={() => videos.filter(v => v.status === 'pending').forEach(v => handleProcessVideo(v.id))}
                disabled={isProcessing || videos.filter(v => v.status === 'pending').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${videos.filter(v => v.status === 'pending').length} Video(s)`}
              </button>
              <button
                className="export-btn"
                disabled={videos.filter(v => v.status === 'ready').length === 0}
              >
                📤 Export {videos.filter(v => v.status === 'ready').length} Video(s)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Script to Video Modal */}
      {showScriptConverter && (
        <div className="modal-overlay" onClick={() => setShowScriptConverter(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✍️ Script to Video Converter</h3>
              <button className="modal-close" onClick={() => setShowScriptConverter(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-hint">
                Paste your script below. Each paragraph or bullet point will become a slide.
                Use # or * for titles, or write in ALL CAPS.
              </p>
              <textarea
                className="script-textarea"
                value={scriptInput}
                onChange={e => setScriptInput(e.target.value)}
                placeholder="# Introduction&#10;Welcome to this video about...&#10;&#10;* Point 1&#10;Here's the first important point...&#10;&#10;* Point 2&#10;And here's the second point..."
                rows={12}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowScriptConverter(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleScriptToVideo}>
                ✨ Generate Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

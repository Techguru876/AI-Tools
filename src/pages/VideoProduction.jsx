import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { generateNarration, generateVideo } from '../utils/aiIntegration'
import './VideoProduction.css'

/**
 * VideoProduction Component
 * AI-powered narration and video creation from story pages
 * Features voice selection, narration preview, and video export
 */
function VideoProduction() {
  const navigate = useNavigate()
  const location = useLocation()
  const storyData = location.state?.story || {}
  const storyText = location.state?.text || ''
  const illustrations = location.state?.illustrations || {}

  const [selectedVoice, setSelectedVoice] = useState('friendly')
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [narrationSpeed, setNarrationSpeed] = useState(1.0)
  const [includeMusic, setIncludeMusic] = useState(true)
  const [transitionType, setTransitionType] = useState('fade')
  const [loading, setLoading] = useState(false)
  const [videoPreview, setVideoPreview] = useState(null)
  const [narrationAudio, setNarrationAudio] = useState(null)

  const voices = [
    { id: 'friendly', name: 'Friendly (Default)', description: 'Warm and welcoming' },
    { id: 'cheerful', name: 'Cheerful', description: 'Upbeat and energetic' },
    { id: 'calm', name: 'Calm', description: 'Soothing and gentle' },
    { id: 'dramatic', name: 'Dramatic', description: 'Expressive storytelling' }
  ]

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'ja-JP', name: 'Japanese' }
  ]

  const transitions = [
    { id: 'fade', name: 'Fade', icon: '🌅' },
    { id: 'slide', name: 'Slide', icon: '➡️' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' },
    { id: 'dissolve', name: 'Dissolve', icon: '✨' }
  ]

  // Generate narration for preview
  const handleGenerateNarration = async () => {
    setLoading(true)
    try {
      const result = await generateNarration({
        text: storyText,
        voice: selectedVoice,
        language: selectedLanguage,
        speed: narrationSpeed
      })
      setNarrationAudio(result)
    } catch (error) {
      console.error('Error generating narration:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate complete video
  const handleGenerateVideo = async () => {
    setLoading(true)
    try {
      const pages = Object.entries(illustrations).map(([pageNum, image]) => ({
        pageNumber: parseInt(pageNum),
        imageUrl: image.url,
        text: storyText.split('\n\n')[pageNum - 1] || ''
      }))

      const result = await generateVideo({
        pages,
        narration: {
          voice: selectedVoice,
          language: selectedLanguage,
          speed: narrationSpeed
        },
        transitions: {
          type: transitionType,
          duration: 1
        },
        music: includeMusic ? 'gentle' : null
      })
      setVideoPreview(result)
    } catch (error) {
      console.error('Error generating video:', error)
    } finally {
      setLoading(false)
    }
  }

  const continueToExport = () => {
    navigate('/export', {
      state: {
        story: storyData,
        text: storyText,
        illustrations,
        video: videoPreview
      }
    })
  }

  return (
    <div className="video-production-page">
      <Navbar />
      <main className="video-production-main">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Video Production</h1>
            <p className="page-description">
              Transform your story into an animated video with AI narration
            </p>
          </header>

          <div className="production-layout">
            {/* Left Panel: Settings */}
            <aside className="production-sidebar" aria-label="Video settings">
              {/* Voice Selection */}
              <section className="setting-section">
                <h2 className="setting-heading">Narration Voice</h2>
                <div className="voice-grid" role="radiogroup" aria-label="Voice selection">
                  {voices.map(voice => (
                    <button
                      key={voice.id}
                      className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVoice(voice.id)}
                      role="radio"
                      aria-checked={selectedVoice === voice.id}
                    >
                      <strong>{voice.name}</strong>
                      <span className="voice-description">{voice.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Language Selection */}
              <section className="setting-section">
                <h2 className="setting-heading">Language</h2>
                <select
                  className="form-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  aria-label="Select narration language"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </section>

              {/* Speed Control */}
              <section className="setting-section">
                <h2 className="setting-heading">
                  Narration Speed: {narrationSpeed.toFixed(1)}x
                </h2>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  className="form-range"
                  value={narrationSpeed}
                  onChange={(e) => setNarrationSpeed(parseFloat(e.target.value))}
                  aria-label="Narration speed"
                  aria-valuemin="0.5"
                  aria-valuemax="2.0"
                  aria-valuenow={narrationSpeed}
                />
                <div className="speed-labels">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </section>

              {/* Transition Effects */}
              <section className="setting-section">
                <h2 className="setting-heading">Transition Effects</h2>
                <div className="transition-grid" role="radiogroup" aria-label="Transition effects">
                  {transitions.map(transition => (
                    <button
                      key={transition.id}
                      className={`transition-option ${transitionType === transition.id ? 'selected' : ''}`}
                      onClick={() => setTransitionType(transition.id)}
                      role="radio"
                      aria-checked={transitionType === transition.id}
                    >
                      <span className="transition-icon" aria-hidden="true">{transition.icon}</span>
                      <span>{transition.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Music Toggle */}
              <section className="setting-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeMusic}
                    onChange={(e) => setIncludeMusic(e.target.checked)}
                    aria-label="Include background music"
                  />
                  <span>Include Background Music</span>
                </label>
              </section>

              {/* Action Buttons */}
              <section className="setting-section">
                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleGenerateNarration}
                  disabled={loading}
                  aria-label="Preview narration audio"
                >
                  {loading ? '⏳ Generating...' : '🎤 Preview Narration'}
                </button>
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleGenerateVideo}
                  disabled={loading}
                  aria-label="Generate complete video"
                >
                  {loading ? '⏳ Creating Video...' : '🎬 Create Video'}
                </button>
              </section>
            </aside>

            {/* Right Panel: Preview */}
            <section className="production-content" aria-label="Video preview">
              <div className="preview-area">
                {videoPreview ? (
                  <div className="video-preview-container">
                    <div className="video-player">
                      <div
                        className="video-thumbnail"
                        style={{ backgroundImage: `url(${videoPreview.thumbnailUrl})` }}
                        role="img"
                        aria-label="Video thumbnail"
                      >
                        <button
                          className="play-button"
                          aria-label="Play video preview"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    <div className="video-info">
                      <h3>Video Ready!</h3>
                      <div className="video-stats">
                        <div className="stat">
                          <span className="stat-label">Duration:</span>
                          <span className="stat-value">{Math.floor(videoPreview.duration / 60)}:{(videoPreview.duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Resolution:</span>
                          <span className="stat-value">{videoPreview.resolution}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Format:</span>
                          <span className="stat-value">{videoPreview.format.toUpperCase()}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Size:</span>
                          <span className="stat-value">{videoPreview.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <div className="placeholder-icon" aria-hidden="true">🎬</div>
                    <h3>No Video Yet</h3>
                    <p>Configure your settings and click "Create Video" to generate your micro-movie</p>
                  </div>
                )}

                {narrationAudio && !videoPreview && (
                  <div className="audio-preview">
                    <h3>Narration Preview</h3>
                    <div className="audio-player">
                      <button className="audio-play-btn" aria-label="Play narration">
                        ▶ Play Narration
                      </button>
                      <span className="audio-duration">
                        Duration: {Math.floor(narrationAudio.duration / 60)}:{(Math.floor(narrationAudio.duration) % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="audio-info">
                      Voice: {selectedVoice} • Language: {selectedLanguage} • Speed: {narrationSpeed}x
                    </p>
                  </div>
                )}

                {Object.keys(illustrations).length > 0 && (
                  <div className="illustration-preview-grid">
                    <h3>Story Illustrations ({Object.keys(illustrations).length} pages)</h3>
                    <div className="mini-gallery">
                      {Object.entries(illustrations).slice(0, 6).map(([pageNum, image]) => (
                        <div key={pageNum} className="mini-thumb">
                          <img
                            src={image.url}
                            alt={`Page ${pageNum} illustration`}
                            loading="lazy"
                          />
                          <span className="mini-page-num">P{pageNum}</span>
                        </div>
                      ))}
                      {Object.keys(illustrations).length > 6 && (
                        <div className="mini-thumb more">
                          +{Object.keys(illustrations).length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="page-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/illustrate', { state: location.state })}
              aria-label="Go back to illustrations"
            >
              Back to Illustrations
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={continueToExport}
              disabled={!videoPreview}
              aria-label="Continue to export and publish"
            >
              Continue to Export
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default VideoProduction

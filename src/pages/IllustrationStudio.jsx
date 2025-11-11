import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { artStyles } from '../data/mockData'
import { generateIllustration, refineIllustration } from '../utils/aiIntegration'
import './IllustrationStudio.css'

/**
 * IllustrationStudio Component
 * Text-to-image pipeline with art style selector, generation, and refinement
 * Allows users to generate and insert illustrations for each story page
 */
function IllustrationStudio() {
  const navigate = useNavigate()
  const location = useLocation()
  const storyData = location.state?.story || {}
  const storyText = location.state?.text || ''

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStyle, setSelectedStyle] = useState('Cartoon')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [illustrations, setIllustrations] = useState({})

  const totalPages = storyData.pages || 10
  const pageText = storyText.split('\n\n')[currentPage - 1] || 'Page content...'

  // Generate illustration for current page
  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateIllustration({
        prompt: `${storyData.genre} illustration showing ${storyData.characters} in ${storyData.theme} setting. ${pageText.substring(0, 100)}`,
        style: selectedStyle,
        size: '1024x1024'
      })
      setGeneratedImage(result)
      setIllustrations(prev => ({
        ...prev,
        [currentPage]: result
      }))
    } catch (error) {
      console.error('Error generating illustration:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refine existing illustration
  const handleRefine = async () => {
    if (!generatedImage) return

    setLoading(true)
    try {
      const result = await refineIllustration({
        originalUrl: generatedImage.url,
        modifications: 'Enhance colors and details',
        strength: 0.5
      })
      setGeneratedImage(result)
      setIllustrations(prev => ({
        ...prev,
        [currentPage]: result
      }))
    } catch (error) {
      console.error('Error refining illustration:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load existing illustration when page changes
  useEffect(() => {
    if (illustrations[currentPage]) {
      setGeneratedImage(illustrations[currentPage])
    } else {
      setGeneratedImage(null)
    }
  }, [currentPage, illustrations])

  const continueToVideo = () => {
    navigate('/video', {
      state: { story: storyData, text: storyText, illustrations }
    })
  }

  return (
    <div className="illustration-studio-page">
      <Navbar />
      <main className="illustration-studio-main">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Illustration Studio</h1>
            <p className="page-description">
              Create beautiful AI-generated artwork for your story
            </p>
          </header>

          <div className="studio-layout">
            {/* Left Panel: Controls */}
            <aside className="studio-sidebar" aria-label="Illustration controls">
              {/* Page Navigator */}
              <section className="control-section">
                <h2 className="control-heading">Page Selection</h2>
                <div className="page-selector">
                  <button
                    className="page-nav-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ←
                  </button>
                  <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="page-nav-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>

                <div className="page-thumbnails" role="list" aria-label="Page thumbnails">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      className={`page-thumb ${currentPage === pageNum ? 'active' : ''} ${illustrations[pageNum] ? 'has-illustration' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={currentPage === pageNum}
                    >
                      {pageNum}
                      {illustrations[pageNum] && <span className="thumb-check">✓</span>}
                    </button>
                  ))}
                </div>
              </section>

              {/* Art Style Selector */}
              <section className="control-section">
                <h2 className="control-heading">Art Style</h2>
                <div className="style-grid" role="radiogroup" aria-label="Art styles">
                  {artStyles.map(style => (
                    <button
                      key={style.id}
                      className={`style-card ${selectedStyle === style.name ? 'selected' : ''}`}
                      onClick={() => setSelectedStyle(style.name)}
                      role="radio"
                      aria-checked={selectedStyle === style.name}
                    >
                      <span className="style-preview" aria-hidden="true">{style.preview}</span>
                      <span className="style-name">{style.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Action Buttons */}
              <section className="control-section">
                <h2 className="control-heading">Actions</h2>
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleGenerate}
                  disabled={loading}
                  aria-label="Generate illustration with AI"
                >
                  {loading ? '⏳ Generating...' : '🎨 Generate Illustration'}
                </button>
                {generatedImage && (
                  <button
                    className="btn btn-secondary btn-block"
                    onClick={handleRefine}
                    disabled={loading}
                    aria-label="Refine current illustration"
                  >
                    {loading ? '⏳ Refining...' : '✨ Refine Image'}
                  </button>
                )}
              </section>

              {/* Progress Info */}
              <section className="control-section">
                <div className="progress-info">
                  <p className="progress-label">Illustrations Complete:</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(Object.keys(illustrations).length / totalPages) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={Object.keys(illustrations).length}
                      aria-valuemin="0"
                      aria-valuemax={totalPages}
                      aria-label={`${Object.keys(illustrations).length} of ${totalPages} illustrations complete`}
                    />
                  </div>
                  <p className="progress-count">
                    {Object.keys(illustrations).length} / {totalPages}
                  </p>
                </div>
              </section>
            </aside>

            {/* Right Panel: Preview */}
            <section className="studio-content" aria-label="Illustration preview">
              <div className="preview-container">
                <div className="page-content">
                  <h3 className="page-title-preview">Page {currentPage}</h3>
                  <p className="page-text-preview">{pageText}</p>
                </div>

                <div className="illustration-preview">
                  {generatedImage ? (
                    <img
                      src={generatedImage.url}
                      alt={`Illustration for page ${currentPage} in ${selectedStyle} style`}
                      className="preview-image"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <p>No illustration yet</p>
                      <p className="preview-hint">Select a style and click "Generate Illustration"</p>
                    </div>
                  )}
                </div>

                {generatedImage && (
                  <div className="image-metadata">
                    <p><strong>Style:</strong> {generatedImage.style}</p>
                    <p><strong>Size:</strong> {generatedImage.size}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="page-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/create')}
              aria-label="Go back to story editor"
            >
              Back to Story
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={continueToVideo}
              disabled={Object.keys(illustrations).length === 0}
              aria-label="Continue to video production"
            >
              Continue to Video Production
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default IllustrationStudio

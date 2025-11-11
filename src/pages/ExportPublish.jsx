import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { exportStory } from '../utils/aiIntegration'
import './ExportPublish.css'

/**
 * ExportPublish Component
 * Single-click export to multiple formats and publishing platforms
 * Supports PDF, ePub, MP4, and third-party platform links
 */
function ExportPublish() {
  const location = useLocation()
  const storyData = location.state?.story || {}
  const storyText = location.state?.text || ''
  const illustrations = location.state?.illustrations || {}
  const video = location.state?.video || null

  const [loading, setLoading] = useState(false)
  const [exportResults, setExportResults] = useState({})

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF E-book',
      icon: '📕',
      description: 'High-quality printable book',
      color: '#E74C3C'
    },
    {
      id: 'epub',
      name: 'ePub',
      icon: '📱',
      description: 'Compatible with e-readers',
      color: '#3498DB'
    },
    {
      id: 'mp4',
      name: 'MP4 Video',
      icon: '🎬',
      description: 'Shareable video format',
      color: '#9B59B6',
      disabled: !video
    },
    {
      id: 'docx',
      name: 'Word Document',
      icon: '📄',
      description: 'Editable text document',
      color: '#2980B9'
    }
  ]

  const publishingPlatforms = [
    {
      id: 'amazon-kdp',
      name: 'Amazon KDP',
      icon: '📚',
      description: 'Publish to Kindle Direct Publishing',
      url: 'https://kdp.amazon.com'
    },
    {
      id: 'apple-books',
      name: 'Apple Books',
      icon: '🍎',
      description: 'Publish to Apple Books',
      url: 'https://books.apple.com'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '▶️',
      description: 'Upload video to YouTube',
      url: 'https://youtube.com/upload',
      disabled: !video
    },
    {
      id: 'google-play',
      name: 'Google Play Books',
      icon: '📖',
      description: 'Publish to Google Play',
      url: 'https://play.google.com/books/publish'
    }
  ]

  const handleExport = async (format) => {
    setLoading(true)
    try {
      const result = await exportStory({
        story: {
          title: storyData.generatedStory?.title || 'My Story',
          text: storyText,
          illustrations,
          video: format === 'mp4' ? video : null,
          metadata: storyData
        },
        format
      })
      setExportResults(prev => ({
        ...prev,
        [format]: result
      }))
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = (platform) => {
    // Open publishing platform in new window
    window.open(platform.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="export-publish-page">
      <Navbar />
      <main className="export-publish-main">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Export & Publish</h1>
            <p className="page-description">
              Share your story with the world in multiple formats
            </p>
          </header>

          {/* Story Summary */}
          <section className="story-summary" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="summary-heading">Your Story</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Title:</span>
                <span className="summary-value">{storyData.generatedStory?.title || 'My Story'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Genre:</span>
                <span className="summary-value">{storyData.genre}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Age Range:</span>
                <span className="summary-value">{storyData.ageRange}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pages:</span>
                <span className="summary-value">{storyData.pages}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Illustrations:</span>
                <span className="summary-value">{Object.keys(illustrations).length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Video:</span>
                <span className="summary-value">{video ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </section>

          {/* Export Formats */}
          <section className="export-section" aria-labelledby="export-heading">
            <h2 id="export-heading" className="section-heading">Export Formats</h2>
            <p className="section-subheading">Download your story in various formats</p>

            <div className="export-grid" role="list" aria-label="Export format options">
              {exportFormats.map(format => (
                <article
                  key={format.id}
                  className={`export-card ${format.disabled ? 'disabled' : ''}`}
                  style={{ '--format-color': format.color }}
                  role="listitem"
                >
                  <div
                    className="export-icon"
                    aria-hidden="true"
                    style={{ backgroundColor: `${format.color}20` }}
                  >
                    <span style={{ fontSize: '3rem' }}>{format.icon}</span>
                  </div>

                  <h3 className="export-name">{format.name}</h3>
                  <p className="export-description">{format.description}</p>

                  {exportResults[format.id] ? (
                    <div className="export-result">
                      <p className="export-success">✓ Ready!</p>
                      <a
                        href={exportResults[format.id].downloadUrl}
                        className="btn btn-success btn-small"
                        download
                        aria-label={`Download ${format.name}`}
                      >
                        Download
                      </a>
                      <p className="export-meta">
                        Size: {exportResults[format.id].size}
                      </p>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleExport(format.id)}
                      disabled={loading || format.disabled}
                      aria-label={`Export to ${format.name}`}
                    >
                      {loading ? 'Exporting...' : 'Export'}
                    </button>
                  )}

                  {format.disabled && (
                    <p className="format-disabled-note">
                      Complete video step first
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Publishing Platforms */}
          <section className="publish-section" aria-labelledby="publish-heading">
            <h2 id="publish-heading" className="section-heading">Publishing Platforms</h2>
            <p className="section-subheading">Share your story on popular platforms</p>

            <div className="platform-grid" role="list" aria-label="Publishing platforms">
              {publishingPlatforms.map(platform => (
                <article
                  key={platform.id}
                  className={`platform-card ${platform.disabled ? 'disabled' : ''}`}
                  role="listitem"
                >
                  <div className="platform-header">
                    <span className="platform-icon" aria-hidden="true">
                      {platform.icon}
                    </span>
                    <h3 className="platform-name">{platform.name}</h3>
                  </div>

                  <p className="platform-description">{platform.description}</p>

                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handlePublish(platform)}
                    disabled={platform.disabled}
                    aria-label={`Open ${platform.name} publishing page`}
                  >
                    {platform.disabled ? 'Unavailable' : 'Go to Platform'}
                  </button>

                  {platform.disabled && (
                    <p className="platform-disabled-note">
                      Video required for this platform
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Share Links */}
          <section className="share-section" aria-labelledby="share-heading">
            <h2 id="share-heading" className="section-heading">Share Your Story</h2>
            <p className="section-subheading">Spread the magic with friends and family</p>

            <div className="share-options">
              <button
                className="share-btn email"
                aria-label="Share via email"
              >
                📧 Email
              </button>
              <button
                className="share-btn facebook"
                aria-label="Share on Facebook"
              >
                f Facebook
              </button>
              <button
                className="share-btn twitter"
                aria-label="Share on Twitter"
              >
                𝕏 Twitter
              </button>
              <button
                className="share-btn whatsapp"
                aria-label="Share on WhatsApp"
              >
                💬 WhatsApp
              </button>
              <button
                className="share-btn copy"
                aria-label="Copy share link"
              >
                🔗 Copy Link
              </button>
            </div>
          </section>

          {/* Success Message */}
          {Object.keys(exportResults).length > 0 && (
            <aside className="success-banner" role="status" aria-live="polite">
              <div className="success-content">
                <span className="success-icon" aria-hidden="true">🎉</span>
                <div>
                  <h3 className="success-title">Congratulations!</h3>
                  <p className="success-message">
                    Your story has been successfully exported and is ready to share with the world!
                  </p>
                </div>
              </div>
            </aside>
          )}

          <div className="page-actions">
            <button
              className="btn btn-secondary"
              onClick={() => window.location.href = '/'}
              aria-label="Create another story"
            >
              Create Another Story
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={() => window.print()}
              aria-label="Print this summary"
            >
              Print Summary
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ExportPublish

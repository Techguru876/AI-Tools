/**
 * Template Library Component
 * Browse and apply professional lofi scene templates
 * Categories: Cozy Room, Rainy Window, Cityscape, Nature Scene, Space Theme
 */

import { useState } from 'react'
import { useLofiStore, LofiTemplate, TemplateCategory } from '../../stores/lofiStore'
import { DEFAULT_TEMPLATES } from './defaultTemplates'
import './TemplateLibrary.css'

interface TemplateLibraryProps {
  onClose?: () => void
}

export default function TemplateLibrary({ onClose }: TemplateLibraryProps) {
  const { templates, applyTemplate, favoriteTemplates } = useLofiStore()
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'popularity'>('popularity')
  const [selectedTemplate, setSelectedTemplate] = useState<LofiTemplate | null>(null)

  // Template categories with icons
  const categories: Array<{ id: TemplateCategory | 'All'; label: string; icon: string }> = [
    { id: 'All', label: 'All Templates', icon: '🎨' },
    { id: 'CozyRoom', label: 'Cozy Room', icon: '🛋️' },
    { id: 'RainyWindow', label: 'Rainy Window', icon: '🌧️' },
    { id: 'Cityscape', label: 'Cityscape', icon: '🏙️' },
    { id: 'NatureScene', label: 'Nature Scene', icon: '🌲' },
    { id: 'SpaceTheme', label: 'Space Theme', icon: '🚀' },
    { id: 'Custom', label: 'Custom', icon: '⭐' },
  ]

  // Get default templates - now properly structured!
  const allTemplates = [...DEFAULT_TEMPLATES, ...templates]

  // Filter and sort templates
  const filteredTemplates = allTemplates
    .filter((t) => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.popularity - a.popularity
    })

  const handleApplyTemplate = (template: LofiTemplate) => {
    applyTemplate(template)
    if (onClose) onClose()
  }

  const handlePreview = (template: LofiTemplate) => {
    setSelectedTemplate(template)
  }

  return (
    <div className="template-library">
      {/* Header */}
      <div className="template-library-header">
        <div className="header-left">
          <h2>📚 Template Library</h2>
          <p>Choose a professionally designed template to get started</p>
        </div>
        <div className="header-right">
          {onClose && (
            <button className="close-button" onClick={onClose} title="Close">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="template-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="popularity">Most Popular</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="template-content">
        {/* Category sidebar */}
        <div className="category-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div className="template-grid">
          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <p>No templates found</p>
              <p className="hint">Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                {/* Thumbnail */}
                <div
                  className="template-thumbnail"
                  style={{
                    background: template.thumbnail || getDefaultThumbnail(template.category),
                  }}
                  onClick={() => handlePreview(template)}
                >
                  <div className="template-overlay">
                    <button
                      className="preview-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(template)
                      }}
                    >
                      👁️ Preview
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="template-info">
                  <div className="template-header">
                    <h4>{template.name}</h4>
                    {favoriteTemplates.includes(template.id) && (
                      <span className="favorite-badge">⭐</span>
                    )}
                  </div>
                  <p className="template-description">{template.description}</p>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="template-tags">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="template-stats">
                    <span className="stat">
                      ❤️ {template.popularity}
                    </span>
                    <span className="stat">
                      {categories.find((c) => c.id === template.category)?.icon}{' '}
                      {template.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="template-actions">
                    <button
                      className="apply-button primary"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      Use Template
                    </button>
                    <button
                      className="preview-button-alt"
                      onClick={() => handlePreview(template)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview modal */}
      {selectedTemplate && (
        <div className="template-preview-modal" onClick={() => setSelectedTemplate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTemplate(null)}>
              ✕
            </button>

            <div className="preview-layout">
              {/* Preview area */}
              <div className="preview-area">
                <div
                  className="preview-canvas"
                  style={{
                    background:
                      selectedTemplate.thumbnail ||
                      getDefaultThumbnail(selectedTemplate.category),
                  }}
                >
                  <div className="preview-label">Preview</div>
                </div>
              </div>

              {/* Details sidebar */}
              <div className="preview-details">
                <h2>{selectedTemplate.name}</h2>
                <p className="description">{selectedTemplate.description}</p>

                <div className="detail-section">
                  <h3>What's Included</h3>
                  <ul>
                    {selectedTemplate.scene.background && <li>✓ Background layer</li>}
                    <li>✓ {selectedTemplate.scene.characters.length} Character(s)</li>
                    <li>✓ {selectedTemplate.scene.props.length} Prop(s)</li>
                    <li>✓ {selectedTemplate.scene.overlays.length} Overlay effect(s)</li>
                    {selectedTemplate.scene.music_track && <li>✓ Music track included</li>}
                  </ul>
                </div>

                {selectedTemplate.customization_options.length > 0 && (
                  <div className="detail-section">
                    <h3>Customization Options</h3>
                    <ul>
                      {selectedTemplate.customization_options.map((opt) => (
                        <li key={opt.id}>
                          • {opt.label} ({opt.option_type})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTemplate.tags.length > 0 && (
                  <div className="detail-section">
                    <h3>Tags</h3>
                    <div className="tag-list">
                      {selectedTemplate.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="preview-actions">
                  <button
                    className="apply-button primary large"
                    onClick={() => {
                      handleApplyTemplate(selectedTemplate)
                      setSelectedTemplate(null)
                    }}
                  >
                    Use This Template
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


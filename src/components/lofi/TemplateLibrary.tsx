/**
 * Template Library Component
 * Browse and apply professional lofi scene templates
 * Categories: Cozy Room, Rainy Window, Cityscape, Nature Scene, Space Theme
 */

import { useState } from 'react'
import { useLofiStore, LofiTemplate, TemplateCategory } from '../../stores/lofiStore'
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

  // Get default templates (in real app, would load from backend)
  const defaultTemplates: LofiTemplate[] = getDefaultTemplates()
  const allTemplates = [...defaultTemplates, ...templates]

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

// Default templates
function getDefaultTemplates(): LofiTemplate[] {
  return [
    {
      id: 'cozy-room-1',
      name: 'Cozy Study Room',
      description: 'Warm study room with desk, books, and window view',
      category: 'CozyRoom',
      thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      scene: {
        id: 'scene-1',
        name: 'Cozy Study Room',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [
        {
          id: 'time',
          label: 'Time of Day',
          option_type: 'Element',
          default_value: 'Evening',
          options: ['Morning', 'Day', 'Evening', 'Night'],
        },
      ],
      tags: ['study', 'cozy', 'warm', 'indoor'],
      popularity: 1250,
    },
    {
      id: 'rainy-window-1',
      name: 'Rainy Window View',
      description: 'City view through rain-covered window',
      category: 'RainyWindow',
      thumbnail: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      scene: {
        id: 'scene-2',
        name: 'Rainy Window View',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [
        {
          id: 'rain',
          label: 'Rain Intensity',
          option_type: 'Animation',
          default_value: 'Medium',
          options: ['Light', 'Medium', 'Heavy'],
        },
      ],
      tags: ['rain', 'window', 'chill', 'atmospheric'],
      popularity: 2100,
    },
    {
      id: 'cityscape-1',
      name: 'Night Cityscape',
      description: 'Animated city skyline at night with lights',
      category: 'Cityscape',
      thumbnail: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      scene: {
        id: 'scene-3',
        name: 'Night Cityscape',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [
        {
          id: 'lights',
          label: 'City Lights Color',
          option_type: 'Color',
          default_value: 'warm',
          options: ['warm', 'cool', 'neon'],
        },
      ],
      tags: ['city', 'night', 'urban', 'skyline'],
      popularity: 1800,
    },
    {
      id: 'nature-1',
      name: 'Forest Clearing',
      description: 'Peaceful forest clearing with fireflies',
      category: 'NatureScene',
      thumbnail: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      scene: {
        id: 'scene-4',
        name: 'Forest Clearing',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [],
      tags: ['nature', 'forest', 'peaceful', 'ambient'],
      popularity: 950,
    },
    {
      id: 'space-1',
      name: 'Cosmic Journey',
      description: 'Spaceship view with stars and nebula',
      category: 'SpaceTheme',
      thumbnail: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
      scene: {
        id: 'scene-5',
        name: 'Cosmic Journey',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [
        {
          id: 'nebula',
          label: 'Nebula Color',
          option_type: 'Color',
          default_value: 'purple',
          options: ['purple', 'blue', 'pink', 'orange'],
        },
      ],
      tags: ['space', 'cosmic', 'sci-fi', 'stars'],
      popularity: 1650,
    },
    {
      id: 'cozy-room-2',
      name: 'Bedroom Sunset',
      description: 'Cozy bedroom with warm sunset lighting',
      category: 'CozyRoom',
      thumbnail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      scene: {
        id: 'scene-6',
        name: 'Bedroom Sunset',
        characters: [],
        props: [],
        overlays: [],
        loop_settings: { duration: 60, auto_sync: true },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      },
      customization_options: [],
      tags: ['bedroom', 'sunset', 'warm', 'cozy'],
      popularity: 1420,
    },
  ]
}

// Generate default thumbnail gradients based on category
function getDefaultThumbnail(category: TemplateCategory): string {
  const gradients: Record<TemplateCategory, string> = {
    CozyRoom: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    RainyWindow: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    Cityscape: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    NatureScene: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    SpaceTheme: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    Custom: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }
  return gradients[category]
}

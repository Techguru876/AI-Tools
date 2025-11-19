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
        background: {
          id: 'bg-1',
          name: 'Warm Room Background',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop',
          color: '#3a2f28',
          blur: 0,
          brightness: 0.8,
        },
        characters: [
          {
            id: 'char-1',
            name: 'Study Character',
            position: { x: 400, y: 300 },
            scale: 1.2,
            rotation: 0,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
            animation: 'subtle-sway',
          },
        ],
        props: [
          {
            id: 'prop-1',
            name: 'Coffee Cup',
            type: 'static',
            position: { x: 800, y: 500 },
            scale: 0.5,
            rotation: 15,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
            animation: 'steam',
          },
          {
            id: 'prop-2',
            name: 'Books',
            type: 'static',
            position: { x: 1200, y: 450 },
            scale: 0.8,
            rotation: -5,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=200&fit=crop',
            animation: null,
          },
        ],
        overlays: [
          {
            id: 'overlay-1',
            name: 'Warm Light',
            type: 'color-gradient',
            blend_mode: 'overlay',
            opacity: 0.3,
            gradient: 'linear-gradient(180deg, #ff9966 0%, #ff5e62 100%)',
            animation: 'pulse',
          },
          {
            id: 'overlay-2',
            name: 'Film Grain',
            type: 'texture',
            blend_mode: 'overlay',
            opacity: 0.15,
            texture_url: 'grain',
            animation: null,
          },
        ],
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
        background: {
          id: 'bg-2',
          name: 'Rainy City Window',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&h=1080&fit=crop',
          color: '#1a2634',
          blur: 2,
          brightness: 0.7,
        },
        characters: [
          {
            id: 'char-2',
            name: 'Cat on Window Sill',
            position: { x: 1400, y: 600 },
            scale: 0.7,
            rotation: 0,
            opacity: 0.9,
            image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
            animation: 'breathing',
          },
        ],
        props: [
          {
            id: 'prop-3',
            name: 'Coffee Mug',
            type: 'static',
            position: { x: 300, y: 800 },
            scale: 0.6,
            rotation: 5,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1514481538271-cf9f99627ab4?w=200&h=200&fit=crop',
            animation: 'steam',
          },
          {
            id: 'prop-4',
            name: 'Plant',
            type: 'static',
            position: { x: 1600, y: 400 },
            scale: 0.9,
            rotation: 0,
            opacity: 0.85,
            image_url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=300&h=400&fit=crop',
            animation: 'gentle-sway',
          },
        ],
        overlays: [
          {
            id: 'overlay-3',
            name: 'Rain Drops',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.6,
            gradient: null,
            animation: 'rain-fall',
          },
          {
            id: 'overlay-4',
            name: 'Blue Tint',
            type: 'color-gradient',
            blend_mode: 'overlay',
            opacity: 0.2,
            gradient: 'linear-gradient(180deg, #30cfd0 0%, #330867 100%)',
            animation: null,
          },
          {
            id: 'overlay-5',
            name: 'Fog',
            type: 'texture',
            blend_mode: 'soft-light',
            opacity: 0.3,
            texture_url: 'fog',
            animation: 'drift',
          },
        ],
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
        background: {
          id: 'bg-3',
          name: 'Night City Skyline',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&h=1080&fit=crop',
          color: '#0f1419',
          blur: 0,
          brightness: 0.8,
        },
        characters: [],
        props: [
          {
            id: 'prop-5',
            name: 'Moon',
            type: 'static',
            position: { x: 1600, y: 200 },
            scale: 0.4,
            rotation: 0,
            opacity: 0.9,
            image_url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=200&h=200&fit=crop',
            animation: 'glow',
          },
          {
            id: 'prop-6',
            name: 'Flying Bird',
            type: 'animated',
            position: { x: 800, y: 400 },
            scale: 0.2,
            rotation: -15,
            opacity: 0.7,
            image_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=150&h=100&fit=crop',
            animation: 'fly-across',
          },
        ],
        overlays: [
          {
            id: 'overlay-6',
            name: 'City Lights Twinkle',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.5,
            gradient: null,
            animation: 'twinkle',
          },
          {
            id: 'overlay-7',
            name: 'Dark Blue Tint',
            type: 'color-gradient',
            blend_mode: 'multiply',
            opacity: 0.3,
            gradient: 'linear-gradient(180deg, #0f2027 0%, #2c5364 100%)',
            animation: null,
          },
          {
            id: 'overlay-8',
            name: 'Stars',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.4,
            gradient: null,
            animation: 'stars-twinkle',
          },
        ],
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
        background: {
          id: 'bg-4',
          name: 'Forest Path',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
          color: '#1a3a1a',
          blur: 1,
          brightness: 0.75,
        },
        characters: [
          {
            id: 'char-3',
            name: 'Deer',
            position: { x: 1300, y: 550 },
            scale: 0.6,
            rotation: -10,
            opacity: 0.85,
            image_url: 'https://images.unsplash.com/photo-1551775912-062fd17b2a46?w=400&h=500&fit=crop',
            animation: 'subtle-movement',
          },
        ],
        props: [
          {
            id: 'prop-7',
            name: 'Mushrooms',
            type: 'static',
            position: { x: 400, y: 750 },
            scale: 0.5,
            rotation: 0,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop',
            animation: null,
          },
          {
            id: 'prop-8',
            name: 'Fallen Log',
            type: 'static',
            position: { x: 800, y: 650 },
            scale: 1.1,
            rotation: 5,
            opacity: 0.9,
            image_url: 'https://images.unsplash.com/photo-1518406537624-3b4515bac6e4?w=600&h=300&fit=crop',
            animation: null,
          },
        ],
        overlays: [
          {
            id: 'overlay-9',
            name: 'Fireflies',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.7,
            gradient: null,
            animation: 'firefly-float',
          },
          {
            id: 'overlay-10',
            name: 'Green Forest Tint',
            type: 'color-gradient',
            blend_mode: 'overlay',
            opacity: 0.15,
            gradient: 'linear-gradient(180deg, #134e5e 0%, #71b280 100%)',
            animation: null,
          },
          {
            id: 'overlay-11',
            name: 'Sunbeams',
            type: 'light-ray',
            blend_mode: 'screen',
            opacity: 0.25,
            gradient: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            animation: 'subtle-shift',
          },
        ],
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
        background: {
          id: 'bg-5',
          name: 'Nebula Space',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
          color: '#000428',
          blur: 0,
          brightness: 0.9,
        },
        characters: [
          {
            id: 'char-4',
            name: 'Astronaut',
            position: { x: 500, y: 400 },
            scale: 0.8,
            rotation: 0,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=600&fit=crop',
            animation: 'float',
          },
        ],
        props: [
          {
            id: 'prop-9',
            name: 'Planet',
            type: 'static',
            position: { x: 1500, y: 500 },
            scale: 0.7,
            rotation: 0,
            opacity: 0.95,
            image_url: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=400&h=400&fit=crop',
            animation: 'slow-rotate',
          },
          {
            id: 'prop-10',
            name: 'Satellite',
            type: 'animated',
            position: { x: 1100, y: 250 },
            scale: 0.3,
            rotation: 45,
            opacity: 0.85,
            image_url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=300&h=200&fit=crop',
            animation: 'orbit',
          },
        ],
        overlays: [
          {
            id: 'overlay-12',
            name: 'Stars',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.8,
            gradient: null,
            animation: 'stars-drift',
          },
          {
            id: 'overlay-13',
            name: 'Purple Nebula Glow',
            type: 'color-gradient',
            blend_mode: 'screen',
            opacity: 0.4,
            gradient: 'radial-gradient(circle, rgba(138, 43, 226, 0.5) 0%, transparent 70%)',
            animation: 'pulse-slow',
          },
          {
            id: 'overlay-14',
            name: 'Cosmic Dust',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.3,
            gradient: null,
            animation: 'dust-float',
          },
        ],
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
        background: {
          id: 'bg-6',
          name: 'Sunset Bedroom',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop',
          color: '#ffa07a',
          blur: 1,
          brightness: 0.9,
        },
        characters: [
          {
            id: 'char-5',
            name: 'Person Reading',
            position: { x: 700, y: 450 },
            scale: 1,
            rotation: 0,
            opacity: 0.95,
            image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=600&fit=crop',
            animation: 'reading',
          },
        ],
        props: [
          {
            id: 'prop-11',
            name: 'Bedside Lamp',
            type: 'static',
            position: { x: 1400, y: 500 },
            scale: 0.6,
            rotation: 0,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782a?w=200&h=300&fit=crop',
            animation: 'warm-glow',
          },
          {
            id: 'prop-12',
            name: 'Open Book',
            type: 'static',
            position: { x: 600, y: 700 },
            scale: 0.5,
            rotation: -10,
            opacity: 1,
            image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop',
            animation: 'page-flutter',
          },
          {
            id: 'prop-13',
            name: 'Potted Plant',
            type: 'static',
            position: { x: 200, y: 600 },
            scale: 0.7,
            rotation: 0,
            opacity: 0.9,
            image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=250&h=350&fit=crop',
            animation: null,
          },
        ],
        overlays: [
          {
            id: 'overlay-15',
            name: 'Sunset Glow',
            type: 'color-gradient',
            blend_mode: 'overlay',
            opacity: 0.5,
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            animation: 'pulse-gentle',
          },
          {
            id: 'overlay-16',
            name: 'Dust Particles',
            type: 'particle',
            blend_mode: 'screen',
            opacity: 0.2,
            gradient: null,
            animation: 'dust-drift',
          },
          {
            id: 'overlay-17',
            name: 'Soft Focus',
            type: 'texture',
            blend_mode: 'soft-light',
            opacity: 0.15,
            texture_url: 'bokeh',
            animation: null,
          },
        ],
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

/**
 * Meme Studio - Viral Meme & Reaction Videos
 * Features: Template library, auto-caption, TTS reactions, trend detection
 */

import { useState } from 'react'
import { generateTTS, searchStockMedia, batchProcess } from '../../utils/studioUtils'
import './MemeStudio.css'

interface Meme {
  id: string
  templateId: string
  topText: string
  bottomText: string
  caption?: string
  voiceReaction?: string
  voiceoverUrl?: string
  musicUrl?: string
  status: 'pending' | 'ready' | 'exporting'
}

interface MemeTemplate {
  id: string
  name: string
  preview: string
  category: 'classic' | 'reaction' | 'trend' | 'custom'
  popularity: number
}

export default function MemeStudio() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | MemeTemplate['category']>('all')
  const [enableVoice, setEnableVoice] = useState(true)
  const [autoMusic, setAutoMusic] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const templates: MemeTemplate[] = [
    { id: 'drake', name: 'Drake Hotline Bling', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', category: 'classic', popularity: 9500 },
    { id: 'distracted', name: 'Distracted Boyfriend', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', category: 'classic', popularity: 8900 },
    { id: 'twobuttons', name: 'Two Buttons', preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'classic', popularity: 7200 },
    { id: 'exitingscar', name: 'Exiting Scar', preview: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%)', category: 'classic', popularity: 6800 },
    { id: 'boardroom', name: 'Boardroom Meeting', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'reaction', popularity: 8100 },
    { id: 'changemymind', name: 'Change My Mind', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'reaction', popularity: 7500 },
    { id: 'surprised', name: 'Surprised Pikachu', preview: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)', category: 'reaction', popularity: 9200 },
    { id: 'expanding', name: 'Expanding Brain', preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', category: 'trend', popularity: 6500 },
  ]

  const categories = [
    { id: 'all', name: 'All Templates', icon: '😂' },
    { id: 'classic', name: 'Classic Memes', icon: '🎭' },
    { id: 'reaction', name: 'Reactions', icon: '😮' },
    { id: 'trend', name: 'Trending', icon: '🔥' },
    { id: 'custom', name: 'Custom', icon: '⭐' },
  ] as const

  const handleAddMeme = () => {
    if (!selectedTemplate) {
      alert('Please select a template first')
      return
    }

    const newMeme: Meme = {
      id: `meme-${Date.now()}`,
      templateId: selectedTemplate,
      topText: 'TOP TEXT',
      bottomText: 'BOTTOM TEXT',
      status: 'pending'
    }
    setMemes([...memes, newMeme])
  }

  const handleProcess = async () => {
    setIsProcessing(true)

    const pendingMemes = memes.filter(m => m.status === 'pending')

    await batchProcess(pendingMemes, async (meme) => {
      if (enableVoice && meme.voiceReaction) {
        meme.voiceoverUrl = await generateTTS(meme.voiceReaction, {
          provider: 'openai',
          voice: 'alloy',
          speed: 1.2,
          pitch: 1.1,
          language: 'en-US'
        })
      }

      if (autoMusic) {
        // Simple placeholder - would select based on meme style
        meme.musicUrl = '/assets/meme-music.mp3'
      }

      meme.status = 'ready'
      setMemes([...memes])
    })

    setIsProcessing(false)
  }

  const handleUpdateMeme = (id: string, field: keyof Meme, value: any) => {
    setMemes(memes.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handleDeleteMeme = (id: string) => {
    setMemes(memes.filter(m => m.id !== id))
  }

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className="meme-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>😂 Meme Studio</h2>
          <p>Create viral memes and reaction videos with trending templates</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{memes.length}</span>
            <span className="stat-label">Memes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{memes.filter(m => m.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          <div className="section">
            <h3>📂 Categories</h3>
            <div className="category-list">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id as any)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎭 Templates</h3>
            <div className="template-grid">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                  style={{ background: template.preview }}
                >
                  <div className="template-info">
                    <span className="template-name">{template.name}</span>
                    <span className="template-popularity">🔥 {(template.popularity / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>⚙️ Options</h3>
            <label className="checkbox">
              <input type="checkbox" checked={enableVoice} onChange={e => setEnableVoice(e.target.checked)} />
              <span>Add Voice Reaction</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={autoMusic} onChange={e => setAutoMusic(e.target.checked)} />
              <span>Auto-add Music</span>
            </label>
          </div>

          <div className="section">
            <button
              className="add-meme-btn"
              onClick={handleAddMeme}
              disabled={!selectedTemplate}
            >
              ➕ Create Meme
            </button>
            <p className="hint">Select a template first</p>
          </div>
        </div>

        <div className="studio-main">
          <div className="memes-container">
            {memes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">😂</div>
                <h3>No Memes Yet</h3>
                <p>Select a template and click "Create Meme" to get started</p>
              </div>
            ) : (
              <div className="memes-list">
                {memes.map(meme => {
                  const template = templates.find(t => t.id === meme.templateId)
                  return (
                    <div key={meme.id} className="meme-card">
                      <div className="meme-preview" style={{ background: template?.preview }}>
                        <div className="meme-text top-text">
                          <input
                            type="text"
                            value={meme.topText}
                            onChange={e => handleUpdateMeme(meme.id, 'topText', e.target.value)}
                            placeholder="TOP TEXT"
                          />
                        </div>
                        <div className="meme-text bottom-text">
                          <input
                            type="text"
                            value={meme.bottomText}
                            onChange={e => handleUpdateMeme(meme.id, 'bottomText', e.target.value)}
                            placeholder="BOTTOM TEXT"
                          />
                        </div>
                      </div>
                      <div className="meme-details">
                        <div className="template-name-small">
                          {template?.name}
                        </div>
                        <input
                          type="text"
                          className="caption-input"
                          value={meme.caption || ''}
                          onChange={e => handleUpdateMeme(meme.id, 'caption', e.target.value)}
                          placeholder="Add caption for social media..."
                        />
                        <textarea
                          className="voice-reaction-input"
                          value={meme.voiceReaction || ''}
                          onChange={e => handleUpdateMeme(meme.id, 'voiceReaction', e.target.value)}
                          placeholder="Add voice reaction (optional)..."
                          rows={2}
                        />
                      </div>
                      <div className="meme-footer">
                        <div className={`status-badge ${meme.status}`}>
                          {meme.status === 'pending' && '⏳ Pending'}
                          {meme.status === 'ready' && '✓ Ready'}
                          {meme.status === 'exporting' && '📤 Exporting'}
                        </div>
                        <button className="delete-btn" onClick={() => handleDeleteMeme(meme.id)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {memes.length > 0 && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={handleProcess}
                disabled={isProcessing || memes.filter(m => m.status === 'pending').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${memes.filter(m => m.status === 'pending').length} Meme(s)`}
              </button>
              <button
                className="export-btn"
                disabled={memes.filter(m => m.status === 'ready').length === 0}
              >
                📤 Export {memes.filter(m => m.status === 'ready').length} Video(s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

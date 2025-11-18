/**
 * Quotes Studio - Motivational Quote Videos
 * Features: Batch import, TTS, animated templates, auto branding, scheduled upload
 */

import { useState } from 'react'
import { generateTTS, parseCSV, autoSelectMusic, batchProcess } from '../../utils/studioUtils'
import './QuotesStudio.css'

interface Quote {
  id: string
  text: string
  author: string
  template?: string
  backgroundUrl?: string
  musicUrl?: string
  voiceoverUrl?: string
  status: 'pending' | 'ready' | 'exporting'
}

export default function QuotesStudio() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('gradient-1')
  const [enableTTS, setEnableTTS] = useState(true)
  const [autoMusic, setAutoMusic] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const templates = [
    { id: 'gradient-1', name: 'Purple Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient-2', name: 'Sunset', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'gradient-3', name: 'Ocean', preview: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { id: 'gradient-4', name: 'Forest', preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
    { id: 'gradient-5', name: 'Fire', preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
    { id: 'gradient-6', name: 'Sky', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ]

  const handleBatchImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const rows = parseCSV(text)

    const newQuotes: Quote[] = rows.map((row, i) => ({
      id: `quote-${new Date().getTime()}-${i}`,
      text: row[0] || '',
      author: row[1] || 'Unknown',
      template: selectedTemplate,
      status: 'pending'
    }))

    setQuotes([...quotes, ...newQuotes])
  }

  const handleSingleQuote = () => {
    const newQuote: Quote = {
      id: `quote-${new Date().getTime()}`,
      text: 'Enter your quote here...',
      author: 'Author Name',
      template: selectedTemplate,
      status: 'pending'
    }
    setQuotes([...quotes, newQuote])
  }

  const handleProcess = async () => {
    setIsProcessing(true)

    const pendingQuotes = quotes.filter(q => q.status === 'pending')

    await batchProcess(pendingQuotes, async (quote) => {
      if (enableTTS) {
        quote.voiceoverUrl = await generateTTS(quote.text, {
          provider: 'openai',
          voice: 'nova',
          speed: 1.0,
          pitch: 1.0,
          language: 'en-US'
        })
      }

      if (autoMusic) {
        const music = await autoSelectMusic('inspiring')
        quote.musicUrl = music.url
      }

      quote.status = 'ready'
      setQuotes([...quotes])
    })

    setIsProcessing(false)
  }

  const handleUpdateQuote = (id: string, field: 'text' | 'author', value: string) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const handleDeleteQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id))
  }

  return (
    <div className="quotes-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>💭 Quotes Studio</h2>
          <p>Create motivational quote videos in batch with AI voiceovers and auto music sync</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{quotes.length}</span>
            <span className="stat-label">Quotes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{quotes.filter(q => q.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
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
            <h3>⚙️ Options</h3>
            <label className="checkbox">
              <input type="checkbox" checked={enableTTS} onChange={e => setEnableTTS(e.target.checked)} />
              <span>Generate AI Voiceover</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={autoMusic} onChange={e => setAutoMusic(e.target.checked)} />
              <span>Auto-select Background Music</span>
            </label>
          </div>

          <div className="section">
            <h3>📥 Import</h3>
            <input type="file" accept=".csv,.txt" onChange={handleBatchImport} style={{ display: 'none' }} id="batch-upload" />
            <label htmlFor="batch-upload" className="import-btn">
              📁 Import CSV File
            </label>
            <p className="hint">Format: Quote, Author</p>
            <p className="hint-example">Example: "Be yourself",Oscar Wilde</p>

            <button className="add-single-btn" onClick={handleSingleQuote}>
              ➕ Add Single Quote
            </button>
          </div>
        </div>

        <div className="studio-main">
          <div className="quotes-container">
            {quotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💭</div>
                <h3>No Quotes Yet</h3>
                <p>Import a CSV file or add a single quote to get started</p>
              </div>
            ) : (
              <div className="quotes-list">
                {quotes.map(quote => (
                  <div key={quote.id} className="quote-card">
                    <div className="quote-preview" style={{ background: templates.find(t => t.id === quote.template)?.preview }}>
                      <textarea
                        className="quote-text-edit"
                        value={quote.text}
                        onChange={e => handleUpdateQuote(quote.id, 'text', e.target.value)}
                        placeholder="Quote text..."
                      />
                      <input
                        type="text"
                        className="quote-author-edit"
                        value={quote.author}
                        onChange={e => handleUpdateQuote(quote.id, 'author', e.target.value)}
                        placeholder="Author name..."
                      />
                    </div>
                    <div className="quote-card-footer">
                      <div className={`status-badge ${quote.status}`}>
                        {quote.status === 'pending' && '⏳ Pending'}
                        {quote.status === 'ready' && '✓ Ready'}
                        {quote.status === 'exporting' && '📤 Exporting'}
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteQuote(quote.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {quotes.length > 0 && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={handleProcess}
                disabled={isProcessing || quotes.filter(q => q.status === 'pending').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${quotes.filter(q => q.status === 'pending').length} Quote(s)`}
              </button>
              <button
                className="export-btn"
                disabled={quotes.filter(q => q.status === 'ready').length === 0}
              >
                📤 Export {quotes.filter(q => q.status === 'ready').length} Video(s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

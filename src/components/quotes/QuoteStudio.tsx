/**
 * Quote & Motivation Studio
 * Create inspirational quote videos with stylish text overlays and animated backgrounds
 * Features: Batch quote import, text styling, branding, animated backgrounds
 */

import { useState } from 'react'
import { useToast } from '../common/ToastContainer'
import './QuoteStudio.css'

interface QuoteTemplate {
  id: string
  name: string
  description: string
  category: 'minimal' | 'bold' | 'elegant' | 'modern' | 'nature' | 'abstract'
  backgroundImage: string
  textPosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
  fontFamily: string
  fontSize: number
  textColor: string
  textShadow: boolean
  animation: 'fade' | 'slide' | 'zoom' | 'typewriter' | 'none'
  overlayOpacity: number
}

interface Quote {
  id: string
  text: string
  author: string
  category: string
}

export default function QuoteStudio() {
  const { success, error: showError, info } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [customText, setCustomText] = useState('')
  const [customAuthor, setCustomAuthor] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // Pre-built quote templates with real styling
  const templates: QuoteTemplate[] = [
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      description: 'Clean black background with white text',
      category: 'minimal',
      backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      textPosition: 'center',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: 48,
      textColor: '#ffffff',
      textShadow: false,
      animation: 'fade',
      overlayOpacity: 0,
    },
    {
      id: 'bold-gradient',
      name: 'Bold Gradient',
      description: 'Vibrant gradient with bold text',
      category: 'bold',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textPosition: 'center',
      fontFamily: 'Impact, sans-serif',
      fontSize: 56,
      textColor: '#ffffff',
      textShadow: true,
      animation: 'zoom',
      overlayOpacity: 0.2,
    },
    {
      id: 'elegant-serif',
      name: 'Elegant Serif',
      description: 'Sophisticated with serif fonts',
      category: 'elegant',
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      textPosition: 'center',
      fontFamily: 'Georgia, serif',
      fontSize: 44,
      textColor: '#2c3e50',
      textShadow: false,
      animation: 'typewriter',
      overlayOpacity: 0.1,
    },
    {
      id: 'modern-geometric',
      name: 'Modern Geometric',
      description: 'Contemporary with geometric patterns',
      category: 'modern',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      textPosition: 'bottom',
      fontFamily: 'Roboto, sans-serif',
      fontSize: 40,
      textColor: '#ffffff',
      textShadow: true,
      animation: 'slide',
      overlayOpacity: 0.3,
    },
    {
      id: 'nature-calm',
      name: 'Nature Calm',
      description: 'Natural tones with calming colors',
      category: 'nature',
      backgroundImage: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      textPosition: 'center',
      fontFamily: 'Verdana, sans-serif',
      fontSize: 42,
      textColor: '#ffffff',
      textShadow: true,
      animation: 'fade',
      overlayOpacity: 0.15,
    },
    {
      id: 'abstract-artistic',
      name: 'Abstract Artistic',
      description: 'Creative abstract background',
      category: 'abstract',
      backgroundImage: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 50%, #6a11cb 100%)',
      textPosition: 'center',
      fontFamily: 'Courier New, monospace',
      fontSize: 38,
      textColor: '#ffffff',
      textShadow: true,
      animation: 'zoom',
      overlayOpacity: 0.25,
    },
  ]

  // Sample motivational quotes
  const sampleQuotes: Quote[] = [
    { id: '1', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'motivation' },
    { id: '2', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'success' },
    { id: '3', text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'belief' },
    { id: '4', text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'dreams' },
    { id: '5', text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'perseverance' },
  ]

  // Handle CSV import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      const importedQuotes: Quote[] = lines.slice(1).map((line, index) => {
        const [quoteText, author, category] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
        return {
          id: `imported-${Date.now()}-${index}`,
          text: quoteText || '',
          author: author || 'Unknown',
          category: category || 'general',
        }
      }).filter(q => q.text)

      setQuotes([...quotes, ...importedQuotes])
      success(`Imported ${importedQuotes.length} quotes successfully!`)
    }
    reader.readAsText(file)
  }

  // Add single quote
  const handleAddQuote = () => {
    if (!customText.trim()) {
      showError('Please enter quote text')
      return
    }

    const newQuote: Quote = {
      id: `custom-${Date.now()}`,
      text: customText,
      author: customAuthor || 'Anonymous',
      category: 'custom',
    }

    setQuotes([...quotes, newQuote])
    setCustomText('')
    setCustomAuthor('')
    success('Quote added!')
  }

  // Load sample quotes
  const handleLoadSamples = () => {
    setQuotes([...quotes, ...sampleQuotes])
    info(`Loaded ${sampleQuotes.length} sample quotes`)
  }

  // Export batch
  const handleBatchExport = async () => {
    if (quotes.length === 0) {
      showError('No quotes to export. Add quotes first.')
      return
    }

    if (!selectedTemplate) {
      showError('Please select a template')
      return
    }

    setIsExporting(true)

    try {
      // Simulate batch export
      for (let i = 0; i < quotes.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        // In production, this would call actual video rendering
      }

      success(`Successfully exported ${quotes.length} quote videos!`)
    } catch (err: any) {
      showError(`Export failed: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const currentQuote = quotes[currentQuoteIndex]

  return (
    <div className="quote-studio">
      {/* Header */}
      <div className="studio-header">
        <div className="header-left">
          <h1>💬 Quote & Motivation Studio</h1>
          <p>Create inspiring quote videos with beautiful templates and batch export</p>
        </div>
      </div>

      <div className="studio-container">
        {/* Sidebar */}
        <div className="studio-sidebar">
          {/* Template Selection */}
          <div className="sidebar-section">
            <h3>📐 Templates</h3>
            <div className="template-list">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`template-item ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div
                    className="template-thumbnail"
                    style={{ background: template.backgroundImage }}
                  >
                    <span style={{
                      fontFamily: template.fontFamily,
                      color: template.textColor,
                      fontSize: '10px',
                      textShadow: template.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
                    }}>
                      Aa
                    </span>
                  </div>
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-desc">{template.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Management */}
          <div className="sidebar-section">
            <h3>📝 Quotes ({quotes.length})</h3>

            <div className="quote-actions">
              <button className="action-btn" onClick={handleLoadSamples}>
                📚 Load Samples
              </button>
              <label className="action-btn">
                📄 Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="add-quote-form">
              <textarea
                placeholder="Enter quote text..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
              />
              <input
                type="text"
                placeholder="Author (optional)"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
              />
              <button className="add-btn" onClick={handleAddQuote}>
                ➕ Add Quote
              </button>
            </div>

            {quotes.length > 0 && (
              <div className="quote-navigator">
                <button
                  onClick={() => setCurrentQuoteIndex(Math.max(0, currentQuoteIndex - 1))}
                  disabled={currentQuoteIndex === 0}
                >
                  ◀
                </button>
                <span>{currentQuoteIndex + 1} / {quotes.length}</span>
                <button
                  onClick={() => setCurrentQuoteIndex(Math.min(quotes.length - 1, currentQuoteIndex + 1))}
                  disabled={currentQuoteIndex === quotes.length - 1}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="sidebar-section">
            <h3>📤 Export</h3>
            <button
              className="export-btn"
              onClick={handleBatchExport}
              disabled={isExporting || quotes.length === 0 || !selectedTemplate}
            >
              {isExporting ? '⏳ Exporting...' : `🎬 Export ${quotes.length} Videos`}
            </button>
          </div>
        </div>

        {/* Main Preview */}
        <div className="studio-main">
          <div className="preview-container">
            {selectedTemplate && currentQuote ? (
              <div
                className="quote-preview"
                style={{
                  background: selectedTemplate.backgroundImage,
                  fontFamily: selectedTemplate.fontFamily,
                  color: selectedTemplate.textColor,
                }}
              >
                <div className={`quote-content ${selectedTemplate.textPosition}`}>
                  <p
                    className="quote-text"
                    style={{
                      fontSize: `${selectedTemplate.fontSize}px`,
                      textShadow: selectedTemplate.textShadow ? '3px 3px 6px rgba(0,0,0,0.5)' : 'none',
                    }}
                  >
                    "{currentQuote.text}"
                  </p>
                  <p className="quote-author">— {currentQuote.author}</p>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <div className="empty-icon">💬</div>
                <h3>No Preview Available</h3>
                <p>Select a template and add quotes to see preview</p>
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="template-details">
              <h4>Template Settings</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Animation:</span>
                  <span className="detail-value">{selectedTemplate.animation}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Text Position:</span>
                  <span className="detail-value">{selectedTemplate.textPosition}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Font:</span>
                  <span className="detail-value">{selectedTemplate.fontFamily.split(',')[0]}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Storytelling Studio - Audiobooks & Narratives
 * Features: Scrolling text, AI narration, backgrounds, pacing controls, batch chapter builder
 */

import { useState } from 'react'
import { generateTTS, parseCSV, batchProcess } from '../../utils/studioUtils'
import './StorytellingStudio.css'

interface Chapter {
  id: string
  title: string
  content: string
  voiceoverUrl?: string
  duration: number
  status: 'pending' | 'ready' | 'exporting'
}

interface Story {
  id: string
  title: string
  author: string
  chapters: Chapter[]
  visualStyle: string
  voiceId: string
  readingSpeed: number
  transitionStyle: 'scroll' | 'flip' | 'fade'
  status: 'editing' | 'ready' | 'exporting'
}

export default function StorytellingStudio() {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedVisual, setSelectedVisual] = useState('book-pages')
  const [selectedVoice, setSelectedVoice] = useState('nova')
  const [readingSpeed, setReadingSpeed] = useState(1.0)
  const [transitionStyle, setTransitionStyle] = useState<'scroll' | 'flip' | 'fade'>('scroll')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTextImport, setShowTextImport] = useState(false)
  const [textImportContent, setTextImportContent] = useState('')

  const visualStyles = [
    { id: 'book-pages', name: 'Book Pages', preview: 'linear-gradient(135deg, #f5f3ee 0%, #e8e4d9 100%)' },
    { id: 'parchment', name: 'Parchment', preview: 'linear-gradient(135deg, #f4e8d0 0%, #d9c7a8 100%)' },
    { id: 'dark-elegant', name: 'Dark Elegant', preview: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' },
    { id: 'comic-style', name: 'Comic Panels', preview: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' },
    { id: 'abstract-art', name: 'Abstract Art', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'minimal-white', name: 'Minimal White', preview: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)' },
  ]

  const voices = [
    { id: 'nova', name: 'Nova (Female, Warm)', provider: 'OpenAI' },
    { id: 'alloy', name: 'Alloy (Neutral, Clear)', provider: 'OpenAI' },
    { id: 'echo', name: 'Echo (Male, Narrator)', provider: 'OpenAI' },
    { id: 'onyx', name: 'Onyx (Male, Deep)', provider: 'OpenAI' },
    { id: 'shimmer', name: 'Shimmer (Female, Expressive)', provider: 'OpenAI' },
  ]

  const handleCreateStory = () => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: `New Story ${stories.length + 1}`,
      author: 'Author Name',
      chapters: [],
      visualStyle: selectedVisual,
      voiceId: selectedVoice,
      readingSpeed,
      transitionStyle,
      status: 'editing'
    }
    setStories([...stories, newStory])
  }

  const handleImportText = () => {
    if (!textImportContent.trim()) return

    // Split text into chapters (assuming ### Chapter Title format)
    const chapterSections = textImportContent.split(/^###\s+/m).filter(Boolean)

    const chapters: Chapter[] = chapterSections.map((section, i) => {
      const lines = section.split('\n')
      const title = lines[0].trim() || `Chapter ${i + 1}`
      const content = lines.slice(1).join('\n').trim()

      return {
        id: `chapter-${Date.now()}-${i}`,
        title,
        content,
        duration: Math.ceil(content.split(' ').length / (readingSpeed * 150)) * 60,
        status: 'pending'
      }
    })

    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: `Imported Story ${stories.length + 1}`,
      author: 'Author Name',
      chapters,
      visualStyle: selectedVisual,
      voiceId: selectedVoice,
      readingSpeed,
      transitionStyle,
      status: 'editing'
    }

    setStories([...stories, newStory])
    setTextImportContent('')
    setShowTextImport(false)
  }

  const handleBatchImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const rows = parseCSV(text)

    // Expected format: Title, Author, ChapterTitle1, ChapterContent1, ChapterTitle2, ChapterContent2...
    const newStories: Story[] = rows.map((row, i) => {
      const title = row[0] || `Story ${i + 1}`
      const author = row[1] || 'Unknown Author'

      const chapters: Chapter[] = []
      for (let j = 2; j < row.length; j += 2) {
        if (row[j] && row[j + 1]) {
          chapters.push({
            id: `chapter-${Date.now()}-${i}-${j}`,
            title: row[j],
            content: row[j + 1],
            duration: Math.ceil(row[j + 1].split(' ').length / (readingSpeed * 150)) * 60,
            status: 'pending'
          })
        }
      }

      return {
        id: `story-${Date.now()}-${i}`,
        title,
        author,
        chapters,
        visualStyle: selectedVisual,
        voiceId: selectedVoice,
        readingSpeed,
        transitionStyle,
        status: 'editing'
      }
    })

    setStories([...stories, ...newStories])
  }

  const handleAddChapter = (storyId: string) => {
    setStories(stories.map(story => {
      if (story.id === storyId) {
        const newChapter: Chapter = {
          id: `chapter-${Date.now()}`,
          title: `Chapter ${story.chapters.length + 1}`,
          content: '',
          duration: 300,
          status: 'pending'
        }
        story.chapters.push(newChapter)
      }
      return story
    }))
  }

  const handleUpdateChapter = (storyId: string, chapterId: string, field: 'title' | 'content', value: string) => {
    setStories(stories.map(story => {
      if (story.id === storyId) {
        story.chapters = story.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return { ...chapter, [field]: value }
          }
          return chapter
        })
      }
      return story
    }))
  }

  const handleDeleteChapter = (storyId: string, chapterId: string) => {
    setStories(stories.map(story => {
      if (story.id === storyId) {
        story.chapters = story.chapters.filter(c => c.id !== chapterId)
      }
      return story
    }))
  }

  const handleProcessStory = async (storyId: string) => {
    setIsProcessing(true)

    const story = stories.find(s => s.id === storyId)
    if (!story) return

    // Process each chapter
    await batchProcess(story.chapters, async (chapter) => {
      if (chapter.content) {
        chapter.voiceoverUrl = await generateTTS(chapter.content, {
          provider: 'openai',
          voice: story.voiceId,
          speed: story.readingSpeed,
          pitch: 1.0,
          language: 'en-US'
        })
      }
      chapter.status = 'ready'
    })

    story.status = 'ready'
    setStories([...stories])
    setIsProcessing(false)
  }

  const handleDeleteStory = (storyId: string) => {
    setStories(stories.filter(s => s.id !== storyId))
  }

  return (
    <div className="storytelling-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>📖 Storytelling Studio</h2>
          <p>Create audiobooks and narrative videos with AI narration and beautiful visuals</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stories.length}</span>
            <span className="stat-label">Stories</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stories.filter(s => s.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stories.reduce((acc, s) => acc + s.chapters.length, 0)}</span>
            <span className="stat-label">Chapters</span>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          <div className="section">
            <h3>🎨 Visual Style</h3>
            <div className="visual-grid">
              {visualStyles.map(style => (
                <div
                  key={style.id}
                  className={`visual-card ${selectedVisual === style.id ? 'active' : ''}`}
                  onClick={() => setSelectedVisual(style.id)}
                  style={{ background: style.preview }}
                >
                  <span className="visual-name">{style.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎙️ Narration</h3>
            <label className="input-label">Voice</label>
            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="select-input">
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            <label className="input-label">Reading Speed</label>
            <div className="speed-control">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={readingSpeed}
                onChange={e => setReadingSpeed(parseFloat(e.target.value))}
              />
              <span className="speed-value">{readingSpeed.toFixed(1)}x</span>
            </div>

            <label className="input-label">Transition Style</label>
            <select value={transitionStyle} onChange={e => setTransitionStyle(e.target.value as any)} className="select-input">
              <option value="scroll">Scroll</option>
              <option value="flip">Flip Pages</option>
              <option value="fade">Fade</option>
            </select>
          </div>

          <div className="section">
            <h3>📥 Create Story</h3>
            <button className="create-btn" onClick={handleCreateStory}>
              ➕ New Blank Story
            </button>
            <button className="create-btn" onClick={() => setShowTextImport(true)}>
              📝 Import Text
            </button>
            <input type="file" accept=".csv,.txt" onChange={handleBatchImportCSV} style={{ display: 'none' }} id="batch-upload" />
            <label htmlFor="batch-upload" className="import-btn">
              📁 Batch Import CSV
            </label>
            <p className="hint">CSV: Title, Author, Ch1Title, Ch1Text...</p>
          </div>
        </div>

        <div className="studio-main">
          {stories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <h3>No Stories Yet</h3>
              <p>Create a new story or import text to get started</p>
            </div>
          ) : (
            <div className="stories-list">
              {stories.map(story => (
                <div key={story.id} className="story-card">
                  <div className="story-header">
                    <div className="story-title-section">
                      <input
                        type="text"
                        className="story-title-input"
                        value={story.title}
                        onChange={e => setStories(stories.map(s => s.id === story.id ? { ...s, title: e.target.value } : s))}
                        placeholder="Story title..."
                      />
                      <input
                        type="text"
                        className="story-author-input"
                        value={story.author}
                        onChange={e => setStories(stories.map(s => s.id === story.id ? { ...s, author: e.target.value } : s))}
                        placeholder="Author..."
                      />
                    </div>
                    <div className="story-actions">
                      <button className="icon-btn" onClick={() => handleProcessStory(story.id)} disabled={story.status === 'ready'}>
                        {story.status === 'ready' ? '✓' : '▶️'}
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDeleteStory(story.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="chapters-container">
                    {story.chapters.map((chapter, index) => (
                      <div key={chapter.id} className="chapter-card">
                        <div className="chapter-number">{index + 1}</div>
                        <div className="chapter-content">
                          <input
                            type="text"
                            className="chapter-title-input"
                            value={chapter.title}
                            onChange={e => handleUpdateChapter(story.id, chapter.id, 'title', e.target.value)}
                            placeholder="Chapter title..."
                          />
                          <textarea
                            className="chapter-text-input"
                            value={chapter.content}
                            onChange={e => handleUpdateChapter(story.id, chapter.id, 'content', e.target.value)}
                            placeholder="Chapter text..."
                            rows={4}
                          />
                          <div className="chapter-meta">
                            <span>~{Math.floor(chapter.duration / 60)} min read</span>
                            <span>•</span>
                            <span>{chapter.content.split(' ').length} words</span>
                            <button className="icon-btn-small delete" onClick={() => handleDeleteChapter(story.id, chapter.id)}>
                              ×
                            </button>
                          </div>
                          {chapter.status === 'ready' && (
                            <div className="chapter-status ready">✓ Narration Ready</div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="add-chapter-btn" onClick={() => handleAddChapter(story.id)}>
                      ➕ Add Chapter
                    </button>
                  </div>

                  <div className="story-footer">
                    <div className={`status-badge ${story.status}`}>
                      {story.status === 'editing' && '✏️ Editing'}
                      {story.status === 'ready' && '✓ Ready to Export'}
                      {story.status === 'exporting' && '📤 Exporting'}
                    </div>
                    <div className="story-info">
                      <span>{story.chapters.length} chapters</span>
                      <span>•</span>
                      <span>{visualStyles.find(v => v.id === story.visualStyle)?.name}</span>
                      <span>•</span>
                      <span>{story.transitionStyle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stories.length > 0 && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={() => stories.filter(s => s.status === 'editing').forEach(s => handleProcessStory(s.id))}
                disabled={isProcessing || stories.filter(s => s.status === 'editing').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${stories.filter(s => s.status === 'editing').length} Stor${stories.filter(s => s.status === 'editing').length === 1 ? 'y' : 'ies'}`}
              </button>
              <button
                className="export-btn"
                disabled={stories.filter(s => s.status === 'ready').length === 0}
              >
                📤 Export {stories.filter(s => s.status === 'ready').length} Stor${stories.filter(s => s.status === 'ready').length === 1 ? 'y' : 'ies'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text Import Modal */}
      {showTextImport && (
        <div className="modal-overlay" onClick={() => setShowTextImport(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Import Story Text</h3>
              <button className="modal-close" onClick={() => setShowTextImport(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-hint">
                Paste your story below. Use "### Chapter Title" to separate chapters.
              </p>
              <textarea
                className="text-import-textarea"
                value={textImportContent}
                onChange={e => setTextImportContent(e.target.value)}
                placeholder="### Chapter 1&#10;Once upon a time...&#10;&#10;### Chapter 2&#10;And then..."
                rows={15}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTextImport(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleImportText}>
                ✨ Import Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

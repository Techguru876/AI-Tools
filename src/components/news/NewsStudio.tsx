/**
 * News Studio - Trending News Videos
 * Features: RSS feed import, TTS narration, automated editing, trend detection
 */

import { useState } from 'react'
import { generateTTS, searchStockMedia, batchProcess, parseRSSFeed, getTrendingNews, RSSItem } from '../../utils/studioUtils'
import './NewsStudio.css'

interface NewsStory {
  id: string
  title: string
  content: string
  source: string
  category: 'tech' | 'business' | 'sports' | 'entertainment' | 'world'
  thumbnailUrl?: string
  bRollUrls?: string[]
  voiceoverUrl?: string
  musicUrl?: string
  status: 'pending' | 'ready' | 'exporting'
}

export default function NewsStudio() {
  const [stories, setStories] = useState<NewsStory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | NewsStory['category']>('all')
  const [enableTTS, setEnableTTS] = useState(true)
  const [autoBRoll, setAutoBRoll] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rssFeedUrl, setRssFeedUrl] = useState('')

  const categories = [
    { id: 'all', name: 'All News', icon: '📰', color: '#e91e63' },
    { id: 'tech', name: 'Technology', icon: '💻', color: '#00bcd4' },
    { id: 'business', name: 'Business', icon: '💼', color: '#4caf50' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: '#ff9800' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#9c27b0' },
    { id: 'world', name: 'World', icon: '🌍', color: '#f44336' },
  ] as const

  const handleImportRSS = async () => {
    if (!rssFeedUrl) {
      alert('Please enter an RSS feed URL')
      return
    }

    try {
      setIsProcessing(true)
      const rssItems = await parseRSSFeed(rssFeedUrl)

      if (rssItems.length === 0) {
        alert('No stories found in RSS feed')
        return
      }

      // Convert RSS items to stories
      const newStories: NewsStory[] = rssItems.map(item => ({
        id: `story-${Date.now()}-${Math.random()}`,
        title: item.title,
        content: item.description || item.content,
        source: item.source,
        category: 'tech', // Default category
        status: 'pending'
      }))

      setStories([...stories, ...newStories])
      setRssFeedUrl('')
      alert(`Successfully imported ${newStories.length} stories from RSS feed`)

    } catch (error: any) {
      alert(`RSS Import Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLoadTrending = async () => {
    try {
      setIsProcessing(true)
      const category = selectedCategory === 'all' ? undefined : selectedCategory
      const trendingItems = await getTrendingNews(category)

      if (trendingItems.length === 0) {
        alert('No trending stories found')
        return
      }

      const newStories: NewsStory[] = trendingItems.slice(0, 10).map(item => ({
        id: `story-${Date.now()}-${Math.random()}`,
        title: item.title,
        content: item.description || item.content,
        source: item.source,
        category: category || 'tech',
        status: 'pending'
      }))

      setStories([...stories, ...newStories])
      alert(`Loaded ${newStories.length} trending stories`)

    } catch (error: any) {
      alert(`Error loading trending news: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddStory = () => {
    const newStory: NewsStory = {
      id: `story-${Date.now()}`,
      title: 'New Story Title',
      content: 'Story content goes here...',
      source: 'Source',
      category: 'tech',
      status: 'pending'
    }
    setStories([...stories, newStory])
  }

  const handleProcess = async () => {
    setIsProcessing(true)

    const pendingStories = stories.filter(s => s.status === 'pending')

    await batchProcess(pendingStories, async (story) => {
      if (enableTTS) {
        const script = `${story.title}. ${story.content}`
        story.voiceoverUrl = await generateTTS(script, {
          provider: 'openai',
          voice: 'onyx',
          speed: 1.1,
          pitch: 1.0,
          language: 'en-US'
        })
      }

      if (autoBRoll) {
        const keywords = story.title.split(' ').slice(0, 3).join(' ')
        const media = await searchStockMedia(keywords, 'video', 3)
        story.bRollUrls = media.map(m => m.url)
      }

      story.status = 'ready'
      setStories([...stories])
    })

    setIsProcessing(false)
  }

  const handleUpdateStory = (id: string, field: keyof NewsStory, value: any) => {
    setStories(stories.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleDeleteStory = (id: string) => {
    setStories(stories.filter(s => s.id !== id))
  }

  const filteredStories = selectedCategory === 'all'
    ? stories
    : stories.filter(s => s.category === selectedCategory)

  return (
    <div className="news-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>📰 News Studio</h2>
          <p>Create engaging news videos with AI narration and automated B-roll</p>
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
                  style={{ '--category-color': cat.color } as React.CSSProperties}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>⚙️ Options</h3>
            <label className="checkbox">
              <input type="checkbox" checked={enableTTS} onChange={e => setEnableTTS(e.target.checked)} />
              <span>Generate AI Narration</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={autoBRoll} onChange={e => setAutoBRoll(e.target.checked)} />
              <span>Auto-find B-roll Footage</span>
            </label>
          </div>

          <div className="section">
            <h3>📥 Import</h3>
            <input
              type="text"
              className="rss-input"
              placeholder="RSS Feed URL"
              value={rssFeedUrl}
              onChange={e => setRssFeedUrl(e.target.value)}
            />
            <button className="import-btn" onClick={handleImportRSS} disabled={isProcessing}>
              📡 Import from RSS
            </button>
            <button className="import-btn" onClick={handleLoadTrending} disabled={isProcessing} style={{ marginTop: '10px', background: '#00bcd4' }}>
              🔥 Load Trending Stories
            </button>
            <div className="divider">or</div>
            <button className="add-single-btn" onClick={handleAddStory}>
              ➕ Add Single Story
            </button>
          </div>
        </div>

        <div className="studio-main">
          <div className="stories-container">
            {filteredStories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📰</div>
                <h3>No Stories Yet</h3>
                <p>Import from an RSS feed or add a story manually to get started</p>
              </div>
            ) : (
              <div className="stories-list">
                {filteredStories.map(story => (
                  <div key={story.id} className="story-card">
                    <div className="story-header">
                      <select
                        className="category-select"
                        value={story.category}
                        onChange={e => handleUpdateStory(story.id, 'category', e.target.value)}
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                      <button className="delete-btn" onClick={() => handleDeleteStory(story.id)}>
                        🗑️
                      </button>
                    </div>
                    <input
                      type="text"
                      className="story-title"
                      value={story.title}
                      onChange={e => handleUpdateStory(story.id, 'title', e.target.value)}
                      placeholder="Story headline..."
                    />
                    <textarea
                      className="story-content"
                      value={story.content}
                      onChange={e => handleUpdateStory(story.id, 'content', e.target.value)}
                      placeholder="Story content..."
                      rows={4}
                    />
                    <input
                      type="text"
                      className="story-source"
                      value={story.source}
                      onChange={e => handleUpdateStory(story.id, 'source', e.target.value)}
                      placeholder="Source..."
                    />
                    <div className="story-footer">
                      <div className={`status-badge ${story.status}`}>
                        {story.status === 'pending' && '⏳ Pending'}
                        {story.status === 'ready' && '✓ Ready'}
                        {story.status === 'exporting' && '📤 Exporting'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {stories.length > 0 && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={handleProcess}
                disabled={isProcessing || stories.filter(s => s.status === 'pending').length === 0}
              >
                {isProcessing ? '⏳ Processing...' : `✨ Process ${stories.filter(s => s.status === 'pending').length} Story(ies)`}
              </button>
              <button
                className="export-btn"
                disabled={stories.filter(s => s.status === 'ready').length === 0}
              >
                📤 Export {stories.filter(s => s.status === 'ready').length} Video(s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

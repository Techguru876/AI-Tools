/**
 * Settings Component
 * Manages API keys, preferences, and application settings
 */

import { useState, useEffect } from 'react'
import './Settings.css'

interface SettingsProps {
  onClose: () => void
}

interface APIKeys {
  openai: string
  elevenlabs: string
  pexels: string
  unsplash: string
  pixabay: string
}

export default function Settings({ onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'api' | 'general' | 'export'>('api')
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    elevenlabs: '',
    pexels: '',
    unsplash: '',
    pixabay: '',
  })
  const [showKeys, setShowKeys] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load saved API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('infinitystudio_api_keys')
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('infinitystudio_api_keys', JSON.stringify(apiKeys))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all API keys?')) {
      setApiKeys({
        openai: '',
        elevenlabs: '',
        pexels: '',
        unsplash: '',
        pixabay: '',
      })
      localStorage.removeItem('infinitystudio_api_keys')
    }
  }

  const maskKey = (key: string) => {
    if (!key || showKeys) return key
    if (key.length <= 8) return '•'.repeat(key.length)
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  return (
    <div className="settings-modal" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            🔑 API Keys
          </button>
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            🎛️ General
          </button>
          <button
            className={`settings-tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            📤 Export
          </button>
        </div>

        <div className="settings-body">
          {activeTab === 'api' && (
            <div className="settings-section">
              <div className="section-header">
                <h3>API Keys</h3>
                <label className="show-keys-toggle">
                  <input
                    type="checkbox"
                    checked={showKeys}
                    onChange={(e) => setShowKeys(e.target.checked)}
                  />
                  <span>Show keys</span>
                </label>
              </div>
              <p className="section-description">
                Configure API keys for AI services. Keys are stored locally in your browser.
              </p>

              <div className="api-keys-list">
                <div className="api-key-item">
                  <div className="api-key-header">
                    <label>OpenAI API Key</label>
                    <span className="api-status">
                      {apiKeys.openai ? '✓ Configured' : '○ Not set'}
                    </span>
                  </div>
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={showKeys ? apiKeys.openai : maskKey(apiKeys.openai)}
                    onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    placeholder="sk-..."
                    className="api-key-input"
                  />
                  <p className="api-key-hint">
                    Used for: AI narration (TTS), script generation, content suggestions
                  </p>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="api-key-link"
                  >
                    Get API key →
                  </a>
                </div>

                <div className="api-key-item">
                  <div className="api-key-header">
                    <label>ElevenLabs API Key</label>
                    <span className="api-status">
                      {apiKeys.elevenlabs ? '✓ Configured' : '○ Not set'}
                    </span>
                  </div>
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={showKeys ? apiKeys.elevenlabs : maskKey(apiKeys.elevenlabs)}
                    onChange={(e) => setApiKeys({ ...apiKeys, elevenlabs: e.target.value })}
                    placeholder="..."
                    className="api-key-input"
                  />
                  <p className="api-key-hint">
                    Used for: High-quality voice synthesis, character voices
                  </p>
                  <a
                    href="https://elevenlabs.io/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="api-key-link"
                  >
                    Get API key →
                  </a>
                </div>

                <div className="api-key-item">
                  <div className="api-key-header">
                    <label>Pexels API Key</label>
                    <span className="api-status">
                      {apiKeys.pexels ? '✓ Configured' : '○ Not set'}
                    </span>
                  </div>
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={showKeys ? apiKeys.pexels : maskKey(apiKeys.pexels)}
                    onChange={(e) => setApiKeys({ ...apiKeys, pexels: e.target.value })}
                    placeholder="..."
                    className="api-key-input"
                  />
                  <p className="api-key-hint">
                    Used for: Free stock videos and photos
                  </p>
                  <a
                    href="https://www.pexels.com/api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="api-key-link"
                  >
                    Get API key →
                  </a>
                </div>

                <div className="api-key-item">
                  <div className="api-key-header">
                    <label>Unsplash API Key</label>
                    <span className="api-status">
                      {apiKeys.unsplash ? '✓ Configured' : '○ Not set'}
                    </span>
                  </div>
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={showKeys ? apiKeys.unsplash : maskKey(apiKeys.unsplash)}
                    onChange={(e) => setApiKeys({ ...apiKeys, unsplash: e.target.value })}
                    placeholder="..."
                    className="api-key-input"
                  />
                  <p className="api-key-hint">
                    Used for: High-quality background images
                  </p>
                  <a
                    href="https://unsplash.com/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="api-key-link"
                  >
                    Get API key →
                  </a>
                </div>

                <div className="api-key-item">
                  <div className="api-key-header">
                    <label>Pixabay API Key</label>
                    <span className="api-status">
                      {apiKeys.pixabay ? '✓ Configured' : '○ Not set'}
                    </span>
                  </div>
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={showKeys ? apiKeys.pixabay : maskKey(apiKeys.pixabay)}
                    onChange={(e) => setApiKeys({ ...apiKeys, pixabay: e.target.value })}
                    placeholder="..."
                    className="api-key-input"
                  />
                  <p className="api-key-hint">
                    Used for: Additional stock media resources
                  </p>
                  <a
                    href="https://pixabay.com/api/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="api-key-link"
                  >
                    Get API key →
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <p className="section-description">
                Configure application preferences and behavior
              </p>

              <div className="settings-group">
                <h4>Appearance</h4>
                <div className="setting-item">
                  <label htmlFor="theme-select">Theme</label>
                  <select id="theme-select" className="setting-select" defaultValue="dark">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h4>Language & Region</h4>
                <div className="setting-item">
                  <label htmlFor="language-select">Language</label>
                  <select id="language-select" className="setting-select" defaultValue="en">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h4>Autosave & Backups</h4>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Enable autosave</span>
                  </label>
                  <p className="setting-hint">Automatically save your work every 5 minutes</p>
                </div>
                <div className="setting-item">
                  <label htmlFor="autosave-interval">Autosave interval (minutes)</label>
                  <input
                    id="autosave-interval"
                    type="number"
                    className="setting-input"
                    defaultValue="5"
                    min="1"
                    max="60"
                  />
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Create backup before export</span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>Performance</h4>
                <div className="setting-item">
                  <label htmlFor="preview-quality">Preview quality</label>
                  <select id="preview-quality" className="setting-select" defaultValue="medium">
                    <option value="low">Low (Faster)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Best Quality)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Enable hardware acceleration</span>
                  </label>
                  <p className="setting-hint">Use GPU for faster rendering (recommended)</p>
                </div>
              </div>

              <div className="settings-group">
                <h4>Privacy</h4>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Send anonymous usage statistics</span>
                  </label>
                  <p className="setting-hint">Help us improve InfinityStudio</p>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Save project history locally</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="settings-section">
              <h3>Export Settings</h3>
              <p className="section-description">
                Configure default export options and branding
              </p>

              <div className="settings-group">
                <h4>Default Export Preset</h4>
                <div className="setting-item">
                  <label htmlFor="default-preset">Platform preset</label>
                  <select id="default-preset" className="setting-select" defaultValue="youtube-hd">
                    <option value="youtube-hd">YouTube HD (1080p)</option>
                    <option value="youtube-4k">YouTube 4K (2160p)</option>
                    <option value="tiktok">TikTok (1080p 9:16)</option>
                    <option value="instagram-feed">Instagram Feed (1080p 1:1)</option>
                    <option value="instagram-reels">Instagram Reels (1080p 9:16)</option>
                    <option value="twitter">Twitter/X (720p)</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h4>Video Quality</h4>
                <div className="setting-item">
                  <label htmlFor="video-quality">Quality</label>
                  <select id="video-quality" className="setting-select" defaultValue="1080p">
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4k">4K Ultra HD</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="framerate">Frame rate</label>
                  <select id="framerate" className="setting-select" defaultValue="30">
                    <option value="24">24 fps (Cinematic)</option>
                    <option value="30">30 fps (Standard)</option>
                    <option value="60">60 fps (Smooth)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="bitrate">Bitrate</label>
                  <select id="bitrate" className="setting-select" defaultValue="8">
                    <option value="5">5 Mbps (Good)</option>
                    <option value="8">8 Mbps (Better)</option>
                    <option value="15">15 Mbps (Best)</option>
                    <option value="40">40 Mbps (Maximum)</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h4>Watermark & Branding</h4>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Add watermark to exports</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label htmlFor="watermark-text">Watermark text</label>
                  <input
                    id="watermark-text"
                    type="text"
                    className="setting-input"
                    placeholder="Your Brand Name"
                  />
                </div>
                <div className="setting-item">
                  <label htmlFor="watermark-position">Watermark position</label>
                  <select id="watermark-position" className="setting-select" defaultValue="bottom-right">
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="watermark-opacity">Watermark opacity</label>
                  <input
                    id="watermark-opacity"
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="setting-range"
                  />
                  <span className="range-value">50%</span>
                </div>
              </div>

              <div className="settings-group">
                <h4>Intro & Outro</h4>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Add intro to all videos</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label htmlFor="intro-duration">Intro duration (seconds)</label>
                  <input
                    id="intro-duration"
                    type="number"
                    className="setting-input"
                    defaultValue="3"
                    min="1"
                    max="10"
                  />
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Add outro to all videos</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label htmlFor="outro-duration">Outro duration (seconds)</label>
                  <input
                    id="outro-duration"
                    type="number"
                    className="setting-input"
                    defaultValue="5"
                    min="1"
                    max="15"
                  />
                </div>
              </div>

              <div className="settings-group">
                <h4>File Management</h4>
                <div className="setting-item">
                  <label htmlFor="export-format">Export format</label>
                  <select id="export-format" className="setting-select" defaultValue="mp4">
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="webm">WebM (VP9)</option>
                    <option value="mov">MOV (QuickTime)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="naming-convention">File naming</label>
                  <select id="naming-convention" className="setting-select" defaultValue="project-date">
                    <option value="project-date">ProjectName_YYYY-MM-DD</option>
                    <option value="date-project">YYYY-MM-DD_ProjectName</option>
                    <option value="custom">Custom Template</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Auto-organize exports by date</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="reset-btn" onClick={handleReset}>
            🗑️ Clear All Keys
          </button>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

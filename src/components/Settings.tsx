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
                Coming soon: Theme, language, autosave, and more preferences
              </p>
              <div className="coming-soon-placeholder">
                <span className="placeholder-icon">🚧</span>
                <p>Additional settings will be available in future updates</p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="settings-section">
              <h3>Export Settings</h3>
              <p className="section-description">
                Coming soon: Default export presets, quality settings, watermarks
              </p>
              <div className="coming-soon-placeholder">
                <span className="placeholder-icon">🚧</span>
                <p>Export configuration will be available in future updates</p>
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

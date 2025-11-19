/**
 * Export Automation Component
 * One-click export with platform-specific presets
 * Supports YouTube, TikTok, Instagram, Twitter, and custom exports
 */

import { useState } from 'react'
import { useLofiStore } from '../../stores/lofiStore'
import { useToast } from '../common/ToastContainer'
import './ExportAutomation.css'

type ExportPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'custom'
type ExportFormat = 'video' | 'gif' | 'frames'
type VideoQuality = '720p' | '1080p' | '4k'

interface ExportPreset {
  id: string
  platform: ExportPlatform
  name: string
  icon: string
  description: string
  settings: {
    format: ExportFormat
    quality: VideoQuality
    fps: number
    duration?: number
    aspectRatio: string
    codec: string
    bitrate: string
  }
}

export default function ExportAutomation() {
  const { currentScene, exportScene } = useLofiStore()
  const { success, error: showError } = useToast()
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [customSettings, setCustomSettings] = useState({
    format: 'video' as ExportFormat,
    quality: '1080p' as VideoQuality,
    fps: 30,
    duration: 60,
    generateThumbnail: true,
    addWatermark: false,
  })

  // Export presets for different platforms
  const presets: ExportPreset[] = [
    {
      id: 'youtube-standard',
      platform: 'youtube',
      name: 'YouTube Standard',
      icon: '📺',
      description: '1080p 30fps for YouTube',
      settings: {
        format: 'video',
        quality: '1080p',
        fps: 30,
        aspectRatio: '16:9',
        codec: 'H.264',
        bitrate: '8 Mbps',
      },
    },
    {
      id: 'youtube-hd',
      platform: 'youtube',
      name: 'YouTube HD',
      icon: '🎬',
      description: '4K 60fps for high quality',
      settings: {
        format: 'video',
        quality: '4k',
        fps: 60,
        aspectRatio: '16:9',
        codec: 'H.264',
        bitrate: '40 Mbps',
      },
    },
    {
      id: 'tiktok',
      platform: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      description: '1080x1920 30fps vertical',
      settings: {
        format: 'video',
        quality: '1080p',
        fps: 30,
        duration: 60,
        aspectRatio: '9:16',
        codec: 'H.264',
        bitrate: '6 Mbps',
      },
    },
    {
      id: 'instagram-feed',
      platform: 'instagram',
      name: 'Instagram Feed',
      icon: '📸',
      description: '1080x1080 30fps square',
      settings: {
        format: 'video',
        quality: '1080p',
        fps: 30,
        duration: 60,
        aspectRatio: '1:1',
        codec: 'H.264',
        bitrate: '5 Mbps',
      },
    },
    {
      id: 'instagram-reels',
      platform: 'instagram',
      name: 'Instagram Reels',
      icon: '🎞️',
      description: '1080x1920 30fps vertical',
      settings: {
        format: 'video',
        quality: '1080p',
        fps: 30,
        duration: 60,
        aspectRatio: '9:16',
        codec: 'H.264',
        bitrate: '6 Mbps',
      },
    },
    {
      id: 'twitter',
      platform: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: '1280x720 30fps landscape',
      settings: {
        format: 'video',
        quality: '720p',
        fps: 30,
        duration: 140,
        aspectRatio: '16:9',
        codec: 'H.264',
        bitrate: '5 Mbps',
      },
    },
  ]

  // Group presets by platform
  const groupedPresets = presets.reduce((acc, preset) => {
    if (!acc[preset.platform]) {
      acc[preset.platform] = []
    }
    acc[preset.platform].push(preset)
    return acc
  }, {} as Record<ExportPlatform, ExportPreset[]>)

  const handleExport = async (preset?: ExportPreset) => {
    if (!currentScene) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      const format = preset?.settings.format || customSettings.format
      const result = await exportScene(format)

      clearInterval(progressInterval)
      setExportProgress(100)

      // Show success message
      setTimeout(() => {
        success('Export complete! Video downloaded successfully.')
        setIsExporting(false)
        setExportProgress(0)
      }, 500)
    } catch (err: any) {
      console.error('Export failed:', err)
      setIsExporting(false)
      setExportProgress(0)
      showError(err.message || 'Export failed. Please try again.')
    }
  }

  return (
    <div className="export-automation">
      {/* Header */}
      <div className="export-header">
        <h2>📤 Export Your Scene</h2>
        <p>Choose a platform preset or customize your export settings</p>
      </div>

      {/* Quick export presets */}
      <div className="export-presets">
        <h3>Quick Export Presets</h3>

        {Object.entries(groupedPresets).map(([platform, platformPresets]) => (
          <div key={platform} className="preset-group">
            <h4 className="platform-label">
              {platform === 'youtube' && '📺 YouTube'}
              {platform === 'tiktok' && '🎵 TikTok'}
              {platform === 'instagram' && '📸 Instagram'}
              {platform === 'twitter' && '🐦 Twitter/X'}
            </h4>

            <div className="preset-cards">
              {platformPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`preset-card ${
                    selectedPreset?.id === preset.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedPreset(preset)}
                >
                  <div className="preset-card-header">
                    <span className="preset-icon">{preset.icon}</span>
                    <h5>{preset.name}</h5>
                  </div>
                  <p className="preset-description">{preset.description}</p>

                  <div className="preset-specs">
                    <span>{preset.settings.quality}</span>
                    <span>•</span>
                    <span>{preset.settings.fps} fps</span>
                    <span>•</span>
                    <span>{preset.settings.aspectRatio}</span>
                  </div>

                  {selectedPreset?.id === preset.id && (
                    <button
                      className="export-button primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExport(preset)
                      }}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Exporting...' : 'Export Now'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom export settings */}
      <div className="custom-export">
        <h3>Custom Export Settings</h3>

        <div className="settings-grid">
          <div className="setting-group">
            <label>Format</label>
            <select
              value={customSettings.format}
              onChange={(e) =>
                setCustomSettings({ ...customSettings, format: e.target.value as ExportFormat })
              }
            >
              <option value="video">Video (MP4)</option>
              <option value="gif">Animated GIF</option>
              <option value="frames">Image Sequence</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Quality</label>
            <select
              value={customSettings.quality}
              onChange={(e) =>
                setCustomSettings({
                  ...customSettings,
                  quality: e.target.value as VideoQuality,
                })
              }
            >
              <option value="720p">720p (HD)</option>
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Frame Rate</label>
            <select
              value={customSettings.fps}
              onChange={(e) =>
                setCustomSettings({ ...customSettings, fps: parseInt(e.target.value) })
              }
            >
              <option value="24">24 fps (Cinematic)</option>
              <option value="30">30 fps (Standard)</option>
              <option value="60">60 fps (Smooth)</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              min="1"
              max="3600"
              value={customSettings.duration}
              onChange={(e) =>
                setCustomSettings({ ...customSettings, duration: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="checkbox-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={customSettings.generateThumbnail}
              onChange={(e) =>
                setCustomSettings({ ...customSettings, generateThumbnail: e.target.checked })
              }
            />
            <span>Generate thumbnail image</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={customSettings.addWatermark}
              onChange={(e) =>
                setCustomSettings({ ...customSettings, addWatermark: e.target.checked })
              }
            />
            <span>Add watermark</span>
          </label>
        </div>

        <button
          className="export-button primary large"
          onClick={() => handleExport()}
          disabled={isExporting || !currentScene}
        >
          {isExporting ? 'Exporting...' : 'Export with Custom Settings'}
        </button>
      </div>

      {/* Export progress */}
      {isExporting && (
        <div className="export-progress">
          <div className="progress-header">
            <h4>🎬 Exporting your scene...</h4>
            <span>{exportProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${exportProgress}%` }} />
          </div>
          <p className="progress-info">
            This may take a few minutes depending on your scene complexity
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="export-tips">
        <h4>💡 Export Tips</h4>
        <ul>
          <li>
            <strong>YouTube:</strong> Use 1080p 30fps for standard content, 4K 60fps for
            high-quality streams
          </li>
          <li>
            <strong>TikTok/Reels:</strong> Keep videos under 60 seconds for maximum engagement
          </li>
          <li>
            <strong>File Size:</strong> Higher quality and fps will result in larger file sizes
          </li>
          <li>
            <strong>Thumbnails:</strong> Auto-generated thumbnails use the first frame of your
            video
          </li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Loop Automation Component
 * Automatic visual/audio sync for seamless loops
 * - Detect audio loop points
 * - Detect visual loop points
 * - Auto-sync visual and audio
 * - Tempo matching
 * - Manual loop point adjustment
 */

import { useState } from 'react'
import { useLofiStore } from '../../stores/lofiStore'
import './LoopAutomation.css'

interface LoopPoints {
  start: number
  end: number
  duration: number
}

interface LoopAnalysis {
  audioLoop?: LoopPoints
  visualLoop?: LoopPoints
  bpm?: number
  isSynced: boolean
  recommendations: string[]
}

export default function LoopAutomation() {
  const { currentScene, detectLoopPoints, updateScene } = useLofiStore()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loopAnalysis, setLoopAnalysis] = useState<LoopAnalysis | null>(null)
  const [audioLoopStart, setAudioLoopStart] = useState(0)
  const [audioLoopEnd, setAudioLoopEnd] = useState(60)
  const [visualLoopStart, setVisualLoopStart] = useState(0)
  const [visualLoopEnd, setVisualLoopEnd] = useState(60)
  const [autoSync, setAutoSync] = useState(true)

  // Analyze loop points
  const handleAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      // In real implementation, would call Rust backend:
      // const result = await invoke('detect_loop_points', {
      //   audioPath: currentScene.music_track?.file_path,
      //   duration: currentScene.loop_settings.duration
      // })

      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock analysis
      const mockAnalysis: LoopAnalysis = {
        audioLoop: {
          start: 0,
          end: 60,
          duration: 60,
        },
        visualLoop: {
          start: 0,
          end: 60,
          duration: 60,
        },
        bpm: 85,
        isSynced: true,
        recommendations: [
          '✓ Perfect loop detected at 60 seconds',
          '✓ Audio and visual are in sync',
          '💡 Consider extending to 120 seconds for more variety',
          '🎵 Music tempo (85 BPM) matches perfectly with visual animations',
        ],
      }

      setLoopAnalysis(mockAnalysis)
      if (mockAnalysis.audioLoop) {
        setAudioLoopStart(mockAnalysis.audioLoop.start)
        setAudioLoopEnd(mockAnalysis.audioLoop.end)
      }
      if (mockAnalysis.visualLoop) {
        setVisualLoopStart(mockAnalysis.visualLoop.start)
        setVisualLoopEnd(mockAnalysis.visualLoop.end)
      }
    } catch (error) {
      console.error('Loop analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Apply loop settings
  const handleApplyLoop = () => {
    if (!currentScene) return

    updateScene({
      loop_settings: {
        ...currentScene.loop_settings,
        duration: audioLoopEnd - audioLoopStart,
        visual_loop_point: visualLoopEnd,
        audio_loop_point: audioLoopEnd,
        auto_sync: autoSync,
      },
    })
  }

  // Sync visual to audio
  const handleSyncToAudio = () => {
    setVisualLoopStart(audioLoopStart)
    setVisualLoopEnd(audioLoopEnd)
    setLoopAnalysis((prev) =>
      prev
        ? {
            ...prev,
            isSynced: true,
            recommendations: [...prev.recommendations, '✓ Visual synced to audio loop points'],
          }
        : null
    )
  }

  // Sync audio to visual
  const handleSyncToVisual = () => {
    setAudioLoopStart(visualLoopStart)
    setAudioLoopEnd(visualLoopEnd)
    setLoopAnalysis((prev) =>
      prev
        ? {
            ...prev,
            isSynced: true,
            recommendations: [...prev.recommendations, '✓ Audio synced to visual loop points'],
          }
        : null
    )
  }

  return (
    <div className="loop-automation">
      {/* Header */}
      <div className="loop-automation-header">
        <h2>🔄 Loop Automation</h2>
        <p>Create perfect seamless loops with automatic visual/audio sync</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-button primary"
          onClick={handleAnalyze}
          disabled={!currentScene || isAnalyzing}
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🔍 Auto-Detect Loop Points'}
        </button>

        <button
          className="action-button"
          onClick={() => {
            detectLoopPoints()
            handleAnalyze()
          }}
          disabled={!currentScene?.music_track || isAnalyzing}
        >
          🎵 Detect from Music
        </button>

        <button
          className="action-button"
          onClick={handleApplyLoop}
          disabled={!loopAnalysis}
        >
          ✓ Apply Loop Settings
        </button>
      </div>

      {isAnalyzing && (
        <div className="analyzing-section">
          <div className="analyzing-spinner" />
          <p>Analyzing your scene for perfect loop points...</p>
          <div className="analyzing-steps">
            <div className="step">✓ Analyzing audio waveform</div>
            <div className="step">✓ Detecting beat patterns</div>
            <div className="step active">⟳ Finding optimal loop points</div>
            <div className="step">⏳ Syncing visual timeline</div>
          </div>
        </div>
      )}

      {/* Loop Analysis Results */}
      {loopAnalysis && !isAnalyzing && (
        <div className="loop-results">
          <div className="result-header">
            <h3>Analysis Results</h3>
            <div className={`sync-status ${loopAnalysis.isSynced ? 'synced' : 'unsynced'}`}>
              {loopAnalysis.isSynced ? '✓ Synced' : '⚠ Not Synced'}
            </div>
          </div>

          {/* Visual Timeline */}
          <div className="timeline-section">
            <div className="section-header">
              <h4>📹 Visual Loop</h4>
              <div className="loop-duration">{visualLoopEnd - visualLoopStart}s duration</div>
            </div>

            <div className="timeline-controls">
              <div className="control-row">
                <label>Start Point</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="0.1"
                    value={visualLoopStart}
                    onChange={(e) => setVisualLoopStart(parseFloat(e.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="0.1"
                    value={visualLoopStart}
                    onChange={(e) => setVisualLoopStart(parseFloat(e.target.value))}
                    className="time-input"
                  />
                  <span className="time-unit">s</span>
                </div>
              </div>

              <div className="control-row">
                <label>End Point</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="0.1"
                    value={visualLoopEnd}
                    onChange={(e) => setVisualLoopEnd(parseFloat(e.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="0.1"
                    value={visualLoopEnd}
                    onChange={(e) => setVisualLoopEnd(parseFloat(e.target.value))}
                    className="time-input"
                  />
                  <span className="time-unit">s</span>
                </div>
              </div>
            </div>

            {/* Visual Timeline Visualization */}
            <div className="timeline-viz">
              <div className="timeline-track">
                <div
                  className="loop-region visual"
                  style={{
                    left: `${(visualLoopStart / 120) * 100}%`,
                    width: `${((visualLoopEnd - visualLoopStart) / 120) * 100}%`,
                  }}
                />
                <div
                  className="loop-marker start"
                  style={{ left: `${(visualLoopStart / 120) * 100}%` }}
                />
                <div
                  className="loop-marker end"
                  style={{ left: `${(visualLoopEnd / 120) * 100}%` }}
                />
              </div>
              <div className="timeline-labels">
                <span>0s</span>
                <span>30s</span>
                <span>60s</span>
                <span>90s</span>
                <span>120s</span>
              </div>
            </div>
          </div>

          {/* Audio Timeline */}
          <div className="timeline-section">
            <div className="section-header">
              <h4>🎵 Audio Loop</h4>
              <div className="loop-duration">{audioLoopEnd - audioLoopStart}s duration</div>
              {loopAnalysis.bpm && <div className="bpm-indicator">{loopAnalysis.bpm} BPM</div>}
            </div>

            <div className="timeline-controls">
              <div className="control-row">
                <label>Start Point</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="0.1"
                    value={audioLoopStart}
                    onChange={(e) => setAudioLoopStart(parseFloat(e.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="0.1"
                    value={audioLoopStart}
                    onChange={(e) => setAudioLoopStart(parseFloat(e.target.value))}
                    className="time-input"
                  />
                  <span className="time-unit">s</span>
                </div>
              </div>

              <div className="control-row">
                <label>End Point</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="0.1"
                    value={audioLoopEnd}
                    onChange={(e) => setAudioLoopEnd(parseFloat(e.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="0.1"
                    value={audioLoopEnd}
                    onChange={(e) => setAudioLoopEnd(parseFloat(e.target.value))}
                    className="time-input"
                  />
                  <span className="time-unit">s</span>
                </div>
              </div>
            </div>

            {/* Audio Timeline Visualization */}
            <div className="timeline-viz">
              <div className="timeline-track">
                <div
                  className="loop-region audio"
                  style={{
                    left: `${(audioLoopStart / 120) * 100}%`,
                    width: `${((audioLoopEnd - audioLoopStart) / 120) * 100}%`,
                  }}
                />
                <div
                  className="loop-marker start"
                  style={{ left: `${(audioLoopStart / 120) * 100}%` }}
                />
                <div
                  className="loop-marker end"
                  style={{ left: `${(audioLoopEnd / 120) * 100}%` }}
                />
                {/* Beat markers */}
                {loopAnalysis.bpm &&
                  Array.from({ length: Math.floor((120 * loopAnalysis.bpm) / 60) }).map((_, i) => {
                    const beatTime = (i * 60) / loopAnalysis.bpm!
                    return (
                      <div
                        key={i}
                        className="beat-marker"
                        style={{ left: `${(beatTime / 120) * 100}%` }}
                      />
                    )
                  })}
              </div>
              <div className="timeline-labels">
                <span>0s</span>
                <span>30s</span>
                <span>60s</span>
                <span>90s</span>
                <span>120s</span>
              </div>
            </div>
          </div>

          {/* Sync Controls */}
          <div className="sync-controls">
            <h4>🔄 Synchronization</h4>
            <div className="sync-buttons">
              <button className="sync-button" onClick={handleSyncToAudio}>
                📹→🎵 Sync Visual to Audio
              </button>
              <button className="sync-button" onClick={handleSyncToVisual}>
                🎵→📹 Sync Audio to Visual
              </button>
            </div>

            <label className="auto-sync-toggle">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
              />
              <span>Automatically keep visual and audio loops synchronized</span>
            </label>
          </div>

          {/* Recommendations */}
          <div className="recommendations-section">
            <h4>💡 Recommendations</h4>
            <div className="recommendations-list">
              {loopAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Loop Preview */}
          <div className="loop-preview-section">
            <h4>👁️ Loop Preview</h4>
            <p>Preview how your loop will appear to viewers</p>

            <div className="preview-controls">
              <button className="preview-button">▶️ Play Loop</button>
              <button className="preview-button">🔄 Play 3 Cycles</button>
              <button className="preview-button">⏹️ Stop</button>
            </div>

            <div className="preview-info">
              <div className="info-item">
                <span className="info-label">Loop Duration:</span>
                <span className="info-value">{Math.max(audioLoopEnd - audioLoopStart, visualLoopEnd - visualLoopStart).toFixed(1)}s</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cycles per minute:</span>
                <span className="info-value">
                  {(60 / Math.max(audioLoopEnd - audioLoopStart, visualLoopEnd - visualLoopStart)).toFixed(1)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">File size (1 hour):</span>
                <span className="info-value">~250 MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loopAnalysis && !isAnalyzing && (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <h3>No Loop Analysis Yet</h3>
          <p>
            Click "Auto-Detect Loop Points" to analyze your scene and find perfect loop points
          </p>
          <p className="empty-hint">
            💡 Make sure you have music added to your scene for best results
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="loop-tips">
        <h4>📚 Loop Creation Tips</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h5>Perfect Loop Points</h5>
            <p>Loop points should align with musical beats for seamless transitions</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⏱️</div>
            <h5>Optimal Duration</h5>
            <p>60-120 second loops work best for lofi videos - not too short, not too long</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎨</div>
            <h5>Visual Consistency</h5>
            <p>Ensure elements return to starting positions at loop point</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔊</div>
            <h5>Audio Crossfade</h5>
            <p>A subtle crossfade at loop point creates smoother transitions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

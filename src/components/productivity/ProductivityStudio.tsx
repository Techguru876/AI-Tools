/**
 * Productivity Studio - Study Timers & Pomodoro
 * Features: Animated timers, ambient sounds, task integration, stream mode
 */

import { useState } from 'react'
import './ProductivityStudio.css'

interface Timer {
  id: string
  title: string
  timerType: 'pomodoro' | 'countdown' | 'stopwatch' | 'hourglass'
  duration: number
  breakDuration: number
  cycles: number
  visualTheme: string
  ambientSound: string
  showTaskList: boolean
  status: 'editing' | 'ready' | 'streaming'
}

export default function ProductivityStudio() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [selectedTheme, setSelectedTheme] = useState('minimal-clean')
  const [selectedSound, setSelectedSound] = useState('lofi-beats')
  const [timerType, setTimerType] = useState<'pomodoro' | 'countdown' | 'stopwatch' | 'hourglass'>('pomodoro')

  const visualThemes = [
    { id: 'minimal-clean', name: 'Minimal Clean', preview: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)' },
    { id: 'dark-mode', name: 'Dark Mode', preview: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' },
    { id: 'forest-green', name: 'Forest Green', preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
    { id: 'ocean-blue', name: 'Ocean Blue', preview: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { id: 'sunset-orange', name: 'Sunset Orange', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'purple-haze', name: 'Purple Haze', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  ]

  const ambientSounds = [
    { id: 'lofi-beats', name: 'Lo-Fi Beats', icon: '🎵' },
    { id: 'rain', name: 'Rain', icon: '🌧️' },
    { id: 'coffee-shop', name: 'Coffee Shop', icon: '☕' },
    { id: 'forest', name: 'Forest Sounds', icon: '🌲' },
    { id: 'ocean-waves', name: 'Ocean Waves', icon: '🌊' },
    { id: 'white-noise', name: 'White Noise', icon: '📻' },
    { id: 'fireplace', name: 'Fireplace', icon: '🔥' },
    { id: 'none', name: 'None (Silent)', icon: '🔇' },
  ]

  const timerTypes = [
    { id: 'pomodoro', name: 'Pomodoro', desc: '25min work / 5min break', icon: '🍅' },
    { id: 'countdown', name: 'Countdown', desc: 'Fixed duration timer', icon: '⏱️' },
    { id: 'stopwatch', name: 'Stopwatch', desc: 'Count up from zero', icon: '⏲️' },
    { id: 'hourglass', name: 'Hourglass', desc: 'Visual sand timer', icon: '⏳' },
  ]

  const handleCreateTimer = () => {
    const newTimer: Timer = {
      id: `timer-${Date.now()}`,
      title: `${timerTypes.find(t => t.id === timerType)?.name} Timer ${timers.length + 1}`,
      timerType,
      duration: timerType === 'pomodoro' ? 25 * 60 : 60 * 60,
      breakDuration: 5 * 60,
      cycles: 4,
      visualTheme: selectedTheme,
      ambientSound: selectedSound,
      showTaskList: true,
      status: 'editing'
    }
    setTimers([...timers, newTimer])
  }

  const handleUpdateTimer = (id: string, field: keyof Timer, value: any) => {
    setTimers(timers.map(timer =>
      timer.id === id ? { ...timer, [field]: value } : timer
    ))
  }

  const handleProcessTimer = (id: string) => {
    setTimers(timers.map(timer =>
      timer.id === id ? { ...timer, status: 'ready' } : timer
    ))
  }

  const handleStartStream = (id: string) => {
    setTimers(timers.map(timer =>
      timer.id === id ? { ...timer, status: 'streaming' } : timer
    ))
  }

  const handleStopStream = (id: string) => {
    setTimers(timers.map(timer =>
      timer.id === id ? { ...timer, status: 'ready' } : timer
    ))
  }

  const handleDeleteTimer = (id: string) => {
    setTimers(timers.filter(t => t.id !== id))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="productivity-studio">
      <div className="studio-header">
        <div className="header-content">
          <h2>⏱️ Productivity Studio</h2>
          <p>Create study timers and Pomodoro videos with ambient sounds and task tracking</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{timers.length}</span>
            <span className="stat-label">Timers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{timers.filter(t => t.status === 'ready').length}</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat">
            <span className={`stat-value ${timers.some(t => t.status === 'streaming') ? 'streaming' : ''}`}>
              {timers.some(t => t.status === 'streaming') ? '🔴 LIVE' : '⚫ OFF'}
            </span>
            <span className="stat-label">Stream</span>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          <div className="section">
            <h3>⏱️ Timer Type</h3>
            <div className="timer-types">
              {timerTypes.map(type => (
                <div
                  key={type.id}
                  className={`timer-type-card ${timerType === type.id ? 'active' : ''}`}
                  onClick={() => setTimerType(type.id as any)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <div className="type-info">
                    <div className="type-name">{type.name}</div>
                    <div className="type-desc">{type.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎨 Visual Theme</h3>
            <div className="theme-grid">
              {visualThemes.map(theme => (
                <div
                  key={theme.id}
                  className={`theme-card ${selectedTheme === theme.id ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(theme.id)}
                  style={{ background: theme.preview }}
                >
                  <span className="theme-name">{theme.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🔊 Ambient Sound</h3>
            <div className="sound-list">
              {ambientSounds.map(sound => (
                <label key={sound.id} className="sound-item">
                  <input
                    type="radio"
                    name="ambient-sound"
                    checked={selectedSound === sound.id}
                    onChange={() => setSelectedSound(sound.id)}
                  />
                  <span className="sound-icon">{sound.icon}</span>
                  <span className="sound-name">{sound.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🎬 Actions</h3>
            <button className="create-btn" onClick={handleCreateTimer}>
              ➕ Create Timer
            </button>
          </div>
        </div>

        <div className="studio-main">
          {timers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⏱️</div>
              <h3>No Timers Yet</h3>
              <p>Create a timer to start building your productivity content</p>
            </div>
          ) : (
            <div className="timers-list">
              {timers.map(timer => (
                <div key={timer.id} className={`timer-card ${timer.status === 'streaming' ? 'streaming' : ''}`}>
                  <div className="timer-header">
                    <input
                      type="text"
                      className="timer-title-input"
                      value={timer.title}
                      onChange={e => handleUpdateTimer(timer.id, 'title', e.target.value)}
                      placeholder="Timer title..."
                    />
                    <div className="timer-actions">
                      {timer.status === 'editing' && (
                        <button className="icon-btn" onClick={() => handleProcessTimer(timer.id)}>
                          ▶️
                        </button>
                      )}
                      {timer.status === 'ready' && (
                        <button className="icon-btn stream" onClick={() => handleStartStream(timer.id)}>
                          🔴
                        </button>
                      )}
                      {timer.status === 'streaming' && (
                        <button className="icon-btn stop" onClick={() => handleStopStream(timer.id)}>
                          ⏹️
                        </button>
                      )}
                      <button className="icon-btn delete" onClick={() => handleDeleteTimer(timer.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="timer-preview" style={{ background: visualThemes.find(t => t.id === timer.visualTheme)?.preview }}>
                    <div className="preview-timer-display">
                      <div className="timer-icon">{timerTypes.find(t => t.id === timer.timerType)?.icon}</div>
                      <div className="timer-display">{formatTime(timer.duration)}</div>
                    </div>
                  </div>

                  <div className="timer-config">
                    <div className="config-row">
                      <label>Duration</label>
                      <input
                        type="number"
                        value={timer.duration / 60}
                        onChange={e => handleUpdateTimer(timer.id, 'duration', parseInt(e.target.value) * 60)}
                        min="1"
                        max="480"
                      />
                      <span>min</span>
                    </div>

                    {timer.timerType === 'pomodoro' && (
                      <>
                        <div className="config-row">
                          <label>Break Duration</label>
                          <input
                            type="number"
                            value={timer.breakDuration / 60}
                            onChange={e => handleUpdateTimer(timer.id, 'breakDuration', parseInt(e.target.value) * 60)}
                            min="1"
                            max="60"
                          />
                          <span>min</span>
                        </div>
                        <div className="config-row">
                          <label>Cycles</label>
                          <input
                            type="number"
                            value={timer.cycles}
                            onChange={e => handleUpdateTimer(timer.id, 'cycles', parseInt(e.target.value))}
                            min="1"
                            max="20"
                          />
                          <span>cycles</span>
                        </div>
                      </>
                    )}

                    <div className="config-row">
                      <label>Show Task List</label>
                      <input
                        type="checkbox"
                        checked={timer.showTaskList}
                        onChange={e => handleUpdateTimer(timer.id, 'showTaskList', e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="timer-footer">
                    <div className={`status-badge ${timer.status}`}>
                      {timer.status === 'editing' && '✏️ Editing'}
                      {timer.status === 'ready' && '✓ Ready'}
                      {timer.status === 'streaming' && '🔴 Live Streaming'}
                    </div>
                    <div className="timer-info">
                      <span>{timerTypes.find(t => t.id === timer.timerType)?.name}</span>
                      <span>•</span>
                      <span>{ambientSounds.find(s => s.id === timer.ambientSound)?.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {timers.length > 0 && !timers.some(t => t.status === 'streaming') && (
            <div className="action-bar">
              <button
                className="process-btn primary"
                onClick={() => timers.filter(t => t.status === 'editing').forEach(t => handleProcessTimer(t.id))}
                disabled={timers.filter(t => t.status === 'editing').length === 0}
              >
                ✨ Process {timers.filter(t => t.status === 'editing').length} Timer(s)
              </button>
              <button
                className="export-btn"
                disabled={timers.filter(t => t.status === 'ready').length === 0}
              >
                📤 Export {timers.filter(t => t.status === 'ready').length} Timer(s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

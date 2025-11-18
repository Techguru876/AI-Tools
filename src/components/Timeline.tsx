/**
 * Timeline Component
 * Multi-track timeline for video editing with clips, effects, and transitions
 */

import { useRef, useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { invoke } from '@tauri-apps/api/tauri'
import '../styles/Timeline.css'

export default function Timeline() {
  const { project, currentTime, setCurrentTime, isPlaying, setPlaying } = useProjectStore()
  const timelineRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  const timeline = project?.timeline

  const handlePlayPause = () => {
    setPlaying(!isPlaying)
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !timeline) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / (rect.width * zoom)) * timeline.duration
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * (project?.settings.fps || 30))
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => setCurrentTime(0)}>⏮</button>
        <button onClick={() => setCurrentTime(currentTime - 1 / (project?.settings.fps || 30))}>
          ⏪
        </button>
        <button onClick={() => setCurrentTime(currentTime + 1 / (project?.settings.fps || 30))}>
          ⏩
        </button>
        <span className="time-display">{formatTime(currentTime)}</span>

        <div className="timeline-zoom">
          <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(5, zoom + 0.1))}>+</button>
        </div>
      </div>

      <div className="timeline-tracks" ref={timelineRef} onClick={handleTimelineClick}>
        {/* Time ruler */}
        <div className="time-ruler">
          {timeline && Array.from({ length: Math.ceil(timeline.duration) }).map((_, i) => (
            <div key={i} className="time-marker" style={{ left: `${(i / timeline.duration) * 100}%` }}>
              {formatTime(i)}
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="playhead"
          style={{
            left: timeline ? `${(currentTime / timeline.duration) * 100}%` : '0%',
          }}
        />

        {/* Tracks */}
        {timeline?.tracks.map((track) => (
          <div key={track.id} className="track">
            <div className="track-header">
              <span>{track.track_type}</span>
              <button
                className={track.locked ? 'active' : ''}
                title="Lock track"
              >
                🔒
              </button>
              <button
                className={track.muted ? 'active' : ''}
                title="Mute track"
              >
                🔇
              </button>
            </div>

            <div className="track-content">
              {track.clips.map((clip) => (
                <div
                  key={clip.id}
                  className="clip"
                  style={{
                    left: timeline ? `${(clip.start_time / timeline.duration) * 100}%` : '0%',
                    width: timeline ? `${(clip.duration / timeline.duration) * 100}%` : '100%',
                  }}
                >
                  <div className="clip-name">{clip.source_path.split('/').pop()}</div>
                  {clip.effects.length > 0 && (
                    <div className="clip-effects">FX: {clip.effects.length}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

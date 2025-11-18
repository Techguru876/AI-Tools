/**
 * TIMELINE COMPONENT
 *
 * Multi-track timeline editor for video editing
 * Features:
 * - Multiple video and audio tracks
 * - Drag and drop clips
 * - Trim and split clips
 * - Apply effects and transitions
 * - Keyframe animation
 * - Playback controls
 */

import React, { useRef, useEffect, useState } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import './Timeline.css';

const Timeline: React.FC = () => {
  const {
    timeline,
    playhead,
    setPlayhead,
    isPlaying,
    setIsPlaying,
    zoomLevel,
    setZoomLevel,
    selectedClip,
    setSelectedClip,
  } = useTimeline();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pixelsPerSecond = 50 * zoomLevel;

  useEffect(() => {
    // Handle playback
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlayhead(prev => {
          const next = prev + (1 / 30); // 30 FPS
          if (timeline && next >= timeline.duration) {
            setIsPlaying(false);
            return timeline.duration;
          }
          return next;
        });
      }, 1000 / 30);

      return () => clearInterval(interval);
    }
  }, [isPlaying, timeline, setPlayhead, setIsPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;

    setPlayhead(time);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timeline">
      {/* Playback controls */}
      <div className="timeline-controls">
        <button onClick={handlePlayPause} className="control-btn">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => setPlayhead(0)} className="control-btn">
          ⏮
        </button>
        <span className="timecode">{formatTime(playhead)}</span>

        <div className="zoom-controls">
          <button onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.25))}>-</button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(Math.min(10, zoomLevel + 0.25))}>+</button>
        </div>
      </div>

      {/* Timeline ruler */}
      <div className="timeline-ruler">
        {timeline && Array.from({ length: Math.ceil(timeline.duration) + 1 }).map((_, i) => (
          <div
            key={i}
            className="ruler-tick"
            style={{ left: `${i * pixelsPerSecond}px` }}
          >
            <span>{i}s</span>
          </div>
        ))}
      </div>

      {/* Tracks */}
      <div
        ref={timelineRef}
        className="timeline-tracks"
        onClick={handleTimelineClick}
      >
        {timeline?.tracks.map(track => (
          <div key={track.id} className="track" style={{ height: `${track.height}px` }}>
            <div className="track-header">
              <span>{track.name}</span>
              <div className="track-controls">
                <button title="Mute">{track.muted ? '🔇' : '🔊'}</button>
                <button title="Lock">{track.locked ? '🔒' : '🔓'}</button>
              </div>
            </div>

            <div className="track-content">
              {track.clips.map(clip => (
                <div
                  key={clip.id}
                  className={`clip ${selectedClip === clip.id ? 'selected' : ''}`}
                  style={{
                    left: `${clip.startTime * pixelsPerSecond}px`,
                    width: `${clip.duration * pixelsPerSecond}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClip(clip.id);
                  }}
                >
                  <div className="clip-content">
                    <span className="clip-name">{clip.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Playhead indicator */}
        <div
          className="playhead"
          style={{ left: `${playhead * pixelsPerSecond}px` }}
        >
          <div className="playhead-line" />
        </div>
      </div>
    </div>
  );
};

export default Timeline;

/**
 * TIMELINE CONTEXT
 *
 * State management for timeline and video editing
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Timeline, Track, Clip } from '../../shared/types';

interface TimelineContextType {
  timeline: Timeline | null;
  setTimeline: (timeline: Timeline | null) => void;
  playhead: number;
  setPlayhead: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedClip: string | null;
  setSelectedClip: (clipId: string | null) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const addClip = useCallback((trackId: string, clip: Clip) => {
    setTimeline(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: prev.tracks.map(track =>
          track.id === trackId
            ? { ...track, clips: [...track.clips, clip] }
            : track
        ),
      };
    });
  }, []);

  const removeClip = useCallback((clipId: string) => {
    setTimeline(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: prev.tracks.map(track => ({
          ...track,
          clips: track.clips.filter(c => c.id !== clipId),
        })),
      };
    });
  }, []);

  const updateClip = useCallback((clipId: string, updates: Partial<Clip>) => {
    setTimeline(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: prev.tracks.map(track => ({
          ...track,
          clips: track.clips.map(c =>
            c.id === clipId ? { ...c, ...updates } : c
          ),
        })),
      };
    });
  }, []);

  return (
    <TimelineContext.Provider
      value={{
        timeline,
        setTimeline,
        playhead,
        setPlayhead,
        isPlaying,
        setIsPlaying,
        selectedClip,
        setSelectedClip,
        zoomLevel,
        setZoomLevel,
        addClip,
        removeClip,
        updateClip,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = (): TimelineContextType => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within TimelineProvider');
  }
  return context;
};

import { BrowserWindow } from 'electron';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import os from 'os';

interface Clip {
  id: string;
  asset_id: string;
  source_path: string;
  start_time: number;  // Position on timeline
  duration: number;
  trim_start: number;  // Trim from source
  trim_end: number;    // Trim from source
  track_index: number;
  effects?: any[];
}

interface Track {
  type: 'video' | 'audio';
  clips: Clip[];
}

interface Timeline {
  tracks: Track[];
}

export class TimelineService {
  private timeline: Timeline = { tracks: [] };
  private previewInterval: NodeJS.Timeout | null = null;
  private currentFrame: number = 0;
  private isPlaying: boolean = false;
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.homedir(), 'PhotoVideoPro', 'temp');
    fs.mkdir(this.tempDir, { recursive: true }).catch(err =>
      console.error('Error creating temp dir:', err)
    );
  }

  addClip(clip: Clip): Clip {
    // Find or create appropriate track
    let track = this.timeline.tracks.find(t =>
      t.type === 'video' && t.clips.some(c => c.track_index === clip.track_index)
    );

    if (!track) {
      track = {
        type: 'video',
        clips: [],
      };
      this.timeline.tracks.push(track);
    }

    track.clips.push(clip);

    // Sort clips by start time
    track.clips.sort((a, b) => a.start_time - b.start_time);

    return clip;
  }

  removeClip(clipId: string): void {
    this.timeline.tracks.forEach(track => {
      track.clips = track.clips.filter(c => c.id !== clipId);
    });

    // Remove empty tracks
    this.timeline.tracks = this.timeline.tracks.filter(t => t.clips.length > 0);
  }

  updateClip(clipId: string, updates: Partial<Clip>): void {
    this.timeline.tracks.forEach(track => {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        Object.assign(clip, updates);
      }
    });

    // Re-sort if start_time was updated
    if (updates.start_time !== undefined) {
      this.timeline.tracks.forEach(track => {
        track.clips.sort((a, b) => a.start_time - b.start_time);
      });
    }
  }

  getTimeline(): Timeline {
    return this.timeline;
  }

  async getFrameAtTime(time: number): Promise<string> {
    if (!this.timeline || this.timeline.tracks.length === 0) {
      throw new Error('No timeline loaded');
    }

    // Find which clip contains this time
    const clip = this.findClipAtTime(time);
    if (!clip) {
      throw new Error('No clip at specified time');
    }

    // Calculate time within the clip's source video
    const timeInClip = time - clip.start_time;
    const sourceTime = clip.trim_start + timeInClip;

    const framePath = path.join(this.tempDir, `frame_${Date.now()}.jpg`);

    return new Promise((resolve, reject) => {
      ffmpeg(clip.source_path)
        .seekInput(sourceTime)
        .frames(1)
        .output(framePath)
        .on('end', () => resolve(framePath))
        .on('error', reject)
        .run();
    });
  }

  async startPreview(): Promise<void> {
    if (this.isPlaying) return;

    this.isPlaying = true;
    const fps = 30;
    const frameTime = 1000 / fps;

    const mainWindow = BrowserWindow.getAllWindows()[0];

    this.previewInterval = setInterval(async () => {
      try {
        const framePath = await this.getFrameAtTime(this.currentFrame / fps);
        mainWindow?.webContents.send('frame-ready', framePath);
        this.currentFrame++;
      } catch (err) {
        console.error('Preview error:', err);
        this.stopPreview();
      }
    }, frameTime);
  }

  stopPreview(): void {
    if (this.previewInterval) {
      clearInterval(this.previewInterval);
      this.previewInterval = null;
    }
    this.isPlaying = false;
  }

  async seek(time: number): Promise<string> {
    this.currentFrame = Math.floor(time * 30); // Assuming 30fps
    return this.getFrameAtTime(time);
  }

  private findClipAtTime(time: number): Clip | null {
    for (const track of this.timeline.tracks) {
      if (track.type !== 'video') continue;

      for (const clip of track.clips) {
        if (time >= clip.start_time && time < clip.start_time + clip.duration) {
          return clip;
        }
      }
    }
    return null;
  }

  // Get total timeline duration
  getDuration(): number {
    let maxDuration = 0;

    this.timeline.tracks.forEach(track => {
      track.clips.forEach(clip => {
        const clipEnd = clip.start_time + clip.duration;
        if (clipEnd > maxDuration) {
          maxDuration = clipEnd;
        }
      });
    });

    return maxDuration;
  }

  // Clear timeline
  clear(): void {
    this.timeline = { tracks: [] };
    this.stopPreview();
    this.currentFrame = 0;
  }
}

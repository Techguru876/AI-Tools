"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineService = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
class TimelineService {
    constructor() {
        this.timeline = { tracks: [] };
        this.previewInterval = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.tempDir = path_1.default.join(os_1.default.homedir(), 'PhotoVideoPro', 'temp');
        promises_1.default.mkdir(this.tempDir, { recursive: true }).catch(err => console.error('Error creating temp dir:', err));
    }
    addClip(clip) {
        // Find or create appropriate track
        let track = this.timeline.tracks.find(t => t.type === 'video' && t.clips.some(c => c.track_index === clip.track_index));
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
    removeClip(clipId) {
        this.timeline.tracks.forEach(track => {
            track.clips = track.clips.filter(c => c.id !== clipId);
        });
        // Remove empty tracks
        this.timeline.tracks = this.timeline.tracks.filter(t => t.clips.length > 0);
    }
    updateClip(clipId, updates) {
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
    getTimeline() {
        return this.timeline;
    }
    async getFrameAtTime(time) {
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
        const framePath = path_1.default.join(this.tempDir, `frame_${Date.now()}.jpg`);
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(clip.source_path)
                .seekInput(sourceTime)
                .frames(1)
                .output(framePath)
                .on('end', () => resolve(framePath))
                .on('error', reject)
                .run();
        });
    }
    async startPreview() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        const fps = 30;
        const frameTime = 1000 / fps;
        const mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
        this.previewInterval = setInterval(async () => {
            try {
                const framePath = await this.getFrameAtTime(this.currentFrame / fps);
                mainWindow?.webContents.send('frame-ready', framePath);
                this.currentFrame++;
            }
            catch (err) {
                console.error('Preview error:', err);
                this.stopPreview();
            }
        }, frameTime);
    }
    stopPreview() {
        if (this.previewInterval) {
            clearInterval(this.previewInterval);
            this.previewInterval = null;
        }
        this.isPlaying = false;
    }
    async seek(time) {
        this.currentFrame = Math.floor(time * 30); // Assuming 30fps
        return this.getFrameAtTime(time);
    }
    findClipAtTime(time) {
        for (const track of this.timeline.tracks) {
            if (track.type !== 'video')
                continue;
            for (const clip of track.clips) {
                if (time >= clip.start_time && time < clip.start_time + clip.duration) {
                    return clip;
                }
            }
        }
        return null;
    }
    // Get total timeline duration
    getDuration() {
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
    clear() {
        this.timeline = { tracks: [] };
        this.stopPreview();
        this.currentFrame = 0;
    }
}
exports.TimelineService = TimelineService;
//# sourceMappingURL=timeline-service.js.map
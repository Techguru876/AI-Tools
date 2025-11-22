import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { BrowserWindow } from 'electron';
import sharp from 'sharp';

interface ExportConfig {
  timeline: any;
  outputPath: string;
  preset?: string;
  resolution?: [number, number];
  codec?: string;
  bitrate?: string;
  framerate?: number;
  quality?: string;
}

export class ExportService {
  async exportVideo(config: ExportConfig): Promise<void> {
    const {
      timeline,
      outputPath,
      resolution = [1920, 1080],
      codec = 'libx264',
      bitrate = '5000k',
      framerate = 30,
    } = config;

    const mainWindow = BrowserWindow.getAllWindows()[0];

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Build filter complex for timeline
      const filterComplex = this.buildFilterComplex(timeline, resolution, framerate);

      if (filterComplex.inputs.length === 0) {
        reject(new Error('No clips in timeline'));
        return;
      }

      // Add all inputs
      filterComplex.inputs.forEach(inputPath => {
        command.input(inputPath);
      });

      command
        .complexFilter(filterComplex.filters, filterComplex.outputMap)
        .outputOptions([
          `-c:v ${codec}`,
          `-b:v ${bitrate}`,
          `-s ${resolution[0]}x${resolution[1]}`,
          `-r ${framerate}`,
          '-c:a aac',
          '-b:a 192k',
          '-movflags +faststart',
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
          mainWindow?.webContents.send('export-progress', 0, 'starting');
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          mainWindow?.webContents.send('export-progress', percent, 'encoding');
        })
        .on('end', () => {
          mainWindow?.webContents.send('export-progress', 100, 'complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          mainWindow?.webContents.send('error', `Export failed: ${err.message}`);
          reject(err);
        })
        .save(outputPath);
    });
  }

  private buildFilterComplex(
    timeline: any,
    resolution: [number, number],
    framerate: number
  ): { inputs: string[]; filters: string[]; outputMap: string[] } {
    const inputs: string[] = [];
    const filters: string[] = [];
    const videoStreams: string[] = [];

    // Process each video track
    timeline.tracks.forEach((track: any, trackIndex: number) => {
      if (track.type !== 'video') return;

      track.clips.forEach((clip: any, clipIndex: number) => {
        const inputIndex = inputs.length;
        inputs.push(clip.source_path);

        const inputLabel = `[${inputIndex}:v]`;
        const outputLabel = `[v${trackIndex}_${clipIndex}]`;

        // Build filter for this clip
        const clipFilters: string[] = [];

        // Trim the clip
        if (clip.trim_start > 0 || clip.trim_end > 0) {
          const trimEnd = clip.duration + clip.trim_start;
          clipFilters.push(`trim=start=${clip.trim_start}:end=${trimEnd}`);
          clipFilters.push('setpts=PTS-STARTPTS');
        }

        // Scale to target resolution
        clipFilters.push(
          `scale=${resolution[0]}:${resolution[1]}:force_original_aspect_ratio=decrease,` +
          `pad=${resolution[0]}:${resolution[1]}:(ow-iw)/2:(oh-ih)/2`
        );

        // Set framerate
        clipFilters.push(`fps=${framerate}`);

        // Apply effects if any
        if (clip.effects) {
          clip.effects.forEach((effect: any) => {
            if (effect.type === 'blur') {
              clipFilters.push(`gblur=sigma=${effect.intensity || 5}`);
            } else if (effect.type === 'brightness') {
              clipFilters.push(`eq=brightness=${effect.value || 0}`);
            } else if (effect.type === 'saturation') {
              clipFilters.push(`eq=saturation=${effect.value || 1}`);
            }
          });
        }

        // Combine filters for this clip
        filters.push(`${inputLabel}${clipFilters.join(',')}${outputLabel}`);
        videoStreams.push(outputLabel);
      });
    });

    // Concatenate all clips
    if (videoStreams.length > 1) {
      const concatInput = videoStreams.join('');
      filters.push(`${concatInput}concat=n=${videoStreams.length}:v=1:a=0[outv]`);
      return { inputs, filters, outputMap: ['outv'] };
    } else if (videoStreams.length === 1) {
      // Single clip, rename output
      const singleStream = videoStreams[0];
      filters.push(`${singleStream}copy[outv]`);
      return { inputs, filters, outputMap: ['outv'] };
    }

    return { inputs, filters, outputMap: [] };
  }

  async exportImage(config: {
    imagePath?: string;
    outputPath: string;
    format?: 'png' | 'jpg' | 'webp';
    quality?: number;
    width?: number;
    height?: number;
  }): Promise<void> {
    const {
      imagePath,
      outputPath,
      format = 'png',
      quality = 90,
      width,
      height,
    } = config;

    if (!imagePath) {
      throw new Error('Image path required');
    }

    let pipeline = sharp(imagePath);

    if (width && height) {
      pipeline = pipeline.resize(width, height, { fit: 'cover' });
    }

    switch (format) {
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
      case 'jpg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
    }

    await pipeline.toFile(outputPath);
  }

  async exportGIF(config: {
    timeline: any;
    outputPath: string;
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
  }): Promise<void> {
    const {
      timeline,
      outputPath,
      width = 480,
      height = 270,
      fps = 15,
      duration = 5,
    } = config;

    const mainWindow = BrowserWindow.getAllWindows()[0];

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Get first video clip
      const videoTrack = timeline.tracks.find((t: any) => t.type === 'video');
      if (!videoTrack || videoTrack.clips.length === 0) {
        reject(new Error('No video clips in timeline'));
        return;
      }

      const firstClip = videoTrack.clips[0];

      command
        .input(firstClip.source_path)
        .inputOptions([`-t ${duration}`])
        .outputOptions([
          `-vf fps=${fps},scale=${width}:${height}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
          '-loop 0',
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg GIF command:', commandLine);
          mainWindow?.webContents.send('export-progress', 0, 'generating palette');
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          mainWindow?.webContents.send('export-progress', percent, 'encoding GIF');
        })
        .on('end', () => {
          mainWindow?.webContents.send('export-progress', 100, 'complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('GIF export error:', err);
          mainWindow?.webContents.send('error', `GIF export failed: ${err.message}`);
          reject(err);
        })
        .save(outputPath);
    });
  }

  // Get export presets
  getPresets(): Record<string, any> {
    return {
      'youtube-1080p': {
        resolution: [1920, 1080],
        codec: 'libx264',
        bitrate: '8000k',
        framerate: 30,
      },
      'youtube-4k': {
        resolution: [3840, 2160],
        codec: 'libx265',
        bitrate: '40000k',
        framerate: 60,
      },
      'instagram-feed': {
        resolution: [1080, 1080],
        codec: 'libx264',
        bitrate: '5000k',
        framerate: 30,
      },
      'instagram-story': {
        resolution: [1080, 1920],
        codec: 'libx264',
        bitrate: '5000k',
        framerate: 30,
      },
      'tiktok': {
        resolution: [1080, 1920],
        codec: 'libx264',
        bitrate: '6000k',
        framerate: 30,
      },
      'twitter': {
        resolution: [1280, 720],
        codec: 'libx264',
        bitrate: '5000k',
        framerate: 30,
      },
    };
  }
}

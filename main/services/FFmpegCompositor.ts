import ffmpeg from 'fluent-ffmpeg';
import { BrowserWindow } from 'electron';
import { ResolvedTemplate, TemplateLayer } from './templates/TemplateEngine';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

/**
 * FFmpeg Compositor
 * Renders resolved templates into final video files using FFmpeg filter_complex
 */
export class FFmpegCompositor {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.homedir(), 'ContentForge', 'temp');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  /**
   * Render a resolved template to video
   */
  async renderTemplate(
    template: ResolvedTemplate,
    outputPath: string,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<void> {
    const mainWindow = BrowserWindow.getAllWindows()[0];

    return new Promise((resolve, reject) => {
      try {
        const { inputs, filters, audioFilters } = this.buildFilterComplex(template);

        if (inputs.length === 0) {
          reject(new Error('No inputs found in template'));
          return;
        }

        const command = ffmpeg();

        // Add all input files
        inputs.forEach(input => {
          if (input.type === 'image') {
            command.input(input.path).inputOptions([
              '-loop', '1',
              '-t', String(template.duration),
              '-framerate', String(template.framerate),
            ]);
          } else if (input.type === 'video') {
            command.input(input.path).inputOptions([
              '-stream_loop', '-1', // Loop video
            ]);
          } else if (input.type === 'audio') {
            command.input(input.path).inputOptions([
              '-stream_loop', '-1', // Loop audio
            ]);
          }
        });

        // Build filter_complex
        const filterComplex = [...filters];

        // Add audio filters if any
        if (audioFilters.length > 0) {
          filterComplex.push(...audioFilters);
        }

        command
          .complexFilter(filterComplex, ['outv', 'outa'])
          .outputOptions([
            '-map', '[outv]',
            '-map', '[outa]',
            `-s ${template.resolution[0]}x${template.resolution[1]}`,
            `-r ${template.framerate}`,
            '-c:v libx264',
            '-preset medium',
            '-crf 23',
            '-pix_fmt yuv420p',
            '-c:a aac',
            '-b:a 192k',
            '-t', String(template.duration),
            '-movflags +faststart',
          ])
          .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
            mainWindow?.webContents.send('export-progress', 0, 'starting');
            onProgress?.(0, 'starting');
          })
          .on('progress', (progress) => {
            const percent = Math.round(progress.percent || 0);
            mainWindow?.webContents.send('export-progress', percent, 'encoding');
            onProgress?.(percent, 'encoding');
          })
          .on('end', () => {
            console.log('✓ Video rendering complete:', outputPath);
            mainWindow?.webContents.send('export-progress', 100, 'complete');
            onProgress?.(100, 'complete');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            mainWindow?.webContents.send('error', `Rendering failed: ${err.message}`);
            reject(err);
          })
          .save(outputPath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build FFmpeg filter_complex from template layers
   */
  private buildFilterComplex(template: ResolvedTemplate): {
    inputs: Array<{ type: string; path: string }>;
    filters: string[];
    audioFilters: string[];
  } {
    const inputs: Array<{ type: string; path: string }> = [];
    const filters: string[] = [];
    const audioFilters: string[] = [];

    // Sort layers by z_index
    const sortedLayers = [...template.layers].sort((a, b) => a.z_index - b.z_index);

    // Separate video/image layers from audio layers
    const visualLayers = sortedLayers.filter(l => ['image', 'video', 'effect'].includes(l.type));
    const audioLayers = sortedLayers.filter(l => l.type === 'audio');
    const textLayers = sortedLayers.filter(l => l.type === 'text');

    let currentStream = '';

    // Process visual layers
    visualLayers.forEach((layer, index) => {
      if (layer.type === 'image' || layer.type === 'video') {
        const inputIndex = inputs.length;
        inputs.push({
          type: layer.type,
          path: layer.properties.source,
        });

        let layerStream = `[${inputIndex}:v]`;
        const layerLabel = `[v${index}]`;

        // Apply layer filters
        const layerFilters: string[] = [];

        // Scale/position filters
        if (layer.properties.filters) {
          layer.properties.filters.forEach((filter: any) => {
            if (filter.type === 'scale') {
              layerFilters.push(
                `scale=${filter.params.width}:${filter.params.height}:force_original_aspect_ratio=${filter.params.mode || 'decrease'}`
              );
            } else if (filter.type === 'zoompan') {
              // Ken Burns effect
              const zp = filter.params;
              layerFilters.push(
                `zoompan=z='${zp.zoom}':d=${zp.duration}:x='${zp.x}':y='${zp.y}':s=${zp.s}:fps=${zp.fps}`
              );
            } else if (filter.type === 'gblur') {
              layerFilters.push(`gblur=sigma=${filter.params.sigma}`);
            }
          });
        }

        // Set opacity if specified
        if (layer.properties.opacity !== undefined && layer.properties.opacity < 1.0) {
          layerFilters.push(`format=rgba,colorchannelmixer=aa=${layer.properties.opacity}`);
        }

        // Combine layer filters
        if (layerFilters.length > 0) {
          filters.push(`${layerStream}${layerFilters.join(',')}${layerLabel}`);
        } else {
          filters.push(`${layerStream}copy${layerLabel}`);
        }

        // Overlay onto current stream
        if (index === 0) {
          currentStream = layerLabel;
        } else {
          const nextLabel = `[v${index}_overlay]`;
          filters.push(`${currentStream}${layerLabel}overlay=0:0${nextLabel}`);
          currentStream = nextLabel;
        }
      }
    });

    // Add text overlays
    textLayers.forEach((layer, index) => {
      const textProps = layer.properties;
      const textLabel = `[vtext${index}]`;

      // Build drawtext filter
      let drawtextFilter = `drawtext=text='${textProps.text}'`;
      drawtextFilter += `:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`; // Default font
      drawtextFilter += `:fontsize=${textProps.font_size}`;
      drawtextFilter += `:fontcolor=${textProps.color}`;

      // Position
      if (textProps.position.x === 'center') {
        drawtextFilter += `:x=(w-text_w)/2`;
      } else if (typeof textProps.position.x === 'number') {
        drawtextFilter += `:x=${textProps.position.x}`;
      }

      if (textProps.position.y === 'center') {
        drawtextFilter += `:y=(h-text_h)/2`;
      } else if (typeof textProps.position.y === 'number') {
        drawtextFilter += `:y=${textProps.position.y}`;
      }

      // Border/stroke
      if (textProps.stroke_width && textProps.stroke_color) {
        drawtextFilter += `:borderw=${textProps.stroke_width}`;
        drawtextFilter += `:bordercolor=${textProps.stroke_color}`;
      }

      // Shadow
      if (textProps.shadow) {
        drawtextFilter += `:shadowx=${textProps.shadow.offset_x}`;
        drawtextFilter += `:shadowy=${textProps.shadow.offset_y}`;
        drawtextFilter += `:shadowcolor=${textProps.shadow.color}`;
      }

      filters.push(`${currentStream}${drawtextFilter}${textLabel}`);
      currentStream = textLabel;
    });

    // Final video output
    filters.push(`${currentStream}format=yuv420p[outv]`);

    // Process audio layers
    if (audioLayers.length > 0) {
      audioLayers.forEach(layer => {
        const inputIndex = inputs.length;
        inputs.push({
          type: 'audio',
          path: layer.properties.source,
        });

        const audioStream = `[${inputIndex}:a]`;
        const audioLabel = `[a${inputIndex}]`;

        // Apply audio filters (volume, fade, etc.)
        const audioLayerFilters: string[] = [];

        if (layer.properties.volume !== undefined && layer.properties.volume !== 1.0) {
          audioLayerFilters.push(`volume=${layer.properties.volume}`);
        }

        if (layer.properties.fade_in) {
          audioLayerFilters.push(`afade=t=in:st=0:d=${layer.properties.fade_in}`);
        }

        if (layer.properties.fade_out) {
          const fadeOutStart = template.duration - layer.properties.fade_out;
          audioLayerFilters.push(`afade=t=out:st=${fadeOutStart}:d=${layer.properties.fade_out}`);
        }

        if (audioLayerFilters.length > 0) {
          audioFilters.push(`${audioStream}${audioLayerFilters.join(',')}${audioLabel}`);
        } else {
          audioFilters.push(`${audioStream}copy${audioLabel}`);
        }
      });

      // Mix all audio streams
      if (audioLayers.length > 1) {
        const audioInputs = audioLayers.map((_, i) => `[a${i}]`).join('');
        audioFilters.push(`${audioInputs}amix=inputs=${audioLayers.length}:duration=longest[outa]`);
      } else {
        audioFilters.push(`[a0]copy[outa]`);
      }
    } else {
      // No audio - generate silent audio
      audioFilters.push('anullsrc=r=48000:cl=stereo[outa]');
    }

    return { inputs, filters, audioFilters };
  }

  /**
   * Generate preview frame at specific timestamp
   */
  async generatePreview(
    template: ResolvedTemplate,
    timestamp: number,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get first image/video layer for preview
      const visualLayer = template.layers.find(l => l.type === 'image' || l.type === 'video');

      if (!visualLayer) {
        reject(new Error('No visual layers in template'));
        return;
      }

      ffmpeg(visualLayer.properties.source)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: `${template.resolution[0]}x${template.resolution[1]}`,
        })
        .on('end', () => resolve())
        .on('error', reject);
    });
  }

  /**
   * Estimate rendering time
   */
  estimateRenderTime(template: ResolvedTemplate): {
    estimatedSeconds: number;
    complexity: 'low' | 'medium' | 'high';
  } {
    // Rough estimation based on duration and layer count
    const layerCount = template.layers.length;
    const hasEffects = template.layers.some(l => l.type === 'effect');

    let complexityMultiplier = 1;
    if (layerCount > 5) complexityMultiplier = 1.5;
    if (hasEffects) complexityMultiplier *= 1.3;

    const estimatedSeconds = (template.duration / 60) * complexityMultiplier;

    const complexity =
      layerCount <= 3 ? 'low' :
      layerCount <= 6 ? 'medium' : 'high';

    return { estimatedSeconds, complexity };
  }
}

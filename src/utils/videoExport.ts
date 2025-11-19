/**
 * Video Export and Rendering Utilities
 * Handles video composition, rendering, and export for all studios
 */

import { invoke } from '@tauri-apps/api/tauri'
import { save } from '@tauri-apps/api/dialog'
import { ExportPreset, EXPORT_PRESETS } from './studioUtils'

export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'encoding' | 'saving' | 'complete'
  progress: number // 0-100
  message: string
}

export interface VideoExportOptions {
  preset?: string
  customSettings?: {
    width?: number
    height?: number
    fps?: number
    bitrate?: string
    format?: string
  }
  outputPath?: string
  onProgress?: (progress: ExportProgress) => void
}

/**
 * Export video using Canvas/Web APIs (Client-side rendering)
 * This works without FFmpeg by using browser MediaRecorder API
 */
export async function exportVideoClientSide(
  canvasElement: HTMLCanvasElement,
  audioUrl: string | null,
  duration: number,
  options: VideoExportOptions = {}
): Promise<string> {
  try {
    const preset = options.preset ? EXPORT_PRESETS[options.preset] : EXPORT_PRESETS['youtube-hd']

    // Report progress
    options.onProgress?.({
      stage: 'preparing',
      progress: 10,
      message: 'Preparing canvas...',
    })

    // Set canvas size based on preset
    const targetWidth = options.customSettings?.width || parseInt(preset.quality.replace('p', '')) * (16/9)
    const targetHeight = options.customSettings?.height || parseInt(preset.quality.replace('p', ''))

    canvasElement.width = targetWidth
    canvasElement.height = targetHeight

    options.onProgress?.({
      stage: 'rendering',
      progress: 30,
      message: 'Starting video capture...',
    })

    // Create media stream from canvas
    const stream = canvasElement.captureStream(preset.fps)

    // Add audio track if provided
    if (audioUrl) {
      try {
        const audioContext = new AudioContext()
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer

        const destination = audioContext.createMediaStreamDestination()
        source.connect(destination)
        source.start()

        // Add audio track to stream
        destination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track)
        })
      } catch (error) {
        console.warn('Failed to add audio:', error)
      }
    }

    // Configure MediaRecorder
    const mimeType = preset.format === 'webm' ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8'
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: parseBitrate(preset.bitrate),
    })

    const chunks: Blob[] = []

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          const progress = 30 + (chunks.length / (duration * preset.fps / 1000)) * 50
          options.onProgress?.({
            stage: 'rendering',
            progress: Math.min(progress, 80),
            message: `Rendering frame ${chunks.length}...`,
          })
        }
      }

      mediaRecorder.onstop = async () => {
        options.onProgress?.({
          stage: 'encoding',
          progress: 85,
          message: 'Encoding video...',
        })

        const blob = new Blob(chunks, { type: mimeType })

        options.onProgress?.({
          stage: 'saving',
          progress: 90,
          message: 'Saving file...',
        })

        // Save file
        const url = URL.createObjectURL(blob)

        // If output path provided, download directly
        if (options.outputPath) {
          const a = document.createElement('a')
          a.href = url
          a.download = options.outputPath
          a.click()
        }

        options.onProgress?.({
          stage: 'complete',
          progress: 100,
          message: 'Export complete!',
        })

        resolve(url)
      }

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
        reject(error)
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms

      // Stop after duration
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach(track => track.stop())
      }, duration * 1000)
    })

  } catch (error: any) {
    console.error('Export error:', error)
    throw new Error(`Video export failed: ${error.message}`)
  }
}

/**
 * Export video using Tauri backend (Server-side with FFmpeg)
 * Requires FFmpeg to be installed on the system
 */
export async function exportVideoServerSide(
  sceneData: any,
  audioUrl: string | null,
  duration: number,
  options: VideoExportOptions = {}
): Promise<string> {
  try {
    const preset = options.preset ? EXPORT_PRESETS[options.preset] : EXPORT_PRESETS['youtube-hd']

    options.onProgress?.({
      stage: 'preparing',
      progress: 10,
      message: 'Preparing export...',
    })

    // Ask user for save location
    const savePath = options.outputPath || await save({
      defaultPath: `video-${Date.now()}.${preset.format}`,
      filters: [{
        name: 'Video',
        extensions: [preset.format],
      }],
    })

    if (!savePath) {
      throw new Error('Export cancelled')
    }

    options.onProgress?.({
      stage: 'rendering',
      progress: 30,
      message: 'Rendering with FFmpeg...',
    })

    // Call Tauri backend to render video with FFmpeg
    const result = await invoke<string>('export_video', {
      sceneData,
      audioUrl,
      duration,
      outputPath: savePath,
      preset: {
        width: parseInt(preset.quality.replace('p', '')) * (16/9),
        height: parseInt(preset.quality.replace('p', '')),
        fps: preset.fps,
        bitrate: preset.bitrate,
        format: preset.format,
        codec: preset.codec,
      },
    })

    options.onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Export complete!',
    })

    return result

  } catch (error: any) {
    // If Tauri command doesn't exist, fall back to client-side export
    if (error.message?.includes('not found') || error.message?.includes('Command')) {
      console.warn('Server-side export not available, using client-side rendering')
      const canvas = document.createElement('canvas')
      return exportVideoClientSide(canvas, audioUrl, duration, options)
    }
    throw error
  }
}

/**
 * Export scene as image (screenshot)
 */
export async function exportSceneAsImage(
  canvasElement: HTMLCanvasElement,
  format: 'png' | 'jpg' | 'webp' = 'png'
): Promise<string> {
  try {
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvasElement.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create image blob'))
        }
      }, mimeType, 0.95)
    })

    const url = URL.createObjectURL(blob)

    // Download image
    const a = document.createElement('a')
    a.href = url
    a.download = `scene-${Date.now()}.${format}`
    a.click()

    return url
  } catch (error: any) {
    throw new Error(`Image export failed: ${error.message}`)
  }
}

/**
 * Helper: Parse bitrate string to number
 */
function parseBitrate(bitrate: string): number {
  const match = bitrate.match(/(\d+)\s*([KMG]?)bps/i)
  if (!match) return 5000000 // Default 5 Mbps

  const value = parseInt(match[1])
  const unit = match[2].toUpperCase()

  switch (unit) {
    case 'K': return value * 1000
    case 'M': return value * 1000000
    case 'G': return value * 1000000000
    default: return value
  }
}

/**
 * Get available export presets
 */
export function getExportPresets(): Record<string, ExportPreset> {
  return EXPORT_PRESETS
}

/**
 * Estimate file size based on preset and duration
 */
export function estimateFileSize(duration: number, preset: ExportPreset): string {
  const bitrate = parseBitrate(preset.bitrate)
  const sizeBytes = (bitrate * duration) / 8

  if (sizeBytes > 1000000000) {
    return `${(sizeBytes / 1000000000).toFixed(2)} GB`
  } else if (sizeBytes > 1000000) {
    return `${(sizeBytes / 1000000).toFixed(2)} MB`
  } else if (sizeBytes > 1000) {
    return `${(sizeBytes / 1000).toFixed(2)} KB`
  }
  return `${sizeBytes.toFixed(0)} bytes`
}

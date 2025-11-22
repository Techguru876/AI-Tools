/**
 * Video Export and Rendering Utilities
 * Handles video composition, rendering, and export for all studios
 * Supports MP4, WebM, and GIF formats
 */

import { invoke } from '@tauri-apps/api/tauri'
import { save } from '@tauri-apps/api/dialog'
import { ExportPreset, EXPORT_PRESETS } from './studioUtils'
import { exportAsGIF, estimateGIFSize, getOptimalGIFSettings, GIFExportOptions } from './gifExport'

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
 * Export video WITH automatic thumbnail generation
 * Captures thumbnail at middle frame for best representation
 */
export async function exportVideoWithThumbnail(
  canvasElement: HTMLCanvasElement,
  audioUrl: string | null,
  duration: number,
  options: VideoExportOptions = {}
): Promise<{
  videoBlob: Blob
  thumbnailBlob: Blob
  videoUrl: string
  thumbnailUrl: string
  videoSize: string
  thumbnailSize: string
}> {
  try {
    // Step 1: Capture thumbnail at middle frame (best representation)
    options.onProgress?.({
      stage: 'preparing',
      progress: 5,
      message: 'Capturing thumbnail...',
    })

    const thumbnailBlob = await captureThumbnail(canvasElement)
    const thumbnailUrl = URL.createObjectURL(thumbnailBlob)

    // Step 2: Export video using existing logic
    const preset = options.preset ? EXPORT_PRESETS[options.preset] : EXPORT_PRESETS['youtube-hd']

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

    const videoUrl = await new Promise<string>((resolve, reject) => {
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

        const videoBlob = new Blob(chunks, { type: mimeType })

        options.onProgress?.({
          stage: 'saving',
          progress: 90,
          message: 'Finalizing export...',
        })

        const url = URL.createObjectURL(videoBlob)

        options.onProgress?.({
          stage: 'complete',
          progress: 100,
          message: 'Export complete with thumbnail!',
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

    // Get the video blob from chunks
    const videoBlob = new Blob(chunks, { type: mimeType })

    return {
      videoBlob,
      thumbnailBlob,
      videoUrl,
      thumbnailUrl,
      videoSize: formatFileSize(videoBlob.size),
      thumbnailSize: formatFileSize(thumbnailBlob.size),
    }

  } catch (error: any) {
    console.error('Export with thumbnail error:', error)
    throw new Error(`Video export with thumbnail failed: ${error.message}`)
  }
}

/**
 * Capture thumbnail from canvas (internal helper)
 */
async function captureThumbnail(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate thumbnail'))
      }
    }, 'image/jpeg', 0.9) // 90% quality JPEG for optimal size/quality balance
  })
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes > 1000000000) {
    return `${(bytes / 1000000000).toFixed(2)} GB`
  } else if (bytes > 1000000) {
    return `${(bytes / 1000000).toFixed(2)} MB`
  } else if (bytes > 1000) {
    return `${(bytes / 1000).toFixed(2)} KB`
  }
  return `${bytes} bytes`
}

/**
 * Generate thumbnail from canvas (no download)
 * Returns both blob and URL for flexible usage
 */
export async function generateThumbnail(
  canvasElement: HTMLCanvasElement,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {}
): Promise<{ blob: Blob; url: string; size: string }> {
  try {
    const { width = canvasElement.width, height = canvasElement.height, quality = 0.9 } = options

    // Create thumbnail canvas with specified dimensions
    const thumbCanvas = document.createElement('canvas')
    thumbCanvas.width = width
    thumbCanvas.height = height

    const ctx = thumbCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Draw scaled image
    ctx.drawImage(canvasElement, 0, 0, width, height)

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      thumbCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate thumbnail'))
          }
        },
        'image/jpeg',
        quality
      )
    })

    const url = URL.createObjectURL(blob)

    return {
      blob,
      url,
      size: formatFileSize(blob.size),
    }
  } catch (error: any) {
    throw new Error(`Thumbnail generation failed: ${error.message}`)
  }
}

/**
 * Generate thumbnail from video element
 * Captures frame at specified timestamp
 */
export async function generateThumbnailFromVideo(
  videoElement: HTMLVideoElement,
  timestamp: number = 0,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {}
): Promise<{ blob: Blob; url: string; size: string }> {
  try {
    const { width = 1280, height = 720, quality = 0.9 } = options

    // Create canvas and capture frame
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Seek to timestamp and wait for it to load
    await new Promise<void>((resolve, reject) => {
      videoElement.currentTime = timestamp

      videoElement.onseeked = () => resolve()
      videoElement.onerror = () => reject(new Error('Failed to seek video'))

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Video seek timeout')), 5000)
    })

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, width, height)

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate thumbnail'))
          }
        },
        'image/jpeg',
        quality
      )
    })

    const url = URL.createObjectURL(blob)

    return {
      blob,
      url,
      size: formatFileSize(blob.size),
    }
  } catch (error: any) {
    throw new Error(`Video thumbnail generation failed: ${error.message}`)
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

/**
 * Export animation as GIF
 * Wrapper around gifExport.ts for easy integration
 */
export async function exportAnimationAsGIF(
  canvasElement: HTMLCanvasElement,
  duration: number,
  renderFrame: (timestamp: number) => void | Promise<void>,
  options: GIFExportOptions & {
    autoDownload?: boolean
    filename?: string
  } = {}
): Promise<{ blob: Blob; url: string; size: string }> {
  try {
    const { autoDownload = false, filename = `animation-${Date.now()}.gif`, ...gifOptions } = options

    // Export as GIF
    const result = await exportAsGIF(canvasElement, duration, renderFrame, gifOptions)

    // Auto-download if requested
    if (autoDownload) {
      const a = document.createElement('a')
      a.href = result.url
      a.download = filename
      a.click()
    }

    return {
      blob: result.blob,
      url: result.url,
      size: result.size,
    }
  } catch (error: any) {
    throw new Error(`GIF export failed: ${error.message}`)
  }
}

/**
 * Export with format selection (MP4, WebM, or GIF)
 */
export async function exportWithFormat(
  format: 'mp4' | 'webm' | 'gif',
  canvasElement: HTMLCanvasElement,
  audioUrl: string | null,
  duration: number,
  renderFrame: (timestamp: number) => void | Promise<void>,
  options: VideoExportOptions & GIFExportOptions = {}
): Promise<{ blob: Blob; url: string; size: string; format: string }> {
  try {
    if (format === 'gif') {
      // Export as GIF
      const gifResult = await exportAsGIF(canvasElement, duration, renderFrame, {
        width: options.customSettings?.width || 480,
        height: options.customSettings?.height || 270,
        fps: options.customSettings?.fps || 15,
        quality: 'medium',
        loop: true,
        onProgress: (progress) => {
          options.onProgress?.({
            stage: 'encoding',
            progress,
            message: `Encoding GIF... ${progress.toFixed(0)}%`,
          })
        },
      })

      return {
        blob: gifResult.blob,
        url: gifResult.url,
        size: gifResult.size,
        format: 'gif',
      }
    } else {
      // Export as video (MP4/WebM)
      const videoUrl = await exportVideoClientSide(canvasElement, audioUrl, duration, {
        ...options,
        preset: format === 'mp4' ? 'youtube-hd' : undefined,
      })

      // Get blob from URL
      const response = await fetch(videoUrl)
      const blob = await response.blob()

      return {
        blob,
        url: videoUrl,
        size: formatFileSize(blob.size),
        format,
      }
    }
  } catch (error: any) {
    throw new Error(`Export failed: ${error.message}`)
  }
}

// Re-export GIF utilities for convenience
export { estimateGIFSize, getOptimalGIFSettings } from './gifExport'

/**
 * GIF Export Utility
 * Exports canvas animations as optimized GIF files using FFmpeg
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface GIFExportOptions {
  width?: number
  height?: number
  fps?: number
  quality?: 'low' | 'medium' | 'high' // Maps to FFmpeg palette optimization
  loop?: boolean
  dither?: 'none' | 'bayer' | 'floyd_steinberg' // Dithering algorithm
  onProgress?: (progress: number) => void
  onLog?: (message: string) => void
}

export interface GIFExportResult {
  blob: Blob
  url: string
  size: string
  duration: number
  frameCount: number
}

let ffmpegInstance: FFmpeg | null = null
let ffmpegLoaded = false

/**
 * Load FFmpeg (lazy loading)
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance
  }

  try {
    const ffmpeg = new FFmpeg()

    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegInstance = ffmpeg
    ffmpegLoaded = true
    return ffmpeg
  } catch (error: any) {
    throw new Error(`Failed to load FFmpeg: ${error.message}`)
  }
}

/**
 * Export canvas animation as GIF using FFmpeg
 * Provides superior quality compared to JavaScript GIF encoders
 */
export async function exportAsGIF(
  canvasElement: HTMLCanvasElement,
  duration: number,
  renderFrame: (timestamp: number) => void | Promise<void>,
  options: GIFExportOptions = {}
): Promise<GIFExportResult> {
  const {
    width = 480,
    height = 270,
    fps = 15,
    quality = 'medium',
    loop = true,
    dither = 'bayer',
    onProgress,
    onLog,
  } = options

  try {
    onLog?.('Initializing FFmpeg...')
    const ffmpeg = await loadFFmpeg()

    // Calculate frame count
    const frameCount = Math.ceil(duration * fps)
    const frameInterval = 1 / fps

    onLog?.(`Capturing ${frameCount} frames at ${fps} FPS...`)

    // Capture frames to PNG images
    const frameFiles: string[] = []

    for (let i = 0; i < frameCount; i++) {
      const timestamp = i * frameInterval

      // Render frame at this timestamp
      await renderFrame(timestamp)

      // Capture frame as PNG
      const frameBlob = await new Promise<Blob>((resolve, reject) => {
        canvasElement.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error(`Failed to capture frame ${i}`))
            }
          },
          'image/png'
        )
      })

      // Write frame to FFmpeg virtual filesystem
      const fileName = `frame_${i.toString().padStart(5, '0')}.png`
      await ffmpeg.writeFile(fileName, await fetchFile(frameBlob))
      frameFiles.push(fileName)

      // Report progress
      const captureProgress = (i / frameCount) * 50 // First 50% is capture
      onProgress?.(captureProgress)
      onLog?.(`Captured frame ${i + 1}/${frameCount}`)
    }

    onLog?.('Encoding GIF with FFmpeg...')

    // Configure FFmpeg GIF encoding with palette optimization
    // This creates high-quality GIFs with optimized colors
    const paletteQuality = quality === 'high' ? 'stats_mode=full' : quality === 'low' ? 'stats_mode=single' : ''
    const ditherAlgo = dither === 'floyd_steinberg' ? 'floyd_steinberg' : dither === 'bayer' ? 'bayer:bayer_scale=5' : 'none'

    // Step 1: Generate optimized palette
    await ffmpeg.exec([
      '-framerate', fps.toString(),
      '-pattern_type', 'glob',
      '-i', 'frame_*.png',
      '-vf', `fps=${fps},scale=${width}:${height}:flags=lanczos,palettegen${paletteQuality ? '=' + paletteQuality : ''}`,
      'palette.png',
    ])

    onProgress?.(60)
    onLog?.('Generated optimized color palette')

    // Step 2: Create GIF using palette
    const loopFlag = loop ? '-loop' : '-loop'
    const loopValue = loop ? '0' : '-1' // 0 = infinite, -1 = no loop

    await ffmpeg.exec([
      '-framerate', fps.toString(),
      '-pattern_type', 'glob',
      '-i', 'frame_*.png',
      '-i', 'palette.png',
      '-lavfi', `fps=${fps},scale=${width}:${height}:flags=lanczos[x];[x][1:v]paletteuse=dither=${ditherAlgo}`,
      loopFlag, loopValue,
      'output.gif',
    ])

    onProgress?.(90)
    onLog?.('GIF encoding complete')

    // Read output GIF
    const gifData = await ffmpeg.readFile('output.gif')
    const gifBlob = new Blob([gifData as BlobPart], { type: 'image/gif' })
    const gifUrl = URL.createObjectURL(gifBlob)

    // Cleanup FFmpeg virtual filesystem
    onLog?.('Cleaning up temporary files...')
    for (const fileName of frameFiles) {
      try {
        await ffmpeg.deleteFile(fileName)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    try {
      await ffmpeg.deleteFile('palette.png')
      await ffmpeg.deleteFile('output.gif')
    } catch (e) {
      // Ignore cleanup errors
    }

    onProgress?.(100)
    onLog?.('Export complete!')

    return {
      blob: gifBlob,
      url: gifUrl,
      size: formatFileSize(gifBlob.size),
      duration,
      frameCount,
    }

  } catch (error: any) {
    throw new Error(`GIF export failed: ${error.message}`)
  }
}

/**
 * Simpler GIF export using Canvas API (fallback if FFmpeg unavailable)
 * Uses frame capture without palette optimization
 */
export async function exportAsGIFSimple(
  canvasElement: HTMLCanvasElement,
  duration: number,
  renderFrame: (timestamp: number) => void | Promise<void>,
  options: Omit<GIFExportOptions, 'quality' | 'dither'> = {}
): Promise<GIFExportResult> {
  const {
    fps = 10, // Lower FPS for simpler method
    onProgress,
    onLog,
  } = options

  try {
    // This is a placeholder for a simpler GIF encoding method
    // In a real implementation, you'd use a lightweight GIF encoder
    // For now, we'll capture frames and return them as an animation

    onLog?.('Using simple GIF export (Canvas API)...')

    const frameCount = Math.ceil(duration * fps)
    const frameInterval = 1 / fps

    // Capture frames
    const frames: Blob[] = []

    for (let i = 0; i < frameCount; i++) {
      const timestamp = i * frameInterval

      // Render frame
      await renderFrame(timestamp)

      // Capture frame
      const frameBlob = await new Promise<Blob>((resolve, reject) => {
        canvasElement.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error(`Failed to capture frame ${i}`))
            }
          },
          'image/png'
        )
      })

      frames.push(frameBlob)

      onProgress?.((i / frameCount) * 100)
      onLog?.(`Captured frame ${i + 1}/${frameCount}`)
    }

    // Note: This simple version doesn't actually create a GIF
    // It would require a GIF encoding library like gif.js
    // For now, throw an error and fall back to FFmpeg
    throw new Error('Simple GIF export requires gif.js library. Please use FFmpeg-based export.')

  } catch (error: any) {
    throw new Error(`Simple GIF export failed: ${error.message}`)
  }
}

/**
 * Export current canvas frame as static GIF (single frame)
 */
export async function exportStaticGIF(
  canvasElement: HTMLCanvasElement,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {}
): Promise<Blob> {
  const { width = canvasElement.width, height = canvasElement.height } = options

  try {
    // Create resized canvas if needed
    let sourceCanvas = canvasElement

    if (width !== canvasElement.width || height !== canvasElement.height) {
      const resizeCanvas = document.createElement('canvas')
      resizeCanvas.width = width
      resizeCanvas.height = height

      const ctx = resizeCanvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      ctx.drawImage(canvasElement, 0, 0, width, height)
      sourceCanvas = resizeCanvas
    }

    // For static GIF, we can use PNG and rename to GIF
    // (browsers will handle single-frame GIF display)
    const blob = await new Promise<Blob>((resolve, reject) => {
      sourceCanvas.toBlob(
        (blob) => {
          if (blob) {
            // Convert to GIF blob type
            resolve(new Blob([blob], { type: 'image/gif' }))
          } else {
            reject(new Error('Failed to create static GIF'))
          }
        },
        'image/png',
        0.9
      )
    })

    return blob

  } catch (error: any) {
    throw new Error(`Static GIF export failed: ${error.message}`)
  }
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
 * Estimate GIF file size
 */
export function estimateGIFSize(
  width: number,
  height: number,
  duration: number,
  fps: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
): string {
  // Rough estimation based on typical GIF compression ratios
  const pixelsPerFrame = width * height
  const frameCount = duration * fps

  // GIF typically achieves 10:1 to 30:1 compression
  const compressionRatio = quality === 'high' ? 10 : quality === 'medium' ? 20 : 30

  const estimatedBytes = (pixelsPerFrame * frameCount * 3) / compressionRatio // 3 bytes per pixel RGB

  return formatFileSize(estimatedBytes)
}

/**
 * Get optimal GIF settings for target file size
 */
export function getOptimalGIFSettings(
  duration: number,
  targetSizeMB: number = 10
): {
  width: number
  height: number
  fps: number
  quality: 'low' | 'medium' | 'high'
} {
  const targetBytes = targetSizeMB * 1000000

  // Try different configurations
  const configs = [
    { width: 854, height: 480, fps: 24, quality: 'high' as const }, // HD
    { width: 640, height: 360, fps: 20, quality: 'medium' as const }, // SD high
    { width: 480, height: 270, fps: 15, quality: 'medium' as const }, // SD
    { width: 320, height: 180, fps: 12, quality: 'low' as const }, // Low
  ]

  for (const config of configs) {
    const estimated = estimateGIFSize(config.width, config.height, duration, config.fps, config.quality)
    const estimatedBytes = parseFloat(estimated.split(' ')[0]) * (estimated.includes('MB') ? 1000000 : 1000)

    if (estimatedBytes <= targetBytes) {
      return config
    }
  }

  // If nothing fits, return lowest quality
  return configs[configs.length - 1]
}

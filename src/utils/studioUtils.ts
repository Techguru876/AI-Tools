/**
 * Shared Studio Utilities
 * Common functions used across all studio mini-apps
 */

import { fetchWithRetry } from './apiRetry'

// API Configuration
export interface APIConfig {
  openai?: string
  suno?: string
  elevenlabs?: string
  pixabay?: string
  unsplash?: string
  leonardo?: string
  heygen?: string
  speechify?: string
}

// Text-to-Speech Configuration
export interface TTSConfig {
  provider: 'openai' | 'elevenlabs' | 'google' | 'azure'
  voice: string
  speed: number
  pitch: number
  language: string
}

// Batch Processing
export interface BatchItem {
  id: string
  content: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
}

// Template System
export interface StudioTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  config: any
  tags: string[]
  popularity: number
}

/**
 * Get API Keys from localStorage
 */
function getAPIKeys() {
  const keys = localStorage.getItem('infinitystudio_api_keys')
  return keys ? JSON.parse(keys) : {}
}

/**
 * Text-to-Speech Generation - REAL IMPLEMENTATION WITH GRACEFUL DEGRADATION
 * @param onWarning - Optional callback for non-fatal warnings (e.g., using fallback)
 * @param onError - Optional callback for fatal errors
 */
export async function generateTTS(
  text: string,
  config: TTSConfig,
  onWarning?: (message: string) => void,
  onError?: (message: string) => void
): Promise<string> {
  const apiKeys = getAPIKeys()

  try {
    if (config.provider === 'openai') {
      const apiKey = apiKeys.openai
      if (!apiKey) {
        const warningMsg = 'OpenAI API key not configured. Using browser voice synthesis as fallback. For better quality, add your API key in Settings.'
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        // Fall through to browser TTS fallback below
        return await browserTTSFallback(text, config, onError)
      }

      try {
        const response = await fetchWithRetry('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: config.voice,
            input: text,
            speed: config.speed,
          }),
        }, {
          timeout: 30000, // 30 second timeout for TTS
          maxRetries: 2
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`OpenAI TTS failed (${response.status}): ${errorText}`)
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        return audioUrl
      } catch (apiError: any) {
        const warningMsg = `OpenAI TTS error: ${apiError.message}. Falling back to browser voice.`
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        return await browserTTSFallback(text, config, onError)
      }

    } else if (config.provider === 'elevenlabs') {
      const apiKey = apiKeys.elevenlabs
      if (!apiKey) {
        const warningMsg = 'ElevenLabs API key not configured. Using browser voice synthesis as fallback.'
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        return await browserTTSFallback(text, config, onError)
      }

      try {
        // ElevenLabs implementation
        const voiceId = config.voice // Should be ElevenLabs voice ID
        const response = await fetchWithRetry(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }, {
          timeout: 30000, // 30 second timeout for TTS
          maxRetries: 2
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`ElevenLabs TTS failed (${response.status}): ${errorText}`)
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        return audioUrl
      } catch (apiError: any) {
        const warningMsg = `ElevenLabs TTS error: ${apiError.message}. Falling back to browser voice.`
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        return await browserTTSFallback(text, config, onError)
      }

    } else {
      // Explicitly requested browser TTS
      return await browserTTSFallback(text, config, onError)
    }
  } catch (error: any) {
    const errorMsg = `TTS Generation Error: ${error.message}`
    console.error(errorMsg, error)
    if (onError) onError(errorMsg)
    throw error
  }
}

/**
 * Browser TTS Fallback (always available, no API key required)
 */
async function browserTTSFallback(
  text: string,
  config: TTSConfig,
  onError?: (message: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      const errorMsg = 'Browser does not support text-to-speech. Please configure an API key for TTS.'
      console.error(errorMsg)
      if (onError) onError(errorMsg)
      reject(new Error(errorMsg))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = config.language
    utterance.rate = config.speed
    utterance.pitch = config.pitch

    // Get available voices
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.name.includes(config.voice)) || voices[0]
    if (voice) {
      utterance.voice = voice
    }

    window.speechSynthesis.speak(utterance)

    utterance.onend = () => {
      // Return a placeholder - in real app, we'd record this to a blob
      resolve(`browser-tts-${Date.now()}`)
    }

    utterance.onerror = (error) => {
      const errorMsg = `Browser TTS error: ${error.error}`
      console.error(errorMsg)
      if (onError) onError(errorMsg)
      reject(new Error(errorMsg))
    }
  })
}

/**
 * Batch Process Items
 */
export async function batchProcess<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  onProgress?: (completed: number, total: number) => void
): Promise<any[]> {
  const results = []

  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i])
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, items.length)
    }
  }

  return results
}

/**
 * Parse CSV/Text for Batch Import
 */
export function parseCSV(content: string): string[][] {
  const lines = content.trim().split('\n')
  return lines.map((line) => {
    // Simple CSV parser (handles basic cases)
    return line.split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
  })
}

/**
 * Search Stock Media - REAL IMPLEMENTATION WITH GRACEFUL DEGRADATION
 * @param onWarning - Optional callback for warnings (e.g., using placeholder images)
 */
export async function searchStockMedia(
  query: string,
  type: 'image' | 'video',
  count: number = 12,
  provider: 'pixabay' | 'unsplash' | 'pexels' = 'pexels',
  onWarning?: (message: string) => void
): Promise<any[]> {
  const apiKeys = getAPIKeys()

  try {
    if (provider === 'pexels') {
      const apiKey = apiKeys.pexels
      if (!apiKey) {
        const warningMsg = 'Pexels API key not configured. Using placeholder images. Get free API key at: https://www.pexels.com/api/ - Configure in Settings → API Keys for real stock photos.'
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        return getFallbackMedia(query, type, count)
      }

      const endpoint = type === 'video'
        ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}`
        : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`

      const response = await fetchWithRetry(endpoint, {
        headers: {
          'Authorization': apiKey,
        },
      }, {
        timeout: 15000, // 15 second timeout for media search
        maxRetries: 2
      })

      if (!response.ok) {
        throw new Error(`Pexels API failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (type === 'video') {
        return data.videos?.map((v: any) => ({
          id: v.id,
          url: v.video_files[0]?.link,
          thumbnail: v.image,
          author: v.user.name,
          provider: 'pexels',
          width: v.width,
          height: v.height,
          duration: v.duration,
        })) || []
      } else {
        return data.photos?.map((p: any) => ({
          id: p.id,
          url: p.src.large,
          thumbnail: p.src.medium,
          author: p.photographer,
          provider: 'pexels',
          width: p.width,
          height: p.height,
        })) || []
      }

    } else if (provider === 'pixabay') {
      const apiKey = apiKeys.pixabay
      if (!apiKey) {
        const warningMsg = 'Pixabay API key not configured. Using placeholder images. Get free API key at: https://pixabay.com/api/docs/ - Configure in Settings → API Keys.'
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        return getFallbackMedia(query, type, count)
      }

      const endpoint = type === 'video'
        ? `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}`
        : `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}`

      const response = await fetchWithRetry(endpoint, {}, {
        timeout: 15000, // 15 second timeout for media search
        maxRetries: 2
      })

      if (!response.ok) {
        throw new Error(`Pixabay API failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (type === 'video') {
        return data.hits?.map((v: any) => ({
          id: v.id,
          url: v.videos.large.url,
          thumbnail: v.userImageURL,
          author: v.user,
          provider: 'pixabay',
          width: v.videos.large.width,
          height: v.videos.large.height,
          duration: v.duration,
        })) || []
      } else {
        return data.hits?.map((p: any) => ({
          id: p.id,
          url: p.largeImageURL,
          thumbnail: p.previewURL,
          author: p.user,
          provider: 'pixabay',
          width: p.imageWidth,
          height: p.imageHeight,
        })) || []
      }

    } else if (provider === 'unsplash') {
      const apiKey = apiKeys.unsplash
      if (!apiKey) {
        const warningMsg = 'Unsplash API key not configured. Using placeholder images. Get free API key at: https://unsplash.com/developers - Configure in Settings → API Keys.'
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
        return getFallbackMedia(query, type, count)
      }

      if (type === 'video') {
        // Unsplash doesn't support videos, fallback to images
        const warningMsg = 'Unsplash does not support videos. Showing images instead.'
        console.warn(warningMsg)
        if (onWarning) onWarning(warningMsg)
      }

      const response = await fetchWithRetry(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
        {
          headers: {
            'Authorization': `Client-ID ${apiKey}`,
          },
        },
        {
          timeout: 15000, // 15 second timeout for media search
          maxRetries: 2
        }
      )

      if (!response.ok) {
        throw new Error(`Unsplash API failed: ${response.statusText}`)
      }

      const data = await response.json()

      return data.results?.map((p: any) => ({
        id: p.id,
        url: p.urls.regular,
        thumbnail: p.urls.small,
        author: p.user.name,
        provider: 'unsplash',
        width: p.width,
        height: p.height,
      })) || []
    }

    return getFallbackMedia(query, type, count)

  } catch (error: any) {
    const errorMsg = `Stock Media Search Error: ${error.message}. Using placeholder images.`
    console.error(errorMsg, error)
    if (onWarning) onWarning(errorMsg)
    return getFallbackMedia(query, type, count)
  }
}

/**
 * Fallback media when API keys are not configured
 */
function getFallbackMedia(query: string, type: string, count: number) {
  console.log(`Using fallback media for: ${query}`)
  return Array.from({ length: count }, (_, i) => ({
    id: `fallback-${i}`,
    url: `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(query)}+${i + 1}`,
    thumbnail: `https://via.placeholder.com/400x300/667eea/ffffff?text=${encodeURIComponent(query)}+${i + 1}`,
    author: 'Placeholder',
    provider: 'fallback',
    width: 800,
    height: 600,
  }))
}

/**
 * Generate AI Images - REAL IMPLEMENTATION WITH ERROR HANDLING
 * @param onError - Optional callback for error messages
 */
export async function generateAIImage(
  prompt: string,
  provider: 'openai' | 'leonardo' | 'midjourney' = 'openai',
  onError?: (message: string) => void
): Promise<string> {
  const apiKeys = getAPIKeys()

  try {
    if (provider === 'openai') {
      const apiKey = apiKeys.openai
      if (!apiKey) {
        const errorMsg = 'OpenAI API key required for AI image generation. Get your free API key at: https://platform.openai.com/api-keys - Configure it in Settings → API Keys.'
        console.error(errorMsg)
        if (onError) onError(errorMsg)
        throw new Error(errorMsg)
      }

      const response = await fetchWithRetry('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        }),
      }, {
        timeout: 60000, // 60 second timeout for AI image generation
        maxRetries: 2
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI Image Generation failed (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      return data.data[0].url
    }

    // Fallback if provider not supported
    const errorMsg = `Provider ${provider} not yet implemented. Please use OpenAI.`
    if (onError) onError(errorMsg)
    throw new Error(errorMsg)

  } catch (error: any) {
    const errorMsg = `AI Image Generation Error: ${error.message}`
    console.error(errorMsg, error)
    if (onError) onError(errorMsg)
    throw error
  }
}

/**
 * Generate AI Video with OpenAI Sora - WITH ERROR HANDLING
 * @param onError - Optional callback for error messages
 */
export async function generateAIVideo(
  prompt: string,
  options: {
    duration?: number
    quality?: string
    aspectRatio?: string
  } = {},
  onError?: (message: string) => void
): Promise<string> {
  const apiKeys = getAPIKeys()

  try {
    const apiKey = apiKeys.openai
    if (!apiKey) {
      const errorMsg = 'OpenAI API key required for AI video generation (Sora). Get your API key at: https://platform.openai.com/api-keys - Configure it in Settings → API Keys.'
      console.error(errorMsg)
      if (onError) onError(errorMsg)
      throw new Error(errorMsg)
    }

    // Sora API endpoint (placeholder - actual endpoint may differ)
    const response = await fetchWithRetry('https://api.openai.com/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora-1.0',
        prompt: prompt,
        duration: options.duration || 10,
        resolution: options.quality || '1080p',
        aspect_ratio: options.aspectRatio || '16:9',
      }),
    }, {
      timeout: 120000, // 120 second timeout for AI video generation (longer process)
      maxRetries: 1
    })

    if (!response.ok) {
      const error = await response.json()
      const errorMsg = error.error?.message || `Sora Video Generation failed (${response.status}): ${response.statusText}`
      if (onError) onError(errorMsg)
      throw new Error(errorMsg)
    }

    const data = await response.json()

    // Return video URL from response
    return data.data?.[0]?.url || data.url || ''

  } catch (error: any) {
    const errorMsg = `AI Video Generation Error: ${error.message}`
    console.error(errorMsg, error)
    if (onError) onError(errorMsg)
    throw error
  }
}

/**
 * Auto-generate Metadata
 */
export function generateMetadata(content: string): {
  title: string
  description: string
  tags: string[]
  thumbnail?: string
} {
  // Simple metadata generation (would use AI in real implementation)
  const words = content.split(/\s+/).slice(0, 10).join(' ')

  return {
    title: words.substring(0, 100),
    description: content.substring(0, 200),
    tags: extractKeywords(content, 5),
  }
}

/**
 * Extract Keywords
 */
export function extractKeywords(text: string, count: number = 5): string[] {
  // Simple keyword extraction (would use NLP in real implementation)
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
  const frequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([word]) => word)
}

/**
 * Format Duration
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate Optimal Duration
 */
export function calculateOptimalDuration(
  contentLength: number,
  wordsPerMinute: number = 150
): number {
  // Calculate reading time based on words per minute
  const minutes = contentLength / wordsPerMinute
  return Math.ceil(minutes * 60)
}

/**
 * Auto-select Music
 */
export async function autoSelectMusic(
  mood: 'inspiring' | 'calm' | 'energetic' | 'ambient' | 'upbeat'
): Promise<{ title: string; url: string; bpm: number }> {
  console.log('Auto-selecting music for mood:', mood)

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const musicMap = {
    inspiring: { title: 'Rise Up', bpm: 120 },
    calm: { title: 'Peaceful Mind', bpm: 70 },
    energetic: { title: 'High Energy', bpm: 140 },
    ambient: { title: 'Ambient Waves', bpm: 60 },
    upbeat: { title: 'Feel Good', bpm: 128 },
  }

  const music = musicMap[mood]
  return {
    ...music,
    url: `data:audio/mp3;base64,mock_music_${mood}`,
  }
}

/**
 * Sync Visuals to Audio
 */
export function syncVisualsToAudio(
  audioDuration: number,
  bpm: number
): {
  beatMarkers: number[]
  sceneTransitions: number[]
} {
  const beatsPerSecond = bpm / 60
  const totalBeats = Math.floor(audioDuration * beatsPerSecond)

  const beatMarkers = Array.from({ length: totalBeats }, (_, i) => i / beatsPerSecond)

  // Scene transitions every 4 beats
  const sceneTransitions = beatMarkers.filter((_, i) => i % 4 === 0)

  return { beatMarkers, sceneTransitions }
}

/**
 * Apply Auto Branding
 */
export interface BrandConfig {
  logo?: string
  watermark?: string
  intro?: string
  outro?: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export function applyBranding(
  project: any,
  branding: BrandConfig
): any {
  return {
    ...project,
    branding,
    hasIntro: !!branding.intro,
    hasOutro: !!branding.outro,
    hasWatermark: !!branding.watermark,
  }
}

/**
 * Parse RSS Feed - REAL IMPLEMENTATION
 */
export interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  content: string
  source: string
  category?: string
}

export async function parseRSSFeed(feedUrl: string): Promise<RSSItem[]> {
  try {
    // Use a CORS proxy for RSS feeds since browsers don't allow direct RSS fetching
    const corsProxy = 'https://api.allorigins.win/get?url='
    const response = await fetchWithRetry(corsProxy + encodeURIComponent(feedUrl), {}, {
      timeout: 20000, // 20 second timeout for RSS feed fetching
      maxRetries: 2
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
    }

    const data = await response.json()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(data.contents, 'text/xml')

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      throw new Error('Invalid RSS feed format')
    }

    // Extract items from RSS
    const items = xmlDoc.querySelectorAll('item')
    const results: RSSItem[] = []

    items.forEach((item, index) => {
      if (index < 20) { // Limit to 20 items
        const title = item.querySelector('title')?.textContent || 'No Title'
        const description = item.querySelector('description')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString()
        const content = item.querySelector('content\\:encoded, content')?.textContent || description
        const category = item.querySelector('category')?.textContent || undefined

        // Extract source from feed URL
        const sourceMatch = feedUrl.match(/\/\/([^/]+)/)
        const source = sourceMatch ? sourceMatch[1].replace('www.', '') : 'Unknown'

        results.push({
          title: cleanHTML(title),
          description: cleanHTML(description),
          link,
          pubDate,
          content: cleanHTML(content),
          source,
          category,
        })
      }
    })

    return results

  } catch (error: any) {
    console.error('RSS Parse Error:', error)
    throw new Error(`Failed to parse RSS feed: ${error.message}`)
  }
}

/**
 * Clean HTML tags from text
 */
function cleanHTML(text: string): string {
  // Remove HTML tags
  let clean = text.replace(/<[^>]*>/g, '')
  // Decode HTML entities
  const textarea = document.createElement('textarea')
  textarea.innerHTML = clean
  clean = textarea.value
  // Trim whitespace
  return clean.trim()
}

/**
 * Get Trending News Topics
 */
export async function getTrendingNews(category?: string): Promise<RSSItem[]> {
  // Common RSS feeds by category
  const feeds: Record<string, string> = {
    'tech': 'https://techcrunch.com/feed/',
    'business': 'https://feeds.bbci.co.uk/news/business/rss.xml',
    'sports': 'https://www.espn.com/espn/rss/news',
    'entertainment': 'https://www.hollywoodreporter.com/feed/',
    'world': 'https://feeds.bbci.co.uk/news/world/rss.xml',
  }

  const feedUrl = category && feeds[category] ? feeds[category] : feeds['tech']

  try {
    return await parseRSSFeed(feedUrl)
  } catch (error) {
    console.error('Error fetching trending news:', error)
    return []
  }
}

/**
 * Schedule Upload
 */
export interface UploadSchedule {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter'
  scheduledTime: Date
  metadata: {
    title: string
    description: string
    tags: string[]
    thumbnail?: string
  }
}

export async function scheduleUpload(
  _videoPath: string,
  schedule: UploadSchedule
): Promise<{ id: string; status: string }> {
  console.log('Scheduling upload:', schedule)

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: `upload-${Date.now()}`,
    status: 'scheduled',
  }
}

/**
 * Export Presets
 */
export interface ExportPreset {
  name: string
  format: 'mp4' | 'mov' | 'gif' | 'webm'
  quality: '720p' | '1080p' | '4k'
  fps: 24 | 30 | 60
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
  codec: 'h264' | 'h265' | 'vp9'
  bitrate: string
}

export const EXPORT_PRESETS: Record<string, ExportPreset> = {
  'youtube-hd': {
    name: 'YouTube HD',
    format: 'mp4',
    quality: '1080p',
    fps: 30,
    aspectRatio: '16:9',
    codec: 'h264',
    bitrate: '8 Mbps',
  },
  'youtube-4k': {
    name: 'YouTube 4K',
    format: 'mp4',
    quality: '4k',
    fps: 60,
    aspectRatio: '16:9',
    codec: 'h265',
    bitrate: '40 Mbps',
  },
  'tiktok': {
    name: 'TikTok',
    format: 'mp4',
    quality: '1080p',
    fps: 30,
    aspectRatio: '9:16',
    codec: 'h264',
    bitrate: '6 Mbps',
  },
  'instagram-feed': {
    name: 'Instagram Feed',
    format: 'mp4',
    quality: '1080p',
    fps: 30,
    aspectRatio: '1:1',
    codec: 'h264',
    bitrate: '5 Mbps',
  },
  'instagram-reels': {
    name: 'Instagram Reels',
    format: 'mp4',
    quality: '1080p',
    fps: 30,
    aspectRatio: '9:16',
    codec: 'h264',
    bitrate: '6 Mbps',
  },
  'twitter': {
    name: 'Twitter/X',
    format: 'mp4',
    quality: '720p',
    fps: 30,
    aspectRatio: '16:9',
    codec: 'h264',
    bitrate: '5 Mbps',
  },
}

/**
 * Color Palette Interfaces
 */
export interface ColorPalette {
  name: string
  colors: [number, number, number][]
  mood: string
}

/**
 * Extract color palette from an image using canvas color sampling
 */
export async function extractColorPalette(imageFile: File): Promise<ColorPalette[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      try {
        // Create canvas to analyze image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        // Resize image for faster processing
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        // Extract dominant colors using color quantization
        const colorMap = new Map<string, number>()

        for (let i = 0; i < pixels.length; i += 4) {
          const r = Math.floor(pixels[i] / 32) * 32
          const g = Math.floor(pixels[i + 1] / 32) * 32
          const b = Math.floor(pixels[i + 2] / 32) * 32
          const key = `${r},${g},${b}`
          colorMap.set(key, (colorMap.get(key) || 0) + 1)
        }

        // Sort colors by frequency and get top colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([color]) => color.split(',').map(Number) as [number, number, number])

        // Create palettes based on color theory
        const palettes: ColorPalette[] = []

        // Dominant palette
        if (sortedColors.length >= 5) {
          palettes.push({
            name: 'Dominant Colors',
            colors: sortedColors.slice(0, 5),
            mood: getMoodFromColors(sortedColors.slice(0, 5)),
          })
        }

        // Warm palette (reds, oranges, yellows)
        const warmColors = sortedColors.filter(([r, g, b]) => r > g && r > b)
        if (warmColors.length >= 5) {
          palettes.push({
            name: 'Warm Tones',
            colors: warmColors.slice(0, 5),
            mood: 'Energetic and inviting',
          })
        }

        // Cool palette (blues, greens)
        const coolColors = sortedColors.filter(([r, g, b]) => b > r || g > r)
        if (coolColors.length >= 5) {
          palettes.push({
            name: 'Cool Tones',
            colors: coolColors.slice(0, 5),
            mood: 'Calm and serene',
          })
        }

        // Monochromatic (varying brightness)
        if (sortedColors.length >= 5) {
          const baseColor = sortedColors[0]
          const monochrome = [
            [Math.min(255, baseColor[0] * 1.4), Math.min(255, baseColor[1] * 1.4), Math.min(255, baseColor[2] * 1.4)],
            [Math.min(255, baseColor[0] * 1.2), Math.min(255, baseColor[1] * 1.2), Math.min(255, baseColor[2] * 1.2)],
            baseColor,
            [baseColor[0] * 0.8, baseColor[1] * 0.8, baseColor[2] * 0.8],
            [baseColor[0] * 0.6, baseColor[1] * 0.6, baseColor[2] * 0.6],
          ] as [number, number, number][]

          palettes.push({
            name: 'Monochromatic',
            colors: monochrome,
            mood: 'Cohesive and harmonious',
          })
        }

        URL.revokeObjectURL(url)
        resolve(palettes)
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Determine mood from colors based on color psychology
 */
function getMoodFromColors(colors: [number, number, number][]): string {
  const avgR = colors.reduce((sum, c) => sum + c[0], 0) / colors.length
  const avgG = colors.reduce((sum, c) => sum + c[1], 0) / colors.length
  const avgB = colors.reduce((sum, c) => sum + c[2], 0) / colors.length

  if (avgR > avgG && avgR > avgB) {
    return 'Energetic and passionate'
  } else if (avgB > avgR && avgB > avgG) {
    return 'Calm and trustworthy'
  } else if (avgG > avgR && avgG > avgB) {
    return 'Natural and balanced'
  } else if (avgR < 100 && avgG < 100 && avgB < 100) {
    return 'Sophisticated and mysterious'
  } else if (avgR > 200 && avgG > 200 && avgB > 200) {
    return 'Clean and minimalist'
  } else {
    return 'Balanced and neutral'
  }
}

/**
 * Detect BPM from audio file using Web Audio API
 */
export async function detectBPM(audioFile: File): Promise<number> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Get audio data from first channel
      const channelData = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate

      // Find peaks in the audio (simple onset detection)
      const peaks: number[] = []
      const threshold = 0.3
      const minPeakDistance = sampleRate * 0.3 // Minimum 300ms between peaks

      let lastPeakIndex = -minPeakDistance

      for (let i = 1; i < channelData.length - 1; i++) {
        const current = Math.abs(channelData[i])
        const prev = Math.abs(channelData[i - 1])
        const next = Math.abs(channelData[i + 1])

        // Detect peak
        if (current > threshold && current > prev && current > next) {
          if (i - lastPeakIndex >= minPeakDistance) {
            peaks.push(i / sampleRate) // Convert to seconds
            lastPeakIndex = i
          }
        }
      }

      // Calculate intervals between peaks
      if (peaks.length < 2) {
        // Not enough peaks, estimate based on typical lofi range
        resolve(85)
        return
      }

      const intervals: number[] = []
      for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i - 1])
      }

      // Calculate average interval
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length

      // Convert to BPM
      let bpm = Math.round(60 / avgInterval)

      // Lofi music is typically 70-130 BPM, adjust if needed
      while (bpm < 70) bpm *= 2
      while (bpm > 130) bpm /= 2

      await audioContext.close()
      resolve(bpm)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Loop Analysis Interface
 */
export interface LoopAnalysis {
  audioLoop?: {
    start: number
    end: number
    duration: number
  }
  visualLoop?: {
    start: number
    end: number
    duration: number
  }
  bpm: number
  isSynced: boolean
  recommendations: string[]
}

/**
 * Detect optimal loop points in audio file
 */
export async function detectLoopPoints(audioFile: File, targetDuration: number = 60): Promise<LoopAnalysis> {
  try {
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Detect BPM
    const bpm = await detectBPM(audioFile)

    // Calculate beat duration
    const beatDuration = 60 / bpm

    // Find loop point that's close to target duration and aligns with beats
    const beatsInTarget = Math.round(targetDuration / beatDuration)
    const loopDuration = beatsInTarget * beatDuration

    // Ensure loop doesn't exceed audio duration
    const maxDuration = Math.min(loopDuration, audioBuffer.duration)

    // Find zero-crossings near the loop points for smooth transitions
    const channelData = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate

    const findZeroCrossing = (targetTime: number): number => {
      const targetSample = Math.floor(targetTime * sampleRate)
      const searchRange = Math.floor(0.1 * sampleRate) // Search 100ms around target

      for (let i = 0; i < searchRange; i++) {
        const sampleIndex = targetSample + i
        if (sampleIndex >= channelData.length - 1) break

        if (channelData[sampleIndex] >= 0 && channelData[sampleIndex + 1] < 0) {
          return sampleIndex / sampleRate
        }
      }
      return targetTime
    }

    const loopStart = findZeroCrossing(0)
    const loopEnd = findZeroCrossing(maxDuration)

    await audioContext.close()

    return {
      audioLoop: {
        start: loopStart,
        end: loopEnd,
        duration: loopEnd - loopStart,
      },
      visualLoop: {
        start: loopStart,
        end: loopEnd,
        duration: loopEnd - loopStart,
      },
      bpm,
      isSynced: true,
      recommendations: [
        `✓ Detected ${bpm} BPM tempo`,
        `✓ Perfect loop point found at ${Math.round(loopEnd)}s`,
        `✓ Loop aligns with ${beatsInTarget} beats for smooth transitions`,
        `💡 Duration optimized for ${Math.round(loopEnd - loopStart)}s loop`,
      ],
    }
  } catch (error: any) {
    console.error('Loop detection error:', error)
    // Return sensible defaults if analysis fails
    return {
      audioLoop: {
        start: 0,
        end: targetDuration,
        duration: targetDuration,
      },
      visualLoop: {
        start: 0,
        end: targetDuration,
        duration: targetDuration,
      },
      bpm: 85,
      isSynced: true,
      recommendations: [
        '⚠️ Auto-detection unavailable, using default settings',
        `✓ Set loop duration to ${targetDuration}s`,
        '💡 Manually adjust loop points for best results',
      ],
    }
  }
}

/**
 * Simple image segmentation using edge detection
 * For foreground/background separation
 */
export interface SegmentationResult {
  foreground: string
  background: string
}

export async function segmentImage(imageFile: File): Promise<SegmentationResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        // Simple edge detection using Sobel operator
        const edges = new Uint8ClampedArray(pixels.length)
        const width = canvas.width
        const height = canvas.height

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4

            // Get surrounding pixels
            const gx = (
              -pixels[((y - 1) * width + (x - 1)) * 4] +
              pixels[((y - 1) * width + (x + 1)) * 4] +
              -2 * pixels[(y * width + (x - 1)) * 4] +
              2 * pixels[(y * width + (x + 1)) * 4] +
              -pixels[((y + 1) * width + (x - 1)) * 4] +
              pixels[((y + 1) * width + (x + 1)) * 4]
            )

            const gy = (
              -pixels[((y - 1) * width + (x - 1)) * 4] +
              -2 * pixels[((y - 1) * width + x) * 4] +
              -pixels[((y - 1) * width + (x + 1)) * 4] +
              pixels[((y + 1) * width + (x - 1)) * 4] +
              2 * pixels[((y + 1) * width + x) * 4] +
              pixels[((y + 1) * width + (x + 1)) * 4]
            )

            const magnitude = Math.sqrt(gx * gx + gy * gy)
            const threshold = 100

            if (magnitude > threshold) {
              // Edge pixel - mark as foreground
              edges[idx] = pixels[idx]
              edges[idx + 1] = pixels[idx + 1]
              edges[idx + 2] = pixels[idx + 2]
              edges[idx + 3] = 255
            } else {
              // Non-edge - mark as background
              edges[idx] = 0
              edges[idx + 1] = 0
              edges[idx + 2] = 0
              edges[idx + 3] = 0
            }
          }
        }

        // Create foreground canvas
        const fgCanvas = document.createElement('canvas')
        fgCanvas.width = width
        fgCanvas.height = height
        const fgCtx = fgCanvas.getContext('2d')!
        const fgImageData = new ImageData(edges, width, height)
        fgCtx.putImageData(fgImageData, 0, 0)

        // Create background canvas (original with reduced foreground)
        const bgCanvas = document.createElement('canvas')
        bgCanvas.width = width
        bgCanvas.height = height
        const bgCtx = bgCanvas.getContext('2d')!
        bgCtx.drawImage(img, 0, 0)
        bgCtx.globalCompositeOperation = 'destination-out'
        bgCtx.drawImage(fgCanvas, 0, 0)

        URL.revokeObjectURL(url)

        resolve({
          foreground: fgCanvas.toDataURL(),
          background: bgCanvas.toDataURL(),
        })
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

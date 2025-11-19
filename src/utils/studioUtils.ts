/**
 * Shared Studio Utilities
 * Common functions used across all studio mini-apps
 */

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
 * Text-to-Speech Generation - REAL IMPLEMENTATION
 */
export async function generateTTS(
  text: string,
  config: TTSConfig
): Promise<string> {
  const apiKeys = getAPIKeys()

  try {
    if (config.provider === 'openai') {
      const apiKey = apiKeys.openai
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add it in Settings.')
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
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
      })

      if (!response.ok) {
        throw new Error(`OpenAI TTS failed: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      return audioUrl

    } else if (config.provider === 'elevenlabs') {
      const apiKey = apiKeys.elevenlabs
      if (!apiKey) {
        throw new Error('ElevenLabs API key not configured. Please add it in Settings.')
      }

      // ElevenLabs implementation
      const voiceId = config.voice // Should be ElevenLabs voice ID
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS failed: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      return audioUrl

    } else {
      // Fallback to browser Speech Synthesis API (free, no API key needed)
      return new Promise((resolve, reject) => {
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

        // We can't directly get audio URL from browser TTS, so we'll use a workaround
        // In production, you'd want to record this to a blob
        window.speechSynthesis.speak(utterance)

        utterance.onend = () => {
          // Return a placeholder - in real app, we'd record this
          resolve(`browser-tts-${Date.now()}`)
        }

        utterance.onerror = (error) => {
          reject(error)
        }
      })
    }
  } catch (error: any) {
    console.error('TTS Generation Error:', error)
    alert(`TTS Error: ${error.message}`)
    throw error
  }
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
 * Search Stock Media - REAL IMPLEMENTATION
 */
export async function searchStockMedia(
  query: string,
  type: 'image' | 'video',
  count: number = 12,
  provider: 'pixabay' | 'unsplash' | 'pexels' = 'pexels'
): Promise<any[]> {
  const apiKeys = getAPIKeys()

  try {
    if (provider === 'pexels') {
      const apiKey = apiKeys.pexels
      if (!apiKey) {
        console.warn('Pexels API key not configured, using fallback')
        return getFallbackMedia(query, type, count)
      }

      const endpoint = type === 'video'
        ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}`
        : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': apiKey,
        },
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
        console.warn('Pixabay API key not configured, using fallback')
        return getFallbackMedia(query, type, count)
      }

      const endpoint = type === 'video'
        ? `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}`
        : `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${count}`

      const response = await fetch(endpoint)

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
        console.warn('Unsplash API key not configured, using fallback')
        return getFallbackMedia(query, type, count)
      }

      if (type === 'video') {
        // Unsplash doesn't support videos, fallback to images
        console.warn('Unsplash does not support videos, returning images instead')
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
        {
          headers: {
            'Authorization': `Client-ID ${apiKey}`,
          },
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
    console.error('Stock Media Search Error:', error)
    // Don't alert here, just return fallback
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
 * Generate AI Images - REAL IMPLEMENTATION
 */
export async function generateAIImage(
  prompt: string,
  provider: 'openai' | 'leonardo' | 'midjourney' = 'openai'
): Promise<string> {
  const apiKeys = getAPIKeys()

  try {
    if (provider === 'openai') {
      const apiKey = apiKeys.openai
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add it in Settings.')
      }

      const response = await fetch('https://api.openai.com/v1/images/generations', {
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
      })

      if (!response.ok) {
        throw new Error(`OpenAI Image Generation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data[0].url
    }

    // Fallback if provider not supported
    throw new Error(`Provider ${provider} not yet implemented. Please use OpenAI.`)

  } catch (error: any) {
    console.error('AI Image Generation Error:', error)
    alert(`AI Image Error: ${error.message}`)
    // Return placeholder on error
    return `https://via.placeholder.com/1024x1024/667eea/ffffff?text=AI+Error:+${encodeURIComponent(prompt.substring(0, 50))}`
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
    const response = await fetch(corsProxy + encodeURIComponent(feedUrl))

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

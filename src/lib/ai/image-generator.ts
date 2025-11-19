import { createApi } from 'unsplash-js'
import { env } from '@/lib/env'

// Initialize Unsplash API
const unsplash = env.UNSPLASH_ACCESS_KEY
  ? createApi({
      accessKey: env.UNSPLASH_ACCESS_KEY,
    })
  : null

export interface ImageResult {
  url: string
  alt: string
  width: number
  height: number
  photographer: string
  photographerUrl: string
  downloadUrl: string
}

export async function searchImages(query: string, count = 1): Promise<ImageResult[]> {
  if (!unsplash) {
    console.warn('Unsplash API not configured, returning placeholder images')
    return getPlaceholderImages(query, count)
  }

  try {
    const result = await unsplash.search.getPhotos({
      query,
      perPage: count,
      orientation: 'landscape',
    })

    if (result.type === 'error') {
      throw new Error('Failed to fetch images from Unsplash')
    }

    return result.response.results.map((photo) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || query,
      width: photo.width,
      height: photo.height,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadUrl: photo.links.download_location,
    }))
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error)
    return getPlaceholderImages(query, count)
  }
}

export async function getCoverImage(topic: string): Promise<ImageResult> {
  const images = await searchImages(topic, 1)
  return images[0]
}

function getPlaceholderImages(query: string, count: number): ImageResult[] {
  const results: ImageResult[] = []

  for (let i = 0; i < count; i++) {
    results.push({
      url: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop`,
      alt: query,
      width: 1200,
      height: 630,
      photographer: 'Placeholder',
      photographerUrl: 'https://unsplash.com',
      downloadUrl: '',
    })
  }

  return results
}

// Track image downloads for Unsplash API compliance
export async function trackImageDownload(downloadUrl: string): Promise<void> {
  if (!unsplash || !downloadUrl) return

  try {
    await fetch(downloadUrl)
  } catch (error) {
    console.error('Error tracking image download:', error)
  }
}

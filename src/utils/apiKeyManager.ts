/**
 * API Key Management Utility
 * Handles checking API key availability and providing user guidance
 */

export interface APIKeyStatus {
  openai: boolean
  elevenlabs: boolean
  pexels: boolean
  pixabay: boolean
  unsplash: boolean
}

interface APIKeyConfig {
  openai?: string
  elevenlabs?: string
  pexels?: string
  pixabay?: string
  unsplash?: string
  leonardo?: string
  heygen?: string
  speechify?: string
}

/**
 * Get API keys from localStorage
 */
export function getAPIKeys(): APIKeyConfig {
  try {
    const keys = localStorage.getItem('infinitystudio_api_keys')
    return keys ? JSON.parse(keys) : {}
  } catch (error) {
    console.error('Failed to load API keys:', error)
    return {}
  }
}

/**
 * Check which API keys are configured
 */
export function checkAPIKeys(): APIKeyStatus {
  const keys = getAPIKeys()
  return {
    openai: !!keys.openai && keys.openai.trim().length > 0,
    elevenlabs: !!keys.elevenlabs && keys.elevenlabs.trim().length > 0,
    pexels: !!keys.pexels && keys.pexels.trim().length > 0,
    pixabay: !!keys.pixabay && keys.pixabay.trim().length > 0,
    unsplash: !!keys.unsplash && keys.unsplash.trim().length > 0,
  }
}

/**
 * Save API keys to localStorage
 */
export function saveAPIKeys(keys: Partial<APIKeyConfig>): void {
  try {
    const currentKeys = getAPIKeys()
    const updatedKeys = { ...currentKeys, ...keys }
    localStorage.setItem('infinitystudio_api_keys', JSON.stringify(updatedKeys))
  } catch (error) {
    console.error('Failed to save API keys:', error)
    throw new Error('Failed to save API keys to local storage')
  }
}

/**
 * Get instructions for obtaining API keys
 */
export function getAPIKeyInstructions(provider: string): {
  url: string
  description: string
} {
  const instructions: Record<string, { url: string; description: string }> = {
    openai: {
      url: 'https://platform.openai.com/api-keys',
      description: 'Required for AI video generation (Sora) and advanced TTS. Free tier available.',
    },
    elevenlabs: {
      url: 'https://elevenlabs.io/app/settings/api-keys',
      description: 'Required for high-quality voice cloning and TTS. Free tier: 10k chars/month.',
    },
    pexels: {
      url: 'https://www.pexels.com/api/',
      description: 'Required for stock photos and videos. 100% free, no rate limits.',
    },
    pixabay: {
      url: 'https://pixabay.com/api/docs/',
      description: 'Required for stock media search. Free tier available.',
    },
    unsplash: {
      url: 'https://unsplash.com/developers',
      description: 'Required for high-quality stock photos. Free tier: 50 requests/hour.',
    },
  }

  return (
    instructions[provider] || {
      url: 'https://infinitystudio.app/api-keys',
      description: 'Configure API key in Settings',
    }
  )
}

/**
 * Get user-friendly feature names for API providers
 */
export function getFeaturesByProvider(provider: string): string[] {
  const features: Record<string, string[]> = {
    openai: ['AI Video Generation (Sora)', 'Text-to-Speech', 'AI Image Generation (DALL-E)'],
    elevenlabs: ['Premium Voice Synthesis', 'Voice Cloning'],
    pexels: ['Stock Photo Search', 'Stock Video Search'],
    pixabay: ['Stock Media Library'],
    unsplash: ['Stock Photo Library'],
  }

  return features[provider] || []
}

/**
 * Check if a specific API key is available
 */
export function hasAPIKey(provider: keyof APIKeyStatus): boolean {
  const status = checkAPIKeys()
  return status[provider]
}

/**
 * Get missing API keys for a set of required providers
 */
export function getMissingKeys(requiredProviders: (keyof APIKeyStatus)[]): (keyof APIKeyStatus)[] {
  const status = checkAPIKeys()
  return requiredProviders.filter((provider) => !status[provider])
}

/**
 * Generate user-friendly error message for missing API key
 */
export function getMissingKeyMessage(provider: keyof APIKeyStatus): string {
  const instructions = getAPIKeyInstructions(provider)
  const features = getFeaturesByProvider(provider)

  return `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key required for: ${features.join(', ')}.

Get your free API key at: ${instructions.url}

Configure it in Settings → API Keys.`
}

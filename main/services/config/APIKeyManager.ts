import Store from 'electron-store';

/**
 * API Keys Schema
 */
interface APIKeys {
  openai?: string;
  elevenlabs?: string;
  stability?: string;
  youtube?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  };
}

/**
 * API Key Manager
 * Secure encrypted storage for API keys using electron-store
 */
export class APIKeyManager {
  private store: Store<APIKeys>;

  constructor() {
    this.store = new Store<APIKeys>({
      name: 'api-keys',
      encryptionKey: process.env.ENCRYPTION_KEY || 'contentforge-secure-2024',
      defaults: {},
    });
  }

  // OpenAI
  setOpenAIKey(key: string): void {
    this.store.set('openai', key);
  }

  getOpenAIKey(): string | undefined {
    return this.store.get('openai');
  }

  // ElevenLabs
  setElevenLabsKey(key: string): void {
    this.store.set('elevenlabs', key);
  }

  getElevenLabsKey(): string | undefined {
    return this.store.get('elevenlabs');
  }

  // Stability AI
  setStabilityKey(key: string): void {
    this.store.set('stability', key);
  }

  getStabilityKey(): string | undefined {
    return this.store.get('stability');
  }

  // YouTube
  setYouTubeCredentials(credentials: {
    clientId: string;
    clientSecret: string;
    refreshToken?: string;
  }): void {
    this.store.set('youtube', credentials);
  }

  getYouTubeCredentials(): {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  } | undefined {
    return this.store.get('youtube');
  }

  // Validation
  validateKeys(): {
    openai: boolean;
    elevenlabs: boolean;
    stability: boolean;
    youtube: boolean;
  } {
    return {
      openai: !!this.getOpenAIKey(),
      elevenlabs: !!this.getElevenLabsKey(),
      stability: !!this.getStabilityKey(),
      youtube: !!this.getYouTubeCredentials()?.clientId,
    };
  }

  // Clear all keys
  clearAllKeys(): void {
    this.store.clear();
  }

  // Clear specific key
  clearKey(service: 'openai' | 'elevenlabs' | 'stability' | 'youtube'): void {
    this.store.delete(service);
  }

  // Get all configured services
  getConfiguredServices(): string[] {
    const validation = this.validateKeys();
    return Object.entries(validation)
      .filter(([_, isValid]) => isValid)
      .map(([service]) => service);
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIKeyManager = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
/**
 * API Key Manager
 * Secure encrypted storage for API keys using electron-store
 */
class APIKeyManager {
    constructor() {
        this.store = new electron_store_1.default({
            name: 'api-keys',
            encryptionKey: process.env.ENCRYPTION_KEY || 'contentforge-secure-2024',
            defaults: {},
        });
    }
    // OpenAI
    setOpenAIKey(key) {
        this.store.set('openai', key);
    }
    getOpenAIKey() {
        return this.store.get('openai');
    }
    // ElevenLabs
    setElevenLabsKey(key) {
        this.store.set('elevenlabs', key);
    }
    getElevenLabsKey() {
        return this.store.get('elevenlabs');
    }
    // Stability AI
    setStabilityKey(key) {
        this.store.set('stability', key);
    }
    getStabilityKey() {
        return this.store.get('stability');
    }
    // YouTube
    setYouTubeCredentials(credentials) {
        this.store.set('youtube', credentials);
    }
    getYouTubeCredentials() {
        return this.store.get('youtube');
    }
    // Validation
    validateKeys() {
        return {
            openai: !!this.getOpenAIKey(),
            elevenlabs: !!this.getElevenLabsKey(),
            stability: !!this.getStabilityKey(),
            youtube: !!this.getYouTubeCredentials()?.clientId,
        };
    }
    // Clear all keys
    clearAllKeys() {
        this.store.clear();
    }
    // Clear specific key
    clearKey(service) {
        this.store.delete(service);
    }
    // Get all configured services
    getConfiguredServices() {
        const validation = this.validateKeys();
        return Object.entries(validation)
            .filter(([_, isValid]) => isValid)
            .map(([service]) => service);
    }
}
exports.APIKeyManager = APIKeyManager;
//# sourceMappingURL=APIKeyManager.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseProvider_1 = require("../base/BaseProvider");
const promises_1 = __importDefault(require("fs/promises"));
/**
 * ElevenLabs Provider
 * High-quality text-to-speech synthesis
 */
class ElevenLabsProvider extends BaseProvider_1.BaseProvider {
    constructor(apiKey) {
        super(apiKey, 60); // 60 requests per minute
        this.baseURL = 'https://api.elevenlabs.io/v1';
        this.cachedVoices = null;
    }
    getProviderName() {
        return 'ElevenLabs';
    }
    /**
     * List available voices
     */
    async listVoices(forceRefresh = false) {
        if (this.cachedVoices && !forceRefresh) {
            return this.cachedVoices;
        }
        return this.makeRequest(async () => {
            const response = await axios_1.default.get(`${this.baseURL}/voices`, {
                headers: { 'xi-api-key': this.apiKey },
            });
            this.cachedVoices = response.data.voices.map((v) => ({
                voice_id: v.voice_id,
                name: v.name,
                category: v.category,
                description: v.description,
            }));
            return this.cachedVoices;
        }, 0, 'list-voices'); // Free request
    }
    /**
     * Generate voice
     */
    async generateVoice(text, voiceId, outputPath, options) {
        const characters = text.length;
        // Pricing estimate (Creator plan: $22/month for 100K chars = $0.00022/char)
        // Actual cost depends on subscription plan
        const estimatedCost = characters * 0.00022;
        return this.makeRequest(async () => {
            const response = await axios_1.default.post(`${this.baseURL}/text-to-speech/${voiceId}`, {
                text,
                model_id: options?.model || 'eleven_multilingual_v2',
                voice_settings: {
                    stability: options?.stability !== undefined ? options.stability : 0.5,
                    similarity_boost: options?.similarityBoost !== undefined ? options.similarityBoost : 0.75,
                    style: options?.style !== undefined ? options.style : 0,
                },
            }, {
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                },
                responseType: 'arraybuffer',
            });
            // Save audio file
            await promises_1.default.writeFile(outputPath, Buffer.from(response.data));
            return {
                path: outputPath,
                characters,
                cost: estimatedCost,
            };
        }, estimatedCost, 'voice-generation');
    }
    /**
     * Generate voice with streaming (for long texts)
     */
    async generateVoiceStreaming(text, voiceId, outputPath, options) {
        const characters = text.length;
        const estimatedCost = characters * 0.00022;
        return this.makeRequest(async () => {
            const response = await axios_1.default.post(`${this.baseURL}/text-to-speech/${voiceId}/stream`, {
                text,
                model_id: options?.model || 'eleven_multilingual_v2',
                voice_settings: {
                    stability: options?.stability !== undefined ? options.stability : 0.5,
                    similarity_boost: options?.similarityBoost !== undefined ? options.similarityBoost : 0.75,
                },
            }, {
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                },
                responseType: 'stream',
            });
            // Stream to file
            const writer = await promises_1.default.open(outputPath, 'w');
            let chunkCount = 0;
            for await (const chunk of response.data) {
                await writer.write(chunk);
                chunkCount++;
                if (options?.onProgress) {
                    options.onProgress(chunkCount);
                }
            }
            await writer.close();
            return {
                path: outputPath,
                characters,
                cost: estimatedCost,
            };
        }, estimatedCost, 'voice-generation-streaming');
    }
    /**
     * Get voice details
     */
    async getVoice(voiceId) {
        return this.makeRequest(async () => {
            try {
                const response = await axios_1.default.get(`${this.baseURL}/voices/${voiceId}`, {
                    headers: { 'xi-api-key': this.apiKey },
                });
                return {
                    voice_id: response.data.voice_id,
                    name: response.data.name,
                    category: response.data.category,
                    description: response.data.description,
                };
            }
            catch (error) {
                return null;
            }
        }, 0, 'get-voice');
    }
    /**
     * Validate API key
     */
    async validateAPIKey() {
        try {
            await this.listVoices();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.ElevenLabsProvider = ElevenLabsProvider;
//# sourceMappingURL=ElevenLabsProvider.js.map
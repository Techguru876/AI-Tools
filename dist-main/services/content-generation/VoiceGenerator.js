"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceGenerator = void 0;
const ElevenLabsProvider_1 = require("./providers/ElevenLabsProvider");
const OpenAIProvider_1 = require("./providers/OpenAIProvider");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const promises_1 = __importDefault(require("fs/promises"));
/**
 * Voice Generator
 * High-level service for generating narration and voice-overs
 */
class VoiceGenerator {
    constructor(elevenLabsKey, openAIKey, outputDir) {
        if (elevenLabsKey) {
            this.elevenlabs = new ElevenLabsProvider_1.ElevenLabsProvider(elevenLabsKey);
        }
        if (openAIKey) {
            this.openai = new OpenAIProvider_1.OpenAIProvider(openAIKey);
        }
        this.outputDir = outputDir || path_1.default.join(os_1.default.homedir(), 'ContentForge', 'voices');
        this.ensureOutputDir();
    }
    async ensureOutputDir() {
        try {
            await promises_1.default.mkdir(this.outputDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating voice output directory:', error);
        }
    }
    /**
     * Generate narration (auto-selects best provider)
     */
    async generateNarration(text, outputFilename, options) {
        const outputPath = path_1.default.join(this.outputDir, outputFilename);
        let provider = options?.provider || 'auto';
        // Auto-select provider
        if (provider === 'auto') {
            provider = this.elevenlabs ? 'elevenlabs' : 'openai';
        }
        if (provider === 'elevenlabs' && this.elevenlabs) {
            const voiceId = options?.voiceId || await this.getDefaultVoiceId();
            const result = await this.elevenlabs.generateVoice(text, voiceId, outputPath, {
                stability: 0.5,
                similarityBoost: 0.75,
                model: options?.quality === 'high' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2',
            });
            return {
                ...result,
                provider: 'elevenlabs',
            };
        }
        else if (provider === 'openai' && this.openai) {
            const voice = options?.openAIVoice || 'alloy';
            const model = options?.quality === 'high' ? 'tts-1-hd' : 'tts-1';
            const result = await this.openai.generateSpeech(text, outputPath, {
                voice,
                model,
            });
            return {
                ...result,
                provider: 'openai',
            };
        }
        throw new Error('No voice provider available');
    }
    /**
     * Generate long narration (splits into chunks if needed)
     */
    async generateLongNarration(text, outputFilename, options) {
        const maxChunkLength = options?.maxChunkLength || 4500; // ElevenLabs limit is ~5000 chars
        // If text is short enough, generate directly
        if (text.length <= maxChunkLength) {
            const result = await this.generateNarration(text, outputFilename, options);
            return { ...result, chunks: 1 };
        }
        // Split into chunks (on sentence boundaries)
        const chunks = this.splitIntoChunks(text, maxChunkLength);
        // Generate each chunk
        const chunkFiles = [];
        let totalCost = 0;
        for (let i = 0; i < chunks.length; i++) {
            const chunkFilename = outputFilename.replace(/\.mp3$/, `_chunk${i}.mp3`);
            const result = await this.generateNarration(chunks[i], chunkFilename, options);
            chunkFiles.push(result.path);
            totalCost += result.cost;
        }
        // TODO: Merge chunks into single file using ffmpeg
        // For now, return the first chunk path
        const outputPath = path_1.default.join(this.outputDir, outputFilename);
        return {
            path: chunkFiles[0], // TODO: Return merged file
            provider: options?.provider || 'auto',
            characters: text.length,
            cost: totalCost,
            chunks: chunks.length,
        };
    }
    /**
     * Split text into chunks on sentence boundaries
     */
    splitIntoChunks(text, maxLength) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            }
            else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }
    /**
     * List available voices (ElevenLabs)
     */
    async listVoices() {
        if (!this.elevenlabs) {
            return [];
        }
        return await this.elevenlabs.listVoices();
    }
    /**
     * Get default voice ID
     */
    async getDefaultVoiceId() {
        if (!this.elevenlabs) {
            throw new Error('ElevenLabs provider not initialized');
        }
        const voices = await this.elevenlabs.listVoices();
        // Find a suitable narration voice
        const narratorVoice = voices.find(v => v.name.toLowerCase().includes('adam') || // Deep male voice
            v.name.toLowerCase().includes('antoni') // Calm male voice
        );
        return narratorVoice?.voice_id || voices[0]?.voice_id || 'default';
    }
    /**
     * Get cost statistics
     */
    getCostStats(provider = 'both') {
        const stats = {};
        if (provider === 'both' || provider === 'elevenlabs') {
            if (this.elevenlabs) {
                stats.elevenlabs = this.elevenlabs.getCostStats();
            }
        }
        if (provider === 'both' || provider === 'openai') {
            if (this.openai) {
                stats.openai = this.openai.getCostStats();
            }
        }
        return stats;
    }
    close() {
        if (this.elevenlabs)
            this.elevenlabs.close();
        if (this.openai)
            this.openai.close();
    }
}
exports.VoiceGenerator = VoiceGenerator;
//# sourceMappingURL=VoiceGenerator.js.map
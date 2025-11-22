"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerator = void 0;
const OpenAIProvider_1 = require("./providers/OpenAIProvider");
const ContentCache_1 = require("./ContentCache");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const promises_1 = __importDefault(require("fs/promises"));
/**
 * Image Generator
 * High-level service for generating images with AI
 */
class ImageGenerator {
    constructor(apiKey, outputDir) {
        this.openai = new OpenAIProvider_1.OpenAIProvider(apiKey);
        this.cache = new ContentCache_1.ContentCache();
        this.outputDir = outputDir || path_1.default.join(os_1.default.homedir(), 'ContentForge', 'images');
        this.ensureOutputDir();
    }
    async ensureOutputDir() {
        try {
            await promises_1.default.mkdir(this.outputDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating image output directory:', error);
        }
    }
    /**
     * Generate image from prompt
     */
    async generate(prompt, options) {
        const filename = options?.filename || `image_${Date.now()}.png`;
        const outputPath = path_1.default.join(this.outputDir, filename);
        // Enhance prompt with style if provided
        let enhancedPrompt = prompt;
        if (options?.style) {
            enhancedPrompt = `${prompt}, ${options.style}`;
        }
        // Check cache
        const cacheKey = `${enhancedPrompt}_${options?.size}_${options?.quality}`;
        const cached = await this.cache.get('image_generation', cacheKey);
        if (cached && cached.path) {
            // Check if cached file still exists
            try {
                await promises_1.default.access(cached.path);
                return cached;
            }
            catch {
                // Cached file doesn't exist, regenerate
            }
        }
        const result = await this.openai.generateImage(enhancedPrompt, {
            size: options?.size || '1024x1024',
            quality: options?.quality || 'standard',
            outputPath,
        });
        const response = {
            url: result.url,
            path: outputPath,
            cost: result.cost,
        };
        // Cache the result
        await this.cache.set('image_generation', cacheKey, response, {
            costSaved: result.cost,
        });
        return response;
    }
    /**
     * Generate horror scene image
     */
    async generateHorrorScene(sceneDescription, options) {
        const intensity = options?.intensity || 'moderate';
        const styleMap = {
            subtle: 'dark atmospheric, subtle horror, eerie lighting, cinematic',
            moderate: 'dark horror, ominous atmosphere, dramatic shadows, unsettling',
            extreme: 'intense horror, terrifying, nightmarish, extremely dark and disturbing',
        };
        const style = styleMap[intensity];
        return this.generate(sceneDescription, {
            filename: options?.filename,
            size: '1792x1024', // Widescreen for video
            quality: 'hd',
            style,
        });
    }
    /**
     * Generate lofi background image
     */
    async generateLofiBackground(description, options) {
        const mood = options?.mood || 'chill';
        const styleMap = {
            chill: 'lofi aesthetic, anime style, soft colors, relaxing atmosphere',
            cozy: 'cozy lofi scene, warm lighting, comfortable, intimate',
            dreamy: 'dreamy lofi aesthetic, soft focus, pastel colors, ethereal',
            nostalgic: 'nostalgic lofi vibe, retro aesthetic, warm tones, vintage feel',
        };
        const style = styleMap[mood];
        return this.generate(description, {
            filename: options?.filename,
            size: '1024x1024', // Square for lofi streams
            quality: 'hd',
            style,
        });
    }
    /**
     * Generate motivational quote background
     */
    async generateMotivationalBackground(theme, options) {
        const style = 'inspirational, uplifting, vibrant colors, professional, modern design';
        return this.generate(theme, {
            filename: options?.filename,
            size: '1024x1024',
            quality: 'standard', // Standard quality is fine for backgrounds
            style,
        });
    }
    /**
     * Generate multiple images in batch
     */
    async generateBatch(prompts) {
        const results = [];
        for (const item of prompts) {
            const result = await this.generate(item.prompt, {
                filename: item.filename,
                style: item.style,
            });
            results.push(result);
        }
        return results;
    }
    /**
     * Get cost statistics
     */
    getCostStats() {
        return this.openai.getCostStats();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cache.getStats();
    }
    close() {
        this.openai.close();
        this.cache.close();
    }
}
exports.ImageGenerator = ImageGenerator;
//# sourceMappingURL=ImageGenerator.js.map
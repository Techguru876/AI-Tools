"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMotivationalTemplate = createMotivationalTemplate;
/**
 * Motivational Quotes Template
 * Inspiring and uplifting quote videos with powerful visuals
 *
 * Features:
 * - Bold, impactful typography
 * - Inspiring background images
 * - Smooth quote transitions
 * - Motivational music
 * - Elegant animations
 * - Author attribution
 *
 * Perfect for: Motivational quotes, Daily affirmations, Inspirational content
 */
function createMotivationalTemplate() {
    const layers = [
        // Layer 1: Background image (inspirational)
        {
            id: 'bg_image',
            type: 'image',
            name: 'Background Image',
            start_time: 0,
            duration: 15,
            z_index: 0,
            properties: {
                source: '${BACKGROUND_IMAGE}',
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
                fit: 'cover',
                effects: [
                    {
                        type: 'ken_burns',
                        zoom: 1.2,
                        duration: 15,
                    },
                ],
            },
        },
        // Layer 2: Dark overlay for text readability
        {
            id: 'overlay',
            type: 'shape',
            name: 'Dark Overlay',
            start_time: 0,
            duration: 15,
            z_index: 1,
            properties: {
                shape: 'rectangle',
                width: 1920,
                height: 1080,
                x: 0,
                y: 0,
                fill: 'rgba(0, 0, 0, 0.5)',
            },
        },
        // Layer 3: Decorative top border
        {
            id: 'top_border',
            type: 'shape',
            name: 'Top Border',
            start_time: 0,
            duration: 15,
            z_index: 2,
            properties: {
                shape: 'rectangle',
                width: 1920,
                height: 8,
                x: 0,
                y: 0,
                fill: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
            },
        },
        // Layer 4: Main quote text
        {
            id: 'quote',
            type: 'text',
            name: 'Quote Text',
            start_time: 0.5,
            duration: 14,
            z_index: 3,
            properties: {
                text: '"${QUOTE_TEXT}"',
                x: 960,
                y: 440,
                fontSize: 72,
                fontWeight: 'bold',
                color: '#ffffff',
                align: 'center',
                maxWidth: 1600,
                lineHeight: 1.4,
                fontFamily: 'Playfair Display, serif',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                effects: [
                    {
                        type: 'fade_in',
                        duration: 1,
                    },
                    {
                        type: 'scale_in',
                        fromScale: 0.8,
                        toScale: 1.0,
                        duration: 1,
                    },
                ],
            },
        },
        // Layer 5: Quote marks decoration (left)
        {
            id: 'quote_mark_left',
            type: 'text',
            name: 'Quote Mark Left',
            start_time: 0,
            duration: 15,
            z_index: 2,
            properties: {
                text: '"',
                x: 200,
                y: 300,
                fontSize: 200,
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.1)',
                align: 'left',
                fontFamily: 'Georgia, serif',
            },
        },
        // Layer 6: Quote marks decoration (right)
        {
            id: 'quote_mark_right',
            type: 'text',
            name: 'Quote Mark Right',
            start_time: 0,
            duration: 15,
            z_index: 2,
            properties: {
                text: '"',
                x: 1720,
                y: 600,
                fontSize: 200,
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.1)',
                align: 'right',
                fontFamily: 'Georgia, serif',
            },
        },
        // Layer 7: Author/attribution
        {
            id: 'author',
            type: 'text',
            name: 'Author',
            start_time: 1.5,
            duration: 13,
            z_index: 3,
            properties: {
                text: '— ${AUTHOR}',
                x: 960,
                y: 750,
                fontSize: 36,
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                align: 'center',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                effects: [
                    {
                        type: 'fade_in',
                        duration: 0.8,
                    },
                ],
                conditions: [
                    {
                        variable: 'AUTHOR',
                        notEquals: '',
                    },
                ],
            },
        },
        // Layer 8: Category tag (optional)
        {
            id: 'category',
            type: 'text',
            name: 'Category Tag',
            start_time: 0.3,
            duration: 14.5,
            z_index: 4,
            properties: {
                text: '${CATEGORY}',
                x: 960,
                y: 150,
                fontSize: 24,
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: 'rgba(240, 147, 251, 0.8)',
                padding: 12,
                paddingHorizontal: 24,
                borderRadius: 20,
                align: 'center',
                fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: 2,
                effects: [
                    {
                        type: 'fade_in',
                        duration: 0.5,
                    },
                    {
                        type: 'slide_down',
                        distance: 30,
                        duration: 0.5,
                    },
                ],
                conditions: [
                    {
                        variable: 'CATEGORY',
                        notEquals: '',
                    },
                ],
            },
        },
        // Layer 9: Decorative particles/sparkles
        {
            id: 'particles',
            type: 'effect',
            name: 'Sparkle Particles',
            start_time: 0,
            duration: 15,
            z_index: 2,
            properties: {
                effect: 'particles',
                particleCount: 50,
                particleColor: 'rgba(255, 255, 255, 0.3)',
                particleSize: 3,
                velocity: 0.5,
                direction: 'up',
            },
        },
        // Layer 10: Background music
        {
            id: 'bg_music',
            type: 'audio',
            name: 'Background Music',
            start_time: 0,
            duration: 15,
            z_index: 10,
            properties: {
                source: '${BACKGROUND_MUSIC}',
                volume: 0.4,
                loop: true,
                effects: [
                    {
                        type: 'fade_in',
                        duration: 2,
                    },
                    {
                        type: 'fade_out',
                        duration: 2,
                    },
                ],
            },
        },
        // Layer 11: Voice narration (optional)
        {
            id: 'narration',
            type: 'audio',
            name: 'Voice Narration',
            start_time: 1,
            duration: 14,
            z_index: 11,
            properties: {
                source: '${NARRATION_AUDIO}',
                volume: 1.0,
                effects: [
                    {
                        type: 'equalize',
                        preset: 'voice_enhance',
                    },
                ],
                conditions: [
                    {
                        variable: 'NARRATION_AUDIO',
                        notEquals: '',
                    },
                ],
            },
        },
        // Layer 12: Animated underline
        {
            id: 'underline',
            type: 'shape',
            name: 'Decorative Underline',
            start_time: 1,
            duration: 13.5,
            z_index: 3,
            properties: {
                shape: 'rectangle',
                width: 400,
                height: 6,
                x: 760,
                y: 680,
                fill: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 3,
                effects: [
                    {
                        type: 'wipe_right',
                        duration: 0.8,
                    },
                ],
            },
        },
        // Layer 13: Bottom branding/watermark
        {
            id: 'branding',
            type: 'text',
            name: 'Branding',
            start_time: 0,
            duration: 15,
            z_index: 4,
            properties: {
                text: '${BRANDING_TEXT}',
                x: 960,
                y: 1020,
                fontSize: 20,
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.6)',
                align: 'center',
                fontFamily: 'Inter, sans-serif',
                conditions: [
                    {
                        variable: 'BRANDING_TEXT',
                        notEquals: '',
                    },
                ],
            },
        },
    ];
    const template = {
        id: 'motivational_quotes_v1',
        name: 'Motivational Quotes',
        description: 'Inspiring quote videos with elegant typography and powerful visuals',
        niche: 'motivational',
        duration: 15, // 15 seconds default (perfect for short-form)
        resolution: [1920, 1080],
        framerate: 30,
        layers,
        variables: {
            QUOTE_TEXT: {
                name: 'QUOTE_TEXT',
                type: 'string',
                required: true,
                description: 'The motivational quote text',
            },
            BACKGROUND_IMAGE: {
                name: 'BACKGROUND_IMAGE',
                type: 'image',
                required: true,
                description: 'Inspirational background image path',
            },
            AUTHOR: {
                name: 'AUTHOR',
                type: 'string',
                required: false,
                description: 'Quote author/attribution',
                default: '',
            },
            CATEGORY: {
                name: 'CATEGORY',
                type: 'string',
                required: false,
                description: 'Category tag (e.g., SUCCESS, PERSEVERANCE, WISDOM)',
                default: '',
            },
            BACKGROUND_MUSIC: {
                name: 'BACKGROUND_MUSIC',
                type: 'audio',
                required: false,
                description: 'Uplifting background music audio file path',
            },
            NARRATION_AUDIO: {
                name: 'NARRATION_AUDIO',
                type: 'audio',
                required: false,
                description: 'Optional voice narration of the quote',
            },
            BRANDING_TEXT: {
                name: 'BRANDING_TEXT',
                type: 'string',
                required: false,
                description: 'Channel name or watermark text',
                default: '',
            },
            DURATION: {
                name: 'DURATION',
                type: 'number',
                required: false,
                description: 'Video duration in seconds',
                default: 15,
            },
        },
        metadata: {
            created_at: Date.now(),
            modified_at: Date.now(),
            author: 'ContentForge',
            tags: ['motivation', 'quotes', 'inspiration', 'short-form', 'vertical', 'daily-quotes'],
        },
    };
    return template;
}
//# sourceMappingURL=motivational-template.js.map
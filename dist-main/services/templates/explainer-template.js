"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExplainerTemplate = createExplainerTemplate;
/**
 * Explainer Video Template
 * Professional educational and "Top 10" style videos
 *
 * Features:
 * - Clean, modern design
 * - Animated bullet points
 * - AI-generated narration
 * - Key point highlights
 * - Visual examples/diagrams
 * - Smooth transitions
 *
 * Perfect for: Educational content, How-to videos, Top 10 lists, Tutorials
 */
function createExplainerTemplate() {
    const layers = [
        // Layer 1: Clean background (gradient)
        {
            id: 'bg_gradient',
            type: 'shape',
            name: 'Background Gradient',
            start_time: 0,
            duration: 300,
            z_index: 0,
            properties: {
                shape: 'rectangle',
                width: 1920,
                height: 1080,
                x: 0,
                y: 0,
                fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
        },
        // Layer 2: Content background (white card)
        {
            id: 'content_bg',
            type: 'shape',
            name: 'Content Background',
            start_time: 0,
            duration: 300,
            z_index: 1,
            properties: {
                shape: 'rectangle',
                width: 1600,
                height: 800,
                x: 160,
                y: 140,
                fill: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 24,
                shadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            },
        },
        // Layer 3: Visual examples/images
        {
            id: 'visual_examples',
            type: 'image',
            name: 'Visual Examples',
            start_time: 0,
            duration: 300,
            z_index: 2,
            properties: {
                source: '${VISUAL_EXAMPLES}',
                x: 200,
                y: 200,
                width: 700,
                height: 700,
                fit: 'contain',
                transition: 'fade',
                transitionDuration: 0.5,
            },
        },
        // Layer 4: Title section
        {
            id: 'title',
            type: 'text',
            name: 'Title',
            start_time: 0,
            duration: 3,
            z_index: 3,
            properties: {
                text: '${TITLE}',
                x: 960,
                y: 100,
                fontSize: 64,
                fontWeight: 'bold',
                color: '#667eea',
                align: 'center',
                maxWidth: 1600,
                fontFamily: 'Inter, sans-serif',
                effects: [
                    {
                        type: 'fade_in',
                        duration: 0.5,
                    },
                    {
                        type: 'slide_up',
                        distance: 50,
                        duration: 0.5,
                    },
                ],
            },
        },
        // Layer 5: Key points/bullet points
        {
            id: 'key_points',
            type: 'text',
            name: 'Key Points',
            start_time: 3,
            duration: 297,
            z_index: 3,
            properties: {
                text: '${KEY_POINTS}',
                x: 950,
                y: 300,
                fontSize: 36,
                lineHeight: 1.6,
                color: '#2d3748',
                align: 'left',
                maxWidth: 800,
                fontFamily: 'Inter, sans-serif',
                effects: [
                    {
                        type: 'typewriter',
                        speed: 0.05,
                    },
                ],
            },
        },
        // Layer 6: Number indicators (for Top 10 style)
        {
            id: 'number_indicator',
            type: 'text',
            name: 'Number Indicator',
            start_time: 0,
            duration: 300,
            z_index: 4,
            properties: {
                text: '${CURRENT_NUMBER}',
                x: 100,
                y: 100,
                fontSize: 120,
                fontWeight: 'bold',
                color: 'rgba(102, 126, 234, 0.2)',
                align: 'left',
                fontFamily: 'Inter, sans-serif',
            },
        },
        // Layer 7: AI narration audio
        {
            id: 'narration',
            type: 'audio',
            name: 'Narration Audio',
            start_time: 0,
            duration: 300,
            z_index: 10,
            properties: {
                source: '${NARRATION_AUDIO}',
                volume: 1.0,
                effects: [
                    {
                        type: 'equalize',
                        preset: 'voice_enhance',
                    },
                    {
                        type: 'normalize',
                        target: -16,
                    },
                ],
            },
        },
        // Layer 8: Background music (subtle)
        {
            id: 'bg_music',
            type: 'audio',
            name: 'Background Music',
            start_time: 0,
            duration: 300,
            z_index: 9,
            properties: {
                source: '${BACKGROUND_MUSIC}',
                volume: 0.2,
                loop: true,
                effects: [
                    {
                        type: 'fade_in',
                        duration: 2,
                    },
                    {
                        type: 'fade_out',
                        duration: 3,
                    },
                ],
            },
        },
        // Layer 9: Animated icons/diagrams
        {
            id: 'animated_icons',
            type: 'image',
            name: 'Animated Icons',
            start_time: 5,
            duration: 295,
            z_index: 3,
            properties: {
                source: '${ICON_ANIMATIONS}',
                x: 1200,
                y: 600,
                width: 400,
                height: 400,
                fit: 'contain',
                effects: [
                    {
                        type: 'scale_pulse',
                        scale: 1.1,
                        duration: 2,
                        loop: true,
                    },
                ],
            },
        },
        // Layer 10: Progress bar (for multi-part explainers)
        {
            id: 'progress_bar',
            type: 'shape',
            name: 'Progress Bar',
            start_time: 0,
            duration: 300,
            z_index: 5,
            properties: {
                shape: 'rectangle',
                width: 1600,
                height: 8,
                x: 160,
                y: 1020,
                fill: '#667eea',
                effects: [
                    {
                        type: 'wipe_right',
                        duration: 300,
                    },
                ],
            },
        },
        // Layer 11: Subtitles/captions (optional)
        {
            id: 'subtitles',
            type: 'text',
            name: 'Subtitles',
            start_time: 0,
            duration: 300,
            z_index: 6,
            properties: {
                text: '${SUBTITLE_TEXT}',
                x: 960,
                y: 950,
                fontSize: 32,
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 16,
                borderRadius: 8,
                align: 'center',
                maxWidth: 1400,
                fontFamily: 'Inter, sans-serif',
                conditions: [
                    {
                        variable: 'ENABLE_SUBTITLES',
                        equals: true,
                    },
                ],
            },
        },
        // Layer 12: Call to action (end screen)
        {
            id: 'cta',
            type: 'text',
            name: 'Call to Action',
            start_time: 295,
            duration: 5,
            z_index: 7,
            properties: {
                text: '${CTA_TEXT}',
                x: 960,
                y: 540,
                fontSize: 48,
                fontWeight: 'bold',
                color: '#ffffff',
                align: 'center',
                maxWidth: 1200,
                fontFamily: 'Inter, sans-serif',
                effects: [
                    {
                        type: 'fade_in',
                        duration: 0.5,
                    },
                    {
                        type: 'zoom_in',
                        scale: 1.2,
                        duration: 0.5,
                    },
                ],
            },
        },
    ];
    const template = {
        id: 'explainer_video_v1',
        name: 'Explainer Video (Educational)',
        description: 'Professional template for educational content, tutorials, and Top 10 videos with clean design and animated elements',
        niche: 'explainer',
        duration: 300, // 5 minutes default
        resolution: [1920, 1080],
        framerate: 30,
        layers,
        variables: {
            TITLE: {
                name: 'TITLE',
                type: 'string',
                required: true,
                description: 'Video title',
            },
            NARRATION_AUDIO: {
                name: 'NARRATION_AUDIO',
                type: 'audio',
                required: true,
                description: 'AI-generated narration audio file path',
            },
            KEY_POINTS: {
                name: 'KEY_POINTS',
                type: 'string',
                required: true,
                description: 'Main points/bullet points (newline-separated)',
            },
            VISUAL_EXAMPLES: {
                name: 'VISUAL_EXAMPLES',
                type: 'string',
                required: false,
                description: 'JSON array of image paths for visual examples',
                default: '[]',
            },
            ICON_ANIMATIONS: {
                name: 'ICON_ANIMATIONS',
                type: 'string',
                required: false,
                description: 'JSON array of animated icon/diagram paths',
                default: '[]',
            },
            CURRENT_NUMBER: {
                name: 'CURRENT_NUMBER',
                type: 'string',
                required: false,
                description: 'Number indicator (e.g., "#1", "#2" for Top 10 style)',
                default: '',
            },
            BACKGROUND_MUSIC: {
                name: 'BACKGROUND_MUSIC',
                type: 'audio',
                required: false,
                description: 'Background music audio file path',
            },
            SUBTITLE_TEXT: {
                name: 'SUBTITLE_TEXT',
                type: 'string',
                required: false,
                description: 'Subtitle/caption text',
            },
            ENABLE_SUBTITLES: {
                name: 'ENABLE_SUBTITLES',
                type: 'boolean',
                required: false,
                description: 'Enable subtitles',
                default: false,
            },
            CTA_TEXT: {
                name: 'CTA_TEXT',
                type: 'string',
                required: false,
                description: 'Call to action text for end screen',
                default: 'Subscribe for more!',
            },
            DURATION: {
                name: 'DURATION',
                type: 'number',
                required: false,
                description: 'Video duration in seconds',
                default: 300,
            },
        },
        metadata: {
            created_at: Date.now(),
            modified_at: Date.now(),
            author: 'ContentForge',
            tags: ['education', 'tutorial', 'explainer', 'top10', 'how-to', 'professional'],
        },
    };
    return template;
}
//# sourceMappingURL=explainer-template.js.map
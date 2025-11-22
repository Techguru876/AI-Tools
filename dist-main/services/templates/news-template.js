"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewsTemplate = createNewsTemplate;
/**
 * News Compilation Template
 * Professional news aggregation and trending topic videos
 *
 * Features:
 * - Breaking news style graphics
 * - Multiple news segments
 * - Ticker/crawl text
 * - News anchor-style narration
 * - Transition effects between stories
 * - Date/time stamps
 *
 * Perfect for: News compilations, Trending topics, Daily news roundup
 */
function createNewsTemplate() {
    const layers = [
        // Layer 1: Red accent background (news style)
        {
            id: 'bg_gradient',
            type: 'shape',
            name: 'Background Gradient',
            start_time: 0,
            duration: 180,
            z_index: 0,
            properties: {
                shape: 'rectangle',
                width: 1920,
                height: 1080,
                x: 0,
                y: 0,
                fill: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            },
        },
        // Layer 2: Breaking news banner
        {
            id: 'breaking_banner',
            type: 'shape',
            name: 'Breaking News Banner',
            start_time: 0,
            duration: 180,
            z_index: 1,
            properties: {
                shape: 'rectangle',
                width: 1920,
                height: 100,
                x: 0,
                y: 0,
                fill: '#e63946',
            },
        },
        // Layer 3: Breaking news text
        {
            id: 'breaking_text',
            type: 'text',
            name: 'Breaking News Text',
            start_time: 0,
            duration: 5,
            z_index: 2,
            properties: {
                text: 'BREAKING NEWS',
                x: 100,
                y: 50,
                fontSize: 42,
                fontWeight: 'bold',
                color: '#ffffff',
                align: 'left',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: 3,
                effects: [
                    {
                        type: 'blink',
                        interval: 0.5,
                    },
                ],
                conditions: [
                    {
                        variable: 'SHOW_BREAKING',
                        equals: true,
                    },
                ],
            },
        },
        // Layer 4: Main headline
        {
            id: 'headline',
            type: 'text',
            name: 'Headline',
            start_time: 0.5,
            duration: 8,
            z_index: 3,
            properties: {
                text: '${HEADLINE}',
                x: 960,
                y: 200,
                fontSize: 56,
                fontWeight: 'bold',
                color: '#ffffff',
                align: 'center',
                maxWidth: 1700,
                lineHeight: 1.3,
                fontFamily: 'Arial, sans-serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                effects: [
                    {
                        type: 'slide_in_left',
                        duration: 0.5,
                    },
                ],
            },
        },
        // Layer 5: News story images/video clips
        {
            id: 'story_media',
            type: 'image',
            name: 'Story Media',
            start_time: 1,
            duration: 178,
            z_index: 2,
            properties: {
                source: '${STORY_IMAGES}',
                x: 160,
                y: 350,
                width: 1200,
                height: 600,
                fit: 'cover',
                transition: 'wipe',
                transitionDuration: 0.3,
            },
        },
        // Layer 6: Story details panel
        {
            id: 'details_panel',
            type: 'shape',
            name: 'Details Panel',
            start_time: 1,
            duration: 178,
            z_index: 3,
            properties: {
                shape: 'rectangle',
                width: 480,
                height: 600,
                x: 1400,
                y: 350,
                fill: 'rgba(30, 30, 46, 0.95)',
                borderRadius: 8,
            },
        },
        // Layer 7: Story text/details
        {
            id: 'story_details',
            type: 'text',
            name: 'Story Details',
            start_time: 1.5,
            duration: 177,
            z_index: 4,
            properties: {
                text: '${STORY_TEXT}',
                x: 1640,
                y: 400,
                fontSize: 24,
                lineHeight: 1.5,
                color: '#ffffff',
                align: 'left',
                maxWidth: 420,
                fontFamily: 'Arial, sans-serif',
            },
        },
        // Layer 8: Bottom ticker background
        {
            id: 'ticker_bg',
            type: 'shape',
            name: 'Ticker Background',
            start_time: 0,
            duration: 180,
            z_index: 5,
            properties: {
                shape: 'rectangle',
                width: 1920,
                height: 60,
                x: 0,
                y: 1020,
                fill: '#0f3460',
            },
        },
        // Layer 9: Ticker text
        {
            id: 'ticker_text',
            type: 'text',
            name: 'Ticker Text',
            start_time: 0,
            duration: 180,
            z_index: 6,
            properties: {
                text: '${TICKER_TEXT}',
                x: 1920,
                y: 1050,
                fontSize: 28,
                fontWeight: '600',
                color: '#ffffff',
                align: 'left',
                fontFamily: 'Arial, sans-serif',
                effects: [
                    {
                        type: 'scroll_left',
                        speed: 150, // pixels per second
                    },
                ],
            },
        },
        // Layer 10: Date/Time stamp
        {
            id: 'timestamp',
            type: 'text',
            name: 'Timestamp',
            start_time: 0,
            duration: 180,
            z_index: 7,
            properties: {
                text: '${DATE_TIME}',
                x: 1820,
                y: 50,
                fontSize: 24,
                fontWeight: '500',
                color: '#ffffff',
                align: 'right',
                fontFamily: 'Arial, sans-serif',
            },
        },
        // Layer 11: Category badge
        {
            id: 'category_badge',
            type: 'text',
            name: 'Category Badge',
            start_time: 1,
            duration: 178,
            z_index: 4,
            properties: {
                text: '${CATEGORY}',
                x: 180,
                y: 320,
                fontSize: 20,
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: '#e63946',
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 4,
                align: 'left',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: 1,
                effects: [
                    {
                        type: 'fade_in',
                        duration: 0.3,
                    },
                ],
            },
        },
        // Layer 12: AI narration
        {
            id: 'narration',
            type: 'audio',
            name: 'Narration Audio',
            start_time: 0,
            duration: 180,
            z_index: 10,
            properties: {
                source: '${NARRATION_AUDIO}',
                volume: 1.0,
                effects: [
                    {
                        type: 'equalize',
                        preset: 'news_voice',
                    },
                    {
                        type: 'normalize',
                        target: -14,
                    },
                ],
            },
        },
        // Layer 13: Background news music (subtle)
        {
            id: 'bg_music',
            type: 'audio',
            name: 'Background Music',
            start_time: 0,
            duration: 180,
            z_index: 9,
            properties: {
                source: '${BACKGROUND_MUSIC}',
                volume: 0.15,
                loop: true,
                effects: [
                    {
                        type: 'fade_in',
                        duration: 1,
                    },
                    {
                        type: 'fade_out',
                        duration: 2,
                    },
                ],
            },
        },
        // Layer 14: Source attribution
        {
            id: 'source',
            type: 'text',
            name: 'Source Attribution',
            start_time: 2,
            duration: 176,
            z_index: 4,
            properties: {
                text: 'Source: ${SOURCE}',
                x: 1640,
                y: 900,
                fontSize: 18,
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.7)',
                align: 'left',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic',
                conditions: [
                    {
                        variable: 'SOURCE',
                        notEquals: '',
                    },
                ],
            },
        },
        // Layer 15: Transition wipe effect between stories
        {
            id: 'transition_wipe',
            type: 'effect',
            name: 'Transition Effect',
            start_time: 60,
            duration: 0.3,
            z_index: 8,
            properties: {
                effect: 'digital_glitch',
                intensity: 0.5,
                duration: 0.3,
                conditions: [
                    {
                        variable: 'ENABLE_TRANSITIONS',
                        equals: true,
                    },
                ],
            },
        },
    ];
    const template = {
        id: 'news_compilation_v1',
        name: 'News Compilation',
        description: 'Professional news aggregation template with breaking news graphics, ticker, and multiple story segments',
        niche: 'news',
        duration: 180, // 3 minutes default
        resolution: [1920, 1080],
        framerate: 30,
        layers,
        variables: {
            HEADLINE: {
                name: 'HEADLINE',
                type: 'string',
                required: true,
                description: 'Main news headline',
            },
            NARRATION_AUDIO: {
                name: 'NARRATION_AUDIO',
                type: 'audio',
                required: true,
                description: 'News anchor-style narration audio file path',
            },
            STORY_IMAGES: {
                name: 'STORY_IMAGES',
                type: 'string',
                required: true,
                description: 'JSON array of news story image/video paths',
            },
            STORY_TEXT: {
                name: 'STORY_TEXT',
                type: 'string',
                required: true,
                description: 'Story details and key points',
            },
            TICKER_TEXT: {
                name: 'TICKER_TEXT',
                type: 'string',
                required: true,
                description: 'Bottom ticker text (multiple stories separated by •)',
            },
            CATEGORY: {
                name: 'CATEGORY',
                type: 'string',
                required: false,
                description: 'News category (POLITICS, TECH, WORLD, SPORTS, etc.)',
                default: 'BREAKING',
            },
            DATE_TIME: {
                name: 'DATE_TIME',
                type: 'string',
                required: false,
                description: 'Date and time stamp',
                default: new Date().toLocaleString(),
            },
            SOURCE: {
                name: 'SOURCE',
                type: 'string',
                required: false,
                description: 'News source attribution',
                default: '',
            },
            SHOW_BREAKING: {
                name: 'SHOW_BREAKING',
                type: 'boolean',
                required: false,
                description: 'Show "BREAKING NEWS" banner',
                default: false,
            },
            BACKGROUND_MUSIC: {
                name: 'BACKGROUND_MUSIC',
                type: 'audio',
                required: false,
                description: 'Background news theme music',
            },
            ENABLE_TRANSITIONS: {
                name: 'ENABLE_TRANSITIONS',
                type: 'boolean',
                required: false,
                description: 'Enable transition effects between segments',
                default: true,
            },
            SEGMENT_BREAK_TIME: {
                name: 'SEGMENT_BREAK_TIME',
                type: 'number',
                required: false,
                description: 'When to show transition (seconds)',
                default: 60,
            },
            DURATION: {
                name: 'DURATION',
                type: 'number',
                required: false,
                description: 'Video duration in seconds',
                default: 180,
            },
        },
        metadata: {
            created_at: Date.now(),
            modified_at: Date.now(),
            author: 'ContentForge',
            tags: ['news', 'breaking', 'trending', 'current-events', 'compilation', 'daily-news'],
        },
    };
    return template;
}
//# sourceMappingURL=news-template.js.map
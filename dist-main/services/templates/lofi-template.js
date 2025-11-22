"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLofiTemplate = createLofiTemplate;
/**
 * Lofi Music Stream Template
 *
 * Perfect for 24/7 lofi hip hop streams
 * Features:
 * - Looping background video/image
 * - Audio visualizer overlay
 * - Custom text overlays (channel name, song info)
 * - Ambient effects (rain, snow, particles)
 *
 * Variables:
 * - BACKGROUND_IMAGE: Main background image path
 * - AUDIO_FILE: Lofi music track path
 * - CHANNEL_NAME: Channel branding text
 * - TITLE_TEXT: Video title (e.g., "lofi hip hop radio 📚 beats to relax/study to")
 * - VISUALIZER_COLOR: Color for audio visualizer
 * - OVERLAY_EFFECT: rain | snow | none
 */
function createLofiTemplate() {
    const layers = [
        // Layer 1: Background Image (with Ken Burns effect for subtle movement)
        {
            id: 'bg_layer',
            type: 'image',
            name: 'Background Image',
            start_time: 0,
            duration: 3600, // 1 hour (loop for longer videos)
            z_index: 0,
            properties: {
                source: '${BACKGROUND_IMAGE}',
                scale: 1.1,
                position: { x: 0, y: 0 },
                opacity: 1.0,
                filters: [
                    {
                        type: 'scale',
                        params: {
                            width: 1920,
                            height: 1080,
                            mode: 'cover',
                        },
                    },
                    {
                        type: 'zoompan',
                        params: {
                            zoom: 'min(zoom+0.0015,1.5)', // Slow zoom
                            duration: '${DURATION}',
                            x: 'iw/2-(iw/zoom/2)',
                            y: 'ih/2-(ih/zoom/2)',
                            s: '1920x1080',
                            fps: 30,
                        },
                    },
                    {
                        type: 'gblur',
                        params: { sigma: 2 }, // Subtle blur for dreamy effect
                    },
                ],
            },
        },
        // Layer 2: Ambient Overlay (rain/snow effect)
        {
            id: 'overlay_effect',
            type: 'effect',
            name: 'Ambient Effect',
            start_time: 0,
            duration: 3600,
            z_index: 1,
            properties: {
                effect_type: '${OVERLAY_EFFECT}',
                intensity: 0.3,
                blend_mode: 'screen',
                // Rain effect parameters
                rain: {
                    particles: 100,
                    speed: 15,
                    length: 20,
                    opacity: 0.6,
                },
                // Snow effect parameters
                snow: {
                    particles: 50,
                    speed: 5,
                    size: 3,
                    opacity: 0.8,
                },
            },
        },
        // Layer 3: Audio Visualizer (circular waveform)
        {
            id: 'visualizer',
            type: 'effect',
            name: 'Audio Visualizer',
            start_time: 0,
            duration: 3600,
            z_index: 2,
            properties: {
                visualizer_type: 'circular_bars',
                position: { x: 1600, y: 850 }, // Bottom right
                size: { width: 250, height: 250 },
                color: '${VISUALIZER_COLOR}',
                opacity: 0.7,
                blend_mode: 'add',
                audio_source: '${AUDIO_FILE}',
                bars: 60,
                bar_width: 3,
                gap: 2,
                smoothing: 0.8,
                // FFmpeg showwaves/showcqt parameters
                ffmpeg_filter: 'showcqt',
                ffmpeg_params: {
                    size: '250x250',
                    fps: 30,
                    sono_h: 0,
                    bar_h: 12,
                    axis_h: 0,
                    volume: 16,
                    sono_v: 'cbrt',
                    bar_v: 'sono',
                    sono_g: 4,
                    bar_g: 2,
                    bar_t: 1,
                    timeclamp: 0.17,
                    attack: 0.1,
                    basefreq: 20,
                    endfreq: 20000,
                    coeffclamp: 1,
                    tlength: '384/30',
                    count: 60,
                },
            },
        },
        // Layer 4: Vignette Effect
        {
            id: 'vignette',
            type: 'effect',
            name: 'Vignette',
            start_time: 0,
            duration: 3600,
            z_index: 3,
            properties: {
                type: 'vignette',
                angle: 'PI/4',
                x0: 'w/2',
                y0: 'h/2',
                mode: 'forward',
                eval: 'init',
                dither: true,
                aspect: '16/9',
            },
        },
        // Layer 5: Title Text (top center)
        {
            id: 'title_text',
            type: 'text',
            name: 'Title',
            start_time: 0,
            duration: 3600,
            z_index: 4,
            properties: {
                text: '${TITLE_TEXT}',
                font: 'Arial',
                font_size: 42,
                font_weight: 'bold',
                color: '#FFFFFF',
                stroke_color: '#000000',
                stroke_width: 2,
                position: { x: 'center', y: 80 },
                alignment: 'center',
                opacity: 0.9,
                shadow: {
                    offset_x: 2,
                    offset_y: 2,
                    blur: 5,
                    color: '#00000080',
                },
            },
        },
        // Layer 6: Channel Branding (bottom left)
        {
            id: 'channel_name',
            type: 'text',
            name: 'Channel Name',
            start_time: 0,
            duration: 3600,
            z_index: 4,
            properties: {
                text: '${CHANNEL_NAME}',
                font: 'Arial',
                font_size: 28,
                font_weight: 'normal',
                color: '#FFFFFF',
                stroke_color: '#000000',
                stroke_width: 1,
                position: { x: 50, y: 980 },
                alignment: 'left',
                opacity: 0.8,
            },
        },
        // Layer 7: Current Track Info (fades in/out)
        {
            id: 'track_info',
            type: 'text',
            name: 'Track Info',
            start_time: 0,
            duration: 3600,
            z_index: 4,
            properties: {
                text: '${TRACK_NAME}',
                font: 'Arial',
                font_size: 24,
                font_weight: 'normal',
                color: '#FFFFFF',
                stroke_color: '#000000',
                stroke_width: 1,
                position: { x: 50, y: 940 },
                alignment: 'left',
                opacity: 0.7,
                // Fade animation (optional, can be added in compositor)
                animation: {
                    type: 'fade',
                    fade_in: 1.0,
                    fade_out: 1.0,
                    duration: 10.0,
                },
            },
        },
        // Layer 8: Audio Track
        {
            id: 'audio',
            type: 'audio',
            name: 'Lofi Music',
            start_time: 0,
            duration: 3600,
            z_index: 0,
            properties: {
                source: '${AUDIO_FILE}',
                volume: 1.0,
                loop: true,
                fade_in: 2.0,
                fade_out: 2.0,
            },
        },
    ];
    const template = {
        id: 'lofi_stream_v1',
        name: 'Lofi Hip Hop Stream',
        niche: 'lofi',
        description: 'Perfect template for 24/7 lofi hip hop radio streams with visualizer and ambient effects',
        duration: 3600, // 1 hour base (can be extended)
        resolution: [1920, 1080],
        framerate: 30,
        layers,
        variables: {
            BACKGROUND_IMAGE: {
                name: 'BACKGROUND_IMAGE',
                type: 'image',
                required: true,
                description: 'Main background image (anime/aesthetic scene)',
            },
            AUDIO_FILE: {
                name: 'AUDIO_FILE',
                type: 'audio',
                required: true,
                description: 'Lofi music track (MP3/WAV)',
            },
            CHANNEL_NAME: {
                name: 'CHANNEL_NAME',
                type: 'string',
                required: true,
                default: 'Lofi Radio',
                description: 'Your channel name for branding',
            },
            TITLE_TEXT: {
                name: 'TITLE_TEXT',
                type: 'string',
                required: true,
                default: 'lofi hip hop radio 📚 beats to relax/study to',
                description: 'Video title text',
            },
            TRACK_NAME: {
                name: 'TRACK_NAME',
                type: 'string',
                required: false,
                default: 'Now Playing...',
                description: 'Current track name',
            },
            VISUALIZER_COLOR: {
                name: 'VISUALIZER_COLOR',
                type: 'color',
                required: false,
                default: '#FF6B9D',
                description: 'Audio visualizer color (hex)',
                validation: {
                    pattern: '^#[0-9A-Fa-f]{6}$',
                },
            },
            OVERLAY_EFFECT: {
                name: 'OVERLAY_EFFECT',
                type: 'string',
                required: false,
                default: 'rain',
                description: 'Ambient overlay effect',
                validation: {
                    enum: ['rain', 'snow', 'none'],
                },
            },
            DURATION: {
                name: 'DURATION',
                type: 'number',
                required: false,
                default: 3600,
                description: 'Video duration in seconds',
                validation: {
                    min: 60,
                    max: 86400, // 24 hours
                },
            },
        },
        metadata: {
            created_at: Date.now(),
            modified_at: Date.now(),
            author: 'ContentForge',
            tags: ['lofi', 'music', 'stream', 'study', 'relax', '24/7'],
            preview_url: undefined,
        },
    };
    return template;
}
/**
 * Example usage:
 *
 * const engine = new TemplateEngine();
 * const lofiTemplate = createLofiTemplate();
 *
 * // Save template
 * engine.saveTemplate(lofiTemplate);
 *
 * // Use template with variables
 * const resolved = engine.resolveVariables(lofiTemplate, {
 *   BACKGROUND_IMAGE: '/path/to/anime-scene.jpg',
 *   AUDIO_FILE: '/path/to/lofi-track.mp3',
 *   CHANNEL_NAME: 'My Lofi Channel',
 *   TITLE_TEXT: 'chill lofi beats 🎵',
 *   VISUALIZER_COLOR: '#4A90E2',
 *   OVERLAY_EFFECT: 'rain'
 * });
 *
 * // Now pass resolved template to video compositor
 */
//# sourceMappingURL=lofi-template.js.map
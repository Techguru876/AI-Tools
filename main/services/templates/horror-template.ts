import { Template, TemplateLayer } from './TemplateEngine';

/**
 * Horror Story Template
 *
 * AI-powered horror narration template
 * Perfect for generating scary story videos with AI narration and visuals
 *
 * Features:
 * - AI-generated script (GPT-4)
 * - AI-generated narration (ElevenLabs or OpenAI TTS)
 * - AI-generated scene images (DALL-E)
 * - Background music and sound effects
 * - Text overlays for key moments
 *
 * Variables:
 * - NARRATION_AUDIO: Path to AI-generated narration
 * - SCENE_IMAGES: Array of AI-generated scene images
 * - TITLE: Video title
 * - BACKGROUND_MUSIC: Optional background music
 * - ENABLE_SUBTITLES: Show subtitles (boolean)
 */
export function createHorrorTemplate(): Template {
  const layers: TemplateLayer[] = [
    // Layer 1: Background (black base)
    {
      id: 'bg_base',
      type: 'shape',
      name: 'Black Background',
      start_time: 0,
      duration: 600, // 10 minutes default
      z_index: 0,
      properties: {
        shape: 'rectangle',
        width: 1920,
        height: 1080,
        color: '#000000',
      },
    },

    // Layer 2: Scene images (will be dynamically added based on SCENE_IMAGES array)
    {
      id: 'scene_container',
      type: 'image',
      name: 'Scene Images',
      start_time: 0,
      duration: 600,
      z_index: 1,
      properties: {
        // This will be replaced with actual scene images from SCENE_IMAGES variable
        source: '${SCENE_IMAGES}', // Array of image paths
        transition: 'crossfade',
        transitionDuration: 2.0,
        effect: 'ken_burns', // Slow zoom on static images
        filters: [
          {
            type: 'colorchannelmixer',
            params: {
              // Darken and add red tint for horror atmosphere
              rr: 1.1,
              gg: 0.9,
              bb: 0.8,
            },
          },
          {
            type: 'curves',
            params: {
              // Increase contrast
              preset: 'strong_contrast',
            },
          },
        ],
      },
    },

    // Layer 3: Vignette overlay (darken edges)
    {
      id: 'vignette',
      type: 'effect',
      name: 'Dark Vignette',
      start_time: 0,
      duration: 600,
      z_index: 2,
      properties: {
        type: 'vignette',
        intensity: 0.6, // Stronger vignette for horror
        angle: 'PI/4',
        x0: 'w/2',
        y0: 'h/2',
      },
    },

    // Layer 4: Film grain/noise (vintage horror feel)
    {
      id: 'film_grain',
      type: 'effect',
      name: 'Film Grain',
      start_time: 0,
      duration: 600,
      z_index: 3,
      properties: {
        type: 'noise',
        strength: 15,
        blend_mode: 'overlay',
        opacity: 0.3,
      },
    },

    // Layer 5: Title text (appears at start)
    {
      id: 'title_text',
      type: 'text',
      name: 'Title',
      start_time: 0,
      duration: 5,
      z_index: 4,
      properties: {
        text: '${TITLE}',
        font: 'Creepster',
        font_size: 72,
        color: '#FFFFFF',
        stroke_color: '#8B0000', // Dark red stroke
        stroke_width: 3,
        position: { x: 'center', y: 'center' },
        alignment: 'center',
        shadow: {
          offset_x: 4,
          offset_y: 4,
          blur: 10,
          color: '#00000099',
        },
        animation: {
          type: 'fade',
          fade_in: 1.5,
          fade_out: 1.5,
        },
      },
    },

    // Layer 6: Narration audio
    {
      id: 'narration',
      type: 'audio',
      name: 'AI Narration',
      start_time: 0,
      duration: 600,
      z_index: 0,
      properties: {
        source: '${NARRATION_AUDIO}',
        volume: 1.0,
        fade_in: 1.0,
        fade_out: 2.0,
        // Audio filters
        filters: [
          {
            type: 'equalizer',
            params: {
              // Enhance low frequencies for deeper voice
              f: '100',
              width_type: 'h',
              width: 200,
              g: 3,
            },
          },
        ],
      },
    },

    // Layer 7: Background music (subtle horror ambience)
    {
      id: 'bgm',
      type: 'audio',
      name: 'Background Music',
      start_time: 0,
      duration: 600,
      z_index: 0,
      properties: {
        source: '${BACKGROUND_MUSIC}',
        volume: 0.2, // Keep quiet under narration
        loop: true,
        fade_in: 3.0,
        fade_out: 5.0,
      },
    },

    // Layer 8: Optional subtitles (if ENABLE_SUBTITLES is true)
    {
      id: 'subtitles',
      type: 'text',
      name: 'Subtitles',
      start_time: 0,
      duration: 600,
      z_index: 5,
      properties: {
        // Subtitles will be generated from narration transcript
        text: '${SUBTITLES}',
        font: 'Arial',
        font_size: 36,
        color: '#FFFFFF',
        stroke_color: '#000000',
        stroke_width: 2,
        position: { x: 'center', y: 920 }, // Bottom center
        alignment: 'center',
        max_width: 1600,
        word_wrap: true,
      },
    },
  ];

  const template: Template = {
    id: 'horror_story_v1',
    name: 'Horror Story with AI',
    niche: 'horror',
    description: 'AI-powered horror story template with generated narration, visuals, and atmospheric effects',
    duration: 600, // 10 minutes default
    resolution: [1920, 1080],
    framerate: 30,
    layers,
    variables: {
      NARRATION_AUDIO: {
        name: 'NARRATION_AUDIO',
        type: 'audio',
        required: true,
        description: 'AI-generated narration audio file (from VoiceGenerator)',
      },
      SCENE_IMAGES: {
        name: 'SCENE_IMAGES',
        type: 'string', // Will be JSON array of image paths
        required: true,
        description: 'Array of AI-generated scene images (from ImageGenerator)',
      },
      TITLE: {
        name: 'TITLE',
        type: 'string',
        required: true,
        description: 'Video title (from ScriptGenerator)',
      },
      BACKGROUND_MUSIC: {
        name: 'BACKGROUND_MUSIC',
        type: 'audio',
        required: false,
        default: '',
        description: 'Optional background music/ambience',
      },
      ENABLE_SUBTITLES: {
        name: 'ENABLE_SUBTITLES',
        type: 'boolean',
        required: false,
        default: false,
        description: 'Enable subtitle overlays',
      },
      SUBTITLES: {
        name: 'SUBTITLES',
        type: 'string',
        required: false,
        default: '',
        description: 'Subtitle text (generated from narration)',
      },
      DURATION: {
        name: 'DURATION',
        type: 'number',
        required: false,
        default: 600,
        description: 'Video duration in seconds',
        validation: {
          min: 60,
          max: 1800, // Max 30 minutes
        },
      },
    },
    metadata: {
      created_at: Date.now(),
      modified_at: Date.now(),
      author: 'ContentForge',
      tags: ['horror', 'scary', 'ai-generated', 'narration', 'story'],
      preview_url: undefined,
    },
  };

  return template;
}

/**
 * Example usage with AI services:
 *
 * // 1. Generate script
 * const scriptGen = new ScriptGenerator(openAIKey);
 * const story = await scriptGen.generateHorrorStory({
 *   duration: 600,
 *   theme: 'urban legend',
 *   setting: 'abandoned hospital'
 * });
 *
 * // 2. Generate narration
 * const voiceGen = new VoiceGenerator(elevenLabsKey);
 * const narration = await voiceGen.generateNarration(
 *   story.script,
 *   'horror-narration.mp3',
 *   { voiceId: 'deep-male-voice' }
 * );
 *
 * // 3. Generate scene images
 * const imageGen = new ImageGenerator(openAIKey);
 * const images = await Promise.all(
 *   story.scenes.map((scene, i) =>
 *     imageGen.generateHorrorScene(scene.description, {
 *       filename: `scene-${i}.png`,
 *       intensity: 'moderate'
 *     })
 *   )
 * );
 *
 * // 4. Queue video rendering
 * await batch.addJob({
 *   templateId: 'horror_story_v1',
 *   variables: {
 *     TITLE: story.title,
 *     NARRATION_AUDIO: narration.path,
 *     SCENE_IMAGES: JSON.stringify(images.map(img => img.path)),
 *     BACKGROUND_MUSIC: '/music/horror-ambient.mp3',
 *     ENABLE_SUBTITLES: false,
 *     DURATION: 600
 *   },
 *   outputPath: '/output/horror-story-001.mp4'
 * });
 */

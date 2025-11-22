import { Template, TemplateLayer } from './TemplateEngine';

/**
 * Fun Facts Template
 * Engaging and colorful template for interesting facts and trivia
 *
 * Features:
 * - Vibrant, playful colors
 * - Animated fact reveals
 * - Fun icons and illustrations
 * - Quick transitions
 * - Energetic music
 * - Perfect for short-form content
 *
 * Perfect for: Fun facts, Trivia, Did you know?, Quick tips, Educational shorts
 */
export function createFunFactsTemplate(): Template {
  const layers: TemplateLayer[] = [
    // Layer 1: Colorful gradient background
    {
      id: 'bg_gradient',
      type: 'shape',
      name: 'Background Gradient',
      start_time: 0,
      duration: 20,
      z_index: 0,
      properties: {
        shape: 'rectangle',
        width: 1920,
        height: 1080,
        x: 0,
        y: 0,
        fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        effects: [
          {
            type: 'gradient_shift',
            speed: 0.5,
          },
        ],
      },
    },

    // Layer 2: Animated pattern overlay
    {
      id: 'pattern_overlay',
      type: 'effect',
      name: 'Pattern Overlay',
      start_time: 0,
      duration: 20,
      z_index: 1,
      properties: {
        effect: 'dots_pattern',
        dotSize: 4,
        spacing: 40,
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },

    // Layer 3: Main fact card
    {
      id: 'fact_card',
      type: 'shape',
      name: 'Fact Card',
      start_time: 0.3,
      duration: 19.5,
      z_index: 2,
      properties: {
        shape: 'rectangle',
        width: 1400,
        height: 700,
        x: 260,
        y: 190,
        fill: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        shadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
        effects: [
          {
            type: 'scale_in',
            fromScale: 0.8,
            toScale: 1.0,
            duration: 0.5,
          },
        ],
      },
    },

    // Layer 4: "Did You Know?" header
    {
      id: 'header',
      type: 'text',
      name: 'Header Text',
      start_time: 0,
      duration: 20,
      z_index: 3,
      properties: {
        text: 'DID YOU KNOW?',
        x: 960,
        y: 120,
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#f093fb',
        padding: 16,
        paddingHorizontal: 40,
        borderRadius: 24,
        align: 'center',
        fontFamily: 'Poppins, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        effects: [
          {
            type: 'bounce_in',
            duration: 0.6,
          },
        ],
      },
    },

    // Layer 5: Fact icon/emoji
    {
      id: 'fact_icon',
      type: 'text',
      name: 'Fact Icon',
      start_time: 0.5,
      duration: 19,
      z_index: 3,
      properties: {
        text: '${ICON_EMOJI}',
        x: 500,
        y: 400,
        fontSize: 200,
        align: 'center',
        effects: [
          {
            type: 'rotate_in',
            degrees: 360,
            duration: 0.8,
          },
          {
            type: 'pulse',
            scale: 1.1,
            duration: 2,
            loop: true,
          },
        ],
      },
    },

    // Layer 6: Main fact text
    {
      id: 'fact_text',
      type: 'text',
      name: 'Fact Text',
      start_time: 0.8,
      duration: 18.5,
      z_index: 3,
      properties: {
        text: '${FACT_TEXT}',
        x: 1060,
        y: 380,
        fontSize: 42,
        fontWeight: '600',
        color: '#2d3748',
        align: 'left',
        maxWidth: 700,
        lineHeight: 1.5,
        fontFamily: 'Poppins, sans-serif',
        effects: [
          {
            type: 'typewriter',
            speed: 0.03,
          },
        ],
      },
    },

    // Layer 7: Fact number indicator
    {
      id: 'fact_number',
      type: 'text',
      name: 'Fact Number',
      start_time: 0,
      duration: 20,
      z_index: 2,
      properties: {
        text: '#${FACT_NUMBER}',
        x: 300,
        y: 240,
        fontSize: 120,
        fontWeight: 'bold',
        color: 'rgba(102, 126, 234, 0.15)',
        align: 'left',
        fontFamily: 'Poppins, sans-serif',
        conditions: [
          {
            variable: 'FACT_NUMBER',
            notEquals: '',
          },
        ],
      },
    },

    // Layer 8: Decorative circle 1
    {
      id: 'deco_circle_1',
      type: 'shape',
      name: 'Decorative Circle 1',
      start_time: 0,
      duration: 20,
      z_index: 1,
      properties: {
        shape: 'circle',
        radius: 80,
        x: 200,
        y: 800,
        fill: 'rgba(240, 147, 251, 0.3)',
        effects: [
          {
            type: 'float',
            amplitude: 20,
            duration: 3,
            loop: true,
          },
        ],
      },
    },

    // Layer 9: Decorative circle 2
    {
      id: 'deco_circle_2',
      type: 'shape',
      name: 'Decorative Circle 2',
      start_time: 0,
      duration: 20,
      z_index: 1,
      properties: {
        shape: 'circle',
        radius: 50,
        x: 1700,
        y: 300,
        fill: 'rgba(102, 126, 234, 0.3)',
        effects: [
          {
            type: 'float',
            amplitude: 15,
            duration: 4,
            loop: true,
          },
        ],
      },
    },

    // Layer 10: Source/category tag
    {
      id: 'category',
      type: 'text',
      name: 'Category Tag',
      start_time: 1,
      duration: 18,
      z_index: 4,
      properties: {
        text: '${CATEGORY}',
        x: 960,
        y: 920,
        fontSize: 24,
        fontWeight: '600',
        color: '#667eea',
        align: 'center',
        fontFamily: 'Poppins, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        effects: [
          {
            type: 'fade_in',
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

    // Layer 11: Animated sparkles/stars
    {
      id: 'sparkles',
      type: 'effect',
      name: 'Sparkle Effect',
      start_time: 0.8,
      duration: 19,
      z_index: 4,
      properties: {
        effect: 'sparkles',
        count: 30,
        size: 8,
        color: '#ffffff',
        duration: 0.5,
        interval: 0.3,
      },
    },

    // Layer 12: AI narration
    {
      id: 'narration',
      type: 'audio',
      name: 'Narration Audio',
      start_time: 0.5,
      duration: 19,
      z_index: 10,
      properties: {
        source: '${NARRATION_AUDIO}',
        volume: 1.0,
        effects: [
          {
            type: 'equalize',
            preset: 'voice_enhance',
          },
        ],
      },
    },

    // Layer 13: Upbeat background music
    {
      id: 'bg_music',
      type: 'audio',
      name: 'Background Music',
      start_time: 0,
      duration: 20,
      z_index: 9,
      properties: {
        source: '${BACKGROUND_MUSIC}',
        volume: 0.3,
        loop: true,
        effects: [
          {
            type: 'fade_in',
            duration: 0.5,
          },
          {
            type: 'fade_out',
            duration: 1,
          },
        ],
      },
    },

    // Layer 14: Fun sound effect on reveal
    {
      id: 'reveal_sfx',
      type: 'audio',
      name: 'Reveal Sound Effect',
      start_time: 0.8,
      duration: 1,
      z_index: 11,
      properties: {
        source: '${REVEAL_SOUND}',
        volume: 0.6,
        conditions: [
          {
            variable: 'REVEAL_SOUND',
            notEquals: '',
          },
        ],
      },
    },

    // Layer 15: Share/Subscribe CTA
    {
      id: 'cta',
      type: 'text',
      name: 'Call to Action',
      start_time: 17,
      duration: 3,
      z_index: 5,
      properties: {
        text: '${CTA_TEXT}',
        x: 960,
        y: 1000,
        fontSize: 28,
        fontWeight: '600',
        color: '#ffffff',
        align: 'center',
        fontFamily: 'Poppins, sans-serif',
        effects: [
          {
            type: 'fade_in',
            duration: 0.5,
          },
        ],
        conditions: [
          {
            variable: 'CTA_TEXT',
            notEquals: '',
          },
        ],
      },
    },
  ];

  const template: Template = {
    id: 'fun_facts_v1',
    name: 'Fun Facts',
    description: 'Engaging and colorful template for interesting facts, trivia, and educational shorts',
    niche: 'facts',
    duration: 20, // 20 seconds default (perfect for TikTok/Shorts)
    resolution: [1920, 1080],
    framerate: 30,
    layers,
    variables: {
      FACT_TEXT: {
        name: 'FACT_TEXT',
        type: 'string',
        required: true,
        description: 'The fun fact text',
      },
      ICON_EMOJI: {
        name: 'ICON_EMOJI',
        type: 'string',
        required: false,
        description: 'Icon or emoji representing the fact (e.g., 🧠, 🌍, 🔬)',
        default: '💡',
      },
      CATEGORY: {
        name: 'CATEGORY',
        type: 'string',
        required: false,
        description: 'Fact category (SCIENCE, HISTORY, NATURE, etc.)',
        default: '',
      },
      FACT_NUMBER: {
        name: 'FACT_NUMBER',
        type: 'string',
        required: false,
        description: 'Fact number (for series)',
        default: '',
      },
      NARRATION_AUDIO: {
        name: 'NARRATION_AUDIO',
        type: 'audio',
        required: false,
        description: 'AI-generated narration audio file path',
      },
      BACKGROUND_MUSIC: {
        name: 'BACKGROUND_MUSIC',
        type: 'audio',
        required: false,
        description: 'Upbeat background music audio file path',
      },
      REVEAL_SOUND: {
        name: 'REVEAL_SOUND',
        type: 'audio',
        required: false,
        description: 'Fun sound effect for fact reveal',
      },
      CTA_TEXT: {
        name: 'CTA_TEXT',
        type: 'string',
        required: false,
        description: 'Call to action text (e.g., "Follow for more facts!")',
        default: '',
      },
      DURATION: {
        name: 'DURATION',
        type: 'number',
        required: false,
        description: 'Video duration in seconds',
        default: 20,
      },
    },
    metadata: {
      created_at: Date.now(),
      modified_at: Date.now(),
      author: 'ContentForge',
      tags: ['fun-facts', 'trivia', 'educational', 'short-form', 'viral', 'did-you-know'],
    },
  };

  return template;
}

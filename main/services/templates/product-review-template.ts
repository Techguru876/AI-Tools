import { Template, TemplateLayer } from './TemplateEngine';

/**
 * Product Review Template
 * Professional product review and unboxing videos
 *
 * Features:
 * - Product showcase
 * - Pros/Cons sections
 * - Rating display
 * - Feature highlights
 * - Comparison charts
 * - Clean, professional design
 *
 * Perfect for: Product reviews, Unboxing videos, Tech reviews, Comparisons
 */
export function createProductReviewTemplate(): Template {
  const layers: TemplateLayer[] = [
    // Layer 1: Clean white background
    {
      id: 'bg_white',
      type: 'shape',
      name: 'Background',
      start_time: 0,
      duration: 240,
      z_index: 0,
      properties: {
        shape: 'rectangle',
        width: 1920,
        height: 1080,
        x: 0,
        y: 0,
        fill: '#f7f7f7',
      },
    },

    // Layer 2: Top brand bar
    {
      id: 'top_bar',
      type: 'shape',
      name: 'Top Bar',
      start_time: 0,
      duration: 240,
      z_index: 1,
      properties: {
        shape: 'rectangle',
        width: 1920,
        height: 120,
        x: 0,
        y: 0,
        fill: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      },
    },

    // Layer 3: Product name/title
    {
      id: 'product_title',
      type: 'text',
      name: 'Product Title',
      start_time: 0,
      duration: 240,
      z_index: 2,
      properties: {
        text: '${PRODUCT_NAME}',
        x: 100,
        y: 60,
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'left',
        fontFamily: 'Inter, sans-serif',
      },
    },

    // Layer 4: "REVIEW" badge
    {
      id: 'review_badge',
      type: 'text',
      name: 'Review Badge',
      start_time: 0,
      duration: 240,
      z_index: 2,
      properties: {
        text: 'REVIEW',
        x: 1750,
        y: 60,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        align: 'right',
        fontFamily: 'Inter, sans-serif',
      },
    },

    // Layer 5: Product image showcase
    {
      id: 'product_image',
      type: 'image',
      name: 'Product Image',
      start_time: 0,
      duration: 240,
      z_index: 2,
      properties: {
        source: '${PRODUCT_IMAGES}',
        x: 160,
        y: 200,
        width: 800,
        height: 800,
        fit: 'contain',
        transition: 'crossfade',
        transitionDuration: 0.5,
        effects: [
          {
            type: 'rotate_360',
            duration: 20,
            loop: true,
            smooth: true,
          },
        ],
      },
    },

    // Layer 6: Rating stars
    {
      id: 'rating',
      type: 'text',
      name: 'Rating Stars',
      start_time: 1,
      duration: 238.5,
      z_index: 3,
      properties: {
        text: '${RATING_STARS}',
        x: 1200,
        y: 220,
        fontSize: 64,
        color: '#FFD700',
        align: 'left',
        fontFamily: 'Arial, sans-serif',
        effects: [
          {
            type: 'pop_in',
            duration: 0.5,
            delay: 0.1,
            stagger: 0.1,
          },
        ],
      },
    },

    // Layer 7: Rating score
    {
      id: 'rating_score',
      type: 'text',
      name: 'Rating Score',
      start_time: 1.5,
      duration: 238,
      z_index: 3,
      properties: {
        text: '${RATING_SCORE}/10',
        x: 1550,
        y: 250,
        fontSize: 48,
        fontWeight: 'bold',
        color: '#667eea',
        align: 'left',
        fontFamily: 'Inter, sans-serif',
        effects: [
          {
            type: 'count_up',
            duration: 1,
          },
        ],
      },
    },

    // Layer 8: Pros header
    {
      id: 'pros_header',
      type: 'text',
      name: 'Pros Header',
      start_time: 2,
      duration: 237,
      z_index: 3,
      properties: {
        text: '✅ PROS',
        x: 1100,
        y: 350,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4caf50',
        align: 'left',
        fontFamily: 'Inter, sans-serif',
      },
    },

    // Layer 9: Pros list
    {
      id: 'pros_list',
      type: 'text',
      name: 'Pros List',
      start_time: 2.3,
      duration: 236.5,
      z_index: 3,
      properties: {
        text: '${PROS_LIST}',
        x: 1120,
        y: 410,
        fontSize: 24,
        lineHeight: 1.8,
        color: '#2d3748',
        align: 'left',
        maxWidth: 700,
        fontFamily: 'Inter, sans-serif',
        effects: [
          {
            type: 'slide_in_right',
            duration: 0.5,
            stagger: 0.2,
          },
        ],
      },
    },

    // Layer 10: Cons header
    {
      id: 'cons_header',
      type: 'text',
      name: 'Cons Header',
      start_time: 3,
      duration: 236,
      z_index: 3,
      properties: {
        text: '❌ CONS',
        x: 1100,
        y: 620,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f44336',
        align: 'left',
        fontFamily: 'Inter, sans-serif',
      },
    },

    // Layer 11: Cons list
    {
      id: 'cons_list',
      type: 'text',
      name: 'Cons List',
      start_time: 3.3,
      duration: 235.5,
      z_index: 3,
      properties: {
        text: '${CONS_LIST}',
        x: 1120,
        y: 680,
        fontSize: 24,
        lineHeight: 1.8,
        color: '#2d3748',
        align: 'left',
        maxWidth: 700,
        fontFamily: 'Inter, sans-serif',
        effects: [
          {
            type: 'slide_in_right',
            duration: 0.5,
            stagger: 0.2,
          },
        ],
      },
    },

    // Layer 12: Price tag
    {
      id: 'price',
      type: 'text',
      name: 'Price',
      start_time: 4,
      duration: 235,
      z_index: 3,
      properties: {
        text: '${PRICE}',
        x: 1100,
        y: 880,
        fontSize: 56,
        fontWeight: 'bold',
        color: '#667eea',
        align: 'left',
        fontFamily: 'Inter, sans-serif',
        effects: [
          {
            type: 'bounce_in',
            duration: 0.6,
          },
        ],
      },
    },

    // Layer 13: Verdict/recommendation
    {
      id: 'verdict',
      type: 'text',
      name: 'Verdict',
      start_time: 5,
      duration: 234,
      z_index: 4,
      properties: {
        text: '${VERDICT}',
        x: 960,
        y: 980,
        fontSize: 32,
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '${VERDICT_COLOR}',
        padding: 16,
        paddingHorizontal: 40,
        borderRadius: 12,
        align: 'center',
        maxWidth: 1600,
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: 1,
        effects: [
          {
            type: 'slide_up',
            distance: 50,
            duration: 0.5,
          },
        ],
      },
    },

    // Layer 14: Specifications box
    {
      id: 'specs_box',
      type: 'shape',
      name: 'Specs Box',
      start_time: 0.5,
      duration: 5,
      z_index: 3,
      properties: {
        shape: 'rectangle',
        width: 750,
        height: 200,
        x: 100,
        y: 150,
        fill: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        border: '2px solid #667eea',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        conditions: [
          {
            variable: 'SHOW_SPECS',
            equals: true,
          },
        ],
      },
    },

    // Layer 15: Specifications text
    {
      id: 'specs_text',
      type: 'text',
      name: 'Specs Text',
      start_time: 0.8,
      duration: 4.7,
      z_index: 4,
      properties: {
        text: '${SPECS}',
        x: 130,
        y: 180,
        fontSize: 20,
        lineHeight: 1.6,
        color: '#2d3748',
        align: 'left',
        maxWidth: 690,
        fontFamily: 'Inter, sans-serif',
        conditions: [
          {
            variable: 'SHOW_SPECS',
            equals: true,
          },
        ],
      },
    },

    // Layer 16: AI narration
    {
      id: 'narration',
      type: 'audio',
      name: 'Narration Audio',
      start_time: 0,
      duration: 240,
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

    // Layer 17: Background music (subtle)
    {
      id: 'bg_music',
      type: 'audio',
      name: 'Background Music',
      start_time: 0,
      duration: 240,
      z_index: 9,
      properties: {
        source: '${BACKGROUND_MUSIC}',
        volume: 0.2,
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

    // Layer 18: Affiliate/Buy link CTA
    {
      id: 'buy_cta',
      type: 'text',
      name: 'Buy CTA',
      start_time: 235,
      duration: 5,
      z_index: 5,
      properties: {
        text: '${BUY_LINK_TEXT}',
        x: 960,
        y: 1040,
        fontSize: 24,
        fontWeight: '600',
        color: '#667eea',
        align: 'center',
        fontFamily: 'Inter, sans-serif',
        effects: [
          {
            type: 'pulse',
            scale: 1.1,
            duration: 1,
            loop: true,
          },
        ],
        conditions: [
          {
            variable: 'BUY_LINK_TEXT',
            notEquals: '',
          },
        ],
      },
    },
  ];

  const template: Template = {
    id: 'product_review_v1',
    name: 'Product Review',
    description: 'Professional product review template with ratings, pros/cons, and detailed specifications',
    niche: 'custom',
    duration: 240, // 4 minutes default
    resolution: [1920, 1080],
    framerate: 30,
    layers,
    variables: {
      PRODUCT_NAME: {
        name: 'PRODUCT_NAME',
        type: 'string',
        required: true,
        description: 'Product name/title',
      },
      PRODUCT_IMAGES: {
        name: 'PRODUCT_IMAGES',
        type: 'string',
        required: true,
        description: 'JSON array of product image paths',
      },
      NARRATION_AUDIO: {
        name: 'NARRATION_AUDIO',
        type: 'audio',
        required: true,
        description: 'Review narration audio file path',
      },
      RATING_SCORE: {
        name: 'RATING_SCORE',
        type: 'number',
        required: true,
        description: 'Rating score (0-10)',
      },
      RATING_STARS: {
        name: 'RATING_STARS',
        type: 'string',
        required: false,
        description: 'Star rating display (e.g., ⭐⭐⭐⭐)',
        default: '⭐⭐⭐⭐⭐',
      },
      PROS_LIST: {
        name: 'PROS_LIST',
        type: 'string',
        required: true,
        description: 'Pros list (newline-separated)',
      },
      CONS_LIST: {
        name: 'CONS_LIST',
        type: 'string',
        required: true,
        description: 'Cons list (newline-separated)',
      },
      PRICE: {
        name: 'PRICE',
        type: 'string',
        required: false,
        description: 'Product price (e.g., $299.99)',
        default: '',
      },
      VERDICT: {
        name: 'VERDICT',
        type: 'string',
        required: false,
        description: 'Final verdict/recommendation',
        default: 'RECOMMENDED',
      },
      VERDICT_COLOR: {
        name: 'VERDICT_COLOR',
        type: 'string',
        required: false,
        description: 'Verdict background color',
        default: '#4caf50',
      },
      SPECS: {
        name: 'SPECS',
        type: 'string',
        required: false,
        description: 'Product specifications (newline-separated)',
        default: '',
      },
      SHOW_SPECS: {
        name: 'SHOW_SPECS',
        type: 'boolean',
        required: false,
        description: 'Show specifications box',
        default: false,
      },
      BACKGROUND_MUSIC: {
        name: 'BACKGROUND_MUSIC',
        type: 'audio',
        required: false,
        description: 'Background music audio file path',
      },
      BUY_LINK_TEXT: {
        name: 'BUY_LINK_TEXT',
        type: 'string',
        required: false,
        description: 'Buy/affiliate link text',
        default: '',
      },
      DURATION: {
        name: 'DURATION',
        type: 'number',
        required: false,
        description: 'Video duration in seconds',
        default: 240,
      },
    },
    metadata: {
      created_at: Date.now(),
      modified_at: Date.now(),
      author: 'ContentForge',
      tags: ['product-review', 'unboxing', 'tech-review', 'comparison', 'rating', 'pros-cons'],
    },
  };

  return template;
}

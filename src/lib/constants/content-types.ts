export type ContentType = 'news' | 'feature' | 'review' | 'deal' | 'opinion' | 'guide'

export const CONTENT_TYPES = {
  NEWS: {
    value: 'news' as const,
    label: 'News',
    description: 'Breaking news and updates',
    wordCount: { min: 400, max: 600 },
  },
  FEATURE: {
    value: 'feature' as const,
    label: 'Feature',
    description: 'Long-form analysis and deep dives',
    wordCount: { min: 1200, max: 2000 },
  },
  REVIEW: {
    value: 'review' as const,
    label: 'Review',
    description: 'Product reviews with ratings',
    wordCount: { min: 800, max: 1200 },
  },
  DEAL: {
    value: 'deal' as const,
    label: 'Deal',
    description: 'Shopping deals and discounts',
    wordCount: { min: 300, max: 500 },
  },
  OPINION: {
    value: 'opinion' as const,
    label: 'Opinion',
    description: 'Editorial and commentary',
    wordCount: { min: 600, max: 900 },
  },
  GUIDE: {
    value: 'guide' as const,
    label: 'Guide',
    description: 'How-to articles and tutorials',
    wordCount: { min: 800, max: 1500 },
  },
} as const

// Content distribution quotas (percentages)
export const CONTENT_TYPE_QUOTAS = {
  news: 0.60,    // 60% of daily content
  feature: 0.15, // 15%
  review: 0.15,  // 15%
  deal: 0.08,    // 8%
  opinion: 0.02, // 2%
  guide: 0.00,   // On-demand only
} as const

// Daily posting target
export const DAILY_POST_TARGET = 24 // posts per day
export const POSTS_PER_HOUR = DAILY_POST_TARGET / 24 // ~1 post per hour

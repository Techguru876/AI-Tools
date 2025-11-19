export const CATEGORIES = {
  TECH: {
    slug: 'tech',
    label: 'Tech',
    description: 'Latest technology news and updates',
    color: '#3b82f6', // blue
  },
  SCIENCE: {
    slug: 'science',
    label: 'Science',
    description: 'Scientific discoveries and breakthroughs',
    color: '#8b5cf6', // purple
  },
  CULTURE: {
    slug: 'culture',
    label: 'Culture',
    description: 'Entertainment, movies, games, and pop culture',
    color: '#ec4899', // pink
  },
  REVIEWS: {
    slug: 'reviews',
    label: 'Reviews',
    description: 'In-depth product reviews and analysis',
    color: '#10b981', // green
  },
  DEALS: {
    slug: 'deals',
    label: 'Deals',
    description: 'Best tech deals and shopping guides',
    color: '#f59e0b', // amber
  },
  AI_NEWS: {
    slug: 'ai-news',
    label: 'AI News',
    description: 'Latest in artificial intelligence and machine learning',
    color: '#6366f1', // indigo
  },
} as const

export type CategorySlug = keyof typeof CATEGORIES

export const CATEGORY_SLUGS = Object.values(CATEGORIES).map((cat) => cat.slug)

export function getCategoryBySlug(slug: string) {
  return Object.values(CATEGORIES).find((cat) => cat.slug === slug)
}

export function getCategoryColor(slug: string): string {
  const category = getCategoryBySlug(slug)
  return category?.color || '#6b7280' // gray default
}

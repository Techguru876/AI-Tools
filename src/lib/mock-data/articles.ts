import type { ArticleCardProps } from '@/components/article-cards/article-card'
import { CATEGORIES } from '@/lib/constants/categories'

// Mock articles for demonstration - will be replaced with database queries
export const mockArticles: ArticleCardProps[] = [
  // Tech - News
  {
    id: '1',
    slug: 'apple-vision-pro-2-eye-tracking',
    title: 'Apple Announces Vision Pro 2 with Revolutionary Eye-Tracking Technology',
    excerpt: 'The next generation of Apple\'s spatial computer brings unprecedented accuracy and all-day battery life to mixed reality computing.',
    author: 'Sarah Chen',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    category: 'Tech',
    categorySlug: 'tech',
    type: 'news',
    featured: true,
    trending: true,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
    tags: ['apple', 'vision-pro', 'ar-vr', 'spatial-computing'],
  },
  // AI News
  {
    id: '2',
    slug: 'openai-gpt5-most-advanced-model',
    title: 'OpenAI Releases GPT-5: The Most Advanced Language Model Yet',
    excerpt: 'With 10 trillion parameters and multimodal understanding, GPT-5 sets new benchmarks across reasoning, creativity, and problem-solving tasks.',
    author: 'Marcus Rivera',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    category: 'AI News',
    categorySlug: 'ai-news',
    type: 'news',
    trending: true,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    tags: ['openai', 'gpt-5', 'artificial-intelligence', 'language-models'],
  },
  // Deal
  {
    id: '3',
    slug: 'airpods-pro-2-lowest-price',
    title: 'AirPods Pro 2 Drop to Lowest Price Ever at $199',
    excerpt: 'Amazon\'s early Black Friday sale brings Apple\'s premium earbuds down to an all-time low. Includes USB-C charging case.',
    author: 'Deals Team',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    category: 'Deals',
    categorySlug: 'deals',
    type: 'deal',
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&h=400&fit=crop',
    dealPrice: '$199',
    dealOriginalPrice: '$249',
    dealDiscount: '20%',
    tags: ['airpods-pro', 'apple', 'black-friday', 'deals'],
  },
  // Science
  {
    id: '4',
    slug: 'scientists-reverse-aging-cells',
    title: 'Scientists Discover Method to Reverse Aging in Human Cells',
    excerpt: 'Breakthrough research demonstrates cellular rejuvenation technique that could extend human healthspan by decades.',
    author: 'Dr. Elena Rodriguez',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    category: 'Science',
    categorySlug: 'science',
    type: 'news',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=400&fit=crop',
    tags: ['longevity', 'biotech', 'cellular-biology', 'anti-aging'],
  },
  // Review
  {
    id: '5',
    slug: 'iphone-16-pro-max-camera-review',
    title: 'iPhone 16 Pro Max Review: The Best Smartphone Camera Ever Made',
    excerpt: 'Apple\'s latest flagship sets new standards for computational photography with its 5x periscope telephoto and improved night mode.',
    author: 'James Park',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    category: 'Reviews',
    categorySlug: 'reviews',
    type: 'review',
    featured: true,
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=600&fit=crop',
    rating: 4.5,
    tags: ['iphone-16', 'apple', 'smartphone', 'camera'],
  },
  // Culture
  {
    id: '6',
    slug: 'last-of-us-season-2-trailer',
    title: 'The Last of Us Season 2 Trailer Drops: First Look at Abby',
    excerpt: 'HBO releases stunning first footage from the highly anticipated second season, set to premiere in early 2025.',
    author: 'Alex Thompson',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    category: 'Culture',
    categorySlug: 'culture',
    type: 'news',
    image: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=800&h=400&fit=crop',
    tags: ['the-last-of-us', 'hbo', 'streaming', 'tv-shows'],
  },
  // Tech - Feature
  {
    id: '7',
    slug: 'inside-ai-arms-race',
    title: 'Inside the AI Arms Race: How Tech Giants Are Competing for Dominance',
    excerpt: 'An in-depth look at the multi-billion dollar battle between Google, Microsoft, OpenAI, and Anthropic to build the world\'s most advanced AI.',
    author: 'Michael Zhang',
    publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    category: 'Tech',
    categorySlug: 'tech',
    type: 'feature',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    tags: ['artificial-intelligence', 'big-tech', 'competition', 'analysis'],
  },
  // Science
  {
    id: '8',
    slug: 'nasa-water-ice-mars-surface',
    title: 'NASA Confirms Water Ice Discovered Beneath Mars Surface',
    excerpt: 'Perseverance rover\'s ground-penetrating radar reveals vast deposits of frozen water just meters below the Martian surface.',
    author: 'Dr. Rachel Kim',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    category: 'Science',
    categorySlug: 'science',
    type: 'news',
    trending: true,
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=400&fit=crop',
    tags: ['mars', 'nasa', 'space', 'perseverance'],
  },
  // Reviews
  {
    id: '9',
    slug: 'm3-macbook-air-perfect-laptop',
    title: 'M3 MacBook Air Review: The Perfect Laptop for Most People',
    excerpt: 'Apple\'s latest thin-and-light delivers desktop-class performance in a fanless design that lasts all day.',
    author: 'Lisa Wong',
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    category: 'Reviews',
    categorySlug: 'reviews',
    type: 'review',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop',
    rating: 5,
    tags: ['macbook-air', 'apple', 'laptops', 'm3'],
  },
  // Culture
  {
    id: '10',
    slug: 'best-games-coming-2025',
    title: 'Best New Games Coming in 2025: What We\'re Most Excited About',
    excerpt: 'From Grand Theft Auto VI to the next Zelda, here are the biggest gaming releases on the horizon.',
    author: 'Chris Martinez',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    category: 'Culture',
    categorySlug: 'culture',
    type: 'feature',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=400&fit=crop',
    tags: ['gaming', 'video-games', 'gta-6', 'zelda'],
  },
  // Tech - News
  {
    id: '11',
    slug: 'tesla-cybertruck-mass-production',
    title: 'Tesla Cybertruck Finally Begins Mass Production',
    excerpt: 'After years of delays, Tesla\'s polarizing electric pickup truck is rolling off the assembly line at scale.',
    author: 'David Lee',
    publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
    category: 'Tech',
    categorySlug: 'tech',
    type: 'news',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=400&fit=crop',
    tags: ['tesla', 'cybertruck', 'electric-vehicles', 'automotive'],
  },
  // Deal
  {
    id: '12',
    slug: 'samsung-galaxy-s24-ultra-deal',
    title: 'Samsung Galaxy S24 Ultra at $899 - Save $300',
    excerpt: 'Best Buy\'s early Black Friday sale slashes the price on Samsung\'s flagship with built-in S Pen and 200MP camera.',
    author: 'Deals Team',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    category: 'Deals',
    categorySlug: 'deals',
    type: 'deal',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=400&fit=crop',
    dealPrice: '$899',
    dealOriginalPrice: '$1,199',
    dealDiscount: '25%',
    tags: ['samsung', 'galaxy-s24', 'smartphone', 'deals'],
  },
  // AI News
  {
    id: '13',
    slug: 'eu-ai-regulation-act',
    title: 'EU Passes Comprehensive AI Regulation Act',
    excerpt: 'Landmark legislation sets global precedent for AI governance, focusing on safety, transparency, and accountability.',
    author: 'Sophie Laurent',
    publishedAt: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13 hours ago
    category: 'AI News',
    categorySlug: 'ai-news',
    type: 'news',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    tags: ['ai-regulation', 'eu', 'policy', 'governance'],
  },
  // Science
  {
    id: '14',
    slug: 'fusion-reactor-net-energy-gain',
    title: 'Fusion Reactor Achieves Net Energy Gain for Third Time',
    excerpt: 'National Ignition Facility demonstrates reproducibility of fusion breakthrough, bringing clean energy dream closer to reality.',
    author: 'Dr. Thomas Anderson',
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
    category: 'Science',
    categorySlug: 'science',
    type: 'news',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    tags: ['fusion', 'energy', 'physics', 'climate'],
  },
  // Reviews
  {
    id: '15',
    slug: 'sony-wh-1000xm6-headphones-review',
    title: 'Sony WH-1000XM6 Review: Still the Best Noise-Canceling Headphones',
    excerpt: 'Sony refines its flagship headphones with improved ANC, better call quality, and 30-hour battery life.',
    author: 'Nina Patel',
    publishedAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
    category: 'Reviews',
    categorySlug: 'reviews',
    type: 'review',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop',
    rating: 4.5,
    tags: ['sony', 'headphones', 'audio', 'noise-canceling'],
  },
]

// Function to get paginated articles
export function getArticles(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit
  const end = start + limit
  return mockArticles.slice(start, end)
}

// Function to get articles by category
export function getArticlesByCategory(category: string, limit: number = 20) {
  return mockArticles
    .filter((article) => article.categorySlug === category)
    .slice(0, limit)
}

// Function to get trending articles
export function getTrendingArticles(limit: number = 5) {
  return mockArticles.filter((article) => article.trending).slice(0, limit)
}

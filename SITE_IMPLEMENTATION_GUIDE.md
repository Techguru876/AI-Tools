# AI Tech Blog - Complete Site Implementation Guide

This document provides a comprehensive guide to implementing all features for the Gizmodo-style AI Tech Blog platform.

## Table of Contents
1. [Global Architecture](#global-architecture)
2. [Content Taxonomy](#content-taxonomy)
3. [Homepage Feed System](#homepage-feed-system)
4. [Article Templates](#article-templates)
5. [Component Library](#component-library)
6. [Content Strategy & Quotas](#content-strategy--quotas)
7. [Monetization Implementation](#monetization-implementation)
8. [Navigation & Discovery](#navigation--discovery)
9. [Implementation Checklist](#implementation-checklist)

---

## 1. Global Architecture

### Layout Structure

```
┌─────────────────────────────────────┐
│           Header (Sticky)           │
│  Logo | Nav | Search | User | CTA  │
└─────────────────────────────────────┘
┌─────────────┬───────────────────────┐
│             │                       │
│   Sidebar   │    Main Feed         │
│  (Desktop)  │  (Time-Sorted)       │
│             │                       │
│   Deals     │   Article Cards      │
│   Trending  │   Mixed Types        │
│   Featured  │   Infinite Scroll    │
│             │                       │
└─────────────┴───────────────────────┘
┌─────────────────────────────────────┐
│         Footer with Newsletter      │
└─────────────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: `< 768px` - Single column, collapsednavigation
- Tablet: `768px - 1024px` - Single column with expanded navigation
- Desktop: `> 1024px` - Sidebar + Main column layout

---

## 2. Content Taxonomy

### Primary Categories
Defined in `/src/lib/constants/categories.ts`:

```typescript
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
}
```

### Content Types
Each article has a primary category AND a content type:

```typescript
export type ContentType =
  | 'news'      // Breaking news, updates (time-sensitive)
  | 'feature'   // Long-form analysis, deep dives
  | 'review'    // Product reviews with ratings
  | 'deal'      // Shopping deals with pricing
  | 'opinion'   // Editorial, commentary
  | 'guide'     // How-to, tutorials
```

### Tag System
- **Maximum 5 tags per article**
- Tags are lowercase, hyphenated strings
- Examples: `artificial-intelligence`, `iphone-15`, `chatgpt`, `black-friday`
- Used for topic hubs and related content discovery

---

## 3. Homepage Feed System

### Feed Composition

The homepage displays a time-sorted feed with mixed content types:

#### Daily Content Quota (24-hour period)
```javascript
const DAILY_QUOTAS = {
  tech: 12,        // 50% - Core tech news
  science: 4,      // 17% - Science discoveries
  culture: 4,      // 17% - Entertainment & culture
  deals: 2,        // 8%  - Deal posts
  aiNews: 2,       // 8%  - AI-specific news
}

const CONTENT_TYPE_MIX = {
  news: 0.60,      // 60% news articles
  feature: 0.15,   // 15% long-form features
  review: 0.15,    // 15% reviews
  deal: 0.08,      // 8% deals
  opinion: 0.02,   // 2% opinion/editorial
}
```

### Feed Algorithm

```typescript
// src/lib/feed/homepage-feed.ts
export interface FeedPost {
  id: string
  title: string
  excerpt: string
  author: string
  publishedAt: Date
  category: string
  type: ContentType
  featured: boolean
  trending: boolean
  image?: string
  // Type-specific fields
  dealPrice?: string
  dealDiscount?: string
  rating?: number
  tags: string[]
}

export async function getHomepageFeed(
  page: number = 1,
  limit: number = 20
): Promise<FeedPost[]> {
  // 1. Fetch posts from last 48 hours
  // 2. Sort by publishedAt DESC
  // 3. Mix content types according to quotas
  // 4. Mark top 3 as featured
  // 5. Calculate trending based on engagement
  // 6. Paginate results
}
```

### Card Sizes & Rhythm

```typescript
// First post: Large featured card (2x height)
// Posts 2-3: Standard cards
// Post 4: Medium featured (1.5x height)
// Posts 5-10: Standard cards
// Post 11: Medium featured
// Repeat pattern
```

---

## 4. Article Templates

### News Article Template
**Location:** `/src/app/[category]/[slug]/page.tsx`

```tsx
<article>
  {/* Hero Section */}
  <header>
    <CategoryBadge />
    <h1>{title}</h1>
    <AuthorTimestamp author={author} date={publishedAt} />
    <SocialShare />
  </header>

  {/* Featured Image */}
  <HeroImage src={image} alt={title} caption={imageCaption} />

  {/* Article Body */}
  <div className="article-content prose">
    {renderedMarkdown}
  </div>

  {/* Tags */}
  <TagList tags={tags} />

  {/* Related Articles */}
  <RelatedArticles category={category} tags={tags} currentId={id} />

  {/* Newsletter CTA */}
  <NewsletterSignup />

  {/* Comments (placeholder) */}
  <CommentsSection articleId={id} />
</article>
```

### Deal Article Template
Additional elements:

```tsx
<DealHighlight>
  <ProductImage />
  <PriceComparison
    currentPrice={dealPrice}
    originalPrice={dealOriginalPrice}
    discount={dealDiscount}
  />
  <BuyButton href={affiliateLink} />
  <ExpirationTimer expiresAt={dealExpiresAt} />
</DealHighlight>
```

### Review Article Template
Additional elements:

```tsx
<ReviewSummary>
  <OverallRating rating={rating} />
  <ProsCons pros={pros} cons={cons} />
  <VerdictBox verdict={verdict} />
</ReviewSummary>

<SpecTable specifications={specs} />

<ComparisonWidget competitors={competitors} />
```

---

## 5. Component Library

### Core Components

#### ArticleCard (Already Implemented)
```tsx
<ArticleCard
  id="123"
  title="..."
  excerpt="..."
  author="AI Tech Blog"
  publishedAt={new Date()}
  category="tech"
  type="news"
  featured={false}
  trending={true}
  tags={['ai', 'tech']}
/>
```

#### DealCard (To Implement)
```tsx
<DealCard
  productName="iPhone 15 Pro"
  image="/products/iphone-15.jpg"
  currentPrice="$899"
  originalPrice="$999"
  discount="10%"
  affiliateLink="https://..."
  expiresAt={new Date('2024-12-31')}
/>
```

#### Sidebar Components (To Implement)
```tsx
<Sidebar>
  <TrendingPosts limit={5} />
  <FeaturedDeals limit={3} />
  <NewsletterWidget />
  <AdPlacement slot="sidebar-top" />
</Sidebar>
```

---

## 6. Content Strategy & Quotas

### Posting Cadence
- **Target:** 20-24 posts per day (roughly 1 post every 1-2 hours)
- **Peak times:** 7am-10am, 12pm-2pm, 6pm-9pm EST
- **Weekend mix:** More entertainment/culture, fewer business/tech

### Content Distribution

#### By Category
- **Tech (50%):** 12 posts/day
  - Product launches, company news, industry updates
  - Examples: "Apple announces new MacBook Pro", "Microsoft acquires AI startup"

- **Science (17%):** 4 posts/day
  - Research breakthroughs, space news, health tech
  - Examples: "New battery technology doubles EV range", "Mars rover discovers water"

- **Culture (17%):** 4 posts/day
  - Movies, TV, gaming, streaming, social media trends
  - Examples: "New Star Wars trailer drops", "Best games of 2024"

- **Deals (8%):** 2 posts/day
  - Product discounts, buying guides, Black Friday alerts
  - Examples: "AirPods Pro drop to $199", "Best Prime Day tech deals"

- **AI News (8%):** 2 posts/day
  - AI models, ML breakthroughs, AI policy/ethics
  - Examples: "ChatGPT-5 announced", "EU passes AI regulation"

#### By Content Type
- **News (60%):** Quick updates, breaking stories (400-600 words)
- **Features (15%):** Deep dives, analysis (1200-2000 words)
- **Reviews (15%):** Product evaluations (800-1200 words)
- **Deals (8%):** Shopping posts (300-500 words)
- **Opinion (2%):** Editorial commentary (600-900 words)

### AI Generation Prompts

Each content type has a specialized prompt in `/src/lib/ai/prompts.ts`:

```typescript
export const CONTENT_PROMPTS = {
  generateNews: (topic: string, category: string) => `...`,
  generateFeature: (topic: string, angle: string) => `...`,
  generateReview: (product: string, specs: object) => `...`,
  generateDeal: (product: string, price: string) => `...`,
  generateOpinion: (topic: string, stance: string) => `...`,
}
```

---

## 7. Monetization Implementation

### Affiliate Links
```typescript
// src/lib/monetization/affiliate.ts
export function generateAffiliateLink(
  productUrl: string,
  affiliateId: string
): string {
  // Amazon Associates
  if (productUrl.includes('amazon.com')) {
    return `${productUrl}?tag=${affiliateId}`
  }
  // Add other affiliate networks
}
```

### Ad Placements
```tsx
<AdPlacement
  slot="article-top"        // Above article content
  slot="article-mid"        // Mid-article
  slot="sidebar-top"        // Sidebar top
  slot="feed-native"        // In-feed native ad
  slot="footer-banner"      // Footer banner
/>
```

### Deal Tracking
```typescript
// Track click-through for affiliate links
export function trackAffiliateClick(
  dealId: string,
  productName: string,
  price: string
): void {
  analytics.track('Affiliate Click', {
    dealId,
    productName,
    price,
    timestamp: new Date(),
  })
}
```

---

## 8. Navigation & Discovery

### Primary Navigation
- **Header:** Tech | Science | Culture | Reviews | Deals | AI News
- **Mobile:** Hamburger menu with same links + Subscribe CTA

### Topic Hubs (To Implement)
- `/topics/[slug]` - Aggregation pages for popular tags
- Examples: `/topics/artificial-intelligence`, `/topics/iphone`
- Show all articles with that tag, sorted by date

### Search Results (To Implement)
- `/search?q=[query]` - Full-text search across all content
- Filters: Category, Date range, Content type
- Sort: Relevance, Date, Trending

### Category Pages (To Implement)
- `/[category]` - Category-specific feed
- Examples: `/tech`, `/science`, `/reviews`
- Same card layout as homepage, filtered by category

---

## 9. Implementation Checklist

### ✅ Completed
- [x] Enhanced header with full navigation
- [x] Search dialog with trending searches
- [x] Article card system (news, deal, feature, review)
- [x] Enhanced footer with newsletter signup
- [x] Dialog UI component
- [x] Typography and design system

### 🚧 In Progress
- [ ] Sidebar component for desktop
- [ ] Homepage feed with time-sorting
- [ ] Category page templates

### 📋 To Do
- [ ] Article page template with full anatomy
- [ ] Deal card component
- [ ] Product comparison widget
- [ ] Related articles module
- [ ] Comments section (placeholder)
- [ ] Topic hub pages
- [ ] Search results page
- [ ] Trending calculation algorithm
- [ ] Affiliate link tracking
- [ ] Analytics integration
- [ ] RSS feed generation
- [ ] Sitemap generation
- [ ] OpenGraph meta tags
- [ ] Twitter cards
- [ ] Pagination component
- [ ] Load more / infinite scroll
- [ ] Mobile optimization testing

---

## Next Steps

1. **Implement Sidebar Component**
   - Trending posts widget
   - Featured deals widget
   - Ad placement slots
   - Social follow buttons

2. **Build Homepage Feed**
   - Time-sorted article aggregation
   - Mix algorithm (quotas)
   - Featured post selection
   - Trending calculation

3. **Create Category Pages**
   - Dynamic routes for each category
   - Category-filtered feeds
   - Category-specific SEO

4. **Implement Article Pages**
   - Full article template
   - Related articles
   - Share buttons
   - Comments (placeholder)

5. **Add Search Functionality**
   - Search API endpoint
   - Search results page
   - Filters and sorting

6. **Deploy Content Strategy**
   - Set up AI generation pipeline
   - Configure posting schedule
   - Monitor content mix
   - Adjust quotas based on performance

---

## File Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # Homepage with feed
│   │   ├── [category]/
│   │   │   ├── page.tsx                # Category pages
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Article pages
│   │   ├── search/
│   │   │   └── page.tsx                # Search results
│   │   ├── topics/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Topic hub pages
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── ...
│   └── admin/                          # Existing admin
├── components/
│   ├── article-cards/
│   │   ├── article-card.tsx            # ✅ Implemented
│   │   ├── deal-card.tsx               # TODO
│   │   └── compact-card.tsx            # TODO
│   ├── article/
│   │   ├── article-header.tsx          # TODO
│   │   ├── article-body.tsx            # TODO
│   │   ├── related-articles.tsx        # TODO
│   │   ├── social-share.tsx            # TODO
│   │   └── comments-section.tsx        # TODO
│   ├── sidebar/
│   │   ├── sidebar.tsx                 # TODO
│   │   ├── trending-widget.tsx         # TODO
│   │   ├── deals-widget.tsx            # TODO
│   │   └── newsletter-widget.tsx       # TODO
│   ├── layout/
│   │   ├── header.tsx                  # ✅ Implemented
│   │   └── footer.tsx                  # ✅ Implemented
│   └── search-dialog.tsx               # ✅ Implemented
├── lib/
│   ├── feed/
│   │   ├── homepage-feed.ts            # TODO
│   │   ├── category-feed.ts            # TODO
│   │   └── trending.ts                 # TODO
│   ├── constants/
│   │   ├── categories.ts               # TODO
│   │   └── content-types.ts            # TODO
│   └── monetization/
│       └── affiliate.ts                # TODO
└── ...
```

---

This guide will be updated as features are implemented. Reference this document for architectural decisions and implementation details.

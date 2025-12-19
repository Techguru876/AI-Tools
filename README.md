# TechBlog USA

A comprehensive, AI-automated tech blog platform featuring automated content generation, editorial management, monetization, and advanced user experience.

## Features

### Core Content & Editorial
- ✨ **AI-Generated Content**: Automated news, reviews, comparisons, and buying guides powered by Claude AI
- 📝 **Editorial Dashboard**: Intuitive interface for content creation, approval, and scheduling
- 🎯 **Multiple Content Types**: News, reviews, how-to guides, comparisons, and roundups
- 📅 **Content Scheduling**: Automated publishing and content refresh system

### User Experience
- 🎨 **Modern Design**: Dynamic bento/grid layout with responsive design
- 🌓 **Dark/Light Mode**: Fully implemented theme switching
- 📱 **Mobile Optimized**: Responsive design with touch-friendly navigation
- 🔍 **Smart Search**: AI-powered search and content discovery
- 👤 **Personalization**: User preferences and content recommendations

### Monetization
- 💰 **Multiple Revenue Streams**: Ads, affiliate links, and premium memberships
- 🔗 **Affiliate Integration**: Automatic affiliate link injection and tracking
- 💳 **Stripe Integration**: Premium memberships and subscriptions
- 📊 **Revenue Analytics**: Track earnings across all channels

### Analytics & Insights
- 📈 **Comprehensive Analytics**: Track views, engagement, and conversions
- 🤖 **AI-Powered Insights**: Content optimization suggestions
- 📊 **Performance Metrics**: Real-time traffic and engagement data
- 🎯 **SEO Optimization**: Automated meta tags and structured data

### Community & Engagement
- 💬 **Comment System**: Moderated discussions on articles
- 📧 **Newsletter System**: Automated newsletter generation and delivery
- 🔔 **Notifications**: Push notifications for breaking news
- 🔗 **Social Integration**: Share buttons and social login

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Context + Zustand

### Backend
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: Redis
- **Jobs**: BullMQ

### AI & Content
- **Content Generation**: OpenAI GPT-5 mini (default) with optional Anthropic fallback
- **Images**: Unsplash API
- **Embeddings**: OpenAI

### Infrastructure
- **Hosting**: Netlify
- **CDN**: Netlify CDN
- **Monitoring**: Netlify Analytics + Sentry
- **Email**: Resend
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 15+
- Redis (optional, for caching and background jobs)
- Docker and Docker Compose (recommended for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your API keys:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_tech_blog"

   # NextAuth
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"

   # AI
   OPENAI_API_KEY="your-openai-api-key"
   ANTHROPIC_API_KEY="your-anthropic-api-key" # optional fallback for batch tools

   # Unsplash (optional)
   UNSPLASH_ACCESS_KEY="your-unsplash-key"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Start the database (using Docker)**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Create a new migration
npm run db:migrate

# Push schema changes without migration
npm run db:push

# Seed the database
npm run db:seed
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
AI-Tools/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── admin/            # Admin dashboard
│   │   ├── api/              # API routes
│   │   └── (public)/         # Public pages
│   ├── components/           # React components
│   │   ├── layout/          # Layout components
│   │   ├── sections/        # Page sections
│   │   └── ui/              # UI components (shadcn)
│   └── lib/                 # Utilities and libraries
│       ├── ai/              # AI content generation
│       ├── db.ts            # Database client
│       ├── env.ts           # Environment variables
│       └── utils.ts         # Utility functions
├── public/                  # Static assets
└── ...config files
```

## Key Features Implementation

### AI Content Generation

The platform uses Claude AI to generate high-quality tech content:

```typescript
import { generateArticle } from '@/lib/ai/content-generator'

const article = await generateArticle({
  type: 'REVIEW',
  topic: 'iPhone 15 Pro Max',
  specifications: 'A17 Pro chip, 48MP camera...'
})
```

### Editorial Dashboard

Access the admin dashboard at `/admin`:
- Dashboard overview with stats
- AI content generator at `/admin/generate`
- Post management at `/admin/posts`
- Analytics at `/admin/analytics`

### Content Types

The platform supports multiple content types:
- **NEWS**: Breaking tech news and updates
- **REVIEW**: Detailed product reviews
- **GUIDE**: How-to guides and tutorials
- **COMPARISON**: Side-by-side product comparisons
- **ROUNDUP**: "Best of" lists and awards
- **ARTICLE**: General tech articles

## API Endpoints

### Content Generation

```bash
POST /api/ai/generate
Content-Type: application/json

{
  "type": "REVIEW",
  "topic": "iPhone 15 Pro",
  "specifications": "A17 Pro, 48MP camera..."
}
```

### More API endpoints will be documented as they're implemented.

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `OPENAI_API_KEY`: OpenAI API key for GPT-5-mini content generation

### Optional Variables
- `ANTHROPIC_API_KEY`: Claude AI API key (fallback for batch tools)
- `UNSPLASH_ACCESS_KEY`: For image sourcing
- `STRIPE_SECRET_KEY`: For payments
- `RESEND_API_KEY`: For email
- `REDIS_URL`: For caching

## Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Import project in Netlify
3. Add environment variables
4. Deploy!

### Docker

```bash
# Build the image
docker build -t ai-tech-blog .

# Run the container
docker run -p 3000:3000 ai-tech-blog
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and design decisions
- **[FEATURES.md](./FEATURES.md)**: Complete feature list and capabilities
- **[SETUP.md](./SETUP.md)**: Detailed setup and configuration guide

## Roadmap

### Phase 1: Foundation (Completed)
- ✅ Project setup and architecture
- ✅ Database schema and models
- ✅ AI content generation system
- ✅ Basic editorial dashboard
- ✅ Homepage and layout

### Phase 2: Core Features (In Progress)
- [ ] Advanced bento/grid layout
- [ ] Search functionality
- [ ] User authentication
- [ ] Comment system
- [ ] Newsletter system

### Phase 3: Monetization
- [ ] Ad placement system
- [ ] Affiliate link tracking
- [ ] Stripe integration
- [ ] Premium content gating

### Phase 4: Advanced Features
- [ ] Personalization engine
- [ ] Advanced analytics
- [ ] Mobile app (PWA)
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

See LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Unsplash](https://unsplash.com/)

---

**Note**: This is a comprehensive AI-powered blog platform. Make sure to review and configure all features according to your needs and compliance requirements.

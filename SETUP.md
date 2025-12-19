# Setup Guide

Complete guide to setting up the AI Tech Blog Platform for development and production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [API Keys Setup](#api-keys-setup)
6. [Running the Application](#running-the-application)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js 18+**: [Download](https://nodejs.org/)
- **npm, yarn, or pnpm**: Comes with Node.js
- **Git**: [Download](https://git-scm.com/)
- **Docker & Docker Compose**: [Download](https://www.docker.com/) (recommended)

### Optional but Recommended

- **VS Code**: [Download](https://code.visualstudio.com/)
- **PostgreSQL 15+**: If not using Docker
- **Redis**: If not using Docker

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Tools
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Start Database Services

Using Docker (recommended):

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

Verify services are running:

```bash
docker-compose ps
```

### 4. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

## Environment Configuration

Edit `.env` and configure the following sections:

### Database

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_tech_blog?schema=public"
```

### NextAuth

Generate a secret:

```bash
openssl rand -base64 32
```

Then add to `.env`:

```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Application URLs

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="AI Tech Blog"
```

## API Keys Setup

### Required: OpenAI API (GPT-5-mini)

1. Sign up at [https://platform.openai.com/](https://platform.openai.com/)
2. Create an API key
3. Add to `.env`:

```env
OPENAI_API_KEY="sk-your-openai-key"
```

### Optional: Anthropic Claude API (fallback for batch tools)

1. Sign up at [https://console.anthropic.com/](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env`:

```env
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

### Optional: Unsplash API

For image sourcing:

1. Sign up at [https://unsplash.com/developers](https://unsplash.com/developers)
2. Create an application
3. Get your access key
4. Add to `.env`:

```env
UNSPLASH_ACCESS_KEY="your-access-key"
UNSPLASH_SECRET_KEY="your-secret-key"
```

### Optional: Stripe API

For payments and subscriptions:

1. Sign up at [https://stripe.com/](https://stripe.com/)
2. Get your API keys from the dashboard
3. Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### Optional: Resend API

For email functionality:

1. Sign up at [https://resend.com/](https://resend.com/)
2. Create an API key
3. Add to `.env`:

```env
RESEND_API_KEY="re_your-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Optional: OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth credentials
4. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Add to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

#### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth app
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env`:

```env
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

## Database Setup

### Run Migrations

Initialize the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Set up relationships and indexes
- Generate the Prisma Client

### Generate Prisma Client

```bash
npx prisma generate
```

### Seed the Database (Optional)

Add sample data:

```bash
npm run db:seed
```

### Access Prisma Studio

To view and edit database data in a GUI:

```bash
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555`

## Running the Application

### Development Mode

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js

3. **Configure Environment Variables**

Add all environment variables from `.env` in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable (excluding `DATABASE_URL` for now)

4. **Set Up Database**

Option A: Use Vercel Postgres
```bash
vercel postgres create
```

Option B: Use external PostgreSQL (Railway, Supabase, etc.)
- Create database
- Add `DATABASE_URL` to Vercel environment variables

5. **Deploy**

```bash
vercel --prod
```

### Docker Deployment

Build the Docker image:

```bash
docker build -t ai-tech-blog .
```

Run the container:

```bash
docker run -p 3000:3000 --env-file .env ai-tech-blog
```

### Railway Deployment

1. Install Railway CLI:

```bash
npm i -g @railway/cli
```

2. Login and initialize:

```bash
railway login
railway init
```

3. Add PostgreSQL:

```bash
railway add -p postgresql
```

4. Deploy:

```bash
railway up
```

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"

Solution:
```bash
# Check if Docker containers are running
docker-compose ps

# Restart containers
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Prisma Client Issues

**Error**: "PrismaClient is unable to be run in the browser"

Solution:
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

### API Key Issues

**Error**: "Invalid API key" or "Unauthorized"

Solution:
1. Verify API key in `.env` is correct
2. Ensure no extra spaces or quotes
3. Restart development server after changing `.env`
4. Check API key has proper permissions

### Module Not Found Errors

**Error**: "Module not found: Can't resolve '@/...' "

Solution:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify tsconfig.json paths are correct
```

### Build Errors

**Error**: Type errors during build

Solution:
```bash
# Run type checking
npm run type-check

# Fix errors and rebuild
npm run build
```

### Port Already in Use

**Error**: "Port 3000 is already in use"

Solution:
```bash
# Find and kill process on port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
PORT=3001 npm run dev
```

## Development Tips

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Error Translator

### Hot Reload Issues

If hot reload isn't working:

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Database Reset

To completely reset the database:

```bash
# Drop all tables
npx prisma migrate reset

# Rerun migrations
npx prisma migrate dev

# Reseed
npm run db:seed
```

## Next Steps

After successful setup:

1. **Explore the Admin Dashboard**: Visit `/admin` to see editorial features
2. **Generate Content**: Use `/admin/generate` to create AI-powered articles
3. **Customize Styling**: Edit `src/app/globals.css` and Tailwind config
4. **Add Content**: Create categories, tags, and your first posts
5. **Configure Features**: Enable/disable features in settings

## Support

If you encounter issues not covered here:

1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Read the [full documentation](./README.md)
3. Join our community Discord
4. Email support@example.com

---

Happy coding! 🚀

# SocialMuse Deployment Guide

This guide covers deploying SocialMuse in various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 14+
- **Redis** 7+
- **Docker** (optional, recommended)

### Required API Keys

Before deployment, obtain API keys for:

1. **OpenAI** - For GPT-4 content generation
2. **Anthropic** - For Claude AI
3. **Social Platforms** - Meta, Twitter, LinkedIn, TikTok, etc.
4. **Optional Services** - ElevenLabs, DALL-E, Stripe, etc.

## Development Setup

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**

```bash
git clone <repository-url>
cd AI-Tools
```

2. **Set up environment variables**

```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and add your API keys
nano backend/.env
```

3. **Start services**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 3000

4. **Run database migrations**

```bash
docker-compose exec backend npx prisma migrate dev
```

5. **Seed database (optional)**

```bash
docker-compose exec backend npm run db:seed
```

6. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

### Option 2: Manual Setup

1. **Install PostgreSQL**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15
sudo systemctl start postgresql
```

2. **Install Redis**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

3. **Create database**

```bash
psql postgres
CREATE DATABASE socialmuse;
CREATE USER socialmuse WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE socialmuse TO socialmuse;
\q
```

4. **Backend setup**

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

5. **Frontend setup**

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env

# Start development server
npm run dev
```

## Production Deployment

### Option 1: Traditional VPS (Ubuntu/Debian)

#### 1. Server Setup

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Redis
sudo apt-get install -y redis-server

# Install Nginx
sudo apt-get install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Database Setup

```bash
sudo -u postgres psql
CREATE DATABASE socialmuse;
CREATE USER socialmuse WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE socialmuse TO socialmuse;
\q
```

#### 3. Application Deployment

```bash
# Clone repository
cd /var/www
sudo git clone <repository-url> socialmuse
cd socialmuse

# Backend setup
cd backend
sudo npm install --production
sudo cp .env.example .env
# Edit .env with production values
sudo nano .env

# Run migrations
sudo npx prisma migrate deploy

# Build
sudo npm run build

# Start with PM2
pm2 start dist/index.js --name socialmuse-api

# Frontend setup
cd ../frontend
sudo npm install --production
sudo cp .env.example .env
# Edit .env
sudo nano .env

# Build
sudo npm run build

# Start with PM2
pm2 start npm --name socialmuse-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/socialmuse
```

```nginx
# API Server
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/socialmuse /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 5. SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### Option 2: AWS Deployment

#### Architecture

- **EC2**: Application servers
- **RDS**: PostgreSQL database
- **ElastiCache**: Redis
- **S3**: File storage
- **CloudFront**: CDN
- **ALB**: Load balancer

#### Steps

1. **Create RDS PostgreSQL instance**

```bash
aws rds create-db-instance \
  --db-instance-identifier socialmuse-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username socialmuse \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx
```

2. **Create ElastiCache Redis cluster**

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id socialmuse-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

3. **Create S3 bucket**

```bash
aws s3 mb s3://socialmuse-assets
aws s3api put-bucket-cors --bucket socialmuse-assets --cors-configuration file://cors.json
```

4. **Launch EC2 instances**

Use the VPS deployment steps above on EC2 instances.

5. **Set up Application Load Balancer**

- Create target groups for frontend and backend
- Configure health checks
- Set up listeners (HTTP/HTTPS)
- Attach EC2 instances

6. **Configure Auto Scaling** (optional)

Create Auto Scaling group for automatic scaling based on load.

### Option 3: Docker Deployment

1. **Build production images**

```bash
# Backend
cd backend
docker build -t socialmuse-backend:latest -f Dockerfile.prod .

# Frontend
cd frontend
docker build -t socialmuse-frontend:latest -f Dockerfile.prod .
```

2. **Use production docker-compose**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: socialmuse-backend:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_HOST: redis
    restart: always
    depends_on:
      - postgres
      - redis

  frontend:
    image: socialmuse-frontend:latest
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    restart: always
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

## Environment Variables

### Backend (.env)

```env
# Application
NODE_ENV=production
PORT=3001
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/socialmuse

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
ENCRYPTION_KEY=your-encryption-key-32-characters

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Social Media (configure as needed)
META_APP_ID=...
META_APP_SECRET=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=socialmuse-assets

# Monitoring
SENTRY_DSN=...
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=SocialMuse
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Database Migrations

### Development

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Production

```bash
# Deploy migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Monitoring & Maintenance

### Health Checks

Monitor these endpoints:
- API Health: `https://api.yourdomain.com/health`
- Database connection
- Redis connection

### Logs

```bash
# PM2 logs
pm2 logs socialmuse-api
pm2 logs socialmuse-frontend

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backups

#### Database Backup

```bash
# Manual backup
pg_dump -h localhost -U socialmuse socialmuse > backup.sql

# Automated backup (cron)
0 2 * * * pg_dump -h localhost -U socialmuse socialmuse > /backups/socialmuse-$(date +\%Y\%m\%d).sql
```

#### Restore Database

```bash
psql -h localhost -U socialmuse socialmuse < backup.sql
```

## Performance Optimization

### Database

```sql
-- Create indexes
CREATE INDEX idx_posts_scheduled ON posts(scheduled_for) WHERE status = 'SCHEDULED';
CREATE INDEX idx_posts_brand ON posts(brand_id);
CREATE INDEX idx_analytics_date ON analytics(date);
```

### Redis Caching

```typescript
// Cache frequently accessed data
await redis.setex(`brand:${brandId}`, 3600, JSON.stringify(brand));
```

### CDN Configuration

Upload static assets to S3 and serve via CloudFront for optimal performance.

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql postgresql://user:password@host:5432/socialmuse

# Test Redis connection
redis-cli -h host -p 6379 ping
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 PID
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER /var/www/socialmuse
```

### Database Migration Errors

```bash
# Check migration status
npx prisma migrate status

# Resolve conflicts
npx prisma migrate resolve --applied "migration_name"
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (UFW or security groups)
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup automation
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Database access restricted

## Support

For deployment issues:
- Check logs: `pm2 logs` or `docker-compose logs`
- Review environment variables
- Verify database connectivity
- Check firewall rules
- Review Nginx error logs: `/var/log/nginx/error.log`

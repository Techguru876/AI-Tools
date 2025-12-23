# TechBlog USA - Cloudflare Deployment Guide

## Overview
This Next.js application is deployed to **Cloudflare Workers** (NOT Pages) using **OpenNext**.

## Architecture
```
Next.js App → OpenNext Build → Cloudflare Worker + Static Assets
                                     ↓
                              R2 Bucket (cache)
                                     ↓
                              Custom Domains:
                              - techblogusa.com
                              - www.techblogusa.com
```

## Key Files
- `wrangler.toml` - Cloudflare Worker configuration
- `.open-next/` - Build output directory (generated)
- `package.json` - Contains `cf:build` and `cf:deploy` scripts

## Deployment Commands
```bash
# Build for Cloudflare
npm run cf:build

# Deploy to production
npx wrangler deploy
```

## Critical Configuration (wrangler.toml)
```toml
name = "techblogusa"
main = ".open-next/worker.js"           # MUST point to worker.js
compatibility_flags = ["nodejs_compat"]
workers_dev = false                      # Use custom domains only

[[routes]]
pattern = "techblogusa.com"
zone_name = "techblogusa.com"
custom_domain = true

[assets]
directory = ".open-next/assets"          # Static files

[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"     # Required for OpenNext
bucket_name = "techblogusa-cache"
```

## Common Issues & Fixes

### Images Return 404
**Cause**: Site deployed as static Pages instead of Worker
**Fix**: Ensure `main = ".open-next/worker.js"` is in wrangler.toml and deploy with `npx wrangler deploy`

### R2 Bucket Error During Deploy
**Cause**: Missing R2 bucket binding
**Fix**: Create bucket with `npx wrangler r2 bucket create techblogusa-cache` and add `[[r2_buckets]]` to wrangler.toml

### Build Succeeds But Deployment Missing
**Cause**: Using `wrangler pages deploy` instead of `wrangler deploy`
**Fix**: For OpenNext, always use `npx wrangler deploy` (not pages deploy)

### Custom Domains Not Working
**Cause**: Wildcards in route patterns
**Fix**: Use `pattern = "techblogusa.com"` without `/*` suffix

## Environment Variables
Set these in Cloudflare Dashboard → Workers → techblogusa → Settings → Variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `OPENAI_API_KEY` - For AI content generation
- `UNSPLASH_ACCESS_KEY` - For cover images

## Image Handling
The Worker intercepts `/cdn-cgi/image/` requests and proxies images from Unsplash. This bypasses the need for Cloudflare's paid Image Resizing add-on.

## Local Development
```bash
npm run dev          # Standard Next.js dev server on port 1010
npm run cf:preview   # Test Cloudflare Worker locally
```

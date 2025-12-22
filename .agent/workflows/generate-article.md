---
description: Generate a single AI article via the admin UI
---

# Generate Article Workflow

This workflow creates a single article by interacting with the admin UI, mimicking human steps.

## Prerequisites

- Dev server running on `http://localhost:3000` (or production URL)
- OpenAI API key configured in `.env.local`

## Steps

### 1. Navigate to Admin Generate Page

Open the browser and navigate to `/admin/generate`.

### 2. Select Content Type

Click one of: **NEWS**, **REVIEW**, or **FEATURE**

Common choices:
- `NEWS` - For breaking news and updates
- `REVIEW` - For product reviews  
- `FEATURE` - For in-depth feature articles

### 3. Enter Topic

Type the article topic in the "Topic / Title" input field.

Example topics:
- "Best AI Coding Assistants 2025"
- "iPhone 17 Pro Review"
- "Microsoft Copilot December 2025 Update"

### 4. Enter Additional Context (Optional)

Add specific details in the "Additional Context" textarea:
- Key features to mention
- Competitors to compare
- Technical specifications

### 5. Select Category

Choose from the dropdown:
- `tech` - General technology
- `ai-news` - AI and ML news
- `reviews` - Product reviews
- `gaming` - Gaming content
- `deals` - Deals and sales

### 6. Click Generate

Click the **"Generate Article"** button. Wait 30-60 seconds for AI to generate content.

### 7. Review the Preview

The generated article appears in the right panel. Check:
- Title is compelling
- Word count ≥ 1800 (shown in green if met)
- Content quality and accuracy

### 8. Publish or Save to Queue

Click **"Publish to Website"** to publish immediately.

Or navigate to `/admin/review` to find it in the review queue for later editing.

## Return Conditions

- **Success**: Article appears in preview with "Publish" button available
- **Failure**: Error message appears or no content generated after 90 seconds

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `topic` | Article topic/title | Required |
| `type` | NEWS, REVIEW, or FEATURE | NEWS |
| `category` | Category slug | tech |
| `context` | Additional details | Optional |
| `publish` | Publish immediately or save to queue | false |

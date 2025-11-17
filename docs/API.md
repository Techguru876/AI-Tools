# SocialMuse API Documentation

Base URL: `https://api.socialmuse.ai/api` (or `http://localhost:3001/api` for development)

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

## Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "BRAND_OWNER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "role": "BRAND_OWNER"
    }
  }
}
```

### Change Password

```http
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

## AI Endpoints

### Generate Content

```http
POST /ai/generate-content
Authorization: Bearer {token}
Content-Type: application/json

{
  "brandId": "brand_id",
  "prompt": "Create a post about our new coffee blend",
  "platform": "INSTAGRAM",
  "contentType": "post",
  "tone": "friendly"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "content": "☕ Introducing our newest blend! A perfect harmony of...",
    "model": "claude-3-5-sonnet",
    "tokens": 245
  }
}
```

### Generate Hashtags

```http
POST /ai/generate-hashtags
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "coffee roasting",
  "brandId": "brand_id",
  "count": 10
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "hashtags": [
      "#CoffeeRoasting",
      "#SpecialtyCoffee",
      "#CoffeeLover",
      "#FreshRoasted",
      "#CoffeeTime"
    ],
    "model": "gpt-4-turbo"
  }
}
```

### Generate Image

```http
POST /ai/generate-image
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "A steaming cup of coffee on a wooden table, morning light",
  "brandId": "brand_id",
  "style": "professional photography",
  "size": "1024x1024"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "revisedPrompt": "An overhead view of a steaming cup...",
    "provider": "dalle"
  }
}
```

### Generate Video Script

```http
POST /ai/generate-video-script
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "How to brew the perfect espresso",
  "brandId": "brand_id",
  "duration": 60,
  "tone": "educational",
  "includeNarration": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "script": "[0:00] - VISUAL: Close-up of espresso machine\nNARRATION: The secret to perfect espresso...",
    "duration": 60,
    "model": "gpt-4-turbo"
  }
}
```

### Generate Post Ideas

```http
POST /ai/post-ideas
Authorization: Bearer {token}
Content-Type: application/json

{
  "brandId": "brand_id",
  "count": 5
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "ideas": [
      {
        "concept": "Behind-the-scenes look at our roasting process",
        "platform": ["Instagram", "TikTok"],
        "hashtags": ["#CoffeeRoasting", "#BehindTheScenes", "#SpecialtyCoffee"]
      }
    ],
    "model": "gpt-4-turbo"
  }
}
```

## Brand Endpoints

### Create Brand

```http
POST /brands
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org_id",
  "name": "Acme Coffee Co.",
  "description": "Artisanal coffee roasters since 2010",
  "tone": "friendly and authentic",
  "style": "warm and inviting",
  "colors": {
    "primary": "#6F4E37",
    "secondary": "#D4A574"
  },
  "targetAudience": {
    "age": "25-45",
    "interests": ["coffee", "sustainability", "quality"]
  },
  "location": "Seattle, WA",
  "timezone": "America/Los_Angeles"
}
```

### Get Brands

```http
GET /brands?organizationId={org_id}
Authorization: Bearer {token}
```

### Update Brand

```http
PUT /brands/{brand_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Brand Name",
  "tone": "professional"
}
```

### Delete Brand

```http
DELETE /brands/{brand_id}
Authorization: Bearer {token}
```

## Post Endpoints

### Create Post

```http
POST /posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "brandId": "brand_id",
  "campaignId": "campaign_id",
  "socialAccountId": "account_id",
  "type": "IMAGE",
  "caption": "Check out our new product! #NewRelease",
  "hashtags": ["#NewRelease", "#Product", "#Innovation"],
  "media": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "thumbnail": "https://example.com/thumb.jpg"
    }
  ],
  "scheduledFor": "2024-01-15T10:00:00Z",
  "timezone": "America/Los_Angeles"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "post": {
      "id": "post_id",
      "status": "SCHEDULED",
      "scheduledFor": "2024-01-15T10:00:00Z",
      "caption": "Check out our new product! #NewRelease",
      "createdAt": "2024-01-10T15:30:00Z"
    }
  }
}
```

### Get Posts

```http
GET /posts?brandId={brand_id}&status=SCHEDULED&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `brandId` - Filter by brand
- `campaignId` - Filter by campaign
- `status` - Filter by status (DRAFT, SCHEDULED, PUBLISHED, FAILED)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Update Post

```http
PUT /posts/{post_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "caption": "Updated caption",
  "scheduledFor": "2024-01-16T10:00:00Z"
}
```

### Delete Post

```http
DELETE /posts/{post_id}
Authorization: Bearer {token}
```

### Publish Post Now

```http
POST /posts/{post_id}/publish
Authorization: Bearer {token}
```

## Campaign Endpoints

### Create Campaign

```http
POST /campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org_id",
  "brandId": "brand_id",
  "name": "Q1 Product Launch",
  "description": "Launch campaign for new product line",
  "objective": "awareness",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-03-31T23:59:59Z"
}
```

### Get Campaigns

```http
GET /campaigns?brandId={brand_id}&status=active
Authorization: Bearer {token}
```

### Get Campaign Performance

```http
GET /campaigns/{campaign_id}/analytics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalPosts": 45,
    "impressions": 125000,
    "reach": 85000,
    "engagement": 5200,
    "clicks": 1200,
    "conversions": 85,
    "roi": 2.5
  }
}
```

## Analytics Endpoints

### Get Overview Analytics

```http
GET /analytics/overview?brandId={brand_id}&period=30d
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalPosts": 120,
    "totalEngagement": 15000,
    "totalReach": 250000,
    "totalImpressions": 380000,
    "engagementRate": 3.95,
    "topPost": {
      "id": "post_id",
      "caption": "...",
      "engagement": 850
    },
    "platformBreakdown": {
      "INSTAGRAM": {
        "posts": 50,
        "engagement": 8000
      },
      "FACEBOOK": {
        "posts": 40,
        "engagement": 4500
      }
    }
  }
}
```

### Get Post Analytics

```http
GET /analytics/posts/{post_id}
Authorization: Bearer {token}
```

### Get Competitor Analysis

```http
GET /analytics/competitors?brandId={brand_id}
Authorization: Bearer {token}
```

## Social Account Endpoints

### Connect Social Account

```http
POST /social-accounts/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "brandId": "brand_id",
  "platform": "INSTAGRAM",
  "accessToken": "platform_access_token",
  "accountId": "platform_account_id",
  "username": "acme_coffee"
}
```

### Get Social Accounts

```http
GET /social-accounts?brandId={brand_id}
Authorization: Bearer {token}
```

### Disconnect Social Account

```http
DELETE /social-accounts/{account_id}
Authorization: Bearer {token}
```

### Refresh Account Tokens

```http
POST /social-accounts/{account_id}/refresh
Authorization: Bearer {token}
```

## Workflow Endpoints

### Create Workflow Rule

```http
POST /workflows
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "org_id",
  "name": "Weather-Based Coffee Posts",
  "description": "Post about hot coffee when temperature drops",
  "triggerType": "WEATHER",
  "triggerConfig": {
    "location": "Seattle, WA",
    "condition": "temperature < 50"
  },
  "conditions": [
    {
      "type": "time",
      "value": "08:00-10:00"
    }
  ],
  "actions": [
    {
      "type": "CREATE_POST",
      "config": {
        "brandId": "brand_id",
        "template": "weather_cold_coffee",
        "platforms": ["INSTAGRAM", "FACEBOOK"]
      }
    }
  ]
}
```

### Get Workflows

```http
GET /workflows?organizationId={org_id}&isActive=true
Authorization: Bearer {token}
```

### Toggle Workflow

```http
PUT /workflows/{workflow_id}/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

### Get Workflow Executions

```http
GET /workflows/{workflow_id}/executions?page=1&limit=20
Authorization: Bearer {token}
```

## Engagement Endpoints

### Get Comments

```http
GET /engagement/comments?brandId={brand_id}&status=NEW
Authorization: Bearer {token}
```

### Reply to Comment

```http
POST /engagement/comments/{comment_id}/reply
Authorization: Bearer {token}
Content-Type: application/json

{
  "replyText": "Thank you for your feedback!"
}
```

### Get Direct Messages

```http
GET /engagement/messages?brandId={brand_id}&platform=INSTAGRAM
Authorization: Bearer {token}
```

### Reply to DM

```http
POST /engagement/messages/{message_id}/reply
Authorization: Bearer {token}
Content-Type: application/json

{
  "replyText": "Hi! Thanks for reaching out..."
}
```

## Rate Limits

- **Authenticated requests**: 100 requests per 15 minutes per user
- **AI generation**: 20 requests per minute
- **Post publishing**: 50 posts per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Webhooks

SocialMuse can send webhooks for various events:

### Event Types

- `post.published` - When a post is successfully published
- `post.failed` - When post publishing fails
- `comment.received` - When a new comment is received
- `analytics.milestone` - When engagement milestones are reached
- `workflow.executed` - When a workflow is executed

### Webhook Payload

```json
{
  "event": "post.published",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "postId": "post_id",
    "platform": "INSTAGRAM",
    "platformPostId": "18012345678",
    "platformUrl": "https://instagram.com/p/..."
  }
}
```

### Webhook Signature

Verify webhook authenticity using the `X-Webhook-Signature` header:

```typescript
import crypto from 'crypto';

const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.socialmuse.ai/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Generate content
const response = await api.post('/ai/generate-content', {
  brandId: 'brand_id',
  prompt: 'Create a post about our coffee',
  platform: 'INSTAGRAM'
});

console.log(response.data.data.content);
```

### Python

```python
import requests

api_url = 'https://api.socialmuse.ai/api'
headers = {'Authorization': f'Bearer {token}'}

# Generate content
response = requests.post(
    f'{api_url}/ai/generate-content',
    headers=headers,
    json={
        'brandId': 'brand_id',
        'prompt': 'Create a post about our coffee',
        'platform': 'INSTAGRAM'
    }
)

data = response.json()
print(data['data']['content'])
```

## Support

For API support:
- Documentation: https://docs.socialmuse.ai
- Email: api@socialmuse.ai
- Status: https://status.socialmuse.ai

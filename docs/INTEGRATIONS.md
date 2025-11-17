# SocialMuse Integration Guide

This guide covers integrating SocialMuse with various third-party services and social media platforms.

## Table of Contents

- [Social Media Platforms](#social-media-platforms)
- [AI Services](#ai-services)
- [Storage Services](#storage-services)
- [Payment Processing](#payment-processing)
- [Communication Services](#communication-services)

## Social Media Platforms

### Instagram & Facebook (Meta)

#### 1. Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" and "Instagram Basic Display" products
4. Configure OAuth redirect URIs:
   - `https://yourdomain.com/auth/meta/callback`

#### 2. Get Credentials

```
App ID: Your Meta App ID
App Secret: Your Meta App Secret
```

#### 3. Configure Environment Variables

```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
```

#### 4. Required Permissions

- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_read_user_content`

#### 5. API Endpoints

**Post to Instagram**
```typescript
POST https://graph.facebook.com/v18.0/{ig-user-id}/media
Parameters:
  - image_url: URL of the image
  - caption: Post caption
  - access_token: User access token

POST https://graph.facebook.com/v18.0/{ig-user-id}/media_publish
Parameters:
  - creation_id: ID from previous call
  - access_token: User access token
```

**Get Instagram Insights**
```typescript
GET https://graph.facebook.com/v18.0/{ig-media-id}/insights
Parameters:
  - metric: engagement,impressions,reach,saved
  - access_token: User access token
```

### Twitter / X

#### 1. Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Generate API keys and tokens
4. Enable OAuth 2.0

#### 2. Get Credentials

```
API Key: Your Twitter API Key
API Secret: Your Twitter API Secret
Bearer Token: Your Bearer Token
```

#### 3. Configure Environment Variables

```env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

#### 4. API Endpoints

**Post Tweet**
```typescript
POST https://api.twitter.com/2/tweets
Headers:
  Authorization: Bearer {token}
Body:
  {
    "text": "Tweet content",
    "media": {
      "media_ids": ["media_id"]
    }
  }
```

**Get Tweet Metrics**
```typescript
GET https://api.twitter.com/2/tweets/{id}?tweet.fields=public_metrics
Headers:
  Authorization: Bearer {token}
```

### LinkedIn

#### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create new app
3. Add "Sign In with LinkedIn" and "Share on LinkedIn" products
4. Verify your app

#### 2. Get Credentials

```
Client ID: Your LinkedIn Client ID
Client Secret: Your LinkedIn Client Secret
```

#### 3. Configure Environment Variables

```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

#### 4. Required Scopes

- `r_liteprofile`
- `r_emailaddress`
- `w_member_social`

#### 5. API Endpoints

**Share Post**
```typescript
POST https://api.linkedin.com/v2/ugcPosts
Headers:
  Authorization: Bearer {token}
Body:
  {
    "author": "urn:li:person:{person_id}",
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": "Post content"
        },
        "shareMediaCategory": "NONE"
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  }
```

### TikTok

#### 1. Create TikTok App

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Register as a developer
3. Create a new app
4. Apply for Video Kit or Content Posting API access

#### 2. Get Credentials

```
Client Key: Your TikTok Client Key
Client Secret: Your TikTok Client Secret
```

#### 3. Configure Environment Variables

```env
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```

#### 4. Required Scopes

- `video.upload`
- `video.publish`
- `user.info.basic`

### YouTube

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials

#### 2. Get Credentials

```
Client ID: Your Google Client ID
Client Secret: Your Google Client Secret
API Key: Your Google API Key
```

#### 3. Configure Environment Variables

```env
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_API_KEY=your_api_key
```

#### 4. Upload Video

```typescript
POST https://www.googleapis.com/upload/youtube/v3/videos
Headers:
  Authorization: Bearer {token}
Parameters:
  part: snippet,status
Body (multipart):
  - Video file
  - Metadata JSON
```

## AI Services

### OpenAI (GPT-4, DALL-E)

#### 1. Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and add payment method
3. Generate API key

#### 2. Configure

```env
OPENAI_API_KEY=sk-...
```

#### 3. Usage Examples

**Generate Content**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: "You are a social media expert" },
    { role: "user", content: "Create an Instagram post about coffee" }
  ]
});
```

**Generate Image**
```typescript
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: "A coffee cup on a wooden table, professional photography",
  n: 1,
  size: "1024x1024"
});
```

### Anthropic (Claude)

#### 1. Get API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account
3. Generate API key

#### 2. Configure

```env
ANTHROPIC_API_KEY=sk-ant-...
```

#### 3. Usage Example

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Create a LinkedIn post about AI" }
  ]
});
```

### ElevenLabs (Voice Generation)

#### 1. Get API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Create account
3. Get API key from profile

#### 2. Configure

```env
ELEVENLABS_API_KEY=your_api_key
```

#### 3. Generate Voice

```typescript
const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}', {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Your narration text here",
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5
    }
  })
});

const audioBuffer = await response.arrayBuffer();
```

### Leonardo AI (Image Generation)

#### 1. Get API Key

1. Go to [Leonardo.AI](https://leonardo.ai/)
2. Create account
3. Get API key from settings

#### 2. Configure

```env
LEONARDO_API_KEY=your_api_key
```

#### 3. Generate Image

```typescript
// Generate image
const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Professional brand image",
    num_images: 1,
    width: 1024,
    height: 1024,
    modelId: "your_model_id"
  })
});

const data = await response.json();
const generationId = data.sdGenerationJob.generationId;

// Get generated images
const imagesResponse = await fetch(
  `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
  {
    headers: {
      'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
    }
  }
);
```

## Storage Services

### AWS S3

#### 1. Setup

1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 access
4. Generate access keys

#### 2. Configure

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=socialmuse-assets
```

#### 3. Usage

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload file
const uploadParams = {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `uploads/${filename}`,
  Body: fileBuffer,
  ContentType: mimeType,
  ACL: 'public-read'
};

const result = await s3.upload(uploadParams).promise();
const fileUrl = result.Location;
```

### Cloudinary

#### 1. Setup

1. Create [Cloudinary account](https://cloudinary.com/)
2. Get cloud name and API credentials

#### 2. Configure

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. Usage

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image
const result = await cloudinary.uploader.upload(filePath, {
  folder: 'socialmuse',
  transformation: [
    { width: 1080, height: 1080, crop: 'fill' }
  ]
});

const imageUrl = result.secure_url;
```

## Payment Processing

### Stripe

#### 1. Setup

1. Create [Stripe account](https://stripe.com/)
2. Get API keys from dashboard

#### 2. Configure

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. Create Subscription

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create customer
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name,
  metadata: {
    userId: user.id
  }
});

// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [
    { price: 'price_professional_monthly' }
  ],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent']
});
```

#### 4. Webhook Handling

```typescript
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      // Handle subscription created
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
  }

  res.json({ received: true });
});
```

## Communication Services

### Twilio (SMS)

#### 1. Setup

1. Create [Twilio account](https://www.twilio.com/)
2. Get Account SID and Auth Token
3. Get a phone number

#### 2. Configure

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### 3. Send SMS

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: 'Your post has been published!',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: userPhoneNumber
});
```

### SendGrid (Email)

#### 1. Setup

1. Create [SendGrid account](https://sendgrid.com/)
2. Create API key
3. Verify sender email/domain

#### 2. Configure

```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@socialmuse.ai
```

#### 3. Send Email

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Your SocialMuse Report',
  html: emailHtml,
  attachments: [
    {
      content: pdfBuffer.toString('base64'),
      filename: 'report.pdf',
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ]
});
```

## Testing Integrations

### Test Mode

Most services provide test/sandbox modes:

- **Stripe**: Use test API keys (sk_test_...)
- **Meta**: Use test users
- **Twitter**: Developer sandbox
- **OpenAI**: Separate API key with lower rate limits

### Integration Tests

```typescript
// Example integration test
describe('Instagram Integration', () => {
  it('should publish post to Instagram', async () => {
    const post = {
      caption: 'Test post',
      imageUrl: 'https://example.com/image.jpg'
    };

    const result = await instagramService.publishPost(
      testAccountId,
      post
    );

    expect(result.success).toBe(true);
    expect(result.postId).toBeDefined();
  });
});
```

## Rate Limits

Be aware of rate limits for each service:

- **Instagram**: 200 calls/hour per user
- **Twitter**: 300 tweets/3 hours
- **OpenAI**: Varies by tier (see pricing page)
- **LinkedIn**: 100 API calls per day (varies)

Implement exponential backoff and queuing to handle rate limits gracefully.

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Rotate keys regularly** - Especially for production
3. **Use separate keys** - Different keys for dev/staging/production
4. **Encrypt tokens** - Encrypt OAuth tokens in database
5. **Implement webhooks securely** - Verify webhook signatures
6. **Log API errors** - Monitor for suspicious activity
7. **Handle token refresh** - Implement automatic OAuth token refresh

## Support

For integration issues:
- Check service status pages
- Review API documentation
- Check rate limits and quotas
- Verify credentials are correct
- Test in sandbox/development mode first

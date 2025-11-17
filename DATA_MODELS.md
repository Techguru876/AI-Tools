# Data Models & Database Schema

## Database Strategy

### Primary Database: PostgreSQL

**Rationale:**
- Strong JSONB support for flexible metadata
- Excellent relational data modeling
- Full-text search capabilities
- ACID compliance for critical data
- Robust indexing and query optimization

### Complementary Databases

- **Redis**: Caching, sessions, job queues, real-time data
- **MongoDB**: Media metadata, logs, analytics events
- **S3/MinIO**: Media file storage (videos, images, audio)

---

## Core Database Schema

### Users & Authentication

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255), -- NULL for OAuth users
    full_name VARCHAR(255),
    avatar_url TEXT,

    -- Authentication
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,

    -- OAuth
    oauth_provider VARCHAR(50), -- google, github, etc
    oauth_id VARCHAR(255),

    -- MFA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    mfa_backup_codes JSONB,

    -- Subscription & Billing
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, business, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    subscription_expires_at TIMESTAMP,

    -- Usage Tracking
    videos_created INTEGER DEFAULT 0,
    videos_quota INTEGER DEFAULT 5, -- monthly quota
    storage_used_bytes BIGINT DEFAULT 0,
    storage_quota_bytes BIGINT DEFAULT 1073741824, -- 1GB default

    -- Preferences
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    refresh_token_hash VARCHAR(255),
    device_info JSONB, -- browser, OS, IP
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### Organizations & Teams (Multi-user Collaboration)

```sql
-- Organizations (workspaces)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE RESTRICT,

    -- Branding
    logo_url TEXT,
    brand_colors JSONB, -- {primary: "#xxx", secondary: "#xxx"}

    -- Subscription
    subscription_tier VARCHAR(50) DEFAULT 'team',
    seats_total INTEGER DEFAULT 5,
    seats_used INTEGER DEFAULT 1,

    -- Settings
    settings JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Organization members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, editor, viewer
    permissions JSONB DEFAULT '{}', -- granular permissions

    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
```

### Projects & Videos

```sql
-- Projects (container for videos)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Project type
    niche VARCHAR(100), -- tech, finance, health, entertainment, etc
    content_type VARCHAR(50), -- educational, entertaining, news, review, etc
    target_platform VARCHAR(50), -- youtube, tiktok, instagram, multi

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived

    -- Settings
    default_settings JSONB DEFAULT '{}', -- voice, style, brand assets

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Videos
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Content
    script TEXT,
    script_metadata JSONB, -- tone, style, word count, etc

    -- Generation status
    status VARCHAR(50) DEFAULT 'draft',
    -- draft, generating, ready, published, failed

    generation_progress INTEGER DEFAULT 0, -- 0-100
    generation_error TEXT,

    -- Rendering
    duration_seconds DECIMAL(10, 2),
    resolution VARCHAR(20), -- 1080p, 720p, 4k, etc
    aspect_ratio VARCHAR(20), -- 16:9, 9:16, 1:1, 4:5
    fps INTEGER DEFAULT 30,

    -- Files
    video_url TEXT, -- final rendered video
    thumbnail_url TEXT,
    preview_url TEXT, -- low-res preview

    -- SEO & Metadata
    seo_title VARCHAR(100),
    seo_description TEXT,
    tags TEXT[], -- array of tags
    keywords TEXT[],

    -- Publishing
    published_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    platforms JSONB DEFAULT '[]', -- [{platform: 'youtube', status: 'published', url: '...'}]

    -- Analytics reference
    analytics_id VARCHAR(255),

    -- Collaboration
    created_by UUID REFERENCES users(id),
    last_edited_by UUID REFERENCES users(id),

    -- Version control
    version INTEGER DEFAULT 1,
    parent_video_id UUID REFERENCES videos(id), -- for duplicates/versions

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_videos_project_id ON videos(project_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_scheduled_for ON videos(scheduled_for);
CREATE INDEX idx_videos_tags ON videos USING GIN(tags);
```

### Scenes & Timeline

```sql
-- Scenes (timeline segments)
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

    -- Position
    order_index INTEGER NOT NULL,

    -- Timing
    start_time DECIMAL(10, 3) NOT NULL, -- seconds with milliseconds
    end_time DECIMAL(10, 3) NOT NULL,
    duration DECIMAL(10, 3) GENERATED ALWAYS AS (end_time - start_time) STORED,

    -- Content
    script_text TEXT,
    scene_type VARCHAR(50), -- intro, main, outro, transition

    -- Visual
    background_type VARCHAR(50), -- stock-video, stock-image, ai-generated, upload, color
    background_url TEXT,
    background_metadata JSONB,

    -- Overlays & Effects
    overlays JSONB DEFAULT '[]', -- text, images, graphics
    effects JSONB DEFAULT '[]', -- transitions, filters, animations

    -- Audio
    voice_text TEXT, -- text to be spoken (can differ from script)
    voice_url TEXT, -- generated audio file
    voice_settings JSONB, -- voice ID, speed, pitch, etc

    -- Avatar (if using talking head)
    avatar_enabled BOOLEAN DEFAULT FALSE,
    avatar_id VARCHAR(255),
    avatar_settings JSONB,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenes_video_id ON scenes(video_id);
CREATE INDEX idx_scenes_order ON scenes(video_id, order_index);
```

### Assets Library

```sql
-- Media assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- File info
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- video, image, audio, font, etc
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,

    -- Storage
    storage_provider VARCHAR(50), -- s3, cloudflare-r2, local
    storage_path TEXT NOT NULL,
    storage_url TEXT,

    -- Asset type
    asset_type VARCHAR(50), -- upload, stock, ai-generated, brand
    source VARCHAR(100), -- pexels, unsplash, dall-e, user-upload
    source_id VARCHAR(255), -- external ID for attribution

    -- Metadata
    metadata JSONB DEFAULT '{}', -- dimensions, duration, codec, etc
    tags TEXT[],

    -- Branding (for brand assets)
    is_brand_asset BOOLEAN DEFAULT FALSE,
    brand_asset_type VARCHAR(50), -- logo, intro, outro, overlay, watermark

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_org_id ON assets(organization_id);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX idx_assets_brand ON assets(is_brand_asset) WHERE is_brand_asset = TRUE;
```

### Templates

```sql
-- Video templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,

    -- Visibility
    visibility VARCHAR(50) DEFAULT 'private', -- private, organization, public, marketplace
    is_official BOOLEAN DEFAULT FALSE, -- created by platform

    -- Category
    category VARCHAR(100), -- tutorial, news, review, story, etc
    niche VARCHAR(100),

    -- Template content
    template_data JSONB NOT NULL,
    -- {
    --   scenes: [...],
    --   defaultSettings: {...},
    --   variables: [{name: 'title', type: 'text', default: '...'}]
    -- }

    -- Usage
    usage_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,

    -- Marketplace (if selling)
    price_cents INTEGER DEFAULT 0, -- 0 for free

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_templates_visibility ON templates(visibility);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_created_by ON templates(created_by);
```

### AI & Content Generation

```sql
-- AI generation history
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

    -- Generation type
    generation_type VARCHAR(50), -- script, voice, image, avatar, suggestions

    -- Input
    prompt TEXT,
    input_data JSONB,

    -- AI Service
    provider VARCHAR(50), -- openai, anthropic, elevenlabs, etc
    model VARCHAR(100),

    -- Output
    result TEXT,
    result_data JSONB,
    result_url TEXT,

    -- Costs
    tokens_used INTEGER,
    cost_cents DECIMAL(10, 4),

    -- Performance
    duration_ms INTEGER,

    -- Status
    status VARCHAR(50), -- pending, completed, failed
    error_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_video_id ON ai_generations(video_id);
CREATE INDEX idx_ai_generations_type ON ai_generations(generation_type);

-- Niche research & trends
CREATE TABLE niche_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    niche VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,

    -- Trend data
    trend_score DECIMAL(5, 2), -- 0-100
    trend_direction VARCHAR(20), -- rising, stable, declining

    -- Metrics
    search_volume INTEGER,
    competition_score DECIMAL(3, 2), -- 0-1
    engagement_rate DECIMAL(5, 2),

    -- Recommendations
    recommended_keywords TEXT[],
    recommended_titles JSONB,

    -- Source
    data_source VARCHAR(50), -- youtube, google-trends, tiktok

    -- Freshness
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- cache expiration
);

CREATE INDEX idx_niche_trends_niche ON niche_trends(niche);
CREATE INDEX idx_niche_trends_score ON niche_trends(trend_score DESC);
CREATE INDEX idx_niche_trends_analyzed_at ON niche_trends(analyzed_at);
```

### Publishing & Scheduling

```sql
-- Publication records
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

    -- Platform
    platform VARCHAR(50), -- youtube, tiktok, instagram, twitter, facebook
    platform_video_id VARCHAR(255),
    platform_url TEXT,

    -- Publication details
    published_title VARCHAR(255),
    published_description TEXT,
    published_tags TEXT[],

    -- Status
    status VARCHAR(50), -- scheduled, uploading, published, failed
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP,

    -- Results
    error_message TEXT,

    -- Platform-specific data
    platform_metadata JSONB, -- playlist, privacy, category, etc

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publications_video_id ON publications(video_id);
CREATE INDEX idx_publications_platform ON publications(platform);
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_scheduled ON publications(scheduled_for);

-- Platform credentials (encrypted)
CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    platform VARCHAR(50) NOT NULL,

    -- OAuth tokens (encrypted at application level)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,

    -- Account info
    platform_user_id VARCHAR(255),
    platform_username VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, expired, revoked

    -- Permissions
    scopes TEXT[],

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, platform),
    UNIQUE(organization_id, platform)
);

CREATE INDEX idx_platform_connections_user ON platform_connections(user_id);
CREATE INDEX idx_platform_connections_org ON platform_connections(organization_id);
```

### Analytics

```sql
-- Video analytics
CREATE TABLE video_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,

    -- Time period
    date DATE NOT NULL,

    -- Metrics
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    watch_time_seconds INTEGER DEFAULT 0,
    average_view_duration DECIMAL(10, 2),

    -- Engagement
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,

    -- Performance
    ctr DECIMAL(5, 2), -- click-through rate
    engagement_rate DECIMAL(5, 2),

    -- Demographics (aggregated from platform)
    demographics JSONB, -- age, gender, location

    -- Traffic sources
    traffic_sources JSONB, -- search, suggested, external, etc

    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(video_id, publication_id, date)
);

CREATE INDEX idx_analytics_video ON video_analytics(video_id, date DESC);
CREATE INDEX idx_analytics_publication ON video_analytics(publication_id);

-- A/B Testing
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    test_name VARCHAR(255) NOT NULL,

    -- Test setup
    test_type VARCHAR(50), -- thumbnail, title, description

    -- Variants
    variants JSONB NOT NULL,
    -- [
    --   {id: 'a', thumbnail: '...', title: '...'},
    --   {id: 'b', thumbnail: '...', title: '...'}
    -- ]

    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
    winner_variant_id VARCHAR(10),

    -- Time
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ab_test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant_id VARCHAR(10) NOT NULL,

    -- Metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5, 2),

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Job Queue (for async processing)

```sql
-- Background jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Job info
    job_type VARCHAR(100) NOT NULL, -- video-render, voice-generate, upload, etc
    job_data JSONB NOT NULL,

    -- References
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

    -- Priority
    priority INTEGER DEFAULT 5, -- 1-10, higher = more important

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    progress INTEGER DEFAULT 0, -- 0-100

    -- Processing
    worker_id VARCHAR(255),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Results
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_user ON jobs(user_id);
CREATE INDEX idx_jobs_priority ON jobs(priority DESC, created_at ASC);
```

### Audit Logs

```sql
-- Activity logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Action
    action VARCHAR(100) NOT NULL, -- create, update, delete, publish, etc
    resource_type VARCHAR(50), -- video, project, user, etc
    resource_id UUID,

    -- Details
    changes JSONB, -- {before: {...}, after: {...}}
    metadata JSONB, -- IP address, user agent, etc

    -- Context
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## MongoDB Collections (Analytics & Logs)

### Real-time Events

```javascript
// collection: video_events
{
  _id: ObjectId,
  videoId: UUID,
  userId: UUID,
  eventType: "view" | "like" | "share" | "comment",
  platform: "youtube" | "tiktok" | "instagram",
  metadata: {
    watchDuration: 45.5,
    location: "US-CA",
    device: "mobile",
    // ... platform-specific data
  },
  timestamp: ISODate
}

// Indexes
db.video_events.createIndex({ videoId: 1, timestamp: -1 })
db.video_events.createIndex({ userId: 1, timestamp: -1 })
db.video_events.createIndex({ eventType: 1, timestamp: -1 })
```

### Application Logs

```javascript
// collection: app_logs
{
  _id: ObjectId,
  level: "info" | "warn" | "error" | "debug",
  service: "api" | "media" | "ai" | "export",
  message: "Error rendering video",
  error: {
    stack: "...",
    code: "FFMPEG_ERROR"
  },
  context: {
    userId: UUID,
    videoId: UUID,
    requestId: UUID
  },
  timestamp: ISODate
}

// Indexes
db.app_logs.createIndex({ level: 1, timestamp: -1 })
db.app_logs.createIndex({ service: 1, timestamp: -1 })
db.app_logs.createIndex({ "context.userId": 1, timestamp: -1 })

// TTL Index (auto-delete after 30 days)
db.app_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 })
```

---

## Redis Data Structures

### Session Management

```redis
# Session data
SET session:{sessionId} "{userId, deviceInfo, expiresAt}" EX 86400

# User sessions (set of session IDs)
SADD user:{userId}:sessions {sessionId}
```

### Caching

```redis
# User data cache
SETEX user:{userId} 3600 "{...userData}"

# Video data cache
SETEX video:{videoId} 1800 "{...videoData}"

# Niche trends cache
SETEX trends:{niche} 43200 "{...trendsData}"

# AI generation results (temporary)
SETEX ai:result:{generationId} 600 "{...aiOutput}"
```

### Job Queues

```redis
# Job queue (using BullMQ convention)
LPUSH bull:video-render:waiting "{jobId, data}"
HSET bull:video-render:{jobId} "data" "{...}"
HSET bull:video-render:{jobId} "progress" "45"

# Priority queue
ZADD bull:video-render:priority {priority} {jobId}
```

### Rate Limiting

```redis
# API rate limiting (sliding window)
ZADD ratelimit:{userId}:api {timestamp} {requestId}
ZREMRANGEBYSCORE ratelimit:{userId}:api 0 {oldestValidTimestamp}
ZCARD ratelimit:{userId}:api # returns current count

# AI generation limits (daily)
INCR limit:{userId}:ai:script:daily EX 86400
INCR limit:{userId}:ai:voice:daily EX 86400
```

### Real-time Collaboration

```redis
# Active editors for a video
SADD video:{videoId}:editors {userId}
SETEX video:{videoId}:editor:{userId} 30 "active"

# Recent changes (pub/sub)
PUBLISH video:{videoId}:changes "{changeType, data, userId}"
```

---

## S3/MinIO Storage Structure

```
buckets/
├── user-uploads/
│   └── {userId}/
│       ├── images/
│       │   └── {assetId}.{ext}
│       ├── videos/
│       │   └── {assetId}.{ext}
│       └── audio/
│           └── {assetId}.{ext}
│
├── generated-videos/
│   └── {videoId}/
│       ├── final/
│       │   └── {videoId}_1080p.mp4
│       ├── preview/
│       │   └── {videoId}_preview.mp4
│       ├── thumbnails/
│       │   ├── {videoId}_thumb_1.jpg
│       │   └── {videoId}_thumb_2.jpg
│       └── scenes/
│           ├── scene_{sceneId}_video.mp4
│           └── scene_{sceneId}_audio.mp3
│
├── ai-generated/
│   ├── voices/
│   │   └── {generationId}.mp3
│   ├── images/
│   │   └── {generationId}.png
│   └── avatars/
│       └── {generationId}.mp4
│
├── brand-assets/
│   └── {organizationId}/
│       ├── logos/
│       ├── intros/
│       └── outros/
│
└── templates/
    └── {templateId}/
        ├── preview.mp4
        └── thumbnail.jpg
```

---

## Data Migration Strategy

### Version Control

```sql
-- Schema versions
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    description VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example migrations
-- v1: Initial schema
-- v2: Add organizations
-- v3: Add AI generations tracking
-- v4: Add analytics tables
```

### Backup Strategy

```yaml
Database Backups:
  PostgreSQL:
    - Automated daily backups (pg_dump)
    - Point-in-time recovery enabled
    - Retention: 30 days

  Redis:
    - RDB snapshots every 6 hours
    - AOF for durability
    - Retention: 7 days

  MongoDB:
    - Daily mongodump
    - Retention: 30 days

Media Storage:
  - S3 versioning enabled
  - Lifecycle policies (archive after 90 days)
  - Cross-region replication for critical assets
```

---

## Query Optimization Examples

### Common Queries

```sql
-- Get user's recent videos with pagination
SELECT v.*, p.name as project_name
FROM videos v
LEFT JOIN projects p ON v.project_id = p.id
WHERE v.user_id = $1
  AND v.deleted_at IS NULL
ORDER BY v.updated_at DESC
LIMIT 20 OFFSET $2;

-- Get video with all scenes
SELECT
  v.*,
  json_agg(
    json_build_object(
      'id', s.id,
      'orderIndex', s.order_index,
      'duration', s.duration,
      'scriptText', s.script_text,
      'backgroundUrl', s.background_url
    ) ORDER BY s.order_index
  ) as scenes
FROM videos v
LEFT JOIN scenes s ON s.video_id = v.id
WHERE v.id = $1
GROUP BY v.id;

-- Analytics dashboard query
SELECT
  DATE_TRUNC('day', va.date) as day,
  SUM(va.views) as total_views,
  SUM(va.watch_time_seconds) as total_watch_time,
  AVG(va.engagement_rate) as avg_engagement
FROM video_analytics va
JOIN videos v ON va.video_id = v.id
WHERE v.user_id = $1
  AND va.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## Data Retention Policies

```yaml
Hot Data (Frequently Accessed):
  - Active videos and projects: Indefinite
  - Recent analytics (90 days): PostgreSQL + Redis cache
  - User sessions: 30 days

Warm Data (Occasionally Accessed):
  - Video analytics > 90 days: PostgreSQL, no cache
  - Deleted videos (soft delete): 30 days before purge
  - Old audit logs: 1 year

Cold Data (Archival):
  - Video analytics > 1 year: Move to S3/data warehouse
  - Unused templates: Archive after 6 months
  - Application logs: 30 days (MongoDB TTL)

Purge Policies:
  - Hard delete soft-deleted records after 30 days
  - Remove expired sessions daily
  - Clean up failed jobs after 7 days
  - Remove temporary AI results after 24 hours
```

---

## Sample TypeScript Interfaces

```typescript
// User types
interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'pro' | 'business' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'expired';
  preferences: UserPreferences;
  createdAt: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultResolution: '720p' | '1080p' | '4k';
  defaultAspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  autoSave: boolean;
  notifications: NotificationSettings;
}

// Video types
interface Video {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  script?: string;
  status: VideoStatus;
  generationProgress: number;
  durationSeconds?: number;
  resolution: string;
  aspectRatio: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  scenes: Scene[];
  createdAt: Date;
  updatedAt: Date;
}

type VideoStatus = 'draft' | 'generating' | 'ready' | 'published' | 'failed';

interface Scene {
  id: string;
  videoId: string;
  orderIndex: number;
  startTime: number;
  endTime: number;
  scriptText?: string;
  sceneType: 'intro' | 'main' | 'outro' | 'transition';
  background: SceneBackground;
  overlays: Overlay[];
  voiceSettings?: VoiceSettings;
  avatarSettings?: AvatarSettings;
}

interface SceneBackground {
  type: 'stock-video' | 'stock-image' | 'ai-generated' | 'upload' | 'color';
  url?: string;
  metadata?: Record<string, any>;
}

interface VoiceSettings {
  voiceId: string;
  text: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // -20 to +20
  emotion?: string;
  language: string;
}

// Template types
interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  niche?: string;
  visibility: 'private' | 'organization' | 'public' | 'marketplace';
  templateData: TemplateData;
  usageCount: number;
  rating: number;
}

interface TemplateData {
  scenes: Partial<Scene>[];
  defaultSettings: DefaultSettings;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'color' | 'number';
  default: any;
  required: boolean;
}
```

This schema provides a robust foundation for the platform with proper indexing, relationships, and scalability considerations.

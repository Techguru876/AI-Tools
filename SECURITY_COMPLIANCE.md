# Security, Privacy, and Compliance

## Security Framework

### Authentication & Authorization

#### Multi-Factor Authentication (MFA)
```yaml
Implementation:
  - TOTP (Time-based One-Time Password)
  - SMS backup codes (optional)
  - Authenticator apps (Google Authenticator, Authy)
  - Backup codes for account recovery

Library:
  - speakeasy (TOTP generation)
  - qrcode (QR code generation)

Storage:
  - Encrypted MFA secrets in database
  - Hash backup codes with bcrypt
```

#### Password Security
```yaml
Requirements:
  - Minimum 12 characters
  - Must include uppercase, lowercase, number, special char
  - Check against common password lists
  - Password strength indicator

Hashing:
  - Algorithm: Argon2id (recommended) or bcrypt
  - Salt: Unique per password
  - Rounds: 12+ for bcrypt, tuned for Argon2id

Storage:
  - Never store plaintext passwords
  - Hash + salt in secure database field
  - Separate password reset tokens (time-limited)

Code Example:
```typescript
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}
```

#### Session Management
```yaml
JWT Tokens:
  - Access Token: Short-lived (15 minutes)
  - Refresh Token: Long-lived (7 days)
  - Signed with RS256 (asymmetric)

Token Storage:
  - Access token: Memory only (never localStorage)
  - Refresh token: HttpOnly cookie
  - CSRF protection for cookies

Session Tracking:
  - Store active sessions in Redis
  - Allow users to view/revoke sessions
  - Auto-logout on suspicious activity

Code Example:
```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_PRIVATE_KEY!,
    {
      algorithm: 'RS256',
      expiresIn: '15m',
      issuer: 'faceless-video-platform',
      audience: 'api'
    }
  );
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET!,
    {
      algorithm: 'HS256',
      expiresIn: '7d'
    }
  );
}
```

#### OAuth 2.0 Integration
```yaml
Providers:
  - Google
  - GitHub
  - Microsoft

Security Measures:
  - Use state parameter (CSRF protection)
  - Validate redirect URIs
  - Secure token storage
  - Regular token refresh

Implementation:
  - Library: next-auth or passport.js
  - PKCE for mobile apps
```

---

### API Security

#### Rate Limiting
```yaml
Strategy:
  - IP-based limits (DDoS protection)
  - User-based limits (abuse prevention)
  - Endpoint-specific limits

Limits:
  - Public endpoints: 100 req/15min per IP
  - Authenticated: 1000 req/hour per user
  - AI generation: 10 req/hour per user (free tier)
  - File uploads: 10 uploads/hour per user

Implementation:
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
});

// Stricter limit for AI endpoints
const aiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:ai:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Dynamic limit based on subscription tier
    return req.user?.subscriptionTier === 'pro' ? 100 : 10;
  }
});
```

#### Input Validation
```yaml
Validation Library:
  - Zod (TypeScript-first)
  - joi (alternative)

Rules:
  - Validate all user inputs
  - Sanitize HTML/SQL inputs
  - Type checking
  - Length limits
  - Format validation (email, URLs, etc.)

Example:
```typescript
import { z } from 'zod';

const createVideoSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .max(100, 'Title too long')
    .trim(),

  description: z.string()
    .max(5000, 'Description too long')
    .optional(),

  script: z.string()
    .min(50, 'Script too short')
    .max(50000, 'Script too long'),

  niche: z.enum([
    'tech', 'finance', 'health',
    'education', 'entertainment'
  ]),

  settings: z.object({
    resolution: z.enum(['720p', '1080p', '4k']),
    aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:5']),
    fps: z.number().int().min(24).max(60)
  })
});

// Usage in API route
app.post('/api/videos', async (req, res) => {
  try {
    const data = createVideoSchema.parse(req.body);
    // ... proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  }
});
```

#### SQL Injection Prevention
```yaml
Strategy:
  - Parameterized queries (always)
  - ORM usage (Prisma, TypeORM)
  - No raw SQL from user input
  - Least privilege database users

Example:
```typescript
// ❌ NEVER do this
const userId = req.params.id;
const sql = `SELECT * FROM users WHERE id = ${userId}`;
db.query(sql); // VULNERABLE!

// ✅ Always use parameterized queries
const userId = req.params.id;
const sql = 'SELECT * FROM users WHERE id = $1';
db.query(sql, [userId]); // Safe

// ✅ Better: Use ORM
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

#### XSS Protection
```yaml
Measures:
  - Content Security Policy (CSP)
  - Sanitize user-generated content
  - Escape output in templates
  - HttpOnly cookies

CSP Header:
```typescript
// Next.js middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.trusted.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.platform.com;
      media-src 'self' https://cdn.platform.com;
      frame-src 'none';
    `.replace(/\s+/g, ' ').trim()
  );

  return response;
}
```

#### CORS Configuration
```yaml
Settings:
  - Restrict allowed origins
  - Credentials: true (for cookies)
  - Specific allowed methods
  - Preflight caching

Implementation:
```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.platform.com',
      'https://www.platform.com'
    ];

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

---

### Data Protection

#### Encryption at Rest
```yaml
Database:
  - PostgreSQL: Transparent Data Encryption (TDE)
  - Encrypt sensitive columns (PII)
  - AWS RDS encryption enabled

S3 Storage:
  - Server-side encryption (SSE-S3)
  - Bucket policies for access control
  - Versioning enabled

Sensitive Data Encryption:
```typescript
import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Usage for storing OAuth tokens
const encryptionService = new EncryptionService();

await prisma.platformConnection.create({
  data: {
    userId: user.id,
    platform: 'youtube',
    accessTokenEncrypted: encryptionService.encrypt(accessToken),
    refreshTokenEncrypted: encryptionService.encrypt(refreshToken)
  }
});
```

#### Encryption in Transit
```yaml
TLS/SSL:
  - TLS 1.3 only (disable older versions)
  - Strong cipher suites
  - HSTS headers
  - Certificate pinning for mobile apps

Configuration:
```typescript
// HTTPS enforcement middleware
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// HSTS header
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});
```

#### Data Anonymization
```yaml
Strategies:
  - Remove PII from logs
  - Anonymize analytics data
  - Hash identifiable information
  - Data retention policies

Implementation:
```typescript
// Log sanitization
function sanitizeLog(data: any): any {
  const sensitiveFields = [
    'password', 'token', 'apiKey',
    'email', 'phone', 'ssn', 'creditCard'
  ];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveFields.some(field =>
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLog(sanitized[key]);
    }
  }

  return sanitized;
}

// Logger wrapper
logger.info('User action', sanitizeLog({
  userId: user.id,
  email: user.email, // Will be redacted
  action: 'video_created'
}));
```

---

### Access Control

#### Role-Based Access Control (RBAC)
```yaml
Roles:
  - Owner: Full control
  - Admin: Manage users, settings
  - Editor: Create/edit content
  - Viewer: Read-only access

Permissions:
  - videos.create
  - videos.edit
  - videos.delete
  - videos.publish
  - projects.manage
  - org.manage_users
  - org.manage_billing
  - analytics.view

Implementation:
```typescript
// Permission matrix
const rolePermissions = {
  owner: ['*'], // All permissions
  admin: [
    'videos.*',
    'projects.*',
    'org.manage_users',
    'analytics.view'
  ],
  editor: [
    'videos.create',
    'videos.edit',
    'videos.publish',
    'projects.view',
    'analytics.view'
  ],
  viewer: [
    'videos.view',
    'projects.view',
    'analytics.view'
  ]
};

// Permission check middleware
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const userRole = req.user.role;
    const permissions = rolePermissions[userRole];

    // Check for wildcard or specific permission
    const hasPermission =
      permissions.includes('*') ||
      permissions.includes(permission) ||
      permissions.some(p =>
        p.endsWith('.*') &&
        permission.startsWith(p.slice(0, -2))
      );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Usage
app.delete(
  '/api/videos/:id',
  authenticate,
  requirePermission('videos.delete'),
  deleteVideoHandler
);
```

#### Audit Logging
```yaml
Events to Log:
  - User authentication (login, logout, failed attempts)
  - Permission changes
  - Data modifications (create, update, delete)
  - Configuration changes
  - File uploads/downloads
  - API access

Log Format:
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    requestId: string;
  };
  success: boolean;
  errorMessage?: string;
}

// Audit logging middleware
async function auditLog(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.id
      },
      success: true
    }
  });
}
```

---

## Privacy Compliance

### GDPR (General Data Protection Regulation)

#### Requirements
```yaml
Data Subject Rights:
  - Right to access (data export)
  - Right to rectification (data correction)
  - Right to erasure (data deletion)
  - Right to data portability
  - Right to object
  - Right to withdraw consent

Implementation Timeline:
  - Data access request: 30 days
  - Data deletion request: 30 days
  - Data portability: 30 days
```

#### Implementation
```typescript
// GDPR endpoints
app.get('/api/gdpr/export', authenticate, async (req, res) => {
  const userId = req.user.id;

  // Gather all user data
  const userData = {
    profile: await prisma.user.findUnique({ where: { id: userId } }),
    videos: await prisma.video.findMany({ where: { userId } }),
    projects: await prisma.project.findMany({ where: { userId } }),
    assets: await prisma.asset.findMany({ where: { userId } }),
    analytics: await getAnalyticsData(userId),
    auditLogs: await prisma.auditLog.findMany({ where: { userId } })
  };

  // Create ZIP file
  const zip = await createDataExportZip(userData);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=my-data.zip');
  res.send(zip);
});

app.delete('/api/gdpr/delete-account', authenticate, async (req, res) => {
  const userId = req.user.id;

  // Anonymize or delete data
  await prisma.$transaction([
    // Anonymize user data
    prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        fullName: '[Deleted User]',
        avatarUrl: null,
        deletedAt: new Date()
      }
    }),

    // Delete videos and assets
    prisma.video.deleteMany({ where: { userId } }),
    prisma.asset.deleteMany({ where: { userId } }),

    // Keep audit logs but anonymize
    prisma.auditLog.updateMany({
      where: { userId },
      data: { userId: 'deleted' }
    })
  ]);

  res.json({ message: 'Account deleted successfully' });
});
```

#### Privacy Policy & Consent
```yaml
Required Elements:
  - What data is collected
  - How data is used
  - Who data is shared with
  - How long data is retained
  - User rights
  - Contact information

Consent Management:
  - Explicit consent for data processing
  - Granular consent options
  - Easy withdrawal of consent
  - Consent logging
```

---

### CCPA (California Consumer Privacy Act)

```yaml
Requirements:
  - Disclose data collection practices
  - Allow users to opt-out of data sale
  - Allow users to delete their data
  - Non-discrimination for exercising rights

Implementation:
  - "Do Not Sell My Personal Information" link
  - Data deletion mechanism
  - Privacy policy disclosure
```

---

### COPPA (Children's Online Privacy Protection Act)

```yaml
If targeting users under 13:
  - Parental consent required
  - Limited data collection
  - No behavioral advertising
  - Enhanced security measures

Implementation:
  - Age verification
  - Parental consent flow
  - Restricted features for underage users

Note: If not targeting children, add age restriction (13+)
```

---

## Content Compliance

### Copyright Protection

```yaml
Measures:
  - DMCA compliance
  - Content ID system
  - User-uploaded content moderation
  - Attribution tracking for stock media

DMCA Process:
  1. Receive takedown notice
  2. Remove infringing content (within 24 hours)
  3. Notify user
  4. Allow counter-notice
  5. Restore if counter-notice valid
```

### Content Moderation

```yaml
Automated:
  - AI content analysis
  - Keyword filtering
  - Image recognition (NSFW detection)

Manual:
  - User reporting system
  - Moderator review queue
  - Appeal process

Implementation:
```typescript
// Content moderation service
class ContentModerationService {
  async moderateContent(content: string, images: string[]): Promise<ModerationResult> {
    // 1. Text moderation
    const textResult = await this.moderateText(content);

    // 2. Image moderation
    const imageResults = await Promise.all(
      images.map(url => this.moderateImage(url))
    );

    // 3. Aggregate results
    const isSafe =
      textResult.safe &&
      imageResults.every(r => r.safe);

    return {
      safe: isSafe,
      reasons: [
        ...textResult.reasons,
        ...imageResults.flatMap(r => r.reasons)
      ],
      confidence: this.calculateConfidence([
        textResult,
        ...imageResults
      ])
    };
  }

  private async moderateText(text: string): Promise<ModerationResult> {
    // Use external API (e.g., OpenAI Moderation API)
    const response = await openai.moderations.create({
      input: text
    });

    const result = response.results[0];

    return {
      safe: !result.flagged,
      reasons: result.categories,
      confidence: Math.max(...Object.values(result.category_scores))
    };
  }

  private async moderateImage(imageUrl: string): Promise<ModerationResult> {
    // Use image moderation API (e.g., AWS Rekognition, Google Vision)
    const response = await visionClient.safeSearchDetection(imageUrl);

    const safeSearch = response.safeSearchAnnotation;

    const isSafe =
      safeSearch.adult !== 'VERY_LIKELY' &&
      safeSearch.violence !== 'VERY_LIKELY';

    return {
      safe: isSafe,
      reasons: this.extractUnsafeReasons(safeSearch),
      confidence: this.calculateImageConfidence(safeSearch)
    };
  }
}
```

---

## Platform Security Best Practices

### File Upload Security

```yaml
Validation:
  - File type checking (magic number, not just extension)
  - File size limits
  - Virus scanning
  - Image re-encoding (prevent exploits)

Storage:
  - Separate domain for user uploads
  - No execution permissions
  - Randomized filenames
  - Access control
```

```typescript
// Secure file upload
async function uploadFile(file: File, userId: string): Promise<string> {
  // 1. Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  // 2. Check file size (100MB limit)
  if (file.size > 100 * 1024 * 1024) {
    throw new Error('File too large');
  }

  // 3. Scan for viruses
  const isSafe = await virusScanner.scan(file.buffer);
  if (!isSafe) {
    throw new Error('File contains malware');
  }

  // 4. Re-encode images (prevents exploits)
  if (file.mimetype.startsWith('image/')) {
    file.buffer = await sharp(file.buffer)
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  // 5. Generate random filename
  const filename = `${uuidv4()}.${getExtension(file.mimetype)}`;
  const path = `uploads/${userId}/${filename}`;

  // 6. Upload to S3 with proper ACL
  await s3.upload({
    Bucket: process.env.S3_BUCKET!,
    Key: path,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private', // Not public
    ServerSideEncryption: 'AES256'
  });

  // 7. Return signed URL (temporary access)
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET!,
    Key: path,
    Expires: 3600 // 1 hour
  });
}
```

### Dependency Security

```yaml
Practices:
  - Regular dependency updates
  - Automated vulnerability scanning
  - Lock file usage (package-lock.json, yarn.lock)
  - Private npm registry for internal packages

Tools:
  - npm audit / yarn audit
  - Snyk
  - Dependabot
  - GitHub Security Alerts
```

### Secrets Management

```yaml
Never:
  - Commit secrets to git
  - Hardcode API keys
  - Store secrets in client-side code

Best Practices:
  - Environment variables
  - Secrets management service (AWS Secrets Manager, Vault)
  - Rotate secrets regularly
  - Different secrets per environment

Implementation:
```typescript
// Load secrets from AWS Secrets Manager
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName: string): Promise<any> {
  const response = await secretsManager.getSecretValue({
    SecretId: secretName
  });

  return JSON.parse(response.SecretString!);
}

// Usage
const dbCredentials = await getSecret('prod/database');
const apiKeys = await getSecret('prod/api-keys');
```

---

## Incident Response Plan

```yaml
Preparation:
  - Define incident response team
  - Create communication plan
  - Set up monitoring and alerting
  - Document procedures

Detection:
  - Real-time monitoring
  - Anomaly detection
  - User reports
  - Security scanning

Response:
  1. Identify and classify incident
  2. Contain the threat
  3. Eradicate the vulnerability
  4. Recover systems
  5. Document and review

Post-Incident:
  - Root cause analysis
  - Update security measures
  - Team debrief
  - User communication (if needed)
```

---

This comprehensive security framework ensures the platform meets industry standards for security, privacy, and compliance.

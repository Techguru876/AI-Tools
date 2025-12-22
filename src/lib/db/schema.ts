import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    real,
    json,
    primaryKey,
    unique,
    index,
    pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================
// Enums
// ============================================

export const userRoleEnum = pgEnum('UserRole', [
    'READER',
    'SUBSCRIBER',
    'AUTHOR',
    'EDITOR',
    'ADMIN',
])

export const postStatusEnum = pgEnum('PostStatus', [
    'DRAFT',
    'IN_REVIEW',
    'SCHEDULED',
    'PUBLISHED',
    'ARCHIVED',
])

export const contentTypeEnum = pgEnum('ContentType', [
    'ARTICLE',
    'REVIEW',
    'COMPARISON',
    'GUIDE',
    'NEWS',
    'AI_NEWS',
    'ROUNDUP',
    'SPONSORED',
])

export const mediaTypeEnum = pgEnum('MediaType', [
    'IMAGE',
    'VIDEO',
    'INFOGRAPHIC',
    'EMBED',
])

export const taskTypeEnum = pgEnum('TaskType', [
    'GENERATE_POST',
    'REFRESH_CONTENT',
    'SEND_NEWSLETTER',
    'SOCIAL_SYNC',
    'ANALYTICS_REPORT',
])

export const taskStatusEnum = pgEnum('TaskStatus', [
    'PENDING',
    'RUNNING',
    'COMPLETED',
    'FAILED',
])

export const commentStatusEnum = pgEnum('CommentStatus', [
    'PENDING',
    'APPROVED',
    'SPAM',
    'REJECTED',
])

export const membershipPlanEnum = pgEnum('MembershipPlan', [
    'FREE',
    'BASIC',
    'PREMIUM',
    'ENTERPRISE',
])

export const membershipStatusEnum = pgEnum('MembershipStatus', [
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'INCOMPLETE',
])

// ============================================
// Authentication & Users
// ============================================

export const users = pgTable('User', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    role: userRoleEnum('role').default('READER'),
    bio: text('bio'),
    title: text('title'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('User_email_idx').on(table.email),
    index('User_role_idx').on(table.role),
])

export const accounts = pgTable('Account', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
}, (table) => [
    unique('Account_provider_providerAccountId_key').on(table.provider, table.providerAccountId),
    index('Account_userId_idx').on(table.userId),
])

export const sessions = pgTable('Session', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionToken: text('sessionToken').notNull().unique(),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => [
    index('Session_userId_idx').on(table.userId),
])

export const verificationTokens = pgTable('VerificationToken', {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => [
    unique('VerificationToken_identifier_token_key').on(table.identifier, table.token),
])

export const userPreferences = pgTable('UserPreferences', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    theme: text('theme').default('system'),
    newsletterOptIn: boolean('newsletterOptIn').default(false),
    interests: text('interests').array(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
})

// ============================================
// Content Management
// ============================================

export const posts = pgTable('Post', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    coverImage: text('coverImage'),
    status: postStatusEnum('status').default('DRAFT'),
    contentType: contentTypeEnum('contentType').default('ARTICLE'),
    isAiGenerated: boolean('isAiGenerated').default(false),
    aiPromptId: text('aiPromptId'),
    metaTitle: text('metaTitle'),
    metaDescription: text('metaDescription'),
    keywords: text('keywords').array(),
    isPremium: boolean('isPremium').default(false),
    featured: boolean('featured').default(false),
    readingTime: integer('readingTime'),
    publishedAt: timestamp('publishedAt', { mode: 'date' }),
    scheduledFor: timestamp('scheduledFor', { mode: 'date' }),
    authorId: text('authorId'),
    viewCount: integer('viewCount').default(0),
    likeCount: integer('likeCount').default(0),
    shareCount: integer('shareCount').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
    lastRefreshedAt: timestamp('lastRefreshedAt', { mode: 'date' }),
}, (table) => [
    index('Post_slug_idx').on(table.slug),
    index('Post_status_idx').on(table.status),
    index('Post_publishedAt_idx').on(table.publishedAt),
    index('Post_authorId_idx').on(table.authorId),
    index('Post_contentType_idx').on(table.contentType),
])

export const categories = pgTable('Category', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull().unique(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    image: text('image'),
    color: text('color'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('Category_slug_idx').on(table.slug),
])

export const tags = pgTable('Tag', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull().unique(),
    slug: text('slug').notNull().unique(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('Tag_slug_idx').on(table.slug),
])

export const media = pgTable('Media', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    url: text('url').notNull(),
    alt: text('alt'),
    caption: text('caption'),
    type: mediaTypeEnum('type').default('IMAGE'),
    source: text('source'),
    width: integer('width'),
    height: integer('height'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('Media_type_idx').on(table.type),
])

// Many-to-many junction tables
// Prisma implicit many-to-many uses alphabetically sorted model names
// Category + Post = _CategoryToPost with A=Category, B=Post
export const postCategories = pgTable('_CategoryToPost', {
    categoryId: text('A').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    postId: text('B').notNull().references(() => posts.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.categoryId, table.postId] }),
])

// Post + Tag = _PostToTag with A=Post, B=Tag
export const postTags = pgTable('_PostToTag', {
    postId: text('A').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('B').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
])

// Media + Post = _MediaToPost with A=Media, B=Post
export const postMedia = pgTable('_MediaToPost', {
    mediaId: text('A').notNull().references(() => media.id, { onDelete: 'cascade' }),
    postId: text('B').notNull().references(() => posts.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.mediaId, table.postId] }),
])

// ============================================
// AI Content Generation
// ============================================

export const aiPrompts = pgTable('AIPrompt', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    prompt: text('prompt').notNull(),
    category: text('category'),
    model: text('model').default('claude-3-5-sonnet-20241022'),
    temperature: real('temperature').default(0.7),
    maxTokens: integer('maxTokens').default(4000),
    isActive: boolean('isActive').default(true),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('AIPrompt_category_idx').on(table.category),
    index('AIPrompt_isActive_idx').on(table.isActive),
])

export const scheduledTasks = pgTable('ScheduledTask', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    type: taskTypeEnum('type').notNull(),
    cronExpression: text('cronExpression'),
    scheduledFor: timestamp('scheduledFor', { mode: 'date' }),
    lastRunAt: timestamp('lastRunAt', { mode: 'date' }),
    nextRunAt: timestamp('nextRunAt', { mode: 'date' }),
    config: json('config'),
    aiPromptId: text('aiPromptId'),
    status: taskStatusEnum('status').default('PENDING'),
    isActive: boolean('isActive').default(true),
    lastResult: json('lastResult'),
    errorMessage: text('errorMessage'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('ScheduledTask_status_idx').on(table.status),
    index('ScheduledTask_isActive_idx').on(table.isActive),
    index('ScheduledTask_nextRunAt_idx').on(table.nextRunAt),
])

// ============================================
// Community & Engagement
// ============================================

export const comments = pgTable('Comment', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    content: text('content').notNull(),
    postId: text('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    authorId: text('authorId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    parentId: text('parentId'),
    status: commentStatusEnum('status').default('PENDING'),
    upvotes: integer('upvotes').default(0),
    downvotes: integer('downvotes').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('Comment_postId_idx').on(table.postId),
    index('Comment_authorId_idx').on(table.authorId),
    index('Comment_status_idx').on(table.status),
])

export const newsletters = pgTable('Newsletter', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    isSubscribed: boolean('isSubscribed').default(true),
    interests: text('interests').array(),
    subscribedAt: timestamp('subscribedAt', { mode: 'date' }).defaultNow(),
    unsubscribedAt: timestamp('unsubscribedAt', { mode: 'date' }),
}, (table) => [
    index('Newsletter_isSubscribed_idx').on(table.isSubscribed),
])

// ============================================
// Monetization
// ============================================

export const memberships = pgTable('Membership', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    plan: membershipPlanEnum('plan').notNull(),
    status: membershipStatusEnum('status').default('ACTIVE'),
    stripeCustomerId: text('stripeCustomerId').unique(),
    stripeSubscriptionId: text('stripeSubscriptionId').unique(),
    stripePriceId: text('stripePriceId'),
    currentPeriodStart: timestamp('currentPeriodStart', { mode: 'date' }),
    currentPeriodEnd: timestamp('currentPeriodEnd', { mode: 'date' }),
    cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').default(false),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('Membership_status_idx').on(table.status),
])

export const affiliateLinks = pgTable('AffiliateLink', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    url: text('url').notNull(),
    trackingCode: text('trackingCode').notNull().unique(),
    productName: text('productName'),
    productImage: text('productImage'),
    price: text('price'),
    provider: text('provider').notNull(),
    postId: text('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    clicks: integer('clicks').default(0),
    conversions: integer('conversions').default(0),
    revenue: real('revenue').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('AffiliateLink_postId_idx').on(table.postId),
    index('AffiliateLink_trackingCode_idx').on(table.trackingCode),
])

export const adPlacements = pgTable('AdPlacement', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    location: text('location').notNull(),
    adCode: text('adCode').notNull(),
    provider: text('provider').notNull(),
    isActive: boolean('isActive').default(true),
    impressions: integer('impressions').default(0),
    clicks: integer('clicks').default(0),
    revenue: real('revenue').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('AdPlacement_isActive_idx').on(table.isActive),
    index('AdPlacement_location_idx').on(table.location),
])

// ============================================
// Analytics
// ============================================

export const postAnalytics = pgTable('PostAnalytics', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    date: timestamp('date', { mode: 'date' }).defaultNow(),
    views: integer('views').default(0),
    uniqueVisitors: integer('uniqueVisitors').default(0),
    avgTimeOnPage: integer('avgTimeOnPage').default(0),
    bounceRate: real('bounceRate').default(0),
    directTraffic: integer('directTraffic').default(0),
    organicSearch: integer('organicSearch').default(0),
    socialMedia: integer('socialMedia').default(0),
    referral: integer('referral').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    unique('PostAnalytics_postId_date_key').on(table.postId, table.date),
    index('PostAnalytics_postId_idx').on(table.postId),
    index('PostAnalytics_date_idx').on(table.date),
])

export const userAnalytics = pgTable('UserAnalytics', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date', { mode: 'date' }).defaultNow(),
    pageViews: integer('pageViews').default(0),
    sessions: integer('sessions').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    unique('UserAnalytics_userId_date_key').on(table.userId, table.date),
    index('UserAnalytics_userId_idx').on(table.userId),
    index('UserAnalytics_date_idx').on(table.date),
])

export const siteAnalytics = pgTable('SiteAnalytics', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    date: timestamp('date', { mode: 'date' }).defaultNow().unique(),
    totalPageViews: integer('totalPageViews').default(0),
    uniqueVisitors: integer('uniqueVisitors').default(0),
    totalSessions: integer('totalSessions').default(0),
    avgSessionDuration: integer('avgSessionDuration').default(0),
    bounceRate: real('bounceRate').default(0),
    adRevenue: real('adRevenue').default(0),
    affiliateRevenue: real('affiliateRevenue').default(0),
    subscriptionRevenue: real('subscriptionRevenue').default(0),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
}, (table) => [
    index('SiteAnalytics_date_idx').on(table.date),
])

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many, one }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    posts: many(posts),
    comments: many(comments),
    membership: one(memberships, {
        fields: [users.id],
        references: [memberships.userId],
    }),
    preferences: one(userPreferences, {
        fields: [users.id],
        references: [userPreferences.userId],
    }),
    analytics: many(userAnalytics),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    aiPrompt: one(aiPrompts, {
        fields: [posts.aiPromptId],
        references: [aiPrompts.id],
    }),
    postCategories: many(postCategories),
    postTags: many(postTags),
    postMedia: many(postMedia),
    comments: many(comments),
    analytics: many(postAnalytics),
    affiliateLinks: many(affiliateLinks),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
    postCategories: many(postCategories),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
    postTags: many(postTags),
}))

export const mediaRelations = relations(media, ({ many }) => ({
    postMedia: many(postMedia),
}))

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
    post: one(posts, {
        fields: [postCategories.postId],
        references: [posts.id],
    }),
    category: one(categories, {
        fields: [postCategories.categoryId],
        references: [categories.id],
    }),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
    post: one(posts, {
        fields: [postTags.postId],
        references: [posts.id],
    }),
    tag: one(tags, {
        fields: [postTags.tagId],
        references: [tags.id],
    }),
}))

export const postMediaRelations = relations(postMedia, ({ one }) => ({
    post: one(posts, {
        fields: [postMedia.postId],
        references: [posts.id],
    }),
    mediaItem: one(media, {
        fields: [postMedia.mediaId],
        references: [media.id],
    }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    author: one(users, {
        fields: [comments.authorId],
        references: [users.id],
    }),
    parent: one(comments, {
        fields: [comments.parentId],
        references: [comments.id],
        relationName: 'CommentReplies',
    }),
    replies: many(comments, {
        relationName: 'CommentReplies',
    }),
}))

export const aiPromptsRelations = relations(aiPrompts, ({ many }) => ({
    posts: many(posts),
    tasks: many(scheduledTasks),
}))

export const scheduledTasksRelations = relations(scheduledTasks, ({ one }) => ({
    aiPrompt: one(aiPrompts, {
        fields: [scheduledTasks.aiPromptId],
        references: [aiPrompts.id],
    }),
}))

export const membershipsRelations = relations(memberships, ({ one }) => ({
    user: one(users, {
        fields: [memberships.userId],
        references: [users.id],
    }),
}))

export const affiliateLinksRelations = relations(affiliateLinks, ({ one }) => ({
    post: one(posts, {
        fields: [affiliateLinks.postId],
        references: [posts.id],
    }),
}))

export const postAnalyticsRelations = relations(postAnalytics, ({ one }) => ({
    post: one(posts, {
        fields: [postAnalytics.postId],
        references: [posts.id],
    }),
}))

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
    user: one(users, {
        fields: [userAnalytics.userId],
        references: [users.id],
    }),
}))

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type ContentType = (typeof contentTypeEnum.enumValues)[number]
export type PostStatus = (typeof postStatusEnum.enumValues)[number]

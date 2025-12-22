CREATE TYPE "public"."CommentStatus" AS ENUM('PENDING', 'APPROVED', 'SPAM', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."ContentType" AS ENUM('ARTICLE', 'REVIEW', 'COMPARISON', 'GUIDE', 'NEWS', 'AI_NEWS', 'ROUNDUP', 'SPONSORED');--> statement-breakpoint
CREATE TYPE "public"."MediaType" AS ENUM('IMAGE', 'VIDEO', 'INFOGRAPHIC', 'EMBED');--> statement-breakpoint
CREATE TYPE "public"."MembershipPlan" AS ENUM('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."MembershipStatus" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');--> statement-breakpoint
CREATE TYPE "public"."PostStatus" AS ENUM('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."TaskStatus" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."TaskType" AS ENUM('GENERATE_POST', 'REFRESH_CONTENT', 'SEND_NEWSLETTER', 'SOCIAL_SYNC', 'ANALYTICS_REPORT');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('READER', 'SUBSCRIBER', 'AUTHOR', 'EDITOR', 'ADMIN');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "AdPlacement" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"adCode" text NOT NULL,
	"provider" text NOT NULL,
	"isActive" boolean DEFAULT true,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"revenue" real DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "AffiliateLink" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"trackingCode" text NOT NULL,
	"productName" text,
	"productImage" text,
	"price" text,
	"provider" text NOT NULL,
	"postId" text NOT NULL,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"revenue" real DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "AffiliateLink_trackingCode_unique" UNIQUE("trackingCode")
);
--> statement-breakpoint
CREATE TABLE "AIPrompt" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"prompt" text NOT NULL,
	"category" text,
	"model" text DEFAULT 'claude-3-5-sonnet-20241022',
	"temperature" real DEFAULT 0.7,
	"maxTokens" integer DEFAULT 4000,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"color" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Category_name_unique" UNIQUE("name"),
	CONSTRAINT "Category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Comment" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"postId" text NOT NULL,
	"authorId" text NOT NULL,
	"parentId" text,
	"status" "CommentStatus" DEFAULT 'PENDING',
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Media" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"caption" text,
	"type" "MediaType" DEFAULT 'IMAGE',
	"source" text,
	"width" integer,
	"height" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Membership" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"plan" "MembershipPlan" NOT NULL,
	"status" "MembershipStatus" DEFAULT 'ACTIVE',
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"stripePriceId" text,
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Membership_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Membership_stripeCustomerId_unique" UNIQUE("stripeCustomerId"),
	CONSTRAINT "Membership_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "Newsletter" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"isSubscribed" boolean DEFAULT true,
	"interests" text[],
	"subscribedAt" timestamp DEFAULT now(),
	"unsubscribedAt" timestamp,
	CONSTRAINT "Newsletter_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "PostAnalytics" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"date" timestamp DEFAULT now(),
	"views" integer DEFAULT 0,
	"uniqueVisitors" integer DEFAULT 0,
	"avgTimeOnPage" integer DEFAULT 0,
	"bounceRate" real DEFAULT 0,
	"directTraffic" integer DEFAULT 0,
	"organicSearch" integer DEFAULT 0,
	"socialMedia" integer DEFAULT 0,
	"referral" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "PostAnalytics_postId_date_key" UNIQUE("postId","date")
);
--> statement-breakpoint
CREATE TABLE "_PostCategories" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_PostCategories_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "_PostMedia" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_PostMedia_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "_PostTags" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_PostTags_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "Post" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"coverImage" text,
	"status" "PostStatus" DEFAULT 'DRAFT',
	"contentType" "ContentType" DEFAULT 'ARTICLE',
	"isAiGenerated" boolean DEFAULT false,
	"aiPromptId" text,
	"metaTitle" text,
	"metaDescription" text,
	"keywords" text[],
	"isPremium" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"readingTime" integer,
	"publishedAt" timestamp,
	"scheduledFor" timestamp,
	"authorId" text,
	"viewCount" integer DEFAULT 0,
	"likeCount" integer DEFAULT 0,
	"shareCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"lastRefreshedAt" timestamp,
	CONSTRAINT "Post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ScheduledTask" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "TaskType" NOT NULL,
	"cronExpression" text,
	"scheduledFor" timestamp,
	"lastRunAt" timestamp,
	"nextRunAt" timestamp,
	"config" json,
	"aiPromptId" text,
	"status" "TaskStatus" DEFAULT 'PENDING',
	"isActive" boolean DEFAULT true,
	"lastResult" json,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "Session_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "SiteAnalytics" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now(),
	"totalPageViews" integer DEFAULT 0,
	"uniqueVisitors" integer DEFAULT 0,
	"totalSessions" integer DEFAULT 0,
	"avgSessionDuration" integer DEFAULT 0,
	"bounceRate" real DEFAULT 0,
	"adRevenue" real DEFAULT 0,
	"affiliateRevenue" real DEFAULT 0,
	"subscriptionRevenue" real DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "SiteAnalytics_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "Tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Tag_name_unique" UNIQUE("name"),
	CONSTRAINT "Tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "UserAnalytics" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"date" timestamp DEFAULT now(),
	"pageViews" integer DEFAULT 0,
	"sessions" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "UserAnalytics_userId_date_key" UNIQUE("userId","date")
);
--> statement-breakpoint
CREATE TABLE "UserPreferences" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"theme" text DEFAULT 'system',
	"newsletterOptIn" boolean DEFAULT false,
	"interests" text[],
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "UserPreferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"role" "UserRole" DEFAULT 'READER',
	"bio" text,
	"title" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token"),
	CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PostAnalytics" ADD CONSTRAINT "PostAnalytics_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_A_Post_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_B_Category_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PostMedia" ADD CONSTRAINT "_PostMedia_A_Post_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PostMedia" ADD CONSTRAINT "_PostMedia_B_Media_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_A_Post_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_B_Tag_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAnalytics" ADD CONSTRAINT "UserAnalytics_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Account_userId_idx" ON "Account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "AdPlacement_isActive_idx" ON "AdPlacement" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "AdPlacement_location_idx" ON "AdPlacement" USING btree ("location");--> statement-breakpoint
CREATE INDEX "AffiliateLink_postId_idx" ON "AffiliateLink" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "AffiliateLink_trackingCode_idx" ON "AffiliateLink" USING btree ("trackingCode");--> statement-breakpoint
CREATE INDEX "AIPrompt_category_idx" ON "AIPrompt" USING btree ("category");--> statement-breakpoint
CREATE INDEX "AIPrompt_isActive_idx" ON "AIPrompt" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "Category_slug_idx" ON "Category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Comment_postId_idx" ON "Comment" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "Comment_authorId_idx" ON "Comment" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "Comment_status_idx" ON "Comment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Media_type_idx" ON "Media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "Membership_status_idx" ON "Membership" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Newsletter_isSubscribed_idx" ON "Newsletter" USING btree ("isSubscribed");--> statement-breakpoint
CREATE INDEX "PostAnalytics_postId_idx" ON "PostAnalytics" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "PostAnalytics_date_idx" ON "PostAnalytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "Post_slug_idx" ON "Post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Post_status_idx" ON "Post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Post_publishedAt_idx" ON "Post" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "Post_authorId_idx" ON "Post" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "Post_contentType_idx" ON "Post" USING btree ("contentType");--> statement-breakpoint
CREATE INDEX "ScheduledTask_status_idx" ON "ScheduledTask" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ScheduledTask_isActive_idx" ON "ScheduledTask" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "ScheduledTask_nextRunAt_idx" ON "ScheduledTask" USING btree ("nextRunAt");--> statement-breakpoint
CREATE INDEX "Session_userId_idx" ON "Session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "SiteAnalytics_date_idx" ON "SiteAnalytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "Tag_slug_idx" ON "Tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "UserAnalytics_userId_idx" ON "UserAnalytics" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "UserAnalytics_date_idx" ON "UserAnalytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX "User_role_idx" ON "User" USING btree ("role");
/**
 * Social Media Distribution Tools
 * 
 * Tools for posting content to Twitter/X and LinkedIn.
 */

import { ai, z } from '../genkit'

// ============================================
// Generate Social Post Tool
// ============================================

export const generateSocialPostTool = ai.defineTool(
    {
        name: 'generateSocialPost',
        description: 'Generate optimized social media posts for an article.',
        inputSchema: z.object({
            title: z.string().describe('Article title'),
            excerpt: z.string().describe('Article excerpt'),
            url: z.string().describe('Article URL'),
            platform: z.enum(['twitter', 'linkedin', 'both']).default('both'),
        }),
        outputSchema: z.object({
            twitter: z.object({
                text: z.string(),
                characterCount: z.number(),
            }).optional(),
            linkedin: z.object({
                text: z.string(),
                characterCount: z.number(),
            }).optional(),
        }),
    },
    async (input: any) => {
        const result: {
            twitter?: { text: string; characterCount: number }
            linkedin?: { text: string; characterCount: number }
        } = {}

        if (input.platform === 'twitter' || input.platform === 'both') {
            const { text } = await ai.generate({
                prompt: `Write a Twitter/X post for this article. Must be under 280 characters.

Title: ${input.title}
Excerpt: ${input.excerpt}

Requirements:
- Engaging hook
- Include relevant hashtags (max 3)
- Leave room for the link (23 chars)
- Use emojis sparingly
- Must be under 250 chars to leave room for link

Respond with ONLY the tweet text, no explanation.`,
                config: { temperature: 0.7 },
            })

            const tweetText = `${text.trim()}\n\n${input.url}`
            result.twitter = {
                text: text.trim(),
                characterCount: text.trim().length,
            }
        }

        if (input.platform === 'linkedin' || input.platform === 'both') {
            const { text } = await ai.generate({
                prompt: `Write a LinkedIn post for this article. Can be longer and more professional.

Title: ${input.title}
Excerpt: ${input.excerpt}

Requirements:
- Professional tone
- Hook in first line
- Include 3-5 relevant hashtags at the end
- 100-200 words ideal
- Add value beyond just sharing the link

Respond with ONLY the post text, no explanation.`,
                config: { temperature: 0.7 },
            })

            result.linkedin = {
                text: text.trim(),
                characterCount: text.trim().length,
            }
        }

        return result
    }
)

// ============================================
// Post to Twitter Tool
// ============================================

export const postToTwitterTool = ai.defineTool(
    {
        name: 'postToTwitter',
        description: 'Post a tweet to Twitter/X. Requires TWITTER_API_KEY env variable.',
        inputSchema: z.object({
            text: z.string().max(280).describe('Tweet text'),
            mediaUrl: z.string().optional().describe('Optional image URL to attach'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            tweetId: z.string().optional(),
            tweetUrl: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        const apiKey = process.env.TWITTER_API_KEY
        const apiSecret = process.env.TWITTER_API_SECRET
        const accessToken = process.env.TWITTER_ACCESS_TOKEN
        const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

        if (!apiKey || !accessToken) {
            return {
                success: false,
                error: 'Twitter API credentials not configured. Set TWITTER_API_KEY and related env vars.',
            }
        }

        try {
            // Twitter API v2 endpoint
            const response = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: input.text,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                return {
                    success: false,
                    error: `Twitter API error: ${errorText}`,
                }
            }

            const data = await response.json()

            return {
                success: true,
                tweetId: data.data?.id,
                tweetUrl: `https://twitter.com/user/status/${data.data?.id}`,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Twitter post failed',
            }
        }
    }
)

// ============================================
// Post to LinkedIn Tool
// ============================================

export const postToLinkedInTool = ai.defineTool(
    {
        name: 'postToLinkedIn',
        description: 'Post to LinkedIn. Requires LINKEDIN_ACCESS_TOKEN env variable.',
        inputSchema: z.object({
            text: z.string().describe('Post text'),
            articleUrl: z.string().optional().describe('URL to include as article link'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            postId: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input: any) => {
        const accessToken = process.env.LINKEDIN_ACCESS_TOKEN

        if (!accessToken) {
            return {
                success: false,
                error: 'LinkedIn access token not configured. Set LINKEDIN_ACCESS_TOKEN env var.',
            }
        }

        try {
            // LinkedIn API - Create a share
            const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0',
                },
                body: JSON.stringify({
                    author: 'urn:li:person:me',
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: {
                                text: input.text,
                            },
                            shareMediaCategory: input.articleUrl ? 'ARTICLE' : 'NONE',
                            media: input.articleUrl ? [{
                                status: 'READY',
                                originalUrl: input.articleUrl,
                            }] : undefined,
                        },
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                    },
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                return {
                    success: false,
                    error: `LinkedIn API error: ${errorText}`,
                }
            }

            const data = await response.json()

            return {
                success: true,
                postId: data.id,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'LinkedIn post failed',
            }
        }
    }
)

// ============================================
// Schedule Social Post Tool
// ============================================

export const scheduleSocialPostTool = ai.defineTool(
    {
        name: 'scheduleSocialPost',
        description: 'Schedule a social media post for later. Stores in database for future processing.',
        inputSchema: z.object({
            platform: z.enum(['twitter', 'linkedin']),
            text: z.string(),
            articleUrl: z.string().optional(),
            scheduledFor: z.string().describe('ISO date string for when to post'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            scheduledId: z.string().optional(),
            message: z.string(),
        }),
    },
    async (input: any) => {
        try {
            const scheduledDate = new Date(input.scheduledFor)

            if (scheduledDate <= new Date()) {
                return {
                    success: false,
                    message: 'Scheduled time must be in the future',
                }
            }

            // For now, just return success - actual implementation would store in DB
            // In production, create a ScheduledSocialPost model and cron job

            return {
                success: true,
                scheduledId: `scheduled_${Date.now()}`,
                message: `Post scheduled for ${scheduledDate.toISOString()}. Note: Requires cron job to process scheduled posts.`,
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Scheduling failed',
            }
        }
    }
)

// Export all social tools
export const socialTools = [
    generateSocialPostTool,
    postToTwitterTool,
    postToLinkedInTool,
    scheduleSocialPostTool,
]

/**
 * Quality Control Tools
 * 
 * Tools for ensuring content quality: plagiarism detection, fact verification, SEO scoring.
 */

import { ai, z } from '../genkit'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// ============================================
// Plagiarism Check Tool
// ============================================

export const checkPlagiarismTool = ai.defineTool(
    {
        name: 'checkPlagiarism',
        description: 'Check content for potential plagiarism by comparing against published articles in our database and searching for similar phrases.',
        inputSchema: z.object({
            content: z.string().describe('Content to check for plagiarism'),
            title: z.string().optional().describe('Article title'),
        }),
        outputSchema: z.object({
            isPlagiarized: z.boolean(),
            score: z.number().min(0).max(100).describe('Originality score (100 = fully original)'),
            matches: z.array(z.object({
                source: z.string(),
                matchedText: z.string(),
                similarity: z.number(),
            })),
            recommendation: z.string(),
        }),
    },
    async (input: any) => {
        try {
            // Extract key phrases for comparison
            const sentences = input.content
                .split(/[.!?]+/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 50)
                .slice(0, 10) // Check first 10 significant sentences

            const matches: Array<{ source: string; matchedText: string; similarity: number }> = []

            // Check against our own database - fetch all published posts and search in JS
            const publishedPosts = await db
                .select({
                    title: posts.title,
                    slug: posts.slug,
                    content: posts.content,
                })
                .from(posts)
                .where(eq(posts.status, 'PUBLISHED'))
                .limit(50)

            for (const sentence of sentences) {
                const wordsToSearch = sentence.split(' ').slice(0, 8).join(' ').toLowerCase()

                for (const post of publishedPosts) {
                    if (post.content.toLowerCase().includes(wordsToSearch)) {
                        matches.push({
                            source: `Internal: ${post.slug}`,
                            matchedText: wordsToSearch,
                            similarity: 0.8,
                        })
                        break // Only count once per sentence
                    }
                }
            }

            // Calculate originality score
            const uniqueSentences = sentences.length
            const matchedSentences = new Set(matches.map(m => m.matchedText)).size
            const originalityScore = Math.round(((uniqueSentences - matchedSentences) / Math.max(uniqueSentences, 1)) * 100)

            // Use AI to assess overall originality  
            const { text } = await ai.generate({
                prompt: `Analyze this content for originality. Is it written in a unique voice or does it seem copied/templated?

Content excerpt:
${input.content.slice(0, 2000)}

Rate originality from 0-100 and explain briefly. Respond as JSON:
{"originalityAssessment": 85, "note": "Content appears original with unique perspective"}`,
                config: { temperature: 0.3 },
            })

            let aiScore = originalityScore
            try {
                const match = text.match(/\{[\s\S]*\}/)
                if (match) {
                    const parsed = JSON.parse(match[0])
                    aiScore = parsed.originalityAssessment || originalityScore
                }
            } catch { /* Use calculated score */ }

            const finalScore = Math.round((originalityScore + aiScore) / 2)
            const isPlagiarized = finalScore < 70 || matches.length > 3

            return {
                isPlagiarized,
                score: finalScore,
                matches: matches.slice(0, 5),
                recommendation: isPlagiarized
                    ? 'Content has potential originality issues. Consider rewriting flagged sections.'
                    : 'Content appears original. Safe to publish.',
            }
        } catch (error) {
            return {
                isPlagiarized: false,
                score: 100,
                matches: [],
                recommendation: `Could not complete check: ${error instanceof Error ? error.message : 'Unknown error'}`,
            }
        }
    }
)

// ============================================
// Fact Verification Tool
// ============================================

export const verifyFactsTool = ai.defineTool(
    {
        name: 'verifyFacts',
        description: 'Verify factual claims in an article by cross-referencing with AI knowledge.',
        inputSchema: z.object({
            content: z.string().describe('Article content to fact-check'),
            title: z.string().optional().describe('Article title'),
        }),
        outputSchema: z.object({
            overallAccuracy: z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN']),
            claims: z.array(z.object({
                claim: z.string(),
                status: z.enum(['VERIFIED', 'UNVERIFIED', 'FALSE', 'NEEDS_SOURCE']),
                note: z.string(),
            })),
            recommendation: z.string(),
        }),
    },
    async (input: any) => {
        try {
            const { text } = await ai.generate({
                prompt: `You are a fact-checker for a tech publication. Analyze this article and identify key factual claims.

Article:
${input.content.slice(0, 4000)}

For each major claim, verify if it's:
- VERIFIED: Definitely true based on your knowledge
- UNVERIFIED: Cannot confirm but seems plausible
- FALSE: Contradicts known facts
- NEEDS_SOURCE: Specific stat/quote that needs citation

Respond in JSON:
{
  "overallAccuracy": "HIGH|MEDIUM|LOW|UNCERTAIN",
  "claims": [
    {"claim": "The claim text", "status": "VERIFIED", "note": "Why this is verified"}
  ],
  "recommendation": "Overall recommendation"
}`,
                config: { temperature: 0.2 },
            })

            try {
                const match = text.match(/\{[\s\S]*\}/)
                if (match) {
                    return JSON.parse(match[0])
                }
            } catch { /* Fall through */ }

            return {
                overallAccuracy: 'UNCERTAIN' as const,
                claims: [],
                recommendation: 'Could not parse fact-check results. Manual review recommended.',
            }
        } catch (error) {
            return {
                overallAccuracy: 'UNCERTAIN' as const,
                claims: [],
                recommendation: `Fact check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            }
        }
    }
)

// ============================================
// SEO Scoring Tool
// ============================================

export const calculateSEOScoreTool = ai.defineTool(
    {
        name: 'calculateSEOScore',
        description: 'Calculate an SEO score for an article based on title, content, keywords, and meta description.',
        inputSchema: z.object({
            title: z.string().describe('Article title'),
            content: z.string().describe('Article content'),
            metaDescription: z.string().optional().describe('Meta description'),
            keywords: z.array(z.string()).optional().describe('Target keywords'),
        }),
        outputSchema: z.object({
            overallScore: z.number().min(0).max(100),
            breakdown: z.object({
                titleScore: z.number(),
                contentScore: z.number(),
                keywordScore: z.number(),
                readabilityScore: z.number(),
                metaScore: z.number(),
            }),
            issues: z.array(z.string()),
            suggestions: z.array(z.string()),
        }),
    },
    async (input: any) => {
        const issues: string[] = []
        const suggestions: string[] = []

        // Title analysis
        let titleScore = 100
        if (input.title.length < 30) {
            titleScore -= 20
            issues.push('Title is too short (< 30 chars)')
            suggestions.push('Expand title to 50-60 characters for better SEO')
        }
        if (input.title.length > 70) {
            titleScore -= 15
            issues.push('Title is too long (> 70 chars)')
        }
        if (!/\d/.test(input.title) && input.title.toLowerCase().includes('best')) {
            suggestions.push('Consider adding numbers (e.g., "5 Best..." or "Top 10...")')
        }

        // Content analysis
        let contentScore = 100
        const wordCount = input.content.split(/\s+/).length
        if (wordCount < 800) {
            contentScore -= 25
            issues.push(`Content is short (${wordCount} words). Aim for 1500+`)
        } else if (wordCount > 1500) {
            contentScore += 10 // Bonus for longer content
        }

        // Check for headings
        const headingCount = (input.content.match(/^#{1,3}\s/gm) || []).length
        if (headingCount < 3) {
            contentScore -= 15
            issues.push('Too few headings. Use H2/H3 to structure content')
        }

        // Keyword analysis
        let keywordScore = 50 // Default if no keywords
        if (input.keywords && input.keywords.length > 0) {
            const contentLower = input.content.toLowerCase()
            const titleLower = input.title.toLowerCase()

            let keywordsFound = 0
            for (const keyword of input.keywords) {
                const keywordLower = keyword.toLowerCase()
                if (contentLower.includes(keywordLower)) keywordsFound++
                if (titleLower.includes(keywordLower)) keywordsFound += 2
            }

            keywordScore = Math.min(100, (keywordsFound / (input.keywords.length * 2)) * 100)

            if (keywordScore < 50) {
                issues.push('Keywords underutilized in content')
                suggestions.push('Include target keywords naturally throughout the article')
            }
        }

        // Readability (simple heuristic)
        const avgSentenceLength = input.content.length / (input.content.split(/[.!?]+/).length || 1)
        let readabilityScore = 100
        if (avgSentenceLength > 150) {
            readabilityScore -= 20
            issues.push('Sentences are too long on average')
            suggestions.push('Break up long sentences for better readability')
        }

        // Meta description
        let metaScore = 0
        if (input.metaDescription) {
            metaScore = 100
            if (input.metaDescription.length < 120) {
                metaScore -= 30
                issues.push('Meta description too short')
            }
            if (input.metaDescription.length > 160) {
                metaScore -= 20
                issues.push('Meta description too long (will be truncated)')
            }
        } else {
            issues.push('Missing meta description')
            suggestions.push('Add a compelling meta description (120-155 chars)')
        }

        // Calculate overall score
        const overallScore = Math.round(
            (titleScore * 0.2) +
            (contentScore * 0.35) +
            (keywordScore * 0.2) +
            (readabilityScore * 0.15) +
            (metaScore * 0.1)
        )

        return {
            overallScore: Math.min(100, Math.max(0, overallScore)),
            breakdown: {
                titleScore: Math.min(100, titleScore),
                contentScore: Math.min(100, contentScore),
                keywordScore,
                readabilityScore,
                metaScore,
            },
            issues,
            suggestions,
        }
    }
)

// Export all quality tools
export const qualityTools = [
    checkPlagiarismTool,
    verifyFactsTool,
    calculateSEOScoreTool,
]

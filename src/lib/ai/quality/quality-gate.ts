/**
 * Quality Gate System
 * 
 * Validates content quality before saving to database.
 * Auto-runs fact verification, SEO scoring, and claim extraction.
 */

import { ai, z } from '../genkit'

export interface QualityGateResult {
    passed: boolean
    overallScore: number
    seoScore: number
    factScore: number
    issues: string[]
    warnings: string[]
    claims: ExtractedClaim[]
    recommendation: 'PUBLISH' | 'REVIEW' | 'NEEDS_REVISION' | 'REJECT'
}

export interface ExtractedClaim {
    claim: string
    type: 'STATISTIC' | 'QUOTE' | 'FACT' | 'PREDICTION'
    hasSource: boolean
    confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIABLE'
}

// Minimum thresholds for quality gate
const QUALITY_THRESHOLDS = {
    minSEOScore: 60,
    minFactScore: 65,
    minWordCount: 800,
    minHeadings: 3,
    maxUnverifiableClaims: 3,
}

/**
 * Extract and validate claims from article content
 */
async function extractAndValidateClaims(content: string): Promise<{
    claims: ExtractedClaim[]
    factScore: number
}> {
    const { text } = await ai.generate({
        prompt: `Analyze this article and extract all factual claims.

ARTICLE:
${content.slice(0, 4000)}

For each claim, identify:
1. The claim itself
2. Type: STATISTIC (numbers/percentages), QUOTE (attributed statement), FACT (general assertion), PREDICTION (future claim)
3. Whether it has a source attribution (mentions source, company, study, etc.)
4. Confidence: HIGH (verifiable fact), MEDIUM (plausible), LOW (speculative), UNVERIFIABLE (cannot assess)

Also rate overall factual accuracy 0-100.

Respond in JSON only:
{
  "claims": [
    {"claim": "The claim text", "type": "STATISTIC", "hasSource": true, "confidence": "HIGH"}
  ],
  "factScore": 75
}`,
        config: { temperature: 0.2 },
    })

    try {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) {
            const parsed = JSON.parse(match[0])
            return {
                claims: parsed.claims || [],
                factScore: parsed.factScore || 50,
            }
        }
    } catch { /* fallthrough */ }

    return { claims: [], factScore: 50 }
}

/**
 * Calculate SEO score for content
 */
function calculateSEOScore(content: string, title: string, metaDescription?: string): {
    score: number
    issues: string[]
} {
    const issues: string[] = []
    let score = 100

    // Title checks
    if (title.length < 30) {
        score -= 15
        issues.push('Title too short (< 30 chars)')
    }
    if (title.length > 70) {
        score -= 10
        issues.push('Title too long (> 70 chars)')
    }

    // Word count
    const wordCount = content.split(/\s+/).length
    if (wordCount < QUALITY_THRESHOLDS.minWordCount) {
        score -= 25
        issues.push(`Content too short (${wordCount} words, need ${QUALITY_THRESHOLDS.minWordCount}+)`)
    }

    // Heading structure
    const headings = (content.match(/^#{1,3}\s/gm) || []).length
    if (headings < QUALITY_THRESHOLDS.minHeadings) {
        score -= 15
        issues.push(`Too few headings (${headings}, need ${QUALITY_THRESHOLDS.minHeadings}+)`)
    }

    // Meta description
    if (!metaDescription || metaDescription.length < 100) {
        score -= 10
        issues.push('Meta description missing or too short')
    }

    // Lists/bullets for scannability
    const hasBullets = content.includes('- ') || content.includes('* ')
    if (!hasBullets) {
        score -= 5
        issues.push('No bullet points for scannability')
    }

    return { score: Math.max(0, score), issues }
}

/**
 * Main quality gate function
 */
export async function runQualityGate(
    content: string,
    title: string,
    metaDescription?: string
): Promise<QualityGateResult> {
    const issues: string[] = []
    const warnings: string[] = []

    // 1. SEO Check
    const seoResult = calculateSEOScore(content, title, metaDescription)
    issues.push(...seoResult.issues)

    // 2. Claim extraction and validation
    const { claims, factScore } = await extractAndValidateClaims(content)

    // Count problematic claims
    const unverifiableClaims = claims.filter(c => c.confidence === 'UNVERIFIABLE' || c.confidence === 'LOW')
    if (unverifiableClaims.length > QUALITY_THRESHOLDS.maxUnverifiableClaims) {
        issues.push(`Too many unverifiable claims (${unverifiableClaims.length})`)
    }

    // Check for unsourced statistics
    const unsourcedStats = claims.filter(c => c.type === 'STATISTIC' && !c.hasSource)
    if (unsourcedStats.length > 0) {
        warnings.push(`${unsourcedStats.length} statistics without source attribution`)
    }

    // 3. Calculate overall score
    const overallScore = Math.round((seoResult.score + factScore) / 2)

    // 4. Determine recommendation
    let recommendation: QualityGateResult['recommendation']
    let passed = true

    if (overallScore >= 80 && issues.length === 0) {
        recommendation = 'PUBLISH'
    } else if (overallScore >= 65 && issues.length <= 2) {
        recommendation = 'REVIEW'
    } else if (overallScore >= 50) {
        recommendation = 'NEEDS_REVISION'
        passed = false
    } else {
        recommendation = 'REJECT'
        passed = false
    }

    return {
        passed,
        overallScore,
        seoScore: seoResult.score,
        factScore,
        issues,
        warnings,
        claims,
        recommendation,
    }
}

/**
 * Genkit tool for quality gate
 */
export const qualityGateTool = ai.defineTool(
    {
        name: 'runQualityGate',
        description: 'Run comprehensive quality checks on article content before publishing.',
        inputSchema: z.object({
            content: z.string().describe('Article content'),
            title: z.string().describe('Article title'),
            metaDescription: z.string().optional(),
        }),
        outputSchema: z.object({
            passed: z.boolean(),
            overallScore: z.number(),
            seoScore: z.number(),
            factScore: z.number(),
            issues: z.array(z.string()),
            warnings: z.array(z.string()),
            claims: z.array(z.object({
                claim: z.string(),
                type: z.string(),
                hasSource: z.boolean(),
                confidence: z.string(),
            })),
            recommendation: z.enum(['PUBLISH', 'REVIEW', 'NEEDS_REVISION', 'REJECT']),
        }),
    },
    async (input: any) => {
        return await runQualityGate(input.content, input.title, input.metaDescription)
    }
)

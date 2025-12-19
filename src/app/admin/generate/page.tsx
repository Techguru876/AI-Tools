'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Check, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AdminGeneratePage() {
  const [contentType, setContentType] = useState<'NEWS' | 'REVIEW' | 'FEATURE'>('NEWS')
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [category, setCategory] = useState('tech')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<any>(null)
  const [error, setError] = useState('')

  const LEGACY_ARTICLES = [
    { title: 'Apple M4 Pro Chip', slug: 'apple-m4-pro-chip-ai-december-2025', context: 'Focus on 40% AI performance boost, new Neural Engine, 3nm process. Competes with Snapdragon X Elite.' },
    { title: 'OpenAI GPT-5 Launch', slug: 'openai-gpt5-launch-december-2025', context: 'Features Q* reasoning, 1M token context, self-correction. Competes with Claude 3.5 Opus.' },
    { title: 'Meta Llama 4', slug: 'meta-llama-4-release-december-2025', context: 'Open source, 405B params, beats GPT-4o on coding. Challenges proprietary models.' },
    { title: 'Samsung S25 Ultra', slug: 'samsung-s25-ultra-review-december-2025', context: 'Titanium frame, 200MP camera, Snapdragon 8 Gen 4, Galaxy AI 2.0.' },
    { title: 'MacBook Pro M4', slug: 'macbook-pro-m4-2025-review', context: 'M4 Max chip, Tandem OLED, 22-hour battery, Thunderbolt 5.' },
    { title: 'Google Algorithm Update', slug: 'google-algorithm-update-ai-content-december-2025', context: 'Targets low-quality AI content, rewards first-hand experience.' },
    { title: 'Microsoft Copilot', slug: 'microsoft-copilot-december-2025-update', context: 'Deep OS integration, Copilot Studio, Excel Python.' },
    { title: 'NASA Mars Water', slug: 'nasa-mars-water-discovery-december-2025', context: 'Liquid water confirmed 3-5km beneath surface.' },
    { title: 'Fusion Energy', slug: 'fusion-energy-breakthrough-december-2025', context: 'Net gain achieved at NIF for third time. 4.1MJ output.' },
    { title: '2026 Games Preview', slug: 'most-anticipated-games-2026-december-2025', context: 'GTA VI, Elder Scrolls VI, Switch 2 launch titles.' },
    { title: 'Netflix New Releases', slug: 'netflix-december-2025-new-releases', context: 'Squid Game S3, Witcher S4, Electric State.' },
    { title: 'Tech Deals', slug: 'december-2025-tech-deals-black-friday', context: 'Extended Black Friday deals on M3 MacBook Air, PS5 Pro.' },
  ]

  const loadPreset = (preset: typeof LEGACY_ARTICLES[0]) => {
    setTopic(preset.title)
    setContext(preset.context)
    // We can't easily force the slug in this form without adding a slug field, 
    // but the AI usually generates a close enough title. 
    // Ideally we'd modify the generation API to accept a specific slug to update.
  }


  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedArticle(null)

    try {
      const response = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          topic: topic.trim(),
          additionalContext: context.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setGeneratedArticle(data)
    } catch (err: any) {
      setError(err.message || 'Failed to generate article. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePublish = async () => {
    if (!generatedArticle) return

    setIsPublishing(true)
    setError('')

    try {
      const response = await fetch('/api/admin/publish-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generatedArticle,
          categorySlug: category,
        }),
      })

      if (!response.ok) {
        throw new Error('Publishing failed')
      }

      const published = await response.json()
      alert(`✅ Article published! View at: /${category}/${published.slug}`)

      // Reset form
      setTopic('')
      setContext('')
      setGeneratedArticle(null)
    } catch (err) {
      setError('Failed to publish article')
      console.error(err)
    } finally {
      setIsPublishing(false)
    }
  }

  const wordCount = generatedArticle?.content?.split(/\s+/).length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Generate Article</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered content generation with enhanced prompts (1800-2200 words)
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Article Details</h2>

              {/* Content Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <div className="flex gap-2">
                  {(['NEWS', 'REVIEW', 'FEATURE'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${contentType === type
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Topic / Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Apple M4 Pro chip announcement"
                  className="w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Context */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Focus on AI performance, 3nm process, competes with Snapdragon X Elite..."
                  rows={4}
                  className="w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add specific details, dates, specs, or competitors to mention
                </p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="tech">Tech</option>
                  <option value="ai-news">AI News</option>
                  <option value="reviews">Reviews</option>
                  <option value="gaming">Gaming</option>
                  <option value="deals">Deals</option>
                </select>
              </div>

              {/* Legacy Presets */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Populate from Legacy Article</label>
                <div className="flex flex-wrap gap-2">
                  {LEGACY_ARTICLES.map((article) => (
                    <button
                      key={article.slug}
                      onClick={() => loadPreset(article)}
                      className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-full border transition-colors"
                    >
                      {article.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating... (~30-60 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Article
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive p-4 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview */}
          <div>
            {generatedArticle ? (
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Preview</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={wordCount >= 1800 ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                      {wordCount.toLocaleString()} words
                    </span>
                    {wordCount >= 1800 && <Check className="h-5 w-5 text-green-600" />}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">{generatedArticle.title}</h3>
                  </div>
                  <div className="text-muted-foreground">
                    <p>{generatedArticle.excerpt}</p>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/20">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {generatedArticle.content}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full py-6 text-lg"
                    variant="default"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Publish to Website
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isGenerating
                    ? 'Generating your article with AI...'
                    : 'Fill in the form and click Generate to create an article'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

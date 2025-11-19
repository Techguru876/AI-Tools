'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Loader2 } from 'lucide-react'

export default function AIGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<any>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    type: 'ARTICLE',
    topic: '',
    additionalContext: '',
    specifications: '',
    product1: '',
    product2: '',
    aiProvider: 'claude',
  })

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast({
        title: 'Error',
        description: 'Please enter a topic',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setGenerated(data)

      toast({
        title: 'Success!',
        description: 'Content generated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">AI Content Generator</h2>
        <p className="text-muted-foreground">
          Generate high-quality tech articles using AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Content Parameters</CardTitle>
            <CardDescription>Configure what you want to generate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Content Type</Label>
              <select
                id="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="ARTICLE">Article</option>
                <option value="NEWS">Tech News</option>
                <option value="AI_NEWS">AI News</option>
                <option value="REVIEW">Product Review</option>
                <option value="GUIDE">How-to Guide</option>
                <option value="COMPARISON">Comparison</option>
                <option value="ROUNDUP">Best Of Roundup</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiProvider">AI Provider</Label>
              <select
                id="aiProvider"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.aiProvider}
                onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value })}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="openai">GPT-4 (OpenAI)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Claude is recommended for tech content. GPT-4 is faster but may be less detailed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., iPhone 15 Pro Max"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            {formData.type === 'COMPARISON' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="product1">Product 1</Label>
                  <Input
                    id="product1"
                    placeholder="e.g., iPhone 15 Pro"
                    value={formData.product1}
                    onChange={(e) => setFormData({ ...formData, product1: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product2">Product 2</Label>
                  <Input
                    id="product2"
                    placeholder="e.g., Samsung Galaxy S24"
                    value={formData.product2}
                    onChange={(e) => setFormData({ ...formData, product2: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                placeholder="Any specific details, requirements, or context..."
                value={formData.additionalContext}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                rows={3}
              />
            </div>

            {formData.type === 'REVIEW' && (
              <div className="space-y-2">
                <Label htmlFor="specs">Product Specifications (Optional)</Label>
                <Textarea
                  id="specs"
                  placeholder="Key specs to include in the review..."
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Generated content will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {generated ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Title</h3>
                  <p>{generated.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Excerpt</h3>
                  <p className="text-sm text-muted-foreground">{generated.excerpt}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Content</h3>
                  <div className="prose prose-sm max-h-96 overflow-y-auto rounded border p-4">
                    <div dangerouslySetInnerHTML={{ __html: generated.content }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Save as Draft</Button>
                  <Button variant="outline">Publish</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12" />
                  <p>Fill in the form and click Generate to see content here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

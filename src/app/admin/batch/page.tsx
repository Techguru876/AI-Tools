'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Zap, RefreshCw, Clock, BarChart3 } from 'lucide-react'

export default function BatchGeneratorPage() {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const { toast } = useToast()

    const [settings, setSettings] = useState({
        count: 3,
        autoPublish: false,
    })

    const handleBatchGenerate = async () => {
        setLoading(true)
        setResults(null)

        try {
            const response = await fetch('/api/generate/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    count: settings.count,
                    autoPublish: settings.autoPublish,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Batch generation failed')
            }

            setResults(data)

            toast({
                title: 'Batch Complete!',
                description: `Generated ${data.generated} articles${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to generate batch. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleTriggerCron = async () => {
        setLoading(true)

        try {
            const response = await fetch('/api/cron/generate', {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Cron trigger failed')
            }

            setResults(data.details)

            toast({
                title: 'Cron Triggered!',
                description: data.message,
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Batch Content Generator</h2>
                <p className="text-muted-foreground">
                    Generate multiple articles at once using AI automation
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Batch Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Batch Generation
                        </CardTitle>
                        <CardDescription>
                            Generate multiple articles based on content mix algorithm
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="count">Number of Articles</Label>
                            <Input
                                id="count"
                                type="number"
                                min={1}
                                max={10}
                                value={settings.count}
                                onChange={(e) => setSettings({ ...settings, count: parseInt(e.target.value) || 1 })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Max 10 articles per batch to manage API costs
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoPublish"
                                checked={settings.autoPublish}
                                onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                                className="rounded"
                            />
                            <Label htmlFor="autoPublish">Auto-publish (skip review queue)</Label>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="mb-2 font-semibold">Content Mix:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• 50% Tech News</li>
                                <li>• 15% AI News</li>
                                <li>• 15% Reviews</li>
                                <li>• 10% Guides</li>
                                <li>• 10% Comparisons</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleBatchGenerate}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Generate Batch
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Cron Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Scheduled Generation
                        </CardTitle>
                        <CardDescription>
                            Automatic content generation runs every 2 hours
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="mb-2 font-semibold">Schedule:</h4>
                            <p className="font-mono text-sm">0 */2 * * *</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Every 2 hours (12 times/day)
                            </p>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="mb-2 font-semibold">Auto-generation:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• 2 articles off-peak (12am-9am)</li>
                                <li>• 3 articles peak hours (9am-9pm)</li>
                                <li>• ~30 articles/day automatically</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleTriggerCron}
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Trigger Cron Manually
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Generation Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex gap-4">
                            <div className="rounded-lg bg-green-500/10 px-4 py-2 text-green-600">
                                ✅ Generated: {results.generated}
                            </div>
                            {results.failed > 0 && (
                                <div className="rounded-lg bg-red-500/10 px-4 py-2 text-red-600">
                                    ❌ Failed: {results.failed}
                                </div>
                            )}
                        </div>

                        {results.posts && results.posts.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold">Generated Articles:</h4>
                                <div className="max-h-64 overflow-y-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Title</th>
                                                <th className="px-3 py-2 text-left">Type</th>
                                                <th className="px-3 py-2 text-left">Status</th>
                                                <th className="px-3 py-2 text-right">Tokens</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.posts.map((post: any) => (
                                                <tr key={post.id} className="border-t">
                                                    <td className="px-3 py-2">{post.title}</td>
                                                    <td className="px-3 py-2">{post.contentType}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`rounded px-2 py-0.5 text-xs ${post.status === 'PUBLISHED'
                                                                ? 'bg-green-500/10 text-green-600'
                                                                : 'bg-yellow-500/10 text-yellow-600'
                                                            }`}>
                                                            {post.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">{post.tokensUsed?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {results.errors && results.errors.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="font-semibold text-red-600">Errors:</h4>
                                {results.errors.map((err: any, i: number) => (
                                    <div key={i} className="rounded bg-red-500/10 p-2 text-sm text-red-600">
                                        {err.topic}: {err.error}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

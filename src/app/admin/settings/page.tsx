'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Key } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
    const [saved, setSaved] = useState(false)
    const openAIConfigured = process.env.NEXT_PUBLIC_HAS_OPENAI === 'true'
    const anthropicConfigured = process.env.NEXT_PUBLIC_HAS_ANTHROPIC === 'true'

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Settings</h2>
                <p className="text-muted-foreground">Configure your blog settings</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        General Settings
                    </CardTitle>
                    <CardDescription>Basic configuration for your blog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input id="siteName" defaultValue="TechBlog USA" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Input id="siteDescription" defaultValue="Your source for the latest in technology news and reviews" />
                    </div>
                    <Button onClick={handleSave}>
                        {saved ? 'ƒo" Saved!' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Configuration
                    </CardTitle>
                    <CardDescription>
                        API keys are configured via environment variables (.env.local)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span>OpenAI API</span>
                            <span className={openAIConfigured ? 'text-green-600' : 'text-yellow-600'}>
                                {openAIConfigured ? 'ƒo" Configured' : 'ƒ-< Not Set'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span>Anthropic API (optional)</span>
                            <span className={anthropicConfigured ? 'text-green-600' : 'text-yellow-600'}>
                                {anthropicConfigured ? 'ƒo" Configured' : 'ƒ-< Not Set'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span>Database</span>
                            <span className="text-green-600">ƒo" Connected</span>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                        To configure API keys, add them to your <code className="bg-muted px-1 rounded">.env.local</code> file and restart the server.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

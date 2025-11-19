'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NewsletterWidget() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual newsletter subscription
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 3000)
  }

  return (
    <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Daily Newsletter</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Get the day's top tech stories delivered to your inbox every morning.
      </p>

      {!subscribed ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background"
          />
          <Button type="submit" className="w-full" size="sm">
            Subscribe
          </Button>
          <p className="text-xs text-muted-foreground">
            Free. Unsubscribe anytime.
          </p>
        </form>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
          <Check className="h-4 w-4" />
          <span>Thanks for subscribing!</span>
        </div>
      )}
    </div>
  )
}

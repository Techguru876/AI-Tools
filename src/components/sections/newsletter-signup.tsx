'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
      })
      setEmail('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-16">
      <div className="mx-auto max-w-2xl rounded-lg border bg-muted/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Mail className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="mb-2 text-3xl font-bold">Stay in the Loop</h2>
        <p className="mb-6 text-muted-foreground">
          Get the latest tech news, reviews, and exclusive deals delivered to your inbox every week.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from our
          company.
        </p>
      </div>
    </section>
  )
}

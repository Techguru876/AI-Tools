import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewsletterModalProps {
    isOpen: boolean
    onClose: () => void
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // TODO: Implement newsletter API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSuccess(true)
        setIsSubmitting(false)

        setTimeout(() => {
            onClose()
            setIsSuccess(false)
            setEmail('')
        }, 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {!isSuccess ? (
                    <>
                        <h2 className="mb-2 text-3xl font-bold">Stay Updated</h2>
                        <p className="mb-6 text-muted-foreground">
                            Get the latest tech news and insights delivered to your inbox daily.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-6 text-lg"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                No spam. Unsubscribe anytime.
                            </p>
                        </form>
                    </>
                ) : (
                    <div className="py-8 text-center">
                        <div className="mb-4 text-6xl">🎉</div>
                        <h3 className="text-2xl font-bold text-primary">Welcome aboard!</h3>
                        <p className="mt-2 text-muted-foreground">
                            Check your inbox for a confirmation email.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

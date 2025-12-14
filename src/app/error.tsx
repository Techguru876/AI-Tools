'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="mb-6 text-6xl">⚠️</div>
                <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
                <p className="mb-6 text-muted-foreground">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={reset}>Try Again</Button>
                    <Button variant="outline" onClick={() => (window.location.href = '/')}>
                        Go Home
                    </Button>
                </div>
                {error.digest && (
                    <p className="mt-4 text-xs text-muted-foreground">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}

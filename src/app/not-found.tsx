import { NextResponse } from 'next/server'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
                <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
                <p className="mb-8 text-muted-foreground">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/"
                        className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Go Home
                    </a>
                    <a
                        href="/search"
                        className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
                    >
                        Search
                    </a>
                </div>
            </div>
        </div>
    )
}

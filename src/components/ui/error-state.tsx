import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  error?: Error | string
  onRetry?: () => void
  onGoHome?: () => void
  showDetails?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  error,
  onRetry,
  onGoHome,
  showDetails = false,
  className,
}: ErrorStateProps) {
  const errorMessage =
    typeof error === 'string' ? error : error?.message || 'Unknown error'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-destructive">{title}</h3>

      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>

      {showDetails && error && (
        <details className="mb-6 w-full max-w-lg text-left">
          <summary className="mb-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
            <code>{errorMessage}</code>
          </pre>
        </details>
      )}

      <div className="flex gap-4">
        {onRetry && (
          <Button onClick={onRetry} variant="default" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline" size="lg">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  )
}

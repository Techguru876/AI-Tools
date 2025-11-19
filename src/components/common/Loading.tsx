/**
 * Loading Component - Professional loading states
 */

import './Loading.css'

interface LoadingProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullscreen?: boolean
}

export default function Loading({ size = 'medium', text, fullscreen = false }: LoadingProps) {
  const content = (
    <div className={`loading loading-${size}`}>
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  )

  if (fullscreen) {
    return <div className="loading-fullscreen">{content}</div>
  }

  return content
}

export function LoadingSkeleton({ count = 1, height = 80 }: { count?: number; height?: number }) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: `${height}px` }}></div>
      ))}
    </div>
  )
}

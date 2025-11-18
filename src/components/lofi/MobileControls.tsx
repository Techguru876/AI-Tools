/**
 * Mobile Companion Component
 * Touch-optimized controls for tablets and mobile devices
 */

import { useEffect } from 'react'
import { useLofiStore } from '../../stores/lofiStore'
import './MobileControls.css'

export default function MobileControls() {
  const { zoom, setZoom, isPlaying, play, pause } = useLofiStore()

  useEffect(() => {
    // Touch gesture handlers
    const handlePinch = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        // Pinch-to-zoom logic would go here
      }
    }

    const handleTwoFingerPan = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        // Two-finger pan logic would go here
      }
    }

    document.addEventListener('touchstart', handlePinch, { passive: false })
    document.addEventListener('touchmove', handleTwoFingerPan, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handlePinch)
      document.removeEventListener('touchmove', handleTwoFingerPan)
    }
  }, [])

  return (
    <div className="mobile-controls">
      <div className="mobile-toolbar">
        <button className="mobile-btn" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
          🔍-
        </button>
        <button className="mobile-btn" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
          🔍+
        </button>
        <button className="mobile-btn large" onClick={isPlaying ? pause : play}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      <div className="touch-hints">
        <div className="hint-item">
          <span>👆</span>
          <span>Tap to select</span>
        </div>
        <div className="hint-item">
          <span>👉</span>
          <span>Drag to move</span>
        </div>
        <div className="hint-item">
          <span>🤏</span>
          <span>Pinch to zoom</span>
        </div>
        <div className="hint-item">
          <span>✌️</span>
          <span>Two fingers to pan</span>
        </div>
      </div>
    </div>
  )
}

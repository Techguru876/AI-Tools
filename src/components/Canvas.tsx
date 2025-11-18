/**
 * Canvas Component
 * Main preview/editing canvas - displays video frames or image layers
 */

import { useRef, useEffect, useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import '../styles/Canvas.css'

interface CanvasProps {
  activeMode: 'video' | 'photo'
}

export default function Canvas({ activeMode }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { project, currentTime } = useProjectStore()
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    if (!canvasRef.current || !project) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = project.settings.width
    canvas.height = project.settings.height

    // Clear canvas
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    const gridSize = 50

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // In a real implementation, this would:
    // - Render video frames at current time
    // - Composite image layers
    // - Apply effects in real-time
    // - Handle GPU acceleration

  }, [project, currentTime, activeMode])

  return (
    <div className="canvas-container">
      <div className="canvas-controls">
        <button onClick={() => setZoom(Math.max(10, zoom - 10))}>-</button>
        <span>{zoom}%</span>
        <button onClick={() => setZoom(Math.min(400, zoom + 10))}>+</button>
        <button onClick={() => setZoom(100)}>Fit</button>
      </div>

      <div className="canvas-viewport" style={{ transform: `scale(${zoom / 100})` }}>
        <canvas ref={canvasRef} className="main-canvas" />
      </div>

      <div className="canvas-info">
        {project && `${project.settings.width} × ${project.settings.height}`}
        {activeMode === 'video' && ` | ${currentTime.toFixed(2)}s`}
      </div>
    </div>
  )
}

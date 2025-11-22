/**
 * Lofi Canvas - Drag-and-Drop Scene Builder
 * WYSIWYG canvas where users can build lofi scenes by dragging and dropping elements
 * No technical skills required - fully visual and intuitive
 */

import { useRef, useState, useEffect } from 'react'
import { useLofiStore } from '../../stores/lofiStore'
import type { SceneElement } from '../../stores/lofiStore'
import './LofiCanvas.css'

interface LofiCanvasProps {
  width: number
  height: number
  showGrid?: boolean
  showGuides?: boolean
}

export default function LofiCanvas({
  width,
  height,
  showGrid = true,
  showGuides = true,
}: LofiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { currentScene, selectedElement, selectElement, updateElement, isPlaying } = useLofiStore()

  const [draggingElement, setDraggingElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)

  // Render scene to canvas
  useEffect(() => {
    if (!canvasRef.current || !currentScene) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.fillStyle = currentScene.lighting?.ambient_color
      ? `rgb(${currentScene.lighting.ambient_color.join(',')})`
      : '#1a1a24'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height)
    }

    // Render all scene elements in z-index order
    const allElements = [
      currentScene.background ? [currentScene.background] : [],
      ...currentScene.characters,
      ...currentScene.props,
      ...currentScene.overlays,
      currentScene.foreground ? [currentScene.foreground] : [],
    ].flat().sort((a, b) => a.z_index - b.z_index)

    for (const element of allElements) {
      renderElement(ctx, element)
    }

    // Draw selection box for selected element
    if (selectedElement) {
      const element = allElements.find(e => e.id === selectedElement)
      if (element) {
        drawSelectionBox(ctx, element)
      }
    }

    // Draw guides if enabled
    if (showGuides && selectedElement) {
      const element = allElements.find(e => e.id === selectedElement)
      if (element) {
        drawGuides(ctx, element, canvas.width, canvas.height)
      }
    }
  }, [currentScene, selectedElement, width, height, showGrid, showGuides, isPlaying])

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)'
    ctx.lineWidth = 1

    const gridSize = 50

    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  }

  // Image cache for performance
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  const renderElement = (ctx: CanvasRenderingContext2D, element: SceneElement) => {
    ctx.save()

    // Apply transforms
    ctx.translate(element.x, element.y)
    ctx.rotate((element.rotation * Math.PI) / 180)
    ctx.scale(element.scale, element.scale)
    ctx.globalAlpha = element.opacity

    // Apply blend mode if specified
    if (element.blend_mode) {
      ctx.globalCompositeOperation = element.blend_mode.toLowerCase() as GlobalCompositeOperation
    }

    // Load and render actual image
    const imageUrl = getElementImageUrl(element)

    if (imageUrl) {
      let img = imageCache.current.get(imageUrl)

      if (!img) {
        // Create and cache image
        img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imageUrl
        imageCache.current.set(imageUrl, img)

        // Re-render when image loads
        img.onload = () => {
          if (canvasRef.current) {
            // Trigger re-render by updating a state that causes useEffect to run
            setZoom((z) => z) // Dummy update to trigger re-render
          }
        }

        img.onerror = () => {
          console.error(`Failed to load image: ${imageUrl}`)
          // Remove from cache so it can be retried
          imageCache.current.delete(imageUrl)
        }
      }

      // Draw image if loaded
      if (img.complete && img.naturalWidth > 0) {
        const imgWidth = img.naturalWidth
        const imgHeight = img.naturalHeight
        const aspectRatio = imgWidth / imgHeight

        // Default render size based on element type
        let renderWidth = 200
        let renderHeight = 200 / aspectRatio

        if (element.element_type === 'Background') {
          // Backgrounds cover the entire canvas
          renderWidth = width
          renderHeight = height
        } else if (element.element_type === 'Character') {
          renderWidth = 150
          renderHeight = 150 / aspectRatio
        } else if (element.element_type === 'Prop') {
          renderWidth = 100
          renderHeight = 100 / aspectRatio
        }

        ctx.drawImage(
          img,
          -renderWidth / 2,
          -renderHeight / 2,
          renderWidth,
          renderHeight
        )
      } else {
        // Draw placeholder while loading
        drawPlaceholder(ctx, element)
      }
    } else {
      // No image URL, draw placeholder
      drawPlaceholder(ctx, element)
    }

    ctx.restore()
  }

  const getElementImageUrl = (element: SceneElement): string | null => {
    // Extract image URL from various source types
    if (element.source) {
      if (typeof element.source === 'string') {
        return element.source
      } else if (typeof element.source === 'object') {
        if ('path' in element.source) {
          return element.source.path
        } else if ('url' in element.source) {
          return element.source.url
        }
      }
    }
    // @ts-ignore - Legacy support for old templates
    return element.image_url || null
  }

  const drawPlaceholder = (ctx: CanvasRenderingContext2D, element: SceneElement) => {
    // Draw placeholder rectangle
    ctx.fillStyle = element.element_type === 'Background' ? '#2a2a3a' : 'rgba(0, 217, 255, 0.3)'
    ctx.strokeStyle = '#00d9ff'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    const size = element.element_type === 'Background' ? 100 : 60
    ctx.fillRect(-size / 2, -size / 2, size, size)
    ctx.strokeRect(-size / 2, -size / 2, size, size)

    // Draw element name
    ctx.setLineDash([])
    ctx.fillStyle = '#ffffff'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(element.name || element.element_type, 0, size / 2 + 15)
  }

  const drawSelectionBox = (ctx: CanvasRenderingContext2D, element: SceneElement) => {
    ctx.save()
    ctx.translate(element.x, element.y)
    ctx.rotate((element.rotation * Math.PI) / 180)
    ctx.scale(element.scale, element.scale)

    // Selection box
    ctx.strokeStyle = '#00d9ff'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(-55, -55, 110, 110)

    // Resize handles
    const handles = [
      { x: -55, y: -55 }, // Top-left
      { x: 55, y: -55 },  // Top-right
      { x: -55, y: 55 },  // Bottom-left
      { x: 55, y: 55 },   // Bottom-right
    ]

    ctx.fillStyle = '#00d9ff'
    for (const handle of handles) {
      ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8)
    }

    ctx.restore()
  }

  const drawGuides = (ctx: CanvasRenderingContext2D, element: SceneElement, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Center guides
    if (Math.abs(element.x - w / 2) < 10) {
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.lineTo(w / 2, h)
      ctx.stroke()
    }

    if (Math.abs(element.y - h / 2) < 10) {
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentScene) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    // Find clicked element (reverse order to check top elements first)
    const allElements = [
      currentScene.foreground ? [currentScene.foreground] : [],
      ...currentScene.overlays,
      ...currentScene.props,
      ...currentScene.characters,
      currentScene.background ? [currentScene.background] : [],
    ].flat()

    for (const element of allElements) {
      const dx = x - element.x
      const dy = y - element.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 55 * element.scale) {
        selectElement(element.id)
        return
      }
    }

    // Clicked empty space
    selectElement(null)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedElement) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const element = [
      currentScene?.background,
      ...(currentScene?.characters || []),
      ...(currentScene?.props || []),
      ...(currentScene?.overlays || []),
      currentScene?.foreground,
    ].find(e => e?.id === selectedElement)

    if (element) {
      setDraggingElement(element.id)
      setDragOffset({ x: x - element.x, y: y - element.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    updateElement(draggingElement, {
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    })
  }

  const handleMouseUp = () => {
    setDraggingElement(null)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(prevZoom => Math.max(0.1, Math.min(4, prevZoom * delta)))
    }
  }

  return (
    <div className="lofi-canvas-container" ref={containerRef} onWheel={handleWheel}>
      {/* Canvas controls */}
      <div className="canvas-controls">
        <button
          onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
          title="Zoom Out"
        >
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(z => Math.min(4, z + 0.1))}
          title="Zoom In"
        >
          +
        </button>
        <button onClick={() => setZoom(1)} title="Reset Zoom">
          Fit
        </button>

        <div className="canvas-control-divider" />

        <button
          className={showGrid ? 'active' : ''}
          title="Toggle Grid"
        >
          #
        </button>
        <button
          className={showGuides ? 'active' : ''}
          title="Toggle Guides"
        >
          |
        </button>
      </div>

      {/* Main canvas */}
      <div className="canvas-viewport" style={{ transform: `scale(${zoom})` }}>
        <canvas
          ref={canvasRef}
          className="lofi-canvas"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Element info overlay */}
      {selectedElement && (
        <div className="element-info">
          <span>Selected: {currentScene?.characters.find(e => e.id === selectedElement)?.name || 'Element'}</span>
          <span>Use arrow keys to move, or drag directly</span>
        </div>
      )}

      {/* Drop hint */}
      <div className="drop-hint">
        💡 Drag elements from the library onto the canvas to build your scene
      </div>
    </div>
  )
}

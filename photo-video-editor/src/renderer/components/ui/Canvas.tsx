/**
 * CANVAS COMPONENT
 *
 * Main canvas for viewing and editing video frames or images
 * Features:
 * - Real-time preview
 * - Pan and zoom
 * - Tool interactions
 * - Grid and guides
 * - Transform controls
 */

import React, { useRef, useEffect, useState } from 'react';
import { useTools } from '../../contexts/ToolsContext';
import { useTimeline } from '../../contexts/TimelineContext';
import './Canvas.css';

interface CanvasProps {
  mode: 'video' | 'image' | 'hybrid';
}

const Canvas: React.FC<CanvasProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeTool, brushSize, foregroundColor } = useTools();
  const { playhead } = useTimeline();
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    drawCheckerboard(ctx, canvas.width, canvas.height);

    // Draw content based on mode
    if (mode === 'video') {
      drawVideoFrame(ctx);
    } else if (mode === 'image') {
      drawImageLayers(ctx);
    }

    // Draw guides and grid
    drawGrid(ctx, canvas.width, canvas.height);
  }, [mode, playhead, zoom, pan]);

  const drawCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const size = 10;
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#E0E0E0' : '#FFFFFF';
        ctx.fillRect(x, y, size, size);
      }
    }
  };

  const drawVideoFrame = (ctx: CanvasRenderingContext2D) => {
    // Placeholder for video frame rendering
    ctx.fillStyle = '#333';
    ctx.fillRect(100, 100, 400, 300);
    ctx.fillStyle = '#FFF';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Frame at ${playhead.toFixed(2)}s`, 150, 250);
  };

  const drawImageLayers = (ctx: CanvasRenderingContext2D) => {
    // Placeholder for layer compositing
    ctx.fillStyle = '#666';
    ctx.fillRect(100, 100, 400, 300);
    ctx.fillStyle = '#FFF';
    ctx.font = '16px sans-serif';
    ctx.fillText('Image Composition', 200, 250);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(prev => Math.max(10, Math.min(500, prev + delta)));
    }
  };

  return (
    <div className="canvas-container">
      <div className="canvas-toolbar">
        <div className="zoom-controls">
          <button onClick={() => setZoom(prev => Math.max(10, prev - 10))}>-</button>
          <span>{zoom}%</span>
          <button onClick={() => setZoom(prev => Math.min(500, prev + 10))}>+</button>
          <button onClick={() => setZoom(100)}>Fit</button>
        </div>
      </div>

      <div className="canvas-wrapper" onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          style={{ transform: `scale(${zoom / 100})` }}
        />
      </div>
    </div>
  );
};

export default Canvas;

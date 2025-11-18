/**
 * Toolbar Component
 * Left sidebar with editing tools (selection, brush, text, shapes, etc.)
 */

import { useState } from 'react'
import '../styles/Toolbar.css'

interface ToolbarProps {
  activeMode: 'video' | 'photo'
}

export default function Toolbar({ activeMode }: ToolbarProps) {
  const [activeTool, setActiveTool] = useState('select')

  const videoTools = [
    { id: 'select', name: 'Selection', icon: '⬆' },
    { id: 'razor', name: 'Razor', icon: '✂' },
    { id: 'hand', name: 'Hand', icon: '✋' },
    { id: 'zoom', name: 'Zoom', icon: '🔍' },
  ]

  const photoTools = [
    { id: 'select', name: 'Selection', icon: '⬆' },
    { id: 'move', name: 'Move', icon: '✥' },
    { id: 'brush', name: 'Brush', icon: '🖌' },
    { id: 'eraser', name: 'Eraser', icon: '⌫' },
    { id: 'text', name: 'Text', icon: 'T' },
    { id: 'shape', name: 'Shape', icon: '▭' },
    { id: 'gradient', name: 'Gradient', icon: '◧' },
    { id: 'eyedropper', name: 'Eyedropper', icon: '💧' },
    { id: 'clone', name: 'Clone Stamp', icon: '⚭' },
    { id: 'heal', name: 'Healing Brush', icon: '🩹' },
    { id: 'magic-wand', name: 'Magic Wand', icon: '🪄' },
    { id: 'lasso', name: 'Lasso', icon: '⟲' },
  ]

  const tools = activeMode === 'video' ? videoTools : photoTools

  return (
    <div className="toolbar">
      <div className="toolbar-title">Tools</div>
      <div className="toolbar-tools">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
            title={tool.name}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-name">{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

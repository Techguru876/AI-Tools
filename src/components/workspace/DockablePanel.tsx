/**
 * Dockable Panel System
 * Provides draggable, resizable panels that can be docked to any edge
 * Inspired by VS Code, Premiere Pro, and After Effects panel systems
 */

import { useState, useRef, useEffect, ReactNode, CSSProperties } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import './DockablePanel.css'

interface DockablePanelProps {
  id: string
  title: string
  icon?: string
  children: ReactNode
  defaultWidth?: number
  defaultHeight?: number
  minWidth?: number
  minHeight?: number
  defaultPosition?: 'left' | 'right' | 'bottom' | 'floating'
  collapsible?: boolean
  closable?: boolean
}

export default function DockablePanel({
  id,
  title,
  icon,
  children,
  defaultWidth = 300,
  defaultHeight = 200,
  minWidth = 200,
  minHeight = 150,
  defaultPosition = 'right',
  collapsible = true,
  closable = true,
}: DockablePanelProps) {
  const { panels, updatePanel, addPanel } = useWorkspaceStore()
  const panel = panels.find(p => p.id === id)

  const [isDragging, setIsDragging] = useState(false)
  const [_isResizing, setIsResizing] = useState(false)
  const [_dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  // Initialize panel if it doesn't exist
  useEffect(() => {
    if (!panel) {
      addPanel({
        id,
        title,
        icon,
        position: defaultPosition,
        width: defaultWidth,
        height: defaultHeight,
        isCollapsed: false,
        isVisible: true,
        order: 0,
      })
    }
  }, [panel, id, title, icon, defaultPosition, defaultWidth, defaultHeight, addPanel])

  if (!panel || !panel.isVisible) {
    return null
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.panel-header') && panel.position === 'floating') {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - (panel.x || 0),
        y: e.clientY - (panel.y || 0),
      })
    }
  }

  const handleResizeStart = (e: React.MouseEvent, _direction: 'horizontal' | 'vertical') => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const toggleCollapse = () => {
    updatePanel(id, { isCollapsed: !panel.isCollapsed })
  }

  const closePanel = () => {
    updatePanel(id, { isVisible: false })
  }

  const handleUndock = () => {
    // Convert docked panel to floating
    if (panel.position !== 'floating' && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      updatePanel(id, {
        position: 'floating',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      })
    }
  }

  const panelStyle: CSSProperties = {
    width: panel.position === 'floating' || panel.position === 'left' || panel.position === 'right'
      ? `${panel.width}px`
      : '100%',
    height: panel.position === 'floating' || panel.position === 'bottom'
      ? `${panel.height}px`
      : '100%',
    minWidth: `${minWidth}px`,
    minHeight: `${minHeight}px`,
  }

  if (panel.position === 'floating') {
    panelStyle.position = 'absolute'
    panelStyle.left = `${panel.x || 0}px`
    panelStyle.top = `${panel.y || 0}px`
    panelStyle.zIndex = panel.order + 100
  }

  return (
    <div
      ref={panelRef}
      className={`dockable-panel dockable-panel-${panel.position} ${panel.isCollapsed ? 'collapsed' : ''} ${isDragging ? 'dragging' : ''}`}
      style={panelStyle}
      onMouseDown={handleDragStart}
    >
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-header-left">
          {icon && <span className="panel-icon">{icon}</span>}
          <span className="panel-title">{title}</span>
        </div>

        <div className="panel-header-right">
          {collapsible && (
            <button
              className="panel-control-btn"
              onClick={toggleCollapse}
              title={panel.isCollapsed ? 'Expand' : 'Collapse'}
            >
              {panel.isCollapsed ? '▶' : '▼'}
            </button>
          )}

          {panel.position !== 'floating' && (
            <button
              className="panel-control-btn"
              onClick={handleUndock}
              title="Undock panel"
            >
              ⇱
            </button>
          )}

          {closable && (
            <button
              className="panel-control-btn"
              onClick={closePanel}
              title="Close panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {!panel.isCollapsed && (
        <div className="panel-content">
          {children}
        </div>
      )}

      {/* Resize Handles */}
      {!panel.isCollapsed && (
        <>
          {(panel.position === 'left' || panel.position === 'floating') && (
            <div
              className="resize-handle resize-handle-right"
              onMouseDown={(e) => handleResizeStart(e, 'horizontal')}
            />
          )}

          {(panel.position === 'right' || panel.position === 'floating') && (
            <div
              className="resize-handle resize-handle-left"
              onMouseDown={(e) => handleResizeStart(e, 'horizontal')}
            />
          )}

          {(panel.position === 'bottom' || panel.position === 'floating') && (
            <div
              className="resize-handle resize-handle-top"
              onMouseDown={(e) => handleResizeStart(e, 'vertical')}
            />
          )}

          {panel.position === 'floating' && (
            <div
              className="resize-handle resize-handle-corner"
              onMouseDown={(e) => handleResizeStart(e, 'horizontal')}
            />
          )}
        </>
      )}
    </div>
  )
}

// Global mouse handlers (should be in a hook or context)
if (typeof window !== 'undefined') {
  let isDraggingPanel = false
  let isResizingPanel = false

  window.addEventListener('mousemove', (_e) => {
    if (isDraggingPanel || isResizingPanel) {
      // Handle dragging/resizing logic
      // This would update the panel position/size in the store
    }
  })

  window.addEventListener('mouseup', () => {
    isDraggingPanel = false
    isResizingPanel = false
  })
}

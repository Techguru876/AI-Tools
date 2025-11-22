/**
 * Main Application Component
 * Orchestrates the entire UI layout: menu bar, toolbars, panels, canvas
 */

import { useState, useEffect } from 'react'
// NOTE: Tauri imports disabled - this is legacy PhotoVideo Pro code
// import { invoke } from '@tauri-apps/api/tauri'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Timeline from './components/Timeline'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import LayersPanel from './components/LayersPanel'
import EffectsPanel from './components/EffectsPanel'
import AssetLibrary from './components/AssetLibrary'
import LogsPanel from './components/common/LogsPanel'
import { useProjectStore } from './stores/projectStore'
import { logger } from './utils/logger'
import './styles/App.css'

function App() {
  const [activeMode, setActiveMode] = useState<'video' | 'photo'>('video')
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [showLogs, setShowLogs] = useState(false)
  const { initProject } = useProjectStore()

  useEffect(() => {
    // Initialize application
    async function init() {
      try {
        logger.systemEvent('Application initializing')

        // NOTE: Tauri invoke disabled - this is legacy PhotoVideo Pro code
        // Get system information
        // const info = await invoke('get_system_info')
        // setSystemInfo(info)
        setSystemInfo({ platform: 'electron', mode: 'legacy' })
        logger.systemEvent('System info loaded', 'success', { details: systemInfo })

        // Create a default project
        // const newProject = await invoke('create_new_project', {
        //   name: 'Untitled Project',
        //   settings: null,
        // })
        // initProject(newProject as any)
        logger.systemEvent('Application initialized (legacy mode)', 'warning')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        logger.error('system_event', 'Application initialization failed', error as Error)
      }
    }

    init()
  }, [])

  // Keyboard shortcut: Ctrl+Shift+L to toggle logs
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setShowLogs(prev => !prev)
        logger.userAction(showLogs ? 'Closed logs panel' : 'Opened logs panel')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showLogs])

  return (
    <div className="app">
      {/* Menu Bar */}
      <MenuBar activeMode={activeMode} onModeChange={setActiveMode} />

      {/* Main Content Area */}
      <div className="app-content">
        {/* Left Sidebar - Tools and Assets */}
        <div className="sidebar sidebar-left">
          <Toolbar activeMode={activeMode} />
          <AssetLibrary />
        </div>

        {/* Center - Canvas/Preview */}
        <div className="main-area">
          <Canvas activeMode={activeMode} />
          {activeMode === 'video' && <Timeline />}
        </div>

        {/* Right Sidebar - Panels */}
        <div className="sidebar sidebar-right">
          <PropertiesPanel />
          <LayersPanel activeMode={activeMode} />
          <EffectsPanel />
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <span>Ready</span>
        {systemInfo && (
          <span>
            {systemInfo.cpu_cores} cores | {Math.round(systemInfo.available_memory / (1024 * 1024 * 1024))} GB RAM
          </span>
        )}
      </div>

      {/* Developer Tools - Floating Logs Button */}
      <button
        onClick={() => {
          setShowLogs(true)
          logger.userAction('Opened logs panel via button')
        }}
        title="View Application Logs (Ctrl+Shift+L)"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          background: '#1e1e1e',
          color: '#fff',
          border: '1px solid #333',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#2d2d30'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#1e1e1e'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        <span style={{ fontSize: '18px' }}>📋</span>
        <span>Logs</span>
      </button>

      {/* Logs Panel */}
      <LogsPanel
        isOpen={showLogs}
        onClose={() => {
          setShowLogs(false)
          logger.userAction('Closed logs panel')
        }}
      />
    </div>
  )
}

export default App

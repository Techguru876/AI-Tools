/**
 * Main Application Component
 * Orchestrates the entire UI layout: menu bar, toolbars, panels, canvas
 */

import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Timeline from './components/Timeline'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import LayersPanel from './components/LayersPanel'
import EffectsPanel from './components/EffectsPanel'
import AssetLibrary from './components/AssetLibrary'
import { useProjectStore } from './stores/projectStore'
import './styles/App.css'

function App() {
  const [activeMode, setActiveMode] = useState<'video' | 'photo'>('video')
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const { project, initProject } = useProjectStore()

  useEffect(() => {
    // Initialize application
    async function init() {
      try {
        // Get system information
        const info = await invoke('get_system_info')
        setSystemInfo(info)

        // Create a default project
        const newProject = await invoke('create_new_project', {
          name: 'Untitled Project',
          settings: null,
        })
        initProject(newProject as any)
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    init()
  }, [])

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
    </div>
  )
}

export default App

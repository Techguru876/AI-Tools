/**
 * MAIN APPLICATION COMPONENT
 *
 * Root component that manages:
 * - Application layout
 * - State management
 * - Component composition
 * - Theme and styling
 */

import React, { useState, useEffect } from 'react';
import { ProjectProvider } from './contexts/ProjectContext';
import { TimelineProvider } from './contexts/TimelineContext';
import { ToolsProvider } from './contexts/ToolsContext';
import MenuBar from './components/ui/MenuBar';
import Toolbar from './components/ui/Toolbar';
import Timeline from './components/video/Timeline';
import LayersPanel from './components/image/LayersPanel';
import Canvas from './components/ui/Canvas';
import PropertiesPanel from './components/ui/PropertiesPanel';
import AssetsPanel from './components/ui/AssetsPanel';
import './styles/App.css';

const App: React.FC = () => {
  const [mode, setMode] = useState<'video' | 'image' | 'hybrid'>('hybrid');
  const [layout, setLayout] = useState<'default' | 'compact'>('default');

  useEffect(() => {
    // Initialize application
    console.log('Application started');

    // Listen for menu commands
    window.addEventListener('menu-new-project', handleNewProject);
    window.addEventListener('menu-open-project', handleOpenProject);
    window.addEventListener('menu-save', handleSave);
    window.addEventListener('menu-export', handleExport);

    return () => {
      window.removeEventListener('menu-new-project', handleNewProject);
      window.removeEventListener('menu-open-project', handleOpenProject);
      window.removeEventListener('menu-save', handleSave);
      window.removeEventListener('menu-export', handleExport);
    };
  }, []);

  const handleNewProject = () => {
    console.log('New project');
    // Show new project dialog
  };

  const handleOpenProject = () => {
    console.log('Open project');
    // Show file picker
  };

  const handleSave = () => {
    console.log('Save project');
    // Save current project
  };

  const handleExport = () => {
    console.log('Export project');
    // Show export dialog
  };

  return (
    <ProjectProvider>
      <TimelineProvider>
        <ToolsProvider>
          <div className="app">
            <MenuBar />

            <div className="app-content">
              <Toolbar onModeChange={setMode} currentMode={mode} />

              <div className="workspace">
                {/* Left sidebar - Assets and tools */}
                <div className="sidebar sidebar-left">
                  <AssetsPanel />
                </div>

                {/* Center - Main canvas/viewer */}
                <div className="main-area">
                  <Canvas mode={mode} />

                  {/* Bottom - Timeline for video mode */}
                  {(mode === 'video' || mode === 'hybrid') && (
                    <div className="timeline-container">
                      <Timeline />
                    </div>
                  )}
                </div>

                {/* Right sidebar - Layers and properties */}
                <div className="sidebar sidebar-right">
                  {(mode === 'image' || mode === 'hybrid') && (
                    <LayersPanel />
                  )}
                  <PropertiesPanel />
                </div>
              </div>
            </div>
          </div>
        </ToolsProvider>
      </TimelineProvider>
    </ProjectProvider>
  );
};

export default App;

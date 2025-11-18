/**
 * MenuBar Component
 * Top application menu with File, Edit, View, Effects, Export options
 */

import { invoke } from '@tauri-apps/api/tauri'
import { open, save } from '@tauri-apps/api/dialog'
import { useProjectStore } from '../stores/projectStore'
import '../styles/MenuBar.css'

interface MenuBarProps {
  activeMode: 'video' | 'photo'
  onModeChange: (mode: 'video' | 'photo') => void
}

export default function MenuBar({ activeMode, onModeChange }: MenuBarProps) {
  const { project, updateProject } = useProjectStore()

  const handleNew = async () => {
    const newProject = await invoke('create_new_project', {
      name: 'Untitled Project',
      settings: null,
    })
    updateProject(newProject as any)
  }

  const handleOpen = async () => {
    const selected = await open({
      filters: [{ name: 'PhotoVideo Pro Project', extensions: ['pvp'] }],
    })

    if (selected && typeof selected === 'string') {
      try {
        const loadedProject = await invoke('open_project', { path: selected })
        updateProject(loadedProject as any)
      } catch (error) {
        console.error('Failed to open project:', error)
      }
    }
  }

  const handleSave = async () => {
    if (!project) return

    try {
      if (project.path) {
        await invoke('save_project', { project })
      } else {
        await handleSaveAs()
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const handleSaveAs = async () => {
    if (!project) return

    const selected = await save({
      filters: [{ name: 'PhotoVideo Pro Project', extensions: ['pvp'] }],
      defaultPath: `${project.name}.pvp`,
    })

    if (selected) {
      try {
        await invoke('save_project', { project: { ...project, path: selected } })
      } catch (error) {
        console.error('Failed to save project:', error)
      }
    }
  }

  const handleExport = async () => {
    // Open export dialog
    console.log('Export dialog')
  }

  return (
    <div className="menu-bar">
      <div className="menu-logo">PhotoVideo Pro</div>

      <div className="menu-items">
        <div className="menu-item">
          File
          <div className="menu-dropdown">
            <div className="menu-option" onClick={handleNew}>New Project</div>
            <div className="menu-option" onClick={handleOpen}>Open...</div>
            <div className="menu-option" onClick={handleSave}>Save</div>
            <div className="menu-option" onClick={handleSaveAs}>Save As...</div>
            <div className="menu-separator"></div>
            <div className="menu-option" onClick={handleExport}>Export...</div>
          </div>
        </div>

        <div className="menu-item">
          Edit
          <div className="menu-dropdown">
            <div className="menu-option">Undo</div>
            <div className="menu-option">Redo</div>
            <div className="menu-separator"></div>
            <div className="menu-option">Cut</div>
            <div className="menu-option">Copy</div>
            <div className="menu-option">Paste</div>
          </div>
        </div>

        <div className="menu-item">
          View
          <div className="menu-dropdown">
            <div className="menu-option">Zoom In</div>
            <div className="menu-option">Zoom Out</div>
            <div className="menu-option">Fit to Screen</div>
          </div>
        </div>

        <div className="menu-item">
          Effects
          <div className="menu-dropdown">
            <div className="menu-option">Video Effects</div>
            <div className="menu-option">Audio Effects</div>
            <div className="menu-option">Transitions</div>
          </div>
        </div>

        <div className="menu-item">
          Window
          <div className="menu-dropdown">
            <div className="menu-option" onClick={() => onModeChange('video')}>
              Video Editing
            </div>
            <div className="menu-option" onClick={() => onModeChange('photo')}>
              Photo Editing
            </div>
          </div>
        </div>
      </div>

      <div className="menu-mode-switcher">
        <button
          className={activeMode === 'video' ? 'active' : ''}
          onClick={() => onModeChange('video')}
        >
          Video
        </button>
        <button
          className={activeMode === 'photo' ? 'active' : ''}
          onClick={() => onModeChange('photo')}
        >
          Photo
        </button>
      </div>
    </div>
  )
}

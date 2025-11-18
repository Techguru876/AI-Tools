/**
 * TOOLBAR COMPONENT
 *
 * Main toolbar with tools and mode selector
 */

import React from 'react';
import { useTools } from '../../contexts/ToolsContext';
import { Tool } from '../../../shared/types';
import './Toolbar.css';

interface ToolbarProps {
  onModeChange: (mode: 'video' | 'image' | 'hybrid') => void;
  currentMode: 'video' | 'image' | 'hybrid';
}

const Toolbar: React.FC<ToolbarProps> = ({ onModeChange, currentMode }) => {
  const { activeTool, setActiveTool } = useTools();

  const tools: Array<{ id: Tool; icon: string; label: string }> = [
    { id: 'select', icon: '🖱', label: 'Select' },
    { id: 'move', icon: '✋', label: 'Move' },
    { id: 'brush', icon: '🖌', label: 'Brush' },
    { id: 'eraser', icon: '🧹', label: 'Eraser' },
    { id: 'text', icon: 'T', label: 'Text' },
    { id: 'crop', icon: '✂', label: 'Crop' },
    { id: 'eyedropper', icon: '💧', label: 'Eyedropper' },
    { id: 'hand', icon: '✋', label: 'Hand' },
    { id: 'zoom', icon: '🔍', label: 'Zoom' },
  ];

  return (
    <div className="toolbar">
      <div className="mode-selector">
        <button
          className={currentMode === 'video' ? 'active' : ''}
          onClick={() => onModeChange('video')}
        >
          Video
        </button>
        <button
          className={currentMode === 'image' ? 'active' : ''}
          onClick={() => onModeChange('image')}
        >
          Image
        </button>
        <button
          className={currentMode === 'hybrid' ? 'active' : ''}
          onClick={() => onModeChange('hybrid')}
        >
          Hybrid
        </button>
      </div>

      <div className="tools">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;

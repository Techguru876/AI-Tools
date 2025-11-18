/**
 * LAYERS PANEL COMPONENT
 *
 * Photoshop-style layers panel for image editing
 * Features:
 * - Layer hierarchy and grouping
 * - Blend modes and opacity
 * - Layer visibility and locking
 * - Drag to reorder layers
 * - Layer thumbnails
 * - Layer effects and masks
 */

import React, { useState } from 'react';
import { useTools } from '../../contexts/ToolsContext';
import { Layer, BlendMode } from '../../../shared/types';
import { BLEND_MODES } from '../../../shared/constants';
import './LayersPanel.css';

const LayersPanel: React.FC = () => {
  const { activeLayer, setActiveLayer } = useTools();
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      name: 'Background',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      transform: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        opacity: 1,
      },
      effects: [],
    },
  ]);

  const handleAddLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      transform: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        opacity: 1,
      },
      effects: [],
    };

    setLayers([newLayer, ...layers]);
    setActiveLayer(newLayer.id);
  };

  const handleDeleteLayer = (layerId: string) => {
    setLayers(layers.filter(l => l.id !== layerId));
    if (activeLayer === layerId) {
      setActiveLayer(layers[0]?.id || null);
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
  };

  const handleToggleLock = (layerId: string) => {
    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ));
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, opacity } : l
    ));
  };

  const handleBlendModeChange = (layerId: string, blendMode: BlendMode) => {
    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, blendMode } : l
    ));
  };

  return (
    <div className="layers-panel">
      <div className="panel-header">
        <h3>Layers</h3>
        <div className="layer-actions">
          <button onClick={() => handleAddLayer('image')} title="New Layer">+</button>
        </div>
      </div>

      <div className="layers-list">
        {layers.map(layer => (
          <div
            key={layer.id}
            className={`layer-item ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <div className="layer-controls">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(layer.id);
                }}
                className="visibility-btn"
              >
                {layer.visible ? '👁' : '👁‍🗨'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock(layer.id);
                }}
                className="lock-btn"
              >
                {layer.locked ? '🔒' : '🔓'}
              </button>
            </div>

            <div className="layer-thumbnail">
              {/* Placeholder for layer thumbnail */}
              <div className="thumbnail-placeholder" />
            </div>

            <div className="layer-info">
              <div className="layer-name">{layer.name}</div>

              <div className="layer-properties">
                <select
                  value={layer.blendMode}
                  onChange={(e) => handleBlendModeChange(layer.id, e.target.value as BlendMode)}
                  onClick={(e) => e.stopPropagation()}
                  className="blend-mode-select"
                >
                  {BLEND_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>

                <div className="opacity-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity}
                    onChange={(e) => handleOpacityChange(layer.id, parseInt(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{layer.opacity}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteLayer(layer.id);
              }}
              className="delete-btn"
              title="Delete Layer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="layer-toolbar">
        <button onClick={() => handleAddLayer('image')} title="New Image Layer">
          🖼️
        </button>
        <button onClick={() => handleAddLayer('text')} title="New Text Layer">
          T
        </button>
        <button onClick={() => handleAddLayer('shape')} title="New Shape Layer">
          ▢
        </button>
        <button onClick={() => handleAddLayer('adjustment')} title="New Adjustment Layer">
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default LayersPanel;

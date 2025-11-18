/**
 * Layers Panel
 * Shows layer stack for photo editing mode
 */

import { useProjectStore } from '../stores/projectStore'
import { invoke } from '@tauri-apps/api/tauri'
import '../styles/LayersPanel.css'

interface LayersPanelProps {
  activeMode: 'video' | 'photo'
}

export default function LayersPanel({ activeMode }: LayersPanelProps) {
  const { project, selectedLayerId, selectLayer, addLayer, removeLayer } = useProjectStore()

  if (activeMode !== 'photo') {
    return null
  }

  const handleAddLayer = async () => {
    try {
      const newLayer = await invoke('create_layer', {
        layer_type: 'image',
        name: `Layer ${(project?.layers.length || 0) + 1}`,
      })
      addLayer(newLayer as any)
    } catch (error) {
      console.error('Failed to create layer:', error)
    }
  }

  const handleRemoveLayer = async (layerId: string) => {
    try {
      await invoke('delete_layer', { layerId })
      removeLayer(layerId)
      if (selectedLayerId === layerId) {
        selectLayer(null)
      }
    } catch (error) {
      console.error('Failed to delete layer:', error)
    }
  }

  return (
    <div className="layers-panel">
      <div className="panel-title">
        Layers
        <button onClick={handleAddLayer} title="Add layer">+</button>
      </div>

      <div className="panel-content">
        <div className="layers-list">
          {project?.layers.map((layer) => (
            <div
              key={layer.id}
              className={`layer-item ${selectedLayerId === layer.id ? 'selected' : ''}`}
              onClick={() => selectLayer(layer.id)}
            >
              <button
                className="layer-visibility"
                title="Toggle visibility"
              >
                {layer.visible ? '👁' : '👁‍🗨'}
              </button>

              <div className="layer-info">
                <div className="layer-name">{layer.name}</div>
                <div className="layer-type">{typeof layer.layer_type === 'object' ? Object.keys(layer.layer_type)[0] : 'unknown'}</div>
              </div>

              <div className="layer-opacity">{Math.round(layer.opacity * 100)}%</div>

              <button
                className="layer-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveLayer(layer.id)
                }}
                title="Delete layer"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

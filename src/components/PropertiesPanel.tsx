/**
 * Properties Panel
 * Shows and edits properties of selected layer/clip (transform, opacity, blend mode, etc.)
 */

import { useProjectStore } from '../stores/projectStore'
import '../styles/PropertiesPanel.css'

export default function PropertiesPanel() {
  const { project, selectedLayerId, selectedClipId } = useProjectStore()

  const selectedLayer = project?.layers.find((l) => l.id === selectedLayerId)
  const selectedClip = project?.timeline?.tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipId)

  if (!selectedLayer && !selectedClip) {
    return (
      <div className="properties-panel">
        <div className="panel-title">Properties</div>
        <div className="panel-empty">No selection</div>
      </div>
    )
  }

  return (
    <div className="properties-panel">
      <div className="panel-title">Properties</div>

      <div className="panel-content">
        {selectedLayer && (
          <>
            <div className="property-group">
              <h3>Layer</h3>
              <div className="property-item">
                <label>Name</label>
                <input type="text" value={selectedLayer.name} readOnly />
              </div>
              <div className="property-item">
                <label>Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedLayer.opacity * 100}
                  readOnly
                />
                <span>{Math.round(selectedLayer.opacity * 100)}%</span>
              </div>
              <div className="property-item">
                <label>Blend Mode</label>
                <select value={selectedLayer.blend_mode} disabled>
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                </select>
              </div>
            </div>

            <div className="property-group">
              <h3>Transform</h3>
              <div className="property-item">
                <label>X</label>
                <input type="number" value={selectedLayer.transform.x} readOnly />
              </div>
              <div className="property-item">
                <label>Y</label>
                <input type="number" value={selectedLayer.transform.y} readOnly />
              </div>
              <div className="property-item">
                <label>Scale X</label>
                <input type="number" value={selectedLayer.transform.scale_x} readOnly step="0.1" />
              </div>
              <div className="property-item">
                <label>Scale Y</label>
                <input type="number" value={selectedLayer.transform.scale_y} readOnly step="0.1" />
              </div>
              <div className="property-item">
                <label>Rotation</label>
                <input type="number" value={selectedLayer.transform.rotation} readOnly />
                <span>°</span>
              </div>
            </div>
          </>
        )}

        {selectedClip && (
          <>
            <div className="property-group">
              <h3>Clip</h3>
              <div className="property-item">
                <label>Start Time</label>
                <input type="number" value={selectedClip.start_time} readOnly step="0.01" />
              </div>
              <div className="property-item">
                <label>Duration</label>
                <input type="number" value={selectedClip.duration} readOnly step="0.01" />
              </div>
              <div className="property-item">
                <label>Offset</label>
                <input type="number" value={selectedClip.offset} readOnly step="0.01" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

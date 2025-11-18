/**
 * ASSETS PANEL COMPONENT
 *
 * Library of project assets
 */

import React from 'react';
import { useProject } from '../../contexts/ProjectContext';
import './AssetsPanel.css';

const AssetsPanel: React.FC = () => {
  const { project } = useProject();

  const handleImportAsset = async () => {
    // Open file dialog
    console.log('Import asset');
  };

  return (
    <div className="assets-panel">
      <div className="panel-header">
        <h3>Assets</h3>
        <button onClick={handleImportAsset} className="import-btn">
          +
        </button>
      </div>

      <div className="assets-grid">
        {project?.assets.map(asset => (
          <div key={asset.id} className="asset-item">
            {asset.thumbnail && (
              <img src={asset.thumbnail} alt={asset.name} />
            )}
            <div className="asset-name">{asset.name}</div>
          </div>
        ))}

        {(!project || project.assets.length === 0) && (
          <div className="empty-state">
            <p>No assets yet</p>
            <p>Click + to import</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsPanel;

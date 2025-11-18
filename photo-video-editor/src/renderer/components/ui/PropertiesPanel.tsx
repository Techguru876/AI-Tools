/**
 * PROPERTIES PANEL COMPONENT
 *
 * Shows properties of selected element
 */

import React from 'react';
import './PropertiesPanel.css';

const PropertiesPanel: React.FC = () => {
  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h3>Properties</h3>
      </div>
      <div className="properties-content">
        <p>Select an element to view properties</p>
      </div>
    </div>
  );
};

export default PropertiesPanel;

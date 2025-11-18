/**
 * MENU BAR COMPONENT
 *
 * Application menu bar
 */

import React from 'react';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  return (
    <div className="menu-bar">
      <div className="app-title">Pro Photo Video Editor</div>
      <div className="menu-spacer" />
    </div>
  );
};

export default MenuBar;

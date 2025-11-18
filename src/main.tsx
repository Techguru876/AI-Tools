/**
 * Main Entry Point for InfinityStudio
 * This initializes the React application and sets up global state management
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import StudioSuite from './components/StudioSuite'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudioSuite />
  </React.StrictMode>,
)

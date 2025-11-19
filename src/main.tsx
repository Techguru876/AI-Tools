/**
 * Main Entry Point for InfinityStudio
 * This initializes the React application and sets up global state management
 */

import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import StudioSuite from './components/StudioSuite'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import { ToastProvider } from './components/common/ToastContainer'
import './styles/index.css'

function InfinityStudio() {
  const [mode, setMode] = useState<'studio' | 'pro'>('studio')

  if (mode === 'pro') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <button
          onClick={() => setMode('studio')}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10000,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
        >
          ← Back to Studio Suite
        </button>
        <App />
      </div>
    )
  }

  return <StudioSuite onSwitchToProMode={() => setMode('pro')} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <InfinityStudio />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

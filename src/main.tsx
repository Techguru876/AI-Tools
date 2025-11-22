/**
 * Main Entry Point for InfinityStudio
 * This initializes the React application and sets up global state management
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import StudioSuite from './components/StudioSuite'
// NOTE: Old PhotoVideo Pro (Tauri-based) disabled - using ContentForge Studio (Electron-based) only
// import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import { ToastProvider } from './components/common/ToastContainer'
import './styles/index.css'

function InfinityStudio() {
  // Pro mode disabled - only using Studio Suite with ContentForge Studio
  // const [mode, setMode] = useState<'studio' | 'pro'>('studio')

  // if (mode === 'pro') {
  //   return (
  //     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  //       <button onClick={() => setMode('studio')}>
  //         ← Back to Studio Suite
  //       </button>
  //       <App />
  //     </div>
  //   )
  // }

  return <StudioSuite />
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

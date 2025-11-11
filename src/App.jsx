import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StoryCreator from './pages/StoryCreator'
import IllustrationStudio from './pages/IllustrationStudio'
import VideoProduction from './pages/VideoProduction'
import ExportPublish from './pages/ExportPublish'
import './App.css'

/**
 * Main App Component
 * Handles routing for all pages in the ReadKidz application
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<StoryCreator />} />
          <Route path="/illustrate" element={<IllustrationStudio />} />
          <Route path="/video" element={<VideoProduction />} />
          <Route path="/export" element={<ExportPublish />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

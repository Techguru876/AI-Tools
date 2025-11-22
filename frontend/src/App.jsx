/**
 * Main App component with routing.
 * Handles navigation between different pages.
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;

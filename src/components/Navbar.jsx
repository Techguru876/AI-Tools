import { Link } from 'react-router-dom'
import './Navbar.css'

/**
 * Navbar Component
 * Main navigation bar with accessibility features
 * Includes logo, navigation links, and CTA button
 */
function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="StoryUniverse home">
          <span className="logo-icon" aria-hidden="true">📚</span>
          <span className="logo-text">StoryUniverse</span>
        </Link>

        <ul className="navbar-menu" role="menubar">
          <li role="none">
            <Link to="/" className="navbar-link" role="menuitem">
              Home
            </Link>
          </li>
          <li role="none">
            <Link to="/create" className="navbar-link" role="menuitem">
              Create Story
            </Link>
          </li>
          <li role="none">
            <a href="#features" className="navbar-link" role="menuitem">
              Features
            </a>
          </li>
          <li role="none">
            <a href="#gallery" className="navbar-link" role="menuitem">
              Gallery
            </a>
          </li>
          <li role="none">
            <a href="#testimonials" className="navbar-link" role="menuitem">
              Testimonials
            </a>
          </li>
        </ul>

        <div className="navbar-actions">
          <Link
            to="/create"
            className="btn btn-primary"
            aria-label="Start creating your story"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

import { Link } from 'react-router-dom'
import './Footer.css'

/**
 * Footer Component
 * Site footer with links, social media, and copyright
 * Organized in accessible column layout
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-column">
            <Link to="/" className="footer-logo" aria-label="StoryUniverse home">
              <span className="logo-icon" aria-hidden="true">📚</span>
              <span className="logo-text">StoryUniverse</span>
            </Link>
            <p className="footer-description">
              Empowering children's creativity through AI-powered storytelling
              and illustration.
            </p>
            <div className="footer-social" role="navigation" aria-label="Social media links">
              <a
                href="https://facebook.com"
                className="social-link"
                aria-label="Visit our Facebook page"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">f</span>
              </a>
              <a
                href="https://twitter.com"
                className="social-link"
                aria-label="Visit our Twitter profile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">𝕏</span>
              </a>
              <a
                href="https://instagram.com"
                className="social-link"
                aria-label="Visit our Instagram profile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">📷</span>
              </a>
              <a
                href="https://youtube.com"
                className="social-link"
                aria-label="Visit our YouTube channel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">▶</span>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Product</h3>
            <ul className="footer-links" role="list">
              <li><Link to="/create">Create Story</Link></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#templates">Templates</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Resources</h3>
            <ul className="footer-links" role="list">
              <li><a href="#blog">Blog</a></li>
              <li><a href="#guides">Writing Guides</a></li>
              <li><a href="#tutorials">Tutorials</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links" role="list">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press Kit</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#partners">Partners</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links" role="list">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
              <li><a href="#accessibility">Accessibility</a></li>
              <li><a href="#dmca">DMCA</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} StoryUniverse. All rights reserved.
          </p>
          <p className="footer-note">
            Made with ❤️ for children and families worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

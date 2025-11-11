import { Link } from 'react-router-dom'
import './HeroBanner.css'

/**
 * HeroBanner Component
 * Main hero section with headline, description, and CTA
 * Features animated gradient background and engaging copy
 */
function HeroBanner() {
  return (
    <section
      className="hero-banner"
      role="banner"
      aria-labelledby="hero-heading"
    >
      <div className="hero-content">
        <h1 id="hero-heading" className="hero-title">
          Create Magical Stories
          <span className="hero-highlight"> That Bring Joy to Every Child</span>
        </h1>

        <p className="hero-description">
          Transform your ideas into personalized children's books with AI-powered
          storytelling, custom illustrations, and animated videos. No design or
          writing experience needed.
        </p>

        <div className="hero-stats" role="region" aria-label="Platform statistics">
          <div className="stat-item">
            <span className="stat-number" aria-label="50,000 plus">50,000+</span>
            <span className="stat-label">Stories Created</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" aria-label="10,000 plus">10,000+</span>
            <span className="stat-label">Happy Families</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" aria-label="50 plus">50+</span>
            <span className="stat-label">Languages</span>
          </div>
        </div>

        <div className="hero-actions">
          <Link
            to="/create"
            className="btn btn-primary btn-large"
            aria-label="Start creating your first story"
          >
            Start Creating Free
          </Link>
          <a
            href="#demo"
            className="btn btn-secondary btn-large"
            aria-label="Watch demonstration video"
          >
            Watch Demo
          </a>
        </div>

        <p className="hero-note" role="note">
          No credit card required • Create your first book in minutes
        </p>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="floating-book book-1">
          <img
            src="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop"
            alt=""
            loading="lazy"
          />
        </div>
        <div className="floating-book book-2">
          <img
            src="https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=300&h=400&fit=crop"
            alt=""
            loading="lazy"
          />
        </div>
        <div className="floating-book book-3">
          <img
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=400&fit=crop"
            alt=""
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroBanner

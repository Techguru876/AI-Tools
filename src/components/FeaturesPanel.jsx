import { features } from '../data/mockData'
import './FeaturesPanel.css'

/**
 * FeaturesPanel Component
 * Displays platform features in a grid layout
 * Each feature includes icon, title, and description
 */
function FeaturesPanel() {
  return (
    <section
      id="features"
      className="features-section"
      aria-labelledby="features-heading"
    >
      <div className="container">
        <header className="section-header">
          <h2 id="features-heading" className="section-title">
            Everything You Need to Create Amazing Stories
          </h2>
          <p className="section-description">
            Powerful AI tools designed specifically for creating engaging children's content
          </p>
        </header>

        <div
          className="features-grid"
          role="list"
          aria-label="Platform features"
        >
          {features.map((feature) => (
            <article
              key={feature.id}
              className="feature-card"
              role="listitem"
              style={{ '--feature-color': feature.color }}
            >
              <div
                className="feature-icon"
                aria-hidden="true"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <span style={{ fontSize: '2.5rem' }}>{feature.icon}</span>
              </div>

              <h3 className="feature-title">
                {feature.title}
              </h3>

              <p className="feature-description">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesPanel

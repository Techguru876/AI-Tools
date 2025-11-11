import './GalleryCard.css'

/**
 * GalleryCard Component
 * Displays individual gallery items with image and metadata
 * Includes hover effects and accessibility features
 *
 * @param {Object} props - Component props
 * @param {Object} props.item - Gallery item data
 */
function GalleryCard({ item }) {
  return (
    <article className="gallery-card">
      <div className="gallery-image-wrapper">
        <img
          src={item.image}
          alt={`${item.title} - ${item.description}`}
          className="gallery-image"
          loading="lazy"
        />
        <div className="gallery-overlay" aria-hidden="true">
          <span className="gallery-style-badge">{item.style}</span>
        </div>
      </div>

      <div className="gallery-content">
        <h3 className="gallery-title">{item.title}</h3>
        <p className="gallery-description">{item.description}</p>
      </div>
    </article>
  )
}

export default GalleryCard

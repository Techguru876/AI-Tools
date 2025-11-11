import './TestimonialCard.css'

/**
 * TestimonialCard Component
 * Displays user testimonials with avatar, quote, and rating
 * Includes accessibility attributes for screen readers
 *
 * @param {Object} props - Component props
 * @param {Object} props.testimonial - Testimonial data
 */
function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
      <div className="testimonial-header">
        <img
          src={testimonial.avatar}
          alt={`${testimonial.name}, ${testimonial.role}`}
          className="testimonial-avatar"
          loading="lazy"
        />
        <div className="testimonial-author">
          <h3 className="testimonial-name">{testimonial.name}</h3>
          <p className="testimonial-role">{testimonial.role}</p>
          <p className="testimonial-location">{testimonial.location}</p>
        </div>
      </div>

      <div
        className="testimonial-rating"
        role="img"
        aria-label={`Rating: ${testimonial.rating} out of 5 stars`}
      >
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < testimonial.rating ? 'star filled' : 'star'}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>

      <blockquote className="testimonial-quote">
        <p>"{testimonial.quote}"</p>
      </blockquote>
    </article>
  )
}

export default TestimonialCard

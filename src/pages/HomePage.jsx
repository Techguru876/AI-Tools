import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import FeaturesPanel from '../components/FeaturesPanel'
import GalleryCard from '../components/GalleryCard'
import TestimonialCard from '../components/TestimonialCard'
import Footer from '../components/Footer'
import { sampleBooks, galleryItems, testimonials } from '../data/mockData'
import './HomePage.css'

/**
 * HomePage Component
 * Main landing page for StoryUniverse
 * Includes hero, features, gallery, testimonials, and CTA sections
 */
function HomePage() {
  return (
    <div className="homepage">
      <Navbar />
      <main>
        <HeroBanner />
        <FeaturesPanel />

        {/* Sample Books Gallery Section */}
        <section
          id="gallery"
          className="gallery-section"
          aria-labelledby="gallery-heading"
        >
          <div className="container">
            <header className="section-header">
              <h2 id="gallery-heading" className="section-title">
                Stories Created by Families Like Yours
              </h2>
              <p className="section-description">
                Explore the magic created by our community of young authors and their families
              </p>
            </header>

            <div
              className="books-grid"
              role="list"
              aria-label="Sample books created by users"
            >
              {sampleBooks.map((book) => (
                <article key={book.id} className="book-card" role="listitem">
                  <div className="book-cover-wrapper">
                    <img
                      src={book.cover}
                      alt={`Cover of ${book.title} by ${book.author}`}
                      className="book-cover"
                      loading="lazy"
                    />
                    <div className="book-overlay" aria-hidden="true">
                      <span className="book-pages">{book.pages} pages</span>
                      <span className="book-age">Ages {book.age}</span>
                    </div>
                  </div>
                  <div className="book-info">
                    <span className="book-genre">{book.genre}</span>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-description">{book.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AI Illustration Gallery */}
        <section
          className="illustration-gallery-section"
          aria-labelledby="illustration-gallery-heading"
        >
          <div className="container">
            <header className="section-header">
              <h2 id="illustration-gallery-heading" className="section-title">
                AI-Generated Illustrations
              </h2>
              <p className="section-description">
                Beautiful artwork in any style you can imagine
              </p>
            </header>

            <div
              className="gallery-grid"
              role="list"
              aria-label="AI-generated illustration samples"
            >
              {galleryItems.map((item) => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="testimonials-section"
          aria-labelledby="testimonials-heading"
        >
          <div className="container">
            <header className="section-header">
              <h2 id="testimonials-heading" className="section-title">
                Loved by Parents and Teachers
              </h2>
              <p className="section-description">
                Join thousands of families creating magical moments together
              </p>
            </header>

            <div
              className="testimonials-grid"
              role="list"
              aria-label="User testimonials"
            >
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="container">
            <div className="cta-content">
              <h2 id="cta-heading" className="cta-title">
                Ready to Create Your First Story?
              </h2>
              <p className="cta-description">
                Start your magical journey today. No credit card required.
              </p>
              <a
                href="/create"
                className="btn btn-primary btn-large"
                aria-label="Start creating your story now"
              >
                Get Started Now
              </a>
              <p className="cta-guarantee">
                ✓ Free to start • ✓ No design skills needed • ✓ Ready in minutes
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default HomePage

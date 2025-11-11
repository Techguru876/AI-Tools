import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { genres, ageRanges } from '../data/mockData'
import { generateStoryText, generateOutlineSuggestions } from '../utils/aiIntegration'
import './StoryCreator.css'

/**
 * StoryCreator Component
 * Guided story creation with genre/age selector, outline suggestions, and AI text editor
 * Multi-step workflow: Setup → Outline → Write → Review
 */
function StoryCreator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Setup, 2: Outline, 3: Write, 4: Review
  const [loading, setLoading] = useState(false)

  // Form state
  const [storyData, setStoryData] = useState({
    genre: '',
    ageRange: '',
    theme: '',
    characters: '',
    pages: 10,
    outline: null,
    generatedStory: null
  })

  const [outlineSuggestions, setOutlineSuggestions] = useState([])
  const [selectedOutline, setSelectedOutline] = useState(null)
  const [storyText, setStoryText] = useState('')

  // Handle form input changes
  const handleChange = (field, value) => {
    setStoryData(prev => ({ ...prev, [field]: value }))
  }

  // Load outline suggestions
  const loadOutlines = async () => {
    setLoading(true)
    try {
      const suggestions = await generateOutlineSuggestions({
        genre: storyData.genre,
        theme: storyData.theme,
        characters: storyData.characters
      })
      setOutlineSuggestions(suggestions)
      setStep(2)
    } catch (error) {
      console.error('Error loading outlines:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate story with AI
  const generateStory = async () => {
    setLoading(true)
    try {
      const generated = await generateStoryText({
        genre: storyData.genre,
        ageRange: storyData.ageRange,
        theme: storyData.theme,
        characters: storyData.characters,
        pages: storyData.pages
      })
      setStoryData(prev => ({ ...prev, generatedStory: generated }))
      setStoryText(generated.pages.map(p => p.text).join('\n\n'))
      setStep(3)
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setLoading(false)
    }
  }

  // Navigate to illustration step
  const continueToIllustration = () => {
    navigate('/illustrate', { state: { story: storyData, text: storyText } })
  }

  return (
    <div className="story-creator-page">
      <Navbar />
      <main className="story-creator-main">
        <div className="container">
          {/* Progress Indicator */}
          <nav
            className="progress-steps"
            aria-label="Story creation progress"
          >
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number" aria-label="Step 1">1</span>
              <span className="step-label">Setup</span>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number" aria-label="Step 2">2</span>
              <span className="step-label">Outline</span>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <span className="step-number" aria-label="Step 3">3</span>
              <span className="step-label">Write</span>
            </div>
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
              <span className="step-number" aria-label="Step 4">4</span>
              <span className="step-label">Review</span>
            </div>
          </nav>

          {/* Step 1: Setup */}
          {step === 1 && (
            <section className="creator-section" aria-labelledby="setup-heading">
              <h1 id="setup-heading" className="section-title">
                Let's Create Your Story
              </h1>
              <p className="section-description">
                Tell us about the story you want to create
              </p>

              <div className="form-grid">
                {/* Genre Selection */}
                <div className="form-group">
                  <label htmlFor="genre" className="form-label">
                    Choose a Genre
                  </label>
                  <div className="genre-grid" role="radiogroup" aria-labelledby="genre">
                    {genres.map(genre => (
                      <button
                        key={genre.id}
                        type="button"
                        className={`genre-card ${storyData.genre === genre.name ? 'selected' : ''}`}
                        onClick={() => handleChange('genre', genre.name)}
                        role="radio"
                        aria-checked={storyData.genre === genre.name}
                      >
                        <span className="genre-emoji" aria-hidden="true">{genre.emoji}</span>
                        <span className="genre-name">{genre.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Range Selection */}
                <div className="form-group">
                  <label htmlFor="age-range" className="form-label">
                    Target Age Range
                  </label>
                  <select
                    id="age-range"
                    className="form-select"
                    value={storyData.ageRange}
                    onChange={(e) => handleChange('ageRange', e.target.value)}
                    aria-required="true"
                  >
                    <option value="">Select age range</option>
                    {ageRanges.map(range => (
                      <option key={range.id} value={range.range}>
                        {range.label} ({range.range} years)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme Input */}
                <div className="form-group">
                  <label htmlFor="theme" className="form-label">
                    Story Theme
                  </label>
                  <input
                    id="theme"
                    type="text"
                    className="form-input"
                    placeholder="e.g., friendship, bravery, imagination"
                    value={storyData.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    aria-required="true"
                  />
                </div>

                {/* Characters Input */}
                <div className="form-group">
                  <label htmlFor="characters" className="form-label">
                    Main Character(s)
                  </label>
                  <input
                    id="characters"
                    type="text"
                    className="form-input"
                    placeholder="e.g., a brave knight, a curious cat"
                    value={storyData.characters}
                    onChange={(e) => handleChange('characters', e.target.value)}
                    aria-required="true"
                  />
                </div>

                {/* Page Count */}
                <div className="form-group">
                  <label htmlFor="pages" className="form-label">
                    Number of Pages: {storyData.pages}
                  </label>
                  <input
                    id="pages"
                    type="range"
                    min="5"
                    max="20"
                    className="form-range"
                    value={storyData.pages}
                    onChange={(e) => handleChange('pages', parseInt(e.target.value))}
                    aria-valuemin="5"
                    aria-valuemax="20"
                    aria-valuenow={storyData.pages}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primary btn-large"
                  onClick={loadOutlines}
                  disabled={!storyData.genre || !storyData.ageRange || !storyData.theme || !storyData.characters || loading}
                  aria-label="Continue to outline suggestions"
                >
                  {loading ? 'Loading Outlines...' : 'Continue to Outline'}
                </button>
              </div>
            </section>
          )}

          {/* Step 2: Outline Selection */}
          {step === 2 && (
            <section className="creator-section" aria-labelledby="outline-heading">
              <h1 id="outline-heading" className="section-title">
                Choose Your Story Outline
              </h1>
              <p className="section-description">
                Select a structure or create your own
              </p>

              <div className="outline-grid">
                {outlineSuggestions.map(outline => (
                  <article
                    key={outline.id}
                    className={`outline-card ${selectedOutline?.id === outline.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOutline(outline)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedOutline?.id === outline.id}
                  >
                    <h3 className="outline-title">{outline.title}</h3>
                    <ol className="outline-structure">
                      {outline.structure.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ol>
                  </article>
                ))}
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  aria-label="Go back to setup"
                >
                  Back
                </button>
                <button
                  className="btn btn-primary btn-large"
                  onClick={generateStory}
                  disabled={!selectedOutline || loading}
                  aria-label="Generate story with AI"
                >
                  {loading ? 'Generating Story...' : 'Generate Story with AI'}
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Story Editor */}
          {step === 3 && (
            <section className="creator-section" aria-labelledby="editor-heading">
              <h1 id="editor-heading" className="section-title">
                Edit Your Story
              </h1>
              <p className="section-description">
                Review and refine the AI-generated story
              </p>

              <div className="editor-container">
                <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
                  <button className="toolbar-btn" aria-label="Bold text">
                    <strong>B</strong>
                  </button>
                  <button className="toolbar-btn" aria-label="Italic text">
                    <em>I</em>
                  </button>
                  <button className="toolbar-btn" aria-label="Regenerate text">
                    🔄 Regenerate
                  </button>
                </div>

                <textarea
                  className="story-editor"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  aria-label="Story text editor"
                  rows={20}
                />

                <div className="editor-stats">
                  <span>Words: {storyText.split(/\s+/).length}</span>
                  <span>Characters: {storyText.length}</span>
                  <span>Reading Time: ~{Math.ceil(storyText.split(/\s+/).length / 100)} min</span>
                </div>
              </div>

              <div className="sample-output">
                <h3>AI-Generated Sample Preview</h3>
                <div className="preview-box">
                  <p><strong>Title:</strong> {storyData.generatedStory?.title}</p>
                  <p><strong>Genre:</strong> {storyData.genre}</p>
                  <p><strong>Age Range:</strong> {storyData.ageRange}</p>
                  <p><strong>Page Count:</strong> {storyData.pages}</p>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  aria-label="Go back to outline"
                >
                  Back
                </button>
                <button
                  className="btn btn-primary btn-large"
                  onClick={continueToIllustration}
                  aria-label="Continue to add illustrations"
                >
                  Continue to Illustrations
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default StoryCreator

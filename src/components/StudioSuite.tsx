/**
 * Studio Suite - Main Component
 * Houses all genre-specific mini-apps with unified navigation
 * Seamlessly transitions between Studio Suite (beginner) and Core Tool (pro)
 */

import { useState } from 'react'
import LofiStudio from './lofi/LofiStudio'
import QuotesStudio from './quotes/QuotesStudio'
import ExplainerStudio from './explainer/ExplainerStudio'
import AsmrStudio from './asmr/AsmrStudio'
import StorytellingStudio from './storytelling/StorytellingStudio'
import ProductivityStudio from './productivity/ProductivityStudio'
import HorrorStudio from './horror/HorrorStudio'
import './StudioSuite.css'

export type StudioType =
  | 'lofi'
  | 'quotes'
  | 'explainer'
  | 'asmr'
  | 'storytelling'
  | 'productivity'
  | 'horror'
  | 'news'
  | 'meme'

interface Studio {
  id: StudioType
  name: string
  icon: string
  description: string
  color: string
}

export default function StudioSuite() {
  const [activeStudio, setActiveStudio] = useState<StudioType>('lofi')
  const [showProTransition, setShowProTransition] = useState(false)

  const studios: Studio[] = [
    {
      id: 'lofi',
      name: 'Lofi Studio',
      icon: '🎵',
      description: 'Create ambient lofi videos',
      color: '#667eea',
    },
    {
      id: 'quotes',
      name: 'Quotes',
      icon: '💭',
      description: 'Motivational quote videos',
      color: '#fa709a',
    },
    {
      id: 'explainer',
      name: 'Explainer',
      icon: '📚',
      description: 'Educational & Top 10 videos',
      color: '#00d9ff',
    },
    {
      id: 'asmr',
      name: 'ASMR',
      icon: '🎧',
      description: 'Relaxation & ambient content',
      color: '#a855f7',
    },
    {
      id: 'storytelling',
      name: 'Stories',
      icon: '📖',
      description: 'Audiobooks & narratives',
      color: '#4caf50',
    },
    {
      id: 'productivity',
      name: 'Study',
      icon: '⏱️',
      description: 'Pomodoro & study timers',
      color: '#ff9800',
    },
    {
      id: 'horror',
      name: 'Horror',
      icon: '🎃',
      description: 'Horror stories & creepypasta',
      color: '#b71c1c',
    },
    {
      id: 'news',
      name: 'News',
      icon: '📰',
      description: 'News & trends (Coming Soon)',
      color: '#e91e63',
    },
    {
      id: 'meme',
      name: 'Meme',
      icon: '😂',
      description: 'Reactions & memes (Coming Soon)',
      color: '#00bcd4',
    },
  ]

  const handleOpenInProMode = () => {
    setShowProTransition(true)
    // Would transition to Core Tool with current project
    setTimeout(() => {
      alert('Transitioning to Core Tool (Pro Mode)...\n\nYour project will open with full advanced editing capabilities.')
      setShowProTransition(false)
    }, 1500)
  }

  return (
    <div className="studio-suite">
      {/* Header */}
      <div className="studio-suite-header">
        <div className="header-left">
          <h1>InfinityStudio</h1>
          <p className="tagline">Create Without Limits</p>
        </div>
        <div className="header-right">
          <button className="pro-mode-button" onClick={handleOpenInProMode}>
            ⚡ Open in Pro Mode
          </button>
        </div>
      </div>

      {/* Studio Tabs */}
      <div className="studio-tabs">
        {studios.map((studio) => (
          <button
            key={studio.id}
            className={`studio-tab ${activeStudio === studio.id ? 'active' : ''} ${
              studio.id === 'news' || studio.id === 'meme' ? 'disabled' : ''
            }`}
            onClick={() => {
              if (studio.id !== 'news' && studio.id !== 'meme') {
                setActiveStudio(studio.id)
              }
            }}
            style={{
              '--studio-color': studio.color,
            } as React.CSSProperties}
            disabled={studio.id === 'news' || studio.id === 'meme'}
          >
            <span className="tab-icon">{studio.icon}</span>
            <div className="tab-info">
              <span className="tab-name">{studio.name}</span>
              <span className="tab-description">{studio.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Studio Content */}
      <div className="studio-content">
        {activeStudio === 'lofi' && <LofiStudio />}
        {activeStudio === 'quotes' && <QuotesStudio />}
        {activeStudio === 'explainer' && <ExplainerStudio />}
        {activeStudio === 'asmr' && <AsmrStudio />}
        {activeStudio === 'storytelling' && <StorytellingStudio />}
        {activeStudio === 'productivity' && <ProductivityStudio />}
        {activeStudio === 'horror' && <HorrorStudio />}
      </div>

      {/* Pro Mode Transition */}
      {showProTransition && (
        <div className="pro-transition-overlay">
          <div className="transition-content">
            <div className="transition-icon">⚡</div>
            <h2>Upgrading to Pro Mode</h2>
            <p>Unlocking advanced editing features...</p>
            <div className="transition-spinner" />
          </div>
        </div>
      )}
    </div>
  )
}

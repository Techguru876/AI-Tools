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
import NewsStudio from './news/NewsStudio'
import MemeStudio from './meme/MemeStudio'
import Settings from './Settings'
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

interface StudioSuiteProps {
  onSwitchToProMode?: () => void
}

export default function StudioSuite({ onSwitchToProMode }: StudioSuiteProps = {}) {
  const [activeStudio, setActiveStudio] = useState<StudioType>('lofi')
  const [showProTransition, setShowProTransition] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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
      description: 'News & trending videos',
      color: '#e91e63',
    },
    {
      id: 'meme',
      name: 'Meme',
      icon: '😂',
      description: 'Viral memes & reactions',
      color: '#00bcd4',
    },
  ]

  const handleOpenInProMode = () => {
    if (onSwitchToProMode) {
      setShowProTransition(true)
      setTimeout(() => {
        onSwitchToProMode()
      }, 1500)
    } else {
      alert('Pro Mode transition is not available in this context.')
    }
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
          <button className="settings-button" onClick={() => setShowSettings(true)}>
            ⚙️ Settings
          </button>
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
            className={`studio-tab ${activeStudio === studio.id ? 'active' : ''}`}
            onClick={() => setActiveStudio(studio.id)}
            style={{
              '--studio-color': studio.color,
            } as React.CSSProperties}
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
        {activeStudio === 'news' && <NewsStudio />}
        {activeStudio === 'meme' && <MemeStudio />}
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

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

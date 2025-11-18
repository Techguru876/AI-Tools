/**
 * Effects Panel
 * Browse and apply video/image effects and filters
 */

import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { useProjectStore } from '../stores/projectStore'
import '../styles/EffectsPanel.css'

interface Effect {
  id: string
  name: string
  category: string
  effect_type: string
  parameters: any[]
  gpu_accelerated: boolean
}

export default function EffectsPanel() {
  const [effects, setEffects] = useState<Effect[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { selectedLayerId, selectedClipId } = useProjectStore()

  useEffect(() => {
    loadEffects()
  }, [])

  const loadEffects = async () => {
    try {
      const allEffects = await invoke<Effect[]>('get_available_effects', {
        effectType: null,
      })
      setEffects(allEffects)
    } catch (error) {
      console.error('Failed to load effects:', error)
    }
  }

  const categories = ['All', ...new Set(effects.map((e) => e.category))]

  const filteredEffects =
    selectedCategory === 'All'
      ? effects
      : effects.filter((e) => e.category === selectedCategory)

  const handleApplyEffect = async (effect: Effect) => {
    if (!selectedLayerId && !selectedClipId) {
      alert('Please select a layer or clip first')
      return
    }

    try {
      if (selectedLayerId) {
        await invoke('apply_image_effect', {
          layerId: selectedLayerId,
          effectId: effect.id,
          params: {},
        })
      } else if (selectedClipId) {
        await invoke('apply_video_effect', {
          clipId: selectedClipId,
          effectId: effect.id,
          params: {},
        })
      }
    } catch (error) {
      console.error('Failed to apply effect:', error)
    }
  }

  return (
    <div className="effects-panel">
      <div className="panel-title">Effects</div>

      <div className="panel-content">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="effects-list">
          {filteredEffects.map((effect) => (
            <div
              key={effect.id}
              className="effect-item"
              onClick={() => handleApplyEffect(effect)}
            >
              <div className="effect-name">{effect.name}</div>
              {effect.gpu_accelerated && (
                <span className="effect-badge">GPU</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

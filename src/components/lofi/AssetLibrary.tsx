/**
 * Asset Library Component
 * Browse and import assets from multiple sources:
 * - Local files
 * - Suno AI (music generation)
 * - Pixabay/Unsplash (stock images)
 * - Leonardo/OpenAI DALL-E (AI art generation)
 * - OpenAI Sora (AI video generation)
 */

import { useState } from 'react'
import { useLofiStore, SceneElement, MusicTrack } from '../../stores/lofiStore'
import { generateAIImage, generateAIVideo, searchStockMedia } from '../../utils/studioUtils'
import { useToast } from '../common/ToastContainer'
import './AssetLibrary.css'

type AssetSource = 'local' | 'suno' | 'pixabay' | 'unsplash' | 'leonardo' | 'openai' | 'sora'
type AssetType = 'background' | 'character' | 'prop' | 'overlay' | 'music'

interface AssetLibraryProps {
  defaultType?: AssetType
}

export default function AssetLibrary({ defaultType = 'background' }: AssetLibraryProps) {
  const { assetLibrary, addElement, setMusicTrack } = useLofiStore()
  const { success, error: showError, warning } = useToast()
  const [selectedType, setSelectedType] = useState<AssetType>(defaultType)
  const [selectedSource, setSelectedSource] = useState<AssetSource>('local')
  const [searchQuery, setSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [stockMedia, setStockMedia] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Asset type configurations
  const assetTypes: Array<{ id: AssetType; label: string; icon: string }> = [
    { id: 'background', label: 'Backgrounds', icon: '🖼️' },
    { id: 'character', label: 'Characters', icon: '👤' },
    { id: 'prop', label: 'Props', icon: '📦' },
    { id: 'overlay', label: 'Overlays', icon: '✨' },
    { id: 'music', label: 'Music', icon: '🎵' },
  ]

  // Source configurations
  const sources: Array<{ id: AssetSource; label: string; icon: string; types: AssetType[] }> = [
    {
      id: 'local',
      label: 'Local Files',
      icon: '💾',
      types: ['background', 'character', 'prop', 'overlay', 'music'],
    },
    {
      id: 'suno',
      label: 'Suno AI',
      icon: '🎼',
      types: ['music'],
    },
    {
      id: 'pixabay',
      label: 'Pixabay',
      icon: '📸',
      types: ['background', 'prop', 'overlay'],
    },
    {
      id: 'unsplash',
      label: 'Unsplash',
      icon: '🌅',
      types: ['background'],
    },
    {
      id: 'leonardo',
      label: 'Leonardo AI',
      icon: '🎨',
      types: ['background', 'character', 'prop'],
    },
    {
      id: 'openai',
      label: 'DALL-E',
      icon: '🤖',
      types: ['background', 'character', 'prop'],
    },
    {
      id: 'sora',
      label: 'Sora Video',
      icon: '🎬',
      types: ['background', 'overlay'],
    },
  ]

  // Filter sources based on selected type
  const availableSources = sources.filter((source) =>
    source.types.includes(selectedType)
  )

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string

        if (selectedType === 'music') {
          const track: MusicTrack = {
            id: crypto.randomUUID(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown',
            file_path: dataUrl,
            duration: 0, // Would be detected from actual file
            bpm: 0, // Would be detected
          }
          setMusicTrack(track)
        } else {
          const element: SceneElement = {
            id: crypto.randomUUID(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            element_type:
              selectedType === 'background'
                ? 'Background'
                : selectedType === 'character'
                ? 'Character'
                : selectedType === 'prop'
                ? 'Prop'
                : 'Overlay',
            x: 400,
            y: 300,
            scale: 1.0,
            rotation: 0,
            opacity: 1.0,
            z_index: 0,
            source: { type: 'Image', path: dataUrl },
            animations: [],
          }
          addElement(element)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle stock media search
  const handleStockSearch = async () => {
    if (!searchQuery.trim()) {
      warning('Please enter a search query')
      return
    }

    setIsSearching(true)
    setStockMedia([])

    try {
      const results = await searchStockMedia(
        searchQuery,
        'image',
        12,
        selectedSource as 'pixabay' | 'unsplash' | 'pexels'
      )
      setStockMedia(results)

      if (results.length === 0) {
        warning('No results found. Try a different search term.')
      }
    } catch (error: any) {
      console.error('Stock search failed:', error)
      showError(`Search failed: ${error.message}`)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle using stock image
  const handleUseStockImage = (item: any) => {
    const element: SceneElement = {
      id: crypto.randomUUID(),
      name: `${selectedType} from ${selectedSource}`,
      element_type:
        selectedType === 'background'
          ? 'Background'
          : selectedType === 'character'
          ? 'Character'
          : selectedType === 'prop'
          ? 'Prop'
          : 'Overlay',
      x: 400,
      y: 300,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      z_index: 0,
      source: { type: 'Image', path: item.url },
      animations: [],
    }

    addElement(element)
    success(`Added stock image from ${item.provider} by ${item.author}`)
  }

  // Handle AI generation
  const handleGenerate = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a description for the image to generate')
      return
    }

    setIsGenerating(true)

    try {
      const imageUrl = await generateAIImage(searchQuery, 'openai')

      const element: SceneElement = {
        id: crypto.randomUUID(),
        name: `Generated ${selectedType}`,
        element_type:
          selectedType === 'background'
            ? 'Background'
            : selectedType === 'character'
            ? 'Character'
            : selectedType === 'prop'
            ? 'Prop'
            : 'Overlay',
        x: 400,
        y: 300,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        z_index: 0,
        source: { type: 'Generated', prompt: searchQuery, url: imageUrl },
        animations: [],
      }

      addElement(element)
      success('Image generated successfully! Added to scene.')
    } catch (error: any) {
      console.error('AI generation failed:', error)
      showError(`Image generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle AI video generation (Sora)
  const handleGenerateVideo = async () => {
    if (!searchQuery.trim()) {
      warning('Please enter a description for the video to generate')
      return
    }

    setIsGenerating(true)

    try {
      const videoUrl = await generateAIVideo(searchQuery, {
        duration: 10,
        quality: '1080p',
        aspectRatio: '16:9',
      })

      const element: SceneElement = {
        id: crypto.randomUUID(),
        name: `Generated ${selectedType} Video`,
        element_type: selectedType === 'background' ? 'Background' : 'Overlay',
        x: selectedType === 'background' ? 960 : 400,
        y: selectedType === 'background' ? 540 : 300,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        z_index: selectedType === 'background' ? 0 : 50,
        source: { type: 'Video', path: videoUrl },
        animations: [],
      }

      addElement(element)
      success('Video generated successfully! Added to scene.')
    } catch (error: any) {
      console.error('AI video generation failed:', error)
      showError(`Video generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Render asset grid based on source
  const renderAssetGrid = () => {
    switch (selectedSource) {
      case 'local':
        return (
          <div className="upload-area">
            <div className="upload-icon">📁</div>
            <h3>Upload Local Files</h3>
            <p>Drag and drop files here, or click to browse</p>
            <input
              type="file"
              multiple
              accept={
                selectedType === 'music'
                  ? 'audio/*'
                  : 'image/*,video/*'
              }
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" className="upload-button">
              Choose Files
            </label>

            {/* Show uploaded assets */}
            <div className="uploaded-assets">
              {selectedType === 'background' &&
                assetLibrary.backgrounds.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onUse={() => addElement(asset)} />
                ))}
              {selectedType === 'character' &&
                assetLibrary.characters.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onUse={() => addElement(asset)} />
                ))}
              {selectedType === 'prop' &&
                assetLibrary.props.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onUse={() => addElement(asset)} />
                ))}
              {selectedType === 'overlay' &&
                assetLibrary.overlays.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onUse={() => addElement(asset)} />
                ))}
              {selectedType === 'music' &&
                assetLibrary.music.map((track) => (
                  <MusicCard key={track.id} track={track} onUse={() => setMusicTrack(track)} />
                ))}
            </div>
          </div>
        )

      case 'suno':
        return (
          <div className="ai-generate-area">
            <div className="generate-header">
              <h3>🎼 Generate Music with Suno AI</h3>
              <p>Describe the mood, genre, or style you want</p>
            </div>

            <div className="generate-form">
              <textarea
                placeholder="e.g., 'Chill lofi hip hop beat with piano and rain sounds, 90 BPM'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rows={3}
              />

              <div className="generate-options">
                <label>
                  <span>Duration:</span>
                  <select>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="120">2 minutes</option>
                    <option value="180">3 minutes</option>
                  </select>
                </label>

                <label>
                  <span>Style:</span>
                  <select>
                    <option value="lofi">Lofi</option>
                    <option value="ambient">Ambient</option>
                    <option value="chillhop">Chillhop</option>
                    <option value="jazz">Jazz</option>
                    <option value="electronic">Electronic</option>
                  </select>
                </label>
              </div>

              <button
                className="generate-button primary"
                onClick={handleGenerate}
                disabled={isGenerating || !searchQuery.trim()}
              >
                {isGenerating ? '🎵 Generating...' : '🎼 Generate Music'}
              </button>
            </div>

            <div className="credits-info">
              💡 Each generation uses 1 credit. You have 10 credits remaining.
            </div>
          </div>
        )

      case 'pixabay':
      case 'unsplash':
        return (
          <div className="stock-search-area">
            <div className="search-header">
              <h3>
                {selectedSource === 'pixabay' ? '📸 Pixabay' : '🌅 Unsplash'} Stock Images
              </h3>
              <p>Search millions of free high-quality images</p>
            </div>

            <div className="stock-search-box">
              <input
                type="text"
                placeholder="Search images... (e.g., 'lofi study room', 'anime girl', 'rainy window')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStockSearch()}
              />
              <button onClick={handleStockSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </div>

            {stockMedia.length === 0 && !isSearching && (
              <div className="empty-state">
                <p>🔍 Enter a search query to find stock images</p>
                <p style={{ fontSize: '13px', color: '#7a7a90' }}>
                  Try: "cozy room", "night sky", "coffee shop", "anime character"
                </p>
              </div>
            )}

            {isSearching && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Searching {selectedSource}...</p>
              </div>
            )}

            <div className="stock-grid">
              {stockMedia.map((item, i) => (
                <div key={item.id || i} className="stock-item">
                  <div
                    className="stock-thumbnail"
                    style={{ backgroundImage: `url(${item.thumbnail})` }}
                  >
                    <div className="stock-overlay">
                      <button className="use-button" onClick={() => handleUseStockImage(item)}>
                        ✓ Use Image
                      </button>
                    </div>
                  </div>
                  <div className="stock-info">
                    <span>by {item.author || 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'leonardo':
      case 'openai':
        return (
          <div className="ai-generate-area">
            <div className="generate-header">
              <h3>
                {selectedSource === 'leonardo' ? '🎨 Leonardo AI' : '🤖 DALL-E'} Image Generation
              </h3>
              <p>Generate custom images with AI</p>
            </div>

            <div className="generate-form">
              <textarea
                placeholder="Describe the image you want to generate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rows={4}
              />

              <div className="generate-options">
                <label>
                  <span>Style:</span>
                  <select>
                    <option value="realistic">Realistic</option>
                    <option value="anime">Anime</option>
                    <option value="illustration">Illustration</option>
                    <option value="pixel-art">Pixel Art</option>
                  </select>
                </label>

                <label>
                  <span>Size:</span>
                  <select>
                    <option value="512">512x512</option>
                    <option value="1024">1024x1024</option>
                    <option value="1920">1920x1080</option>
                  </select>
                </label>
              </div>

              <button
                className="generate-button primary"
                onClick={handleGenerate}
                disabled={isGenerating || !searchQuery.trim()}
              >
                {isGenerating ? '🎨 Generating...' : '✨ Generate Image'}
              </button>
            </div>

            <div className="credits-info">
              💡 Each generation uses 2 credits. You have 20 credits remaining.
            </div>
          </div>
        )

      case 'sora':
        return (
          <div className="ai-generate-area">
            <div className="generate-header">
              <h3>🎬 Sora Video Generation</h3>
              <p>Generate realistic and imaginative video scenes with OpenAI Sora</p>
            </div>

            <div className="generate-form">
              <textarea
                placeholder="Describe the video scene you want to generate... (e.g., 'A serene Japanese garden with cherry blossoms gently falling, camera slowly panning across a koi pond')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rows={4}
              />

              <div className="generate-options">
                <label>
                  <span>Duration:</span>
                  <select>
                    <option value="5">5 seconds</option>
                    <option value="10">10 seconds</option>
                    <option value="15">15 seconds</option>
                    <option value="20">20 seconds</option>
                  </select>
                </label>

                <label>
                  <span>Quality:</span>
                  <select>
                    <option value="720p">720p (Fast)</option>
                    <option value="1080p">1080p (Standard)</option>
                    <option value="4k">4K (Premium)</option>
                  </select>
                </label>

                <label>
                  <span>Aspect Ratio:</span>
                  <select>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </label>
              </div>

              <button
                className="generate-button primary"
                onClick={handleGenerateVideo}
                disabled={isGenerating || !searchQuery.trim()}
              >
                {isGenerating ? '🎬 Generating Video...' : '✨ Generate Video'}
              </button>
            </div>

            <div className="credits-info">
              💡 Each video generation uses 10 credits. You have 50 credits remaining.
            </div>

            <div className="sora-tips">
              <h4>💡 Tips for better videos:</h4>
              <ul>
                <li>Be specific about camera movements (pan, zoom, dolly)</li>
                <li>Describe lighting and atmosphere (golden hour, moody, bright)</li>
                <li>Include temporal elements (gentle breeze, flowing water, drifting clouds)</li>
                <li>Mention style references (cinematic, anime-style, realistic)</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="asset-library">
      {/* Header */}
      <div className="asset-library-header">
        <h2>📚 Asset Library</h2>
        <p>Import or generate assets for your lofi scene</p>
      </div>

      {/* Asset type selector */}
      <div className="asset-type-selector">
        {assetTypes.map((type) => (
          <button
            key={type.id}
            className={`type-button ${selectedType === type.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedType(type.id)
              // Auto-select appropriate source
              if (type.id === 'music' && selectedSource !== 'suno' && selectedSource !== 'local') {
                setSelectedSource('local')
              }
            }}
          >
            <span className="type-icon">{type.icon}</span>
            <span className="type-label">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Source selector */}
      <div className="source-selector">
        {availableSources.map((source) => (
          <button
            key={source.id}
            className={`source-button ${selectedSource === source.id ? 'active' : ''}`}
            onClick={() => setSelectedSource(source.id)}
          >
            <span className="source-icon">{source.icon}</span>
            <span className="source-label">{source.label}</span>
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="asset-content">{renderAssetGrid()}</div>
    </div>
  )
}

// Asset card component
interface AssetCardProps {
  asset: SceneElement
  onUse: () => void
}

function AssetCard({ asset, onUse }: AssetCardProps) {
  return (
    <div className="asset-card">
      <div className="asset-thumbnail">
        <div className="asset-overlay">
          <button className="use-button" onClick={onUse}>
            Add to Scene
          </button>
        </div>
      </div>
      <div className="asset-info">
        <span>{asset.name}</span>
      </div>
    </div>
  )
}

// Music card component
interface MusicCardProps {
  track: MusicTrack
  onUse: () => void
}

function MusicCard({ track, onUse }: MusicCardProps) {
  return (
    <div className="music-card">
      <div className="music-icon">🎵</div>
      <div className="music-info">
        <h4>{track.title}</h4>
        <p>{track.artist}</p>
        {track.bpm > 0 && <span className="bpm">{track.bpm} BPM</span>}
      </div>
      <button className="use-button-small" onClick={onUse}>
        Use
      </button>
    </div>
  )
}

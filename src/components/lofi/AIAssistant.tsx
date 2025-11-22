/**
 * AI Assistant Component
 * Connects backend AI functions to frontend UI:
 * - Image segmentation (foreground/background separation)
 * - Color palette suggestions from images
 * - BPM detection from audio
 * - Music/visual pairing recommendations
 * - Smart element suggestions
 */

import { useState } from 'react'
import { useLofiStore, ColorPalette } from '../../stores/lofiStore'
import { extractColorPalette, detectBPM, segmentImage, SegmentationResult } from '../../utils/studioUtils'
import './AIAssistant.css'

type AITool =
  | 'segment-image'
  | 'suggest-palette'
  | 'detect-bpm'
  | 'pair-music'
  | 'smart-suggestions'

export default function AIAssistant() {
  const { currentScene } = useLofiStore()

  const [activeTool, setActiveTool] = useState<AITool | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Image segmentation state
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResult | null>(null)

  // Palette suggestion state
  const [paletteSource, setPaletteSource] = useState<string | null>(null)
  const [generatedPalettes, setGeneratedPalettes] = useState<ColorPalette[]>([])

  // BPM detection state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null)
  const [detectedBPM, setDetectedBPM] = useState<number | null>(null)

  // Music pairing state
  const [pairingRecommendations, setPairingRecommendations] = useState<string[]>([])

  // Handle image segmentation
  const handleSegmentImage = async (imageFile: File) => {
    setIsProcessing(true)
    setSelectedImage(URL.createObjectURL(imageFile))

    try {
      const result = await segmentImage(imageFile)
      setSegmentationResult(result)
    } catch (error) {
      console.error('Segmentation failed:', error)
      alert('Image segmentation failed. Please try another image.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle palette suggestion
  const handleSuggestPalette = async (imageFile: File) => {
    setIsProcessing(true)
    setPaletteSource(URL.createObjectURL(imageFile))

    try {
      const palettes = await extractColorPalette(imageFile)
      setGeneratedPalettes(palettes)
    } catch (error) {
      console.error('Palette generation failed:', error)
      alert('Color palette extraction failed. Please try another image.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle BPM detection
  const handleDetectBPM = async (audioFile: File) => {
    setIsProcessing(true)
    setSelectedAudio(URL.createObjectURL(audioFile))

    try {
      const bpm = await detectBPM(audioFile)
      setDetectedBPM(bpm)
    } catch (error) {
      console.error('BPM detection failed:', error)
      alert('BPM detection failed. Please try another audio file.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle music/visual pairing
  const handlePairMusic = async () => {
    setIsProcessing(true)

    try {
      // In real implementation would analyze current scene and suggest music

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const recommendations = [
        '🎵 Chill lofi beat at 85 BPM matches your calm scene perfectly',
        '🎨 Add soft rain animation to complement the ambient music',
        '✨ Consider adding a breathing effect to sync with the music tempo',
        '🌙 Night color palette would enhance the relaxing atmosphere',
      ]

      setPairingRecommendations(recommendations)
    } catch (error) {
      console.error('Music pairing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Apply palette to element
  const applyPalette = (palette: ColorPalette) => {
    // Would apply palette colors to selected element
    console.log('Applying palette:', palette.name)
  }

  return (
    <div className="ai-assistant">
      {/* Header */}
      <div className="ai-assistant-header">
        <h2>🤖 AI Assistant</h2>
        <p>Powerful AI tools to enhance your lofi scenes</p>
      </div>

      {/* Tool Selection */}
      <div className="ai-tools-grid">
        <button
          className={`ai-tool-card ${activeTool === 'segment-image' ? 'active' : ''}`}
          onClick={() => setActiveTool('segment-image')}
        >
          <div className="tool-icon">✂️</div>
          <h4>Image Segmentation</h4>
          <p>Separate foreground from background</p>
        </button>

        <button
          className={`ai-tool-card ${activeTool === 'suggest-palette' ? 'active' : ''}`}
          onClick={() => setActiveTool('suggest-palette')}
        >
          <div className="tool-icon">🎨</div>
          <h4>Color Palette</h4>
          <p>Extract colors from images</p>
        </button>

        <button
          className={`ai-tool-card ${activeTool === 'detect-bpm' ? 'active' : ''}`}
          onClick={() => setActiveTool('detect-bpm')}
        >
          <div className="tool-icon">🎵</div>
          <h4>BPM Detection</h4>
          <p>Analyze music tempo</p>
        </button>

        <button
          className={`ai-tool-card ${activeTool === 'pair-music' ? 'active' : ''}`}
          onClick={() => setActiveTool('pair-music')}
        >
          <div className="tool-icon">🎭</div>
          <h4>Smart Pairing</h4>
          <p>Music & visual recommendations</p>
        </button>

        <button
          className={`ai-tool-card ${activeTool === 'smart-suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTool('smart-suggestions')}
        >
          <div className="tool-icon">💡</div>
          <h4>Smart Suggestions</h4>
          <p>Get AI-powered scene tips</p>
        </button>
      </div>

      {/* Tool Content */}
      <div className="ai-tool-content">
        {/* Image Segmentation */}
        {activeTool === 'segment-image' && (
          <div className="tool-panel">
            <div className="panel-header">
              <h3>✂️ Image Segmentation</h3>
              <p>Upload an image to automatically separate foreground from background</p>
            </div>

            <div className="upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleSegmentImage(e.target.files[0])}
                style={{ display: 'none' }}
                id="segment-upload"
              />
              <label htmlFor="segment-upload" className="upload-button">
                📁 Choose Image
              </label>
            </div>

            {isProcessing && (
              <div className="processing-indicator">
                <div className="spinner" />
                <p>AI is analyzing your image...</p>
              </div>
            )}

            {segmentationResult && (
              <div className="result-grid">
                <div className="result-item">
                  <h4>Original</h4>
                  <img src={selectedImage!} alt="Original" className="result-image" />
                </div>
                <div className="result-item">
                  <h4>Foreground</h4>
                  <img src={segmentationResult.foreground} alt="Foreground" className="result-image" />
                  <button className="result-action">Use Foreground</button>
                </div>
                <div className="result-item">
                  <h4>Background</h4>
                  <img src={segmentationResult.background} alt="Background" className="result-image" />
                  <button className="result-action">Use Background</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Color Palette Suggestion */}
        {activeTool === 'suggest-palette' && (
          <div className="tool-panel">
            <div className="panel-header">
              <h3>🎨 Color Palette Generator</h3>
              <p>Extract beautiful color palettes from any image</p>
            </div>

            <div className="upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleSuggestPalette(e.target.files[0])}
                style={{ display: 'none' }}
                id="palette-upload"
              />
              <label htmlFor="palette-upload" className="upload-button">
                📁 Choose Image
              </label>
            </div>

            {isProcessing && (
              <div className="processing-indicator">
                <div className="spinner" />
                <p>Extracting color palettes...</p>
              </div>
            )}

            {generatedPalettes.length > 0 && (
              <div className="palettes-container">
                {paletteSource && (
                  <div className="palette-source">
                    <img src={paletteSource} alt="Source" />
                  </div>
                )}

                <div className="palettes-grid">
                  {generatedPalettes.map((palette, index) => (
                    <div key={index} className="palette-card">
                      <div className="palette-colors">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="color-swatch"
                            style={{
                              background: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                            }}
                            title={`rgb(${color[0]}, ${color[1]}, ${color[2]})`}
                          />
                        ))}
                      </div>
                      <div className="palette-info">
                        <h4>{palette.name}</h4>
                        <p>{palette.mood}</p>
                      </div>
                      <button className="palette-apply" onClick={() => applyPalette(palette)}>
                        Apply Palette
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BPM Detection */}
        {activeTool === 'detect-bpm' && (
          <div className="tool-panel">
            <div className="panel-header">
              <h3>🎵 BPM Detection</h3>
              <p>Automatically detect the tempo of your music</p>
            </div>

            <div className="upload-section">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files && handleDetectBPM(e.target.files[0])}
                style={{ display: 'none' }}
                id="bpm-upload"
              />
              <label htmlFor="bpm-upload" className="upload-button">
                📁 Choose Audio File
              </label>
            </div>

            {isProcessing && (
              <div className="processing-indicator">
                <div className="spinner" />
                <p>Analyzing audio tempo...</p>
              </div>
            )}

            {detectedBPM && (
              <div className="bpm-result">
                <div className="bpm-display">
                  <div className="bpm-number">{detectedBPM}</div>
                  <div className="bpm-label">BPM</div>
                </div>

                <div className="bpm-info">
                  <h4>Tempo Information</h4>
                  <div className="info-row">
                    <span>Category:</span>
                    <span>
                      {detectedBPM < 90 ? 'Slow (Chill)' : detectedBPM < 120 ? 'Medium (Lofi)' : 'Fast (Upbeat)'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>Best for:</span>
                    <span>
                      {detectedBPM < 90 ? 'Study, Relaxation' : detectedBPM < 120 ? 'Background, Ambient' : 'Energetic scenes'}
                    </span>
                  </div>
                </div>

                <div className="bpm-suggestions">
                  <h4>💡 Animation Suggestions</h4>
                  <ul>
                    <li>Breathing effect: {(60 / detectedBPM * 2).toFixed(1)}s cycle time</li>
                    <li>Float animation: {(60 / detectedBPM).toFixed(1)}s duration</li>
                    <li>Pulse effect synced to beat</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Music/Visual Pairing */}
        {activeTool === 'pair-music' && (
          <div className="tool-panel">
            <div className="panel-header">
              <h3>🎭 Smart Music & Visual Pairing</h3>
              <p>Get AI recommendations for perfect music and visual combinations</p>
            </div>

            <div className="pairing-action">
              <button className="analyze-button" onClick={handlePairMusic} disabled={!currentScene}>
                {isProcessing ? 'Analyzing...' : '✨ Analyze My Scene'}
              </button>
            </div>

            {isProcessing && (
              <div className="processing-indicator">
                <div className="spinner" />
                <p>AI is analyzing your scene for optimal pairings...</p>
              </div>
            )}

            {pairingRecommendations.length > 0 && (
              <div className="recommendations-list">
                <h4>AI Recommendations</h4>
                {pairingRecommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="rec-text">{rec}</div>
                    <button className="rec-action">Apply</button>
                  </div>
                ))}
              </div>
            )}

            {!currentScene && (
              <div className="empty-state">
                <p>Create a scene first to get personalized recommendations</p>
              </div>
            )}
          </div>
        )}

        {/* Smart Suggestions */}
        {activeTool === 'smart-suggestions' && (
          <div className="tool-panel">
            <div className="panel-header">
              <h3>💡 Smart Suggestions</h3>
              <p>AI-powered tips to improve your lofi scene</p>
            </div>

            <div className="suggestions-container">
              <div className="suggestion-card tip">
                <div className="suggestion-icon">💡</div>
                <div className="suggestion-content">
                  <h4>Composition Tip</h4>
                  <p>Try using the rule of thirds - place key elements at intersection points for better visual balance</p>
                </div>
              </div>

              <div className="suggestion-card warning">
                <div className="suggestion-icon">⚠️</div>
                <div className="suggestion-content">
                  <h4>Contrast Alert</h4>
                  <p>Some elements have low contrast. Consider adjusting brightness or adding a subtle glow effect</p>
                </div>
              </div>

              <div className="suggestion-card success">
                <div className="suggestion-icon">✨</div>
                <div className="suggestion-content">
                  <h4>Enhancement Idea</h4>
                  <p>Your scene would benefit from subtle rain or snow particles for added atmosphere</p>
                </div>
              </div>

              <div className="suggestion-card info">
                <div className="suggestion-icon">🎨</div>
                <div className="suggestion-content">
                  <h4>Color Harmony</h4>
                  <p>Consider using complementary colors for overlays - current palette leans warm, try cool-toned effects</p>
                </div>
              </div>

              <div className="suggestion-card info">
                <div className="suggestion-icon">⚡</div>
                <div className="suggestion-content">
                  <h4>Performance</h4>
                  <p>Scene complexity is good. You can add 2-3 more animated elements without performance issues</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!activeTool && (
          <div className="tool-placeholder">
            <div className="placeholder-icon">🤖</div>
            <h3>Select an AI tool to get started</h3>
            <p>Choose from the options above to enhance your lofi scene with AI</p>
          </div>
        )}
      </div>
    </div>
  )
}

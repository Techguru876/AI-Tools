/**
 * ContentForge Studio - AI-Powered Content Generation Dashboard
 * Unified interface for script generation, voice synthesis, image creation, and YouTube automation
 */

import { useState, useEffect } from 'react';
import { contentforge, templates, batch } from '../../lib/electron-bridge';
import './ContentForgeStudio.css';

interface APIKeyStatus {
  openai: boolean;
  elevenlabs: boolean;
  youtube: boolean;
}

interface BatchJob {
  id: string;
  templateId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  createdAt: number;
}

interface CostStats {
  scriptGeneration?: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  voiceGeneration?: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  imageGeneration?: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  metadataGeneration?: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

type ContentType = 'horror' | 'lofi' | 'explainer' | 'motivational';
type ActiveTab = 'dashboard' | 'generate' | 'batch' | 'settings';

export default function ContentForgeStudio() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [apiKeyStatus, setApiKeyStatus] = useState<APIKeyStatus>({ openai: false, elevenlabs: false, youtube: false });
  const [costStats, setCostStats] = useState<CostStats>({});
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings state
  const [openaiKey, setOpenaiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [youtubeClientId, setYoutubeClientId] = useState('');
  const [youtubeClientSecret, setYoutubeClientSecret] = useState('');
  const [youtubeRefreshToken, setYoutubeRefreshToken] = useState('');

  // Generation state
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('horror');
  const [generationOptions, setGenerationOptions] = useState<any>({
    duration: 600,
    theme: 'psychological',
    setting: 'abandoned hospital',
    pov: 'first',
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const status = await contentforge.apiKeys.validate();
      setApiKeyStatus(status);

      const costs = await contentforge.tracking.getCostStats();
      setCostStats(costs);

      const jobs = await batch.listJobs(undefined, 50);
      setBatchJobs(jobs);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSaveAPIKeys = async () => {
    try {
      if (openaiKey) {
        await contentforge.apiKeys.setOpenAI(openaiKey);
      }
      if (elevenLabsKey) {
        await contentforge.apiKeys.setElevenLabs(elevenLabsKey);
      }
      if (youtubeClientId && youtubeClientSecret && youtubeRefreshToken) {
        await contentforge.apiKeys.setYouTube({
          clientId: youtubeClientId,
          clientSecret: youtubeClientSecret,
          refreshToken: youtubeRefreshToken,
        });
      }

      const status = await contentforge.apiKeys.validate();
      setApiKeyStatus(status);
      setShowSettings(false);
      alert('API keys saved successfully!');
    } catch (error) {
      console.error('Error saving API keys:', error);
      alert('Failed to save API keys: ' + (error as Error).message);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let result;

      switch (selectedContentType) {
        case 'horror':
          result = await contentforge.script.horror(generationOptions);
          break;
        case 'lofi':
          result = await contentforge.script.lofi(generationOptions);
          break;
        case 'explainer':
          result = await contentforge.script.explainer(generationOptions);
          break;
        case 'motivational':
          result = await contentforge.script.motivational(generationOptions);
          break;
      }

      setGeneratedContent(result);
      await loadInitialData(); // Refresh cost stats
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAssets = async () => {
    if (!generatedContent) return;

    try {
      setIsGenerating(true);

      // Generate voice narration
      const voiceResult = await contentforge.voice.generate(
        generatedContent.script,
        'narration.mp3',
        { provider: 'auto', quality: 'high' }
      );

      // Generate images if applicable
      let imageResults = [];
      if (generatedContent.scenes) {
        const imagePrompts = generatedContent.scenes.map((scene: any, i: number) => ({
          prompt: scene.description,
          filename: `scene-${i}.png`,
          style: selectedContentType === 'horror' ? 'dark horror' : 'dreamy lofi',
        }));
        imageResults = await contentforge.image.batch(imagePrompts);
      }

      // Queue video rendering
      const templateId = selectedContentType === 'horror' ? 'horror_story_v1' : 'lofi_chill_v1';
      await batch.addJob({
        templateId,
        variables: {
          TITLE: generatedContent.title,
          NARRATION_AUDIO: voiceResult.path,
          SCENE_IMAGES: JSON.stringify(imageResults.map((img: any) => img.path)),
        },
        outputPath: `/output/${selectedContentType}-${Date.now()}.mp4`,
      });

      alert('Assets generated and video queued for rendering!');
      await loadInitialData();
    } catch (error) {
      console.error('Error generating assets:', error);
      alert('Failed to generate assets: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTotalCost = () => {
    let total = 0;
    if (costStats.scriptGeneration) total += costStats.scriptGeneration.total;
    if (costStats.voiceGeneration) total += costStats.voiceGeneration.total;
    if (costStats.imageGeneration) total += costStats.imageGeneration.total;
    if (costStats.metadataGeneration) total += costStats.metadataGeneration.total;
    return total.toFixed(2);
  };

  return (
    <div className="contentforge-studio">
      {/* Header */}
      <div className="cf-header">
        <div className="header-content">
          <h2>🚀 ContentForge Studio</h2>
          <p>AI-powered content generation and YouTube automation</p>
        </div>
        <div className="header-actions">
          <div className="api-status">
            {apiKeyStatus.openai && <span className="status-badge success">OpenAI ✓</span>}
            {apiKeyStatus.elevenlabs && <span className="status-badge success">ElevenLabs ✓</span>}
            {apiKeyStatus.youtube && <span className="status-badge success">YouTube ✓</span>}
            {!apiKeyStatus.openai && !apiKeyStatus.elevenlabs && !apiKeyStatus.youtube && (
              <span className="status-badge warning">No API Keys</span>
            )}
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cf-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          ✨ Generate
        </button>
        <button
          className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          ⚙️ Batch Queue
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="cf-content dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">${getTotalCost()}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎬</div>
              <div className="stat-value">{batchJobs.length}</div>
              <div className="stat-label">Videos Queued</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{batchJobs.filter(j => j.status === 'completed').length}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-value">{batchJobs.filter(j => j.status === 'processing').length}</div>
              <div className="stat-label">Processing</div>
            </div>
          </div>

          <div className="cost-breakdown">
            <h3>💸 Cost Breakdown</h3>
            <div className="cost-items">
              {costStats.scriptGeneration && (
                <div className="cost-item">
                  <span className="cost-label">Script Generation</span>
                  <span className="cost-value">${costStats.scriptGeneration.total.toFixed(2)}</span>
                </div>
              )}
              {costStats.voiceGeneration && (
                <div className="cost-item">
                  <span className="cost-label">Voice Synthesis</span>
                  <span className="cost-value">${costStats.voiceGeneration.total.toFixed(2)}</span>
                </div>
              )}
              {costStats.imageGeneration && (
                <div className="cost-item">
                  <span className="cost-label">Image Generation</span>
                  <span className="cost-value">${costStats.imageGeneration.total.toFixed(2)}</span>
                </div>
              )}
              {costStats.metadataGeneration && (
                <div className="cost-item">
                  <span className="cost-label">YouTube Metadata</span>
                  <span className="cost-value">${costStats.metadataGeneration.total.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="recent-jobs">
            <h3>📋 Recent Jobs</h3>
            {batchJobs.length === 0 ? (
              <div className="empty-state-small">
                <p>No jobs yet. Start generating content!</p>
              </div>
            ) : (
              <div className="jobs-list-small">
                {batchJobs.slice(0, 5).map(job => (
                  <div key={job.id} className="job-item-small">
                    <span className="job-id">{job.id.substring(0, 8)}</span>
                    <span className={`job-status ${job.status}`}>{job.status}</span>
                    <span className="job-progress">{job.progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="cf-content generate">
          <div className="content-type-selector">
            <h3>📝 Select Content Type</h3>
            <div className="type-grid">
              {[
                { id: 'horror' as ContentType, name: 'Horror Story', icon: '👻', color: '#b71c1c' },
                { id: 'lofi' as ContentType, name: 'Lofi Description', icon: '🎵', color: '#667eea' },
                { id: 'explainer' as ContentType, name: 'Explainer Video', icon: '📚', color: '#00d9ff' },
                { id: 'motivational' as ContentType, name: 'Motivational Quotes', icon: '💪', color: '#ff9800' },
              ].map(type => (
                <button
                  key={type.id}
                  className={`type-card ${selectedContentType === type.id ? 'active' : ''}`}
                  onClick={() => setSelectedContentType(type.id)}
                  style={{ '--type-color': type.color } as React.CSSProperties}
                >
                  <div className="type-icon">{type.icon}</div>
                  <div className="type-name">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="generation-options">
            <h3>⚙️ Options</h3>
            {selectedContentType === 'horror' && (
              <div className="options-form">
                <div className="form-group">
                  <label>Duration (seconds)</label>
                  <input
                    type="number"
                    value={generationOptions.duration}
                    onChange={e => setGenerationOptions({ ...generationOptions, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={generationOptions.theme}
                    onChange={e => setGenerationOptions({ ...generationOptions, theme: e.target.value })}
                  >
                    <option value="psychological">Psychological</option>
                    <option value="supernatural">Supernatural</option>
                    <option value="urban legend">Urban Legend</option>
                    <option value="cosmic horror">Cosmic Horror</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Point of View</label>
                  <select
                    value={generationOptions.pov}
                    onChange={e => setGenerationOptions({ ...generationOptions, pov: e.target.value })}
                  >
                    <option value="first">First Person</option>
                    <option value="third">Third Person</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="generation-actions">
            <button
              className="generate-btn primary"
              onClick={handleGenerate}
              disabled={!apiKeyStatus.openai || isGenerating}
            >
              {isGenerating ? '⏳ Generating...' : '✨ Generate Script'}
            </button>
          </div>

          {generatedContent && (
            <div className="generated-content">
              <h3>✅ Generated Content</h3>
              <div className="content-preview">
                <h4>{generatedContent.title}</h4>
                <p className="script-preview">{generatedContent.script?.substring(0, 500)}...</p>
                {generatedContent.scenes && (
                  <div className="scenes-info">
                    <span>{generatedContent.scenes.length} scenes</span>
                  </div>
                )}
              </div>
              <button
                className="generate-assets-btn"
                onClick={handleGenerateAssets}
                disabled={isGenerating}
              >
                {isGenerating ? '⏳ Generating Assets...' : '🎬 Generate Voice + Images + Queue Video'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Batch Queue Tab */}
      {activeTab === 'batch' && (
        <div className="cf-content batch">
          <div className="batch-header">
            <h3>⚙️ Batch Processing Queue</h3>
            <div className="batch-stats">
              <span>Total: {batchJobs.length}</span>
              <span>Processing: {batchJobs.filter(j => j.status === 'processing').length}</span>
              <span>Queued: {batchJobs.filter(j => j.status === 'queued').length}</span>
            </div>
          </div>

          {batchJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4>No Jobs in Queue</h4>
              <p>Start generating content to see jobs here</p>
            </div>
          ) : (
            <div className="jobs-list">
              {batchJobs.map(job => (
                <div key={job.id} className={`job-card ${job.status}`}>
                  <div className="job-header">
                    <span className="job-id">Job: {job.id.substring(0, 12)}</span>
                    <span className={`job-status-badge ${job.status}`}>{job.status}</span>
                  </div>
                  <div className="job-body">
                    <div className="job-template">Template: {job.templateId}</div>
                    <div className="job-stage">{job.stage}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${job.progress}%` }} />
                    </div>
                    <div className="progress-text">{job.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ API Key Settings</h3>
              <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <h4>OpenAI (GPT-4, DALL-E, TTS)</h4>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  className="api-key-input"
                />
                <div className="status-indicator">
                  {apiKeyStatus.openai ? <span className="success">✓ Configured</span> : <span className="warning">⚠️ Not configured</span>}
                </div>
              </div>

              <div className="settings-section">
                <h4>ElevenLabs (Voice Synthesis)</h4>
                <input
                  type="password"
                  placeholder="Enter API key..."
                  value={elevenLabsKey}
                  onChange={e => setElevenLabsKey(e.target.value)}
                  className="api-key-input"
                />
                <div className="status-indicator">
                  {apiKeyStatus.elevenlabs ? <span className="success">✓ Configured</span> : <span className="warning">⚠️ Not configured</span>}
                </div>
              </div>

              <div className="settings-section">
                <h4>YouTube API (OAuth2)</h4>
                <input
                  type="text"
                  placeholder="Client ID"
                  value={youtubeClientId}
                  onChange={e => setYoutubeClientId(e.target.value)}
                  className="api-key-input"
                />
                <input
                  type="text"
                  placeholder="Client Secret"
                  value={youtubeClientSecret}
                  onChange={e => setYoutubeClientSecret(e.target.value)}
                  className="api-key-input"
                />
                <input
                  type="text"
                  placeholder="Refresh Token"
                  value={youtubeRefreshToken}
                  onChange={e => setYoutubeRefreshToken(e.target.value)}
                  className="api-key-input"
                />
                <div className="status-indicator">
                  {apiKeyStatus.youtube ? <span className="success">✓ Configured</span> : <span className="warning">⚠️ Not configured</span>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveAPIKeys}>💾 Save API Keys</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

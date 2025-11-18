/**
 * Community Hub Component  
 * Asset marketplace, template sharing, and community features
 */

import { useState } from 'react'
import './CommunityHub.css'

interface CommunityAsset {
  id: string
  name: string
  type: 'template' | 'scene' | 'asset' | 'music'
  author: string
  downloads: number
  likes: number
  thumbnail: string
  tags: string[]
}

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'myuploads'>('browse')
  
  const communityAssets: CommunityAsset[] = [
    {
      id: '1',
      name: 'Rainy Tokyo Night',
      type: 'template',
      author: 'LofiMaster',
      downloads: 2500,
      likes: 450,
      thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tags: ['rain', 'city', 'night'],
    },
    {
      id: '2',
      name: 'Cozy Coffee Shop',
      type: 'template',
      author: 'ChillBeats',
      downloads: 3200,
      likes: 680,
      thumbnail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      tags: ['cozy', 'indoor', 'warm'],
    },
  ]

  return (
    <div className="community-hub">
      <div className="community-header">
        <h2>🌍 Community Hub</h2>
        <p>Discover and share amazing lofi creations</p>
      </div>

      <div className="community-tabs">
        <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>
          🔍 Browse
        </button>
        <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>
          ⬆️ Upload
        </button>
        <button className={activeTab === 'myuploads' ? 'active' : ''} onClick={() => setActiveTab('myuploads')}>
          📦 My Uploads
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="browse-section">
          <div className="community-grid">
            {communityAssets.map((asset) => (
              <div key={asset.id} className="community-card">
                <div className="card-thumb" style={{ background: asset.thumbnail }} />
                <div className="card-info">
                  <h4>{asset.name}</h4>
                  <p>by {asset.author}</p>
                  <div className="card-stats">
                    <span>❤️ {asset.likes}</span>
                    <span>⬇️ {asset.downloads}</span>
                  </div>
                  <button className="download-btn">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="upload-section">
          <h3>Share Your Creation</h3>
          <div className="upload-form">
            <input type="text" placeholder="Asset name..." />
            <textarea placeholder="Description..." rows={4} />
            <button className="upload-btn">Upload</button>
          </div>
        </div>
      )}
    </div>
  )
}

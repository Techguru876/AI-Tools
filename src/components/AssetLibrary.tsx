/**
 * Asset Library
 * Browse, import, and manage project assets (videos, images, audio)
 */

import { useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'
import '../styles/AssetLibrary.css'

export default function AssetLibrary() {
  const [assets, setAssets] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'video' | 'image' | 'audio'>('all')

  const handleImport = async () => {
    const selected = await open({
      multiple: true,
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'mov', 'avi', 'png', 'jpg', 'jpeg', 'mp3', 'wav'] },
      ],
    })

    if (!selected) return

    const paths = Array.isArray(selected) ? selected : [selected]

    for (const path of paths) {
      try {
        // Determine file type and import
        const ext = path.split('.').pop()?.toLowerCase()

        if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext || '')) {
          const info = await invoke('import_video', { path })
          setAssets((prev) => [...prev, { path, type: 'video', info }])
        } else if (['png', 'jpg', 'jpeg', 'tiff', 'psd', 'webp'].includes(ext || '')) {
          const info = await invoke('import_image', { path })
          setAssets((prev) => [...prev, { path, type: 'image', info }])
        } else if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(ext || '')) {
          const info = await invoke('import_audio', { path })
          setAssets((prev) => [...prev, { path, type: 'audio', info }])
        }
      } catch (error) {
        console.error('Failed to import asset:', error)
      }
    }
  }

  const filteredAssets =
    filter === 'all' ? assets : assets.filter((a) => a.type === filter)

  return (
    <div className="asset-library">
      <div className="panel-title">
        Assets
        <button onClick={handleImport} title="Import assets">+</button>
      </div>

      <div className="panel-content">
        <div className="asset-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'video' ? 'active' : ''}
            onClick={() => setFilter('video')}
          >
            Video
          </button>
          <button
            className={filter === 'image' ? 'active' : ''}
            onClick={() => setFilter('image')}
          >
            Image
          </button>
          <button
            className={filter === 'audio' ? 'active' : ''}
            onClick={() => setFilter('audio')}
          >
            Audio
          </button>
        </div>

        <div className="assets-grid">
          {filteredAssets.map((asset, index) => (
            <div key={index} className="asset-item" draggable>
              <div className="asset-thumbnail">
                {asset.type === 'video' && '🎬'}
                {asset.type === 'image' && '🖼'}
                {asset.type === 'audio' && '🎵'}
              </div>
              <div className="asset-name">
                {asset.path.split('/').pop()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

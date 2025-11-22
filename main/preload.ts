import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Project management
  createProject: (name: string) => ipcRenderer.invoke('project:create', name),
  openProject: (path: string) => ipcRenderer.invoke('project:open', path),
  saveProject: (data: any) => ipcRenderer.invoke('project:save', data),
  listProjects: () => ipcRenderer.invoke('project:list'),

  // Asset management
  importAsset: (path: string) => ipcRenderer.invoke('asset:import', path),
  generateProxy: (assetId: string) => ipcRenderer.invoke('asset:generate-proxy', assetId),
  listAssets: () => ipcRenderer.invoke('asset:list'),
  getAsset: (assetId: string) => ipcRenderer.invoke('asset:get', assetId),
  deleteAsset: (assetId: string) => ipcRenderer.invoke('asset:delete', assetId),

  // Timeline operations
  addClipToTimeline: (clip: any) => ipcRenderer.invoke('timeline:add-clip', clip),
  removeClip: (clipId: string) => ipcRenderer.invoke('timeline:remove-clip', clipId),
  updateClip: (clipId: string, updates: any) => ipcRenderer.invoke('timeline:update-clip', clipId, updates),
  getTimeline: () => ipcRenderer.invoke('timeline:get'),

  // Video processing
  getFrameAtTime: (time: number) => ipcRenderer.invoke('video:get-frame', time),
  startPreview: () => ipcRenderer.invoke('video:start-preview'),
  stopPreview: () => ipcRenderer.invoke('video:stop-preview'),
  seekPreview: (time: number) => ipcRenderer.invoke('video:seek', time),

  // Image processing
  processImage: (assetId: string, operations: any) => ipcRenderer.invoke('image:process', assetId, operations),
  generateThumbnail: (assetId: string) => ipcRenderer.invoke('image:thumbnail', assetId),

  // Export
  exportVideo: (config: any) => ipcRenderer.invoke('export:video', config),
  exportImage: (config: any) => ipcRenderer.invoke('export:image', config),
  exportGIF: (config: any) => ipcRenderer.invoke('export:gif', config),

  // File dialogs
  openFile: (options?: any) => ipcRenderer.invoke('dialog:open-file', options),
  saveFile: (options?: any) => ipcRenderer.invoke('dialog:save-file', options),
  openDirectory: () => ipcRenderer.invoke('dialog:open-directory'),

  // Events (one-way communication from main to renderer)
  onFrameReady: (callback: (framePath: string) => void) => {
    ipcRenderer.on('frame-ready', (_event, framePath) => callback(framePath));
  },
  onExportProgress: (callback: (progress: number, stage: string) => void) => {
    ipcRenderer.on('export-progress', (_event, progress, stage) => callback(progress, stage));
  },
  onAssetProcessed: (callback: (assetId: string, status: string) => void) => {
    ipcRenderer.on('asset-processed', (_event, assetId, status) => callback(assetId, status));
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('error', (_event, error) => callback(error));
  },

  // Remove event listeners
  removeFrameReadyListener: () => {
    ipcRenderer.removeAllListeners('frame-ready');
  },
  removeExportProgressListener: () => {
    ipcRenderer.removeAllListeners('export-progress');
  },
});

// Also expose app info
contextBridge.exposeInMainWorld('appInfo', {
  platform: process.platform,
  version: process.env.npm_package_version || '2.0.0',
});

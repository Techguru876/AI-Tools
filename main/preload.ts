import { contextBridge, ipcRenderer } from 'electron';

console.log('⚡ PRELOAD SCRIPT RUNNING ⚡');

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

  // Template management (ContentForge)
  listTemplates: (niche?: string) => {
    console.log('🌐 Frontend calling: listTemplates with niche:', niche || 'all');
    return ipcRenderer.invoke('template:list', niche);
  },
  getTemplate: (templateId: string) => {
    console.log('🌐 Frontend calling: getTemplate with ID:', templateId);
    return ipcRenderer.invoke('template:get', templateId);
  },
  saveTemplate: (template: any) => ipcRenderer.invoke('template:save', template),
  deleteTemplate: (templateId: string) => ipcRenderer.invoke('template:delete', templateId),
  cloneTemplate: (templateId: string, newName: string) => ipcRenderer.invoke('template:clone', templateId, newName),
  resolveTemplate: (templateId: string, variables: any) => ipcRenderer.invoke('template:resolve', templateId, variables),
  validateTemplate: (templateId: string, variables: any) => ipcRenderer.invoke('template:validate', templateId, variables),
  getTemplateStats: () => ipcRenderer.invoke('template:stats'),
  initBuiltInTemplates: () => ipcRenderer.invoke('template:init-builtin'),

  // Batch processing (ContentForge)
  addBatchJob: (job: any) => ipcRenderer.invoke('batch:add-job', job),
  addBatchJobs: (jobs: any[]) => ipcRenderer.invoke('batch:add-jobs', jobs),
  getBatchJob: (jobId: string) => ipcRenderer.invoke('batch:get-job', jobId),
  listBatchJobs: (status?: string, limit?: number) => ipcRenderer.invoke('batch:list-jobs', status, limit),
  cancelBatchJob: (jobId: string) => ipcRenderer.invoke('batch:cancel-job', jobId),
  clearFinishedJobs: () => ipcRenderer.invoke('batch:clear-finished'),
  getBatchStats: () => ipcRenderer.invoke('batch:stats'),
  startBatchProcessing: () => ipcRenderer.invoke('batch:start-processing'),
  stopBatchProcessing: () => ipcRenderer.invoke('batch:stop-processing'),

  // Batch events
  onBatchJobQueued: (callback: (job: any) => void) => {
    ipcRenderer.on('batch:job-queued', (_event, job) => callback(job));
  },
  onBatchJobStarted: (callback: (job: any) => void) => {
    ipcRenderer.on('batch:job-started', (_event, job) => callback(job));
  },
  onBatchJobProgress: (callback: (jobId: string, progress: number, stage: string) => void) => {
    ipcRenderer.on('batch:job-progress', (_event, jobId, progress, stage) => callback(jobId, progress, stage));
  },
  onBatchJobCompleted: (callback: (job: any) => void) => {
    ipcRenderer.on('batch:job-completed', (_event, job) => callback(job));
  },
  onBatchJobFailed: (callback: (job: any, error: string) => void) => {
    ipcRenderer.on('batch:job-failed', (_event, job, error) => callback(job, error));
  },
  onBatchQueueEmpty: (callback: () => void) => {
    ipcRenderer.on('batch:queue-empty', () => callback());
  },

  // ==================== AI SERVICES (ContentForge) ====================

  // API Key Management
  cfSetOpenAIKey: (apiKey: string) => ipcRenderer.invoke('contentforge:api-keys:set-openai', apiKey),
  cfSetElevenLabsKey: (apiKey: string) => ipcRenderer.invoke('contentforge:api-keys:set-elevenlabs', apiKey),
  cfSetYouTubeCredentials: (credentials: any) => ipcRenderer.invoke('contentforge:api-keys:set-youtube', credentials),
  cfValidateAPIKeys: () => ipcRenderer.invoke('contentforge:api-keys:validate'),
  cfClearAPIKeys: (service?: string) => ipcRenderer.invoke('contentforge:api-keys:clear', service),

  // Script Generation
  cfGenerateHorrorScript: (options: any) => ipcRenderer.invoke('contentforge:script:horror', options),
  cfGenerateLofiScript: (options: any) => ipcRenderer.invoke('contentforge:script:lofi', options),
  cfGenerateExplainerScript: (options: any) => ipcRenderer.invoke('contentforge:script:explainer', options),
  cfGenerateMotivationalScript: (options: any) => ipcRenderer.invoke('contentforge:script:motivational', options),

  // Voice Generation
  cfGenerateVoice: (text: string, filename: string, options?: any) => ipcRenderer.invoke('contentforge:voice:generate', text, filename, options),
  cfListVoices: (provider: 'elevenlabs' | 'openai') => ipcRenderer.invoke('contentforge:voice:list-voices', provider),

  // Image Generation
  cfGenerateImage: (prompt: string, options?: any) => ipcRenderer.invoke('contentforge:image:generate', prompt, options),
  cfGenerateHorrorScene: (description: string, options?: any) => ipcRenderer.invoke('contentforge:image:horror-scene', description, options),
  cfGenerateLofiBackground: (description: string, options?: any) => ipcRenderer.invoke('contentforge:image:lofi-background', description, options),
  cfGenerateBatchImages: (prompts: any[]) => ipcRenderer.invoke('contentforge:image:batch', prompts),

  // YouTube Integration
  cfUploadToYouTube: (videoPath: string, metadata: any) => ipcRenderer.invoke('contentforge:youtube:upload', videoPath, metadata),
  cfGenerateYouTubeMetadata: (options: any) => ipcRenderer.invoke('contentforge:youtube:metadata:generate', options),
  cfGenerateYouTubeTitle: (options: any) => ipcRenderer.invoke('contentforge:youtube:metadata:title', options),
  cfGenerateYouTubeDescription: (options: any) => ipcRenderer.invoke('contentforge:youtube:metadata:description', options),
  cfGenerateYouTubeTags: (options: any) => ipcRenderer.invoke('contentforge:youtube:metadata:tags', options),
  cfListYouTubePlaylists: () => ipcRenderer.invoke('contentforge:youtube:playlists'),
  cfCreateYouTubePlaylist: (options: any) => ipcRenderer.invoke('contentforge:youtube:create-playlist', options),

  // Cost & Cache Tracking
  cfGetCostStats: () => ipcRenderer.invoke('contentforge:cost:stats'),
  cfGetCacheStats: () => ipcRenderer.invoke('contentforge:cache:stats'),
  cfClearCache: (type?: string) => ipcRenderer.invoke('contentforge:cache:clear', type),
});

// Also expose app info
contextBridge.exposeInMainWorld('appInfo', {
  platform: process.platform,
  version: '1.0.0',
  name: 'ContentForge Studio',
});

console.log('✓ electronAPI exposed to window');
console.log('✓ appInfo exposed to window');
console.log('📋 Template methods available: listTemplates, getTemplate, saveTemplate, etc.');

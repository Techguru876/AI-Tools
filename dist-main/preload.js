"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('⚡ PRELOAD SCRIPT RUNNING ⚡');
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Project management
    createProject: (name) => electron_1.ipcRenderer.invoke('project:create', name),
    openProject: (path) => electron_1.ipcRenderer.invoke('project:open', path),
    saveProject: (data) => electron_1.ipcRenderer.invoke('project:save', data),
    listProjects: () => electron_1.ipcRenderer.invoke('project:list'),
    // Asset management
    importAsset: (path) => electron_1.ipcRenderer.invoke('asset:import', path),
    generateProxy: (assetId) => electron_1.ipcRenderer.invoke('asset:generate-proxy', assetId),
    listAssets: () => electron_1.ipcRenderer.invoke('asset:list'),
    getAsset: (assetId) => electron_1.ipcRenderer.invoke('asset:get', assetId),
    deleteAsset: (assetId) => electron_1.ipcRenderer.invoke('asset:delete', assetId),
    // Timeline operations
    addClipToTimeline: (clip) => electron_1.ipcRenderer.invoke('timeline:add-clip', clip),
    removeClip: (clipId) => electron_1.ipcRenderer.invoke('timeline:remove-clip', clipId),
    updateClip: (clipId, updates) => electron_1.ipcRenderer.invoke('timeline:update-clip', clipId, updates),
    getTimeline: () => electron_1.ipcRenderer.invoke('timeline:get'),
    // Video processing
    getFrameAtTime: (time) => electron_1.ipcRenderer.invoke('video:get-frame', time),
    startPreview: () => electron_1.ipcRenderer.invoke('video:start-preview'),
    stopPreview: () => electron_1.ipcRenderer.invoke('video:stop-preview'),
    seekPreview: (time) => electron_1.ipcRenderer.invoke('video:seek', time),
    // Image processing
    processImage: (assetId, operations) => electron_1.ipcRenderer.invoke('image:process', assetId, operations),
    generateThumbnail: (assetId) => electron_1.ipcRenderer.invoke('image:thumbnail', assetId),
    // Export
    exportVideo: (config) => electron_1.ipcRenderer.invoke('export:video', config),
    exportImage: (config) => electron_1.ipcRenderer.invoke('export:image', config),
    exportGIF: (config) => electron_1.ipcRenderer.invoke('export:gif', config),
    // File dialogs
    openFile: (options) => electron_1.ipcRenderer.invoke('dialog:open-file', options),
    saveFile: (options) => electron_1.ipcRenderer.invoke('dialog:save-file', options),
    openDirectory: () => electron_1.ipcRenderer.invoke('dialog:open-directory'),
    // Events (one-way communication from main to renderer)
    onFrameReady: (callback) => {
        electron_1.ipcRenderer.on('frame-ready', (_event, framePath) => callback(framePath));
    },
    onExportProgress: (callback) => {
        electron_1.ipcRenderer.on('export-progress', (_event, progress, stage) => callback(progress, stage));
    },
    onAssetProcessed: (callback) => {
        electron_1.ipcRenderer.on('asset-processed', (_event, assetId, status) => callback(assetId, status));
    },
    onError: (callback) => {
        electron_1.ipcRenderer.on('error', (_event, error) => callback(error));
    },
    // Remove event listeners
    removeFrameReadyListener: () => {
        electron_1.ipcRenderer.removeAllListeners('frame-ready');
    },
    removeExportProgressListener: () => {
        electron_1.ipcRenderer.removeAllListeners('export-progress');
    },
    // Template management (ContentForge)
    listTemplates: (niche) => {
        console.log('🌐 Frontend calling: listTemplates with niche:', niche || 'all');
        return electron_1.ipcRenderer.invoke('template:list', niche);
    },
    getTemplate: (templateId) => {
        console.log('🌐 Frontend calling: getTemplate with ID:', templateId);
        return electron_1.ipcRenderer.invoke('template:get', templateId);
    },
    saveTemplate: (template) => electron_1.ipcRenderer.invoke('template:save', template),
    deleteTemplate: (templateId) => electron_1.ipcRenderer.invoke('template:delete', templateId),
    cloneTemplate: (templateId, newName) => electron_1.ipcRenderer.invoke('template:clone', templateId, newName),
    resolveTemplate: (templateId, variables) => electron_1.ipcRenderer.invoke('template:resolve', templateId, variables),
    validateTemplate: (templateId, variables) => electron_1.ipcRenderer.invoke('template:validate', templateId, variables),
    getTemplateStats: () => electron_1.ipcRenderer.invoke('template:stats'),
    initBuiltInTemplates: () => electron_1.ipcRenderer.invoke('template:init-builtin'),
    // Batch processing (ContentForge)
    addBatchJob: (job) => electron_1.ipcRenderer.invoke('batch:add-job', job),
    addBatchJobs: (jobs) => electron_1.ipcRenderer.invoke('batch:add-jobs', jobs),
    getBatchJob: (jobId) => electron_1.ipcRenderer.invoke('batch:get-job', jobId),
    listBatchJobs: (status, limit) => electron_1.ipcRenderer.invoke('batch:list-jobs', status, limit),
    cancelBatchJob: (jobId) => electron_1.ipcRenderer.invoke('batch:cancel-job', jobId),
    clearFinishedJobs: () => electron_1.ipcRenderer.invoke('batch:clear-finished'),
    getBatchStats: () => electron_1.ipcRenderer.invoke('batch:stats'),
    startBatchProcessing: () => electron_1.ipcRenderer.invoke('batch:start-processing'),
    stopBatchProcessing: () => electron_1.ipcRenderer.invoke('batch:stop-processing'),
    // Batch events
    onBatchJobQueued: (callback) => {
        electron_1.ipcRenderer.on('batch:job-queued', (_event, job) => callback(job));
    },
    onBatchJobStarted: (callback) => {
        electron_1.ipcRenderer.on('batch:job-started', (_event, job) => callback(job));
    },
    onBatchJobProgress: (callback) => {
        electron_1.ipcRenderer.on('batch:job-progress', (_event, jobId, progress, stage) => callback(jobId, progress, stage));
    },
    onBatchJobCompleted: (callback) => {
        electron_1.ipcRenderer.on('batch:job-completed', (_event, job) => callback(job));
    },
    onBatchJobFailed: (callback) => {
        electron_1.ipcRenderer.on('batch:job-failed', (_event, job, error) => callback(job, error));
    },
    onBatchQueueEmpty: (callback) => {
        electron_1.ipcRenderer.on('batch:queue-empty', () => callback());
    },
    // ==================== AI SERVICES (ContentForge) ====================
    // API Key Management
    cfSetOpenAIKey: (apiKey) => electron_1.ipcRenderer.invoke('contentforge:api-keys:set-openai', apiKey),
    cfSetElevenLabsKey: (apiKey) => electron_1.ipcRenderer.invoke('contentforge:api-keys:set-elevenlabs', apiKey),
    cfSetYouTubeCredentials: (credentials) => electron_1.ipcRenderer.invoke('contentforge:api-keys:set-youtube', credentials),
    cfValidateAPIKeys: () => electron_1.ipcRenderer.invoke('contentforge:api-keys:validate'),
    cfClearAPIKeys: (service) => electron_1.ipcRenderer.invoke('contentforge:api-keys:clear', service),
    // Script Generation
    cfGenerateHorrorScript: (options) => electron_1.ipcRenderer.invoke('contentforge:script:horror', options),
    cfGenerateLofiScript: (options) => electron_1.ipcRenderer.invoke('contentforge:script:lofi', options),
    cfGenerateExplainerScript: (options) => electron_1.ipcRenderer.invoke('contentforge:script:explainer', options),
    cfGenerateMotivationalScript: (options) => electron_1.ipcRenderer.invoke('contentforge:script:motivational', options),
    // Voice Generation
    cfGenerateVoice: (text, filename, options) => electron_1.ipcRenderer.invoke('contentforge:voice:generate', text, filename, options),
    cfListVoices: (provider) => electron_1.ipcRenderer.invoke('contentforge:voice:list-voices', provider),
    // Image Generation
    cfGenerateImage: (prompt, options) => electron_1.ipcRenderer.invoke('contentforge:image:generate', prompt, options),
    cfGenerateHorrorScene: (description, options) => electron_1.ipcRenderer.invoke('contentforge:image:horror-scene', description, options),
    cfGenerateLofiBackground: (description, options) => electron_1.ipcRenderer.invoke('contentforge:image:lofi-background', description, options),
    cfGenerateBatchImages: (prompts) => electron_1.ipcRenderer.invoke('contentforge:image:batch', prompts),
    // YouTube Integration
    cfUploadToYouTube: (videoPath, metadata) => electron_1.ipcRenderer.invoke('contentforge:youtube:upload', videoPath, metadata),
    cfGenerateYouTubeMetadata: (options) => electron_1.ipcRenderer.invoke('contentforge:youtube:metadata:generate', options),
    cfGenerateYouTubeTitle: (options) => electron_1.ipcRenderer.invoke('contentforge:youtube:metadata:title', options),
    cfGenerateYouTubeDescription: (options) => electron_1.ipcRenderer.invoke('contentforge:youtube:metadata:description', options),
    cfGenerateYouTubeTags: (options) => electron_1.ipcRenderer.invoke('contentforge:youtube:metadata:tags', options),
    cfListYouTubePlaylists: () => electron_1.ipcRenderer.invoke('contentforge:youtube:playlists'),
    cfCreateYouTubePlaylist: (options) => electron_1.ipcRenderer.invoke('contentforge:youtube:create-playlist', options),
    // Cost & Cache Tracking
    cfGetCostStats: () => electron_1.ipcRenderer.invoke('contentforge:cost:stats'),
    cfGetCacheStats: () => electron_1.ipcRenderer.invoke('contentforge:cache:stats'),
    cfClearCache: (type) => electron_1.ipcRenderer.invoke('contentforge:cache:clear', type),
});
// Also expose app info
electron_1.contextBridge.exposeInMainWorld('appInfo', {
    platform: process.platform,
    version: '1.0.0',
    name: 'ContentForge Studio',
});
console.log('✓ electronAPI exposed to window');
console.log('✓ appInfo exposed to window');
console.log('📋 Template methods available: listTemplates, getTemplate, saveTemplate, etc.');
//# sourceMappingURL=preload.js.map
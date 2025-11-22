"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Project management
    createProject: function (name) { return electron_1.ipcRenderer.invoke('project:create', name); },
    openProject: function (path) { return electron_1.ipcRenderer.invoke('project:open', path); },
    saveProject: function (data) { return electron_1.ipcRenderer.invoke('project:save', data); },
    listProjects: function () { return electron_1.ipcRenderer.invoke('project:list'); },
    // Asset management
    importAsset: function (path) { return electron_1.ipcRenderer.invoke('asset:import', path); },
    generateProxy: function (assetId) { return electron_1.ipcRenderer.invoke('asset:generate-proxy', assetId); },
    listAssets: function () { return electron_1.ipcRenderer.invoke('asset:list'); },
    getAsset: function (assetId) { return electron_1.ipcRenderer.invoke('asset:get', assetId); },
    deleteAsset: function (assetId) { return electron_1.ipcRenderer.invoke('asset:delete', assetId); },
    // Timeline operations
    addClipToTimeline: function (clip) { return electron_1.ipcRenderer.invoke('timeline:add-clip', clip); },
    removeClip: function (clipId) { return electron_1.ipcRenderer.invoke('timeline:remove-clip', clipId); },
    updateClip: function (clipId, updates) { return electron_1.ipcRenderer.invoke('timeline:update-clip', clipId, updates); },
    getTimeline: function () { return electron_1.ipcRenderer.invoke('timeline:get'); },
    // Video processing
    getFrameAtTime: function (time) { return electron_1.ipcRenderer.invoke('video:get-frame', time); },
    startPreview: function () { return electron_1.ipcRenderer.invoke('video:start-preview'); },
    stopPreview: function () { return electron_1.ipcRenderer.invoke('video:stop-preview'); },
    seekPreview: function (time) { return electron_1.ipcRenderer.invoke('video:seek', time); },
    // Image processing
    processImage: function (assetId, operations) { return electron_1.ipcRenderer.invoke('image:process', assetId, operations); },
    generateThumbnail: function (assetId) { return electron_1.ipcRenderer.invoke('image:thumbnail', assetId); },
    // Export
    exportVideo: function (config) { return electron_1.ipcRenderer.invoke('export:video', config); },
    exportImage: function (config) { return electron_1.ipcRenderer.invoke('export:image', config); },
    exportGIF: function (config) { return electron_1.ipcRenderer.invoke('export:gif', config); },
    // File dialogs
    openFile: function (options) { return electron_1.ipcRenderer.invoke('dialog:open-file', options); },
    saveFile: function (options) { return electron_1.ipcRenderer.invoke('dialog:save-file', options); },
    openDirectory: function () { return electron_1.ipcRenderer.invoke('dialog:open-directory'); },
    // Events (one-way communication from main to renderer)
    onFrameReady: function (callback) {
        electron_1.ipcRenderer.on('frame-ready', function (_event, framePath) { return callback(framePath); });
    },
    onExportProgress: function (callback) {
        electron_1.ipcRenderer.on('export-progress', function (_event, progress, stage) { return callback(progress, stage); });
    },
    onAssetProcessed: function (callback) {
        electron_1.ipcRenderer.on('asset-processed', function (_event, assetId, status) { return callback(assetId, status); });
    },
    onError: function (callback) {
        electron_1.ipcRenderer.on('error', function (_event, error) { return callback(error); });
    },
    // Remove event listeners
    removeFrameReadyListener: function () {
        electron_1.ipcRenderer.removeAllListeners('frame-ready');
    },
    removeExportProgressListener: function () {
        electron_1.ipcRenderer.removeAllListeners('export-progress');
    },
    // Template management (ContentForge)
    listTemplates: function (niche) { return electron_1.ipcRenderer.invoke('template:list', niche); },
    getTemplate: function (templateId) { return electron_1.ipcRenderer.invoke('template:get', templateId); },
    saveTemplate: function (template) { return electron_1.ipcRenderer.invoke('template:save', template); },
    deleteTemplate: function (templateId) { return electron_1.ipcRenderer.invoke('template:delete', templateId); },
    cloneTemplate: function (templateId, newName) { return electron_1.ipcRenderer.invoke('template:clone', templateId, newName); },
    resolveTemplate: function (templateId, variables) { return electron_1.ipcRenderer.invoke('template:resolve', templateId, variables); },
    validateTemplate: function (templateId, variables) { return electron_1.ipcRenderer.invoke('template:validate', templateId, variables); },
    getTemplateStats: function () { return electron_1.ipcRenderer.invoke('template:stats'); },
    initBuiltInTemplates: function () { return electron_1.ipcRenderer.invoke('template:init-builtin'); },
    // Batch processing (ContentForge)
    addBatchJob: function (job) { return electron_1.ipcRenderer.invoke('batch:add-job', job); },
    addBatchJobs: function (jobs) { return electron_1.ipcRenderer.invoke('batch:add-jobs', jobs); },
    getBatchJob: function (jobId) { return electron_1.ipcRenderer.invoke('batch:get-job', jobId); },
    listBatchJobs: function (status, limit) { return electron_1.ipcRenderer.invoke('batch:list-jobs', status, limit); },
    cancelBatchJob: function (jobId) { return electron_1.ipcRenderer.invoke('batch:cancel-job', jobId); },
    clearFinishedJobs: function () { return electron_1.ipcRenderer.invoke('batch:clear-finished'); },
    getBatchStats: function () { return electron_1.ipcRenderer.invoke('batch:stats'); },
    startBatchProcessing: function () { return electron_1.ipcRenderer.invoke('batch:start-processing'); },
    stopBatchProcessing: function () { return electron_1.ipcRenderer.invoke('batch:stop-processing'); },
    // Batch events
    onBatchJobQueued: function (callback) {
        electron_1.ipcRenderer.on('batch:job-queued', function (_event, job) { return callback(job); });
    },
    onBatchJobStarted: function (callback) {
        electron_1.ipcRenderer.on('batch:job-started', function (_event, job) { return callback(job); });
    },
    onBatchJobProgress: function (callback) {
        electron_1.ipcRenderer.on('batch:job-progress', function (_event, jobId, progress, stage) { return callback(jobId, progress, stage); });
    },
    onBatchJobCompleted: function (callback) {
        electron_1.ipcRenderer.on('batch:job-completed', function (_event, job) { return callback(job); });
    },
    onBatchJobFailed: function (callback) {
        electron_1.ipcRenderer.on('batch:job-failed', function (_event, job, error) { return callback(job, error); });
    },
    onBatchQueueEmpty: function (callback) {
        electron_1.ipcRenderer.on('batch:queue-empty', function () { return callback(); });
    },
});
// Also expose app info
electron_1.contextBridge.exposeInMainWorld('appInfo', {
    platform: process.platform,
    version: '1.0.0',
    name: 'ContentForge Studio',
});

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
});
// Also expose app info
electron_1.contextBridge.exposeInMainWorld('appInfo', {
    platform: process.platform,
    version: process.env.npm_package_version || '2.0.0',
});

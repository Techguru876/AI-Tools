"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const project_service_1 = require("./services/project-service");
const asset_service_1 = require("./services/asset-service");
const timeline_service_1 = require("./services/timeline-service");
const export_service_1 = require("./services/export-service");
const projectService = new project_service_1.ProjectService();
const assetService = new asset_service_1.AssetService();
const timelineService = new timeline_service_1.TimelineService();
const exportService = new export_service_1.ExportService();
function setupIpcHandlers() {
    // Project handlers
    electron_1.ipcMain.handle('project:create', async (_event, name) => {
        try {
            return await projectService.createProject(name);
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('project:open', async (_event, path) => {
        try {
            return await projectService.openProject(path);
        }
        catch (error) {
            console.error('Error opening project:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('project:save', async (_event, data) => {
        try {
            return await projectService.saveProject(data);
        }
        catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('project:list', async () => {
        try {
            return await projectService.listProjects();
        }
        catch (error) {
            console.error('Error listing projects:', error);
            throw error;
        }
    });
    // Asset handlers
    electron_1.ipcMain.handle('asset:import', async (_event, path) => {
        try {
            return await assetService.importAsset(path);
        }
        catch (error) {
            console.error('Error importing asset:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('asset:generate-proxy', async (_event, assetId) => {
        try {
            return await assetService.generateProxy(assetId);
        }
        catch (error) {
            console.error('Error generating proxy:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('asset:list', async () => {
        try {
            return await assetService.listAssets();
        }
        catch (error) {
            console.error('Error listing assets:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('asset:get', async (_event, assetId) => {
        try {
            return await assetService.getAsset(assetId);
        }
        catch (error) {
            console.error('Error getting asset:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('asset:delete', async (_event, assetId) => {
        try {
            return await assetService.deleteAsset(assetId);
        }
        catch (error) {
            console.error('Error deleting asset:', error);
            throw error;
        }
    });
    // Timeline handlers
    electron_1.ipcMain.handle('timeline:add-clip', async (_event, clip) => {
        try {
            return await timelineService.addClip(clip);
        }
        catch (error) {
            console.error('Error adding clip:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('timeline:remove-clip', async (_event, clipId) => {
        try {
            return await timelineService.removeClip(clipId);
        }
        catch (error) {
            console.error('Error removing clip:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('timeline:update-clip', async (_event, clipId, updates) => {
        try {
            return await timelineService.updateClip(clipId, updates);
        }
        catch (error) {
            console.error('Error updating clip:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('timeline:get', async () => {
        try {
            return await timelineService.getTimeline();
        }
        catch (error) {
            console.error('Error getting timeline:', error);
            throw error;
        }
    });
    // Video processing handlers
    electron_1.ipcMain.handle('video:get-frame', async (_event, time) => {
        try {
            return await timelineService.getFrameAtTime(time);
        }
        catch (error) {
            console.error('Error getting frame:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('video:start-preview', async () => {
        try {
            return await timelineService.startPreview();
        }
        catch (error) {
            console.error('Error starting preview:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('video:stop-preview', async () => {
        try {
            return await timelineService.stopPreview();
        }
        catch (error) {
            console.error('Error stopping preview:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('video:seek', async (_event, time) => {
        try {
            return await timelineService.seek(time);
        }
        catch (error) {
            console.error('Error seeking:', error);
            throw error;
        }
    });
    // Image processing handlers
    electron_1.ipcMain.handle('image:process', async (_event, assetId, operations) => {
        try {
            return await assetService.processImage(assetId, operations);
        }
        catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('image:thumbnail', async (_event, assetId) => {
        try {
            return await assetService.generateThumbnail(assetId);
        }
        catch (error) {
            console.error('Error generating thumbnail:', error);
            throw error;
        }
    });
    // Export handlers
    electron_1.ipcMain.handle('export:video', async (_event, config) => {
        try {
            return await exportService.exportVideo(config);
        }
        catch (error) {
            console.error('Error exporting video:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('export:image', async (_event, config) => {
        try {
            return await exportService.exportImage(config);
        }
        catch (error) {
            console.error('Error exporting image:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('export:gif', async (_event, config) => {
        try {
            return await exportService.exportGIF(config);
        }
        catch (error) {
            console.error('Error exporting GIF:', error);
            throw error;
        }
    });
    // Dialog handlers
    electron_1.ipcMain.handle('dialog:open-file', async (_event, options) => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: options?.filters || [
                { name: 'Media Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'jpg', 'png', 'gif'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });
        return result.filePaths[0];
    });
    electron_1.ipcMain.handle('dialog:save-file', async (_event, options) => {
        const result = await electron_1.dialog.showSaveDialog({
            filters: options?.filters || [
                { name: 'Video Files', extensions: ['mp4', 'mov'] },
                { name: 'All Files', extensions: ['*'] },
            ],
            defaultPath: options?.defaultPath,
        });
        return result.filePath;
    });
    electron_1.ipcMain.handle('dialog:open-directory', async () => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        return result.filePaths[0];
    });
}
//# sourceMappingURL=ipc-handlers.js.map
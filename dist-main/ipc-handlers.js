"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const project_service_1 = require("./services/project-service");
const asset_service_1 = require("./services/asset-service");
const timeline_service_1 = require("./services/timeline-service");
const export_service_1 = require("./services/export-service");
const TemplateEngine_1 = require("./services/templates/TemplateEngine");
const BatchProcessor_1 = require("./services/batch/BatchProcessor");
const lofi_template_1 = require("./services/templates/lofi-template");
const projectService = new project_service_1.ProjectService();
const assetService = new asset_service_1.AssetService();
const timelineService = new timeline_service_1.TimelineService();
const exportService = new export_service_1.ExportService();
const templateEngine = new TemplateEngine_1.TemplateEngine();
const batchProcessor = new BatchProcessor_1.BatchProcessor(2); // Max 2 concurrent jobs
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
    // Template handlers
    electron_1.ipcMain.handle('template:list', async (_event, niche) => {
        try {
            return templateEngine.listTemplates(niche);
        }
        catch (error) {
            console.error('Error listing templates:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:get', async (_event, templateId) => {
        try {
            return templateEngine.getTemplate(templateId);
        }
        catch (error) {
            console.error('Error getting template:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:save', async (_event, template) => {
        try {
            templateEngine.saveTemplate(template);
            return { success: true };
        }
        catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:delete', async (_event, templateId) => {
        try {
            templateEngine.deleteTemplate(templateId);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:clone', async (_event, templateId, newName) => {
        try {
            return templateEngine.cloneTemplate(templateId, newName);
        }
        catch (error) {
            console.error('Error cloning template:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:resolve', async (_event, templateId, variables) => {
        try {
            const template = templateEngine.getTemplate(templateId);
            if (!template)
                throw new Error('Template not found');
            return templateEngine.resolveVariables(template, variables);
        }
        catch (error) {
            console.error('Error resolving template:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:validate', async (_event, templateId, variables) => {
        try {
            const template = templateEngine.getTemplate(templateId);
            if (!template)
                throw new Error('Template not found');
            return templateEngine.validateVariables(template, variables);
        }
        catch (error) {
            console.error('Error validating template:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:stats', async () => {
        try {
            return templateEngine.getStats();
        }
        catch (error) {
            console.error('Error getting template stats:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('template:init-builtin', async () => {
        try {
            // Initialize built-in templates
            const lofiTemplate = (0, lofi_template_1.createLofiTemplate)();
            templateEngine.saveTemplate(lofiTemplate);
            return { success: true };
        }
        catch (error) {
            console.error('Error initializing built-in templates:', error);
            throw error;
        }
    });
    // Batch processing handlers
    electron_1.ipcMain.handle('batch:add-job', async (_event, job) => {
        try {
            return batchProcessor.addJob(job);
        }
        catch (error) {
            console.error('Error adding batch job:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:add-jobs', async (_event, jobs) => {
        try {
            return batchProcessor.addBatchJobs(jobs);
        }
        catch (error) {
            console.error('Error adding batch jobs:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:get-job', async (_event, jobId) => {
        try {
            return batchProcessor.getJob(jobId);
        }
        catch (error) {
            console.error('Error getting batch job:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:list-jobs', async (_event, status, limit) => {
        try {
            return batchProcessor.listJobs(status, limit);
        }
        catch (error) {
            console.error('Error listing batch jobs:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:cancel-job', async (_event, jobId) => {
        try {
            return batchProcessor.cancelJob(jobId);
        }
        catch (error) {
            console.error('Error cancelling batch job:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:clear-finished', async () => {
        try {
            return batchProcessor.clearFinishedJobs();
        }
        catch (error) {
            console.error('Error clearing finished jobs:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:stats', async () => {
        try {
            return batchProcessor.getStats();
        }
        catch (error) {
            console.error('Error getting batch stats:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:start-processing', async () => {
        try {
            // Processing starts automatically, this is just a manual trigger
            return { success: true };
        }
        catch (error) {
            console.error('Error starting batch processing:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('batch:stop-processing', async () => {
        try {
            batchProcessor.stopProcessing();
            return { success: true };
        }
        catch (error) {
            console.error('Error stopping batch processing:', error);
            throw error;
        }
    });
    // Setup batch processor event forwarding to renderer
    batchProcessor.on('job-queued', (job) => {
        const mainWindow = require('electron').BrowserWindow.getAllWindows()[0];
        mainWindow?.webContents.send('batch:job-queued', job);
    });
    batchProcessor.on('job-started', (job) => {
        const mainWindow = require('electron').BrowserWindow.getAllWindows()[0];
        mainWindow?.webContents.send('batch:job-started', job);
    });
    batchProcessor.on('job-progress', (jobId, progress, stage) => {
        const mainWindow = require('electron').BrowserWindow.getAllWindows()[0];
        mainWindow?.webContents.send('batch:job-progress', jobId, progress, stage);
    });
    batchProcessor.on('job-completed', (job) => {
        const mainWindow = require('electron').BrowserWindow.getAllWindows()[0];
        mainWindow?.webContents.send('batch:job-completed', job);
    });
    batchProcessor.on('job-failed', (job, error) => {
        const mainWindow = require('electron').BrowserWindow.getAllWindows()[0];
        mainWindow?.webContents.send('batch:job-failed', job, error.message);
    });
    batchProcessor.on('queue-empty', () => {
        const mainWindow = require('electron').BrowserWindow.getAllWindows()[0];
        mainWindow?.webContents.send('batch:queue-empty');
    });
}
//# sourceMappingURL=ipc-handlers.js.map
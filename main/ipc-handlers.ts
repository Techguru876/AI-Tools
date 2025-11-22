import { ipcMain, dialog } from 'electron';
import { ProjectService } from './services/project-service';
import { AssetService } from './services/asset-service';
import { TimelineService } from './services/timeline-service';
import { ExportService } from './services/export-service';
import { TemplateEngine } from './services/templates/TemplateEngine';
import { BatchProcessor } from './services/batch/BatchProcessor';
import { createLofiTemplate } from './services/templates/lofi-template';

const projectService = new ProjectService();
const assetService = new AssetService();
const timelineService = new TimelineService();
const exportService = new ExportService();
const templateEngine = new TemplateEngine();
const batchProcessor = new BatchProcessor(2); // Max 2 concurrent jobs

export function setupIpcHandlers() {
  // Project handlers
  ipcMain.handle('project:create', async (_event, name: string) => {
    try {
      return await projectService.createProject(name);
    } catch (error: any) {
      console.error('Error creating project:', error);
      throw error;
    }
  });

  ipcMain.handle('project:open', async (_event, path: string) => {
    try {
      return await projectService.openProject(path);
    } catch (error: any) {
      console.error('Error opening project:', error);
      throw error;
    }
  });

  ipcMain.handle('project:save', async (_event, data: any) => {
    try {
      return await projectService.saveProject(data);
    } catch (error: any) {
      console.error('Error saving project:', error);
      throw error;
    }
  });

  ipcMain.handle('project:list', async () => {
    try {
      return await projectService.listProjects();
    } catch (error: any) {
      console.error('Error listing projects:', error);
      throw error;
    }
  });

  // Asset handlers
  ipcMain.handle('asset:import', async (_event, path: string) => {
    try {
      return await assetService.importAsset(path);
    } catch (error: any) {
      console.error('Error importing asset:', error);
      throw error;
    }
  });

  ipcMain.handle('asset:generate-proxy', async (_event, assetId: string) => {
    try {
      return await assetService.generateProxy(assetId);
    } catch (error: any) {
      console.error('Error generating proxy:', error);
      throw error;
    }
  });

  ipcMain.handle('asset:list', async () => {
    try {
      return await assetService.listAssets();
    } catch (error: any) {
      console.error('Error listing assets:', error);
      throw error;
    }
  });

  ipcMain.handle('asset:get', async (_event, assetId: string) => {
    try {
      return await assetService.getAsset(assetId);
    } catch (error: any) {
      console.error('Error getting asset:', error);
      throw error;
    }
  });

  ipcMain.handle('asset:delete', async (_event, assetId: string) => {
    try {
      return await assetService.deleteAsset(assetId);
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  });

  // Timeline handlers
  ipcMain.handle('timeline:add-clip', async (_event, clip: any) => {
    try {
      return await timelineService.addClip(clip);
    } catch (error: any) {
      console.error('Error adding clip:', error);
      throw error;
    }
  });

  ipcMain.handle('timeline:remove-clip', async (_event, clipId: string) => {
    try {
      return await timelineService.removeClip(clipId);
    } catch (error: any) {
      console.error('Error removing clip:', error);
      throw error;
    }
  });

  ipcMain.handle('timeline:update-clip', async (_event, clipId: string, updates: any) => {
    try {
      return await timelineService.updateClip(clipId, updates);
    } catch (error: any) {
      console.error('Error updating clip:', error);
      throw error;
    }
  });

  ipcMain.handle('timeline:get', async () => {
    try {
      return await timelineService.getTimeline();
    } catch (error: any) {
      console.error('Error getting timeline:', error);
      throw error;
    }
  });

  // Video processing handlers
  ipcMain.handle('video:get-frame', async (_event, time: number) => {
    try {
      return await timelineService.getFrameAtTime(time);
    } catch (error: any) {
      console.error('Error getting frame:', error);
      throw error;
    }
  });

  ipcMain.handle('video:start-preview', async () => {
    try {
      return await timelineService.startPreview();
    } catch (error: any) {
      console.error('Error starting preview:', error);
      throw error;
    }
  });

  ipcMain.handle('video:stop-preview', async () => {
    try {
      return await timelineService.stopPreview();
    } catch (error: any) {
      console.error('Error stopping preview:', error);
      throw error;
    }
  });

  ipcMain.handle('video:seek', async (_event, time: number) => {
    try {
      return await timelineService.seek(time);
    } catch (error: any) {
      console.error('Error seeking:', error);
      throw error;
    }
  });

  // Image processing handlers
  ipcMain.handle('image:process', async (_event, assetId: string, operations: any) => {
    try {
      return await assetService.processImage(assetId, operations);
    } catch (error: any) {
      console.error('Error processing image:', error);
      throw error;
    }
  });

  ipcMain.handle('image:thumbnail', async (_event, assetId: string) => {
    try {
      return await assetService.generateThumbnail(assetId);
    } catch (error: any) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  });

  // Export handlers
  ipcMain.handle('export:video', async (_event, config: any) => {
    try {
      return await exportService.exportVideo(config);
    } catch (error: any) {
      console.error('Error exporting video:', error);
      throw error;
    }
  });

  ipcMain.handle('export:image', async (_event, config: any) => {
    try {
      return await exportService.exportImage(config);
    } catch (error: any) {
      console.error('Error exporting image:', error);
      throw error;
    }
  });

  ipcMain.handle('export:gif', async (_event, config: any) => {
    try {
      return await exportService.exportGIF(config);
    } catch (error: any) {
      console.error('Error exporting GIF:', error);
      throw error;
    }
  });

  // Dialog handlers
  ipcMain.handle('dialog:open-file', async (_event, options?: any) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: options?.filters || [
        { name: 'Media Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'jpg', 'png', 'gif'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    return result.filePaths[0];
  });

  ipcMain.handle('dialog:save-file', async (_event, options?: any) => {
    const result = await dialog.showSaveDialog({
      filters: options?.filters || [
        { name: 'Video Files', extensions: ['mp4', 'mov'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      defaultPath: options?.defaultPath,
    });
    return result.filePath;
  });

  ipcMain.handle('dialog:open-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result.filePaths[0];
  });

  // Template handlers
  ipcMain.handle('template:list', async (_event, niche?: string) => {
    try {
      return templateEngine.listTemplates(niche);
    } catch (error: any) {
      console.error('Error listing templates:', error);
      throw error;
    }
  });

  ipcMain.handle('template:get', async (_event, templateId: string) => {
    try {
      return templateEngine.getTemplate(templateId);
    } catch (error: any) {
      console.error('Error getting template:', error);
      throw error;
    }
  });

  ipcMain.handle('template:save', async (_event, template: any) => {
    try {
      templateEngine.saveTemplate(template);
      return { success: true };
    } catch (error: any) {
      console.error('Error saving template:', error);
      throw error;
    }
  });

  ipcMain.handle('template:delete', async (_event, templateId: string) => {
    try {
      templateEngine.deleteTemplate(templateId);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting template:', error);
      throw error;
    }
  });

  ipcMain.handle('template:clone', async (_event, templateId: string, newName: string) => {
    try {
      return templateEngine.cloneTemplate(templateId, newName);
    } catch (error: any) {
      console.error('Error cloning template:', error);
      throw error;
    }
  });

  ipcMain.handle('template:resolve', async (_event, templateId: string, variables: any) => {
    try {
      const template = templateEngine.getTemplate(templateId);
      if (!template) throw new Error('Template not found');
      return templateEngine.resolveVariables(template, variables);
    } catch (error: any) {
      console.error('Error resolving template:', error);
      throw error;
    }
  });

  ipcMain.handle('template:validate', async (_event, templateId: string, variables: any) => {
    try {
      const template = templateEngine.getTemplate(templateId);
      if (!template) throw new Error('Template not found');
      return templateEngine.validateVariables(template, variables);
    } catch (error: any) {
      console.error('Error validating template:', error);
      throw error;
    }
  });

  ipcMain.handle('template:stats', async () => {
    try {
      return templateEngine.getStats();
    } catch (error: any) {
      console.error('Error getting template stats:', error);
      throw error;
    }
  });

  ipcMain.handle('template:init-builtin', async () => {
    try {
      // Initialize built-in templates
      const lofiTemplate = createLofiTemplate();
      templateEngine.saveTemplate(lofiTemplate);
      return { success: true };
    } catch (error: any) {
      console.error('Error initializing built-in templates:', error);
      throw error;
    }
  });

  // Batch processing handlers
  ipcMain.handle('batch:add-job', async (_event, job: any) => {
    try {
      return batchProcessor.addJob(job);
    } catch (error: any) {
      console.error('Error adding batch job:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:add-jobs', async (_event, jobs: any[]) => {
    try {
      return batchProcessor.addBatchJobs(jobs);
    } catch (error: any) {
      console.error('Error adding batch jobs:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:get-job', async (_event, jobId: string) => {
    try {
      return batchProcessor.getJob(jobId);
    } catch (error: any) {
      console.error('Error getting batch job:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:list-jobs', async (_event, status?: string, limit?: number) => {
    try {
      return batchProcessor.listJobs(status as any, limit);
    } catch (error: any) {
      console.error('Error listing batch jobs:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:cancel-job', async (_event, jobId: string) => {
    try {
      return batchProcessor.cancelJob(jobId);
    } catch (error: any) {
      console.error('Error cancelling batch job:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:clear-finished', async () => {
    try {
      return batchProcessor.clearFinishedJobs();
    } catch (error: any) {
      console.error('Error clearing finished jobs:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:stats', async () => {
    try {
      return batchProcessor.getStats();
    } catch (error: any) {
      console.error('Error getting batch stats:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:start-processing', async () => {
    try {
      // Processing starts automatically, this is just a manual trigger
      return { success: true };
    } catch (error: any) {
      console.error('Error starting batch processing:', error);
      throw error;
    }
  });

  ipcMain.handle('batch:stop-processing', async () => {
    try {
      batchProcessor.stopProcessing();
      return { success: true };
    } catch (error: any) {
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

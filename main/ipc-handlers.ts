import { ipcMain, dialog } from 'electron';
import { ProjectService } from './services/project-service';
import { AssetService } from './services/asset-service';
import { TimelineService } from './services/timeline-service';
import { ExportService } from './services/export-service';

const projectService = new ProjectService();
const assetService = new AssetService();
const timelineService = new TimelineService();
const exportService = new ExportService();

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
}

import { ipcMain, dialog } from 'electron';
import { ProjectService } from './services/project-service';
import { AssetService } from './services/asset-service';
import { TimelineService } from './services/timeline-service';
import { ExportService } from './services/export-service';
import { TemplateEngine } from './services/templates/TemplateEngine';
import { BatchProcessor } from './services/batch/BatchProcessor';
import { createLofiTemplate } from './services/templates/lofi-template';
import { createHorrorTemplate } from './services/templates/horror-template';
import { createExplainerTemplate } from './services/templates/explainer-template';
import { createMotivationalTemplate } from './services/templates/motivational-template';
import { createNewsTemplate } from './services/templates/news-template';
import { createFunFactsTemplate } from './services/templates/funfacts-template';
import { createProductReviewTemplate } from './services/templates/product-review-template';
import { APIKeyManager } from './services/config/APIKeyManager';
import { ScriptGenerator } from './services/content-generation/ScriptGenerator';
import { VoiceGenerator } from './services/content-generation/VoiceGenerator';
import { ImageGenerator } from './services/content-generation/ImageGenerator';
import { MetadataGenerator } from './services/youtube/MetadataGenerator';
import { YouTubeAPI } from './services/youtube/YouTubeAPI';
import { OpenAIProvider } from './services/content-generation/providers/OpenAIProvider';
import { ElevenLabsProvider } from './services/content-generation/providers/ElevenLabsProvider';

const projectService = new ProjectService();
const assetService = new AssetService();
const timelineService = new TimelineService();
const exportService = new ExportService();
const templateEngine = new TemplateEngine();
const batchProcessor = new BatchProcessor(2); // Max 2 concurrent jobs

// AI Services - Initialize lazily when API keys are set
const apiKeyManager = new APIKeyManager();
let scriptGenerator: ScriptGenerator | null = null;
let voiceGenerator: VoiceGenerator | null = null;
let imageGenerator: ImageGenerator | null = null;
let metadataGenerator: MetadataGenerator | null = null;
let youtubeAPI: YouTubeAPI | null = null;
let openaiProvider: OpenAIProvider | null = null;
let elevenLabsProvider: ElevenLabsProvider | null = null;

// Helper to initialize AI services when keys are available
function initAIServices() {
  const openAIKey = apiKeyManager.getOpenAIKey();
  const elevenLabsKey = apiKeyManager.getElevenLabsKey();
  const youtubeCredentials = apiKeyManager.getYouTubeCredentials();

  if (openAIKey && !scriptGenerator) {
    openaiProvider = new OpenAIProvider(openAIKey);
    scriptGenerator = new ScriptGenerator(openAIKey);
    imageGenerator = new ImageGenerator(openAIKey);
    metadataGenerator = new MetadataGenerator(openAIKey);
  }

  if ((openAIKey || elevenLabsKey) && !voiceGenerator) {
    voiceGenerator = new VoiceGenerator(openAIKey, elevenLabsKey);
  }

  if (elevenLabsKey && !elevenLabsProvider) {
    elevenLabsProvider = new ElevenLabsProvider(elevenLabsKey);
  }

  if (youtubeCredentials && youtubeCredentials.clientId && youtubeCredentials.clientSecret && youtubeCredentials.refreshToken && !youtubeAPI) {
    youtubeAPI = new YouTubeAPI({
      clientId: youtubeCredentials.clientId,
      clientSecret: youtubeCredentials.clientSecret,
      refreshToken: youtubeCredentials.refreshToken,
    });
  }
}

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
      // Initialize all built-in templates
      const templates = [
        createLofiTemplate(),
        createHorrorTemplate(),
        createExplainerTemplate(),
        createMotivationalTemplate(),
        createNewsTemplate(),
        createFunFactsTemplate(),
        createProductReviewTemplate(),
      ];

      for (const template of templates) {
        templateEngine.saveTemplate(template);
        console.log(`✓ Initialized template: ${template.name}`);
      }

      return { success: true, count: templates.length };
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

  // ==================== AI SERVICES (ContentForge) ====================

  // API Key Management
  ipcMain.handle('contentforge:api-keys:set-openai', async (_event, apiKey: string) => {
    try {
      apiKeyManager.setOpenAIKey(apiKey);
      initAIServices(); // Re-initialize services with new key
      return { success: true };
    } catch (error: any) {
      console.error('Error setting OpenAI key:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:api-keys:set-elevenlabs', async (_event, apiKey: string) => {
    try {
      apiKeyManager.setElevenLabsKey(apiKey);
      initAIServices();
      return { success: true };
    } catch (error: any) {
      console.error('Error setting ElevenLabs key:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:api-keys:set-youtube', async (_event, credentials: any) => {
    try {
      apiKeyManager.setYouTubeCredentials(credentials);
      initAIServices();
      return { success: true };
    } catch (error: any) {
      console.error('Error setting YouTube credentials:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:api-keys:validate', async () => {
    try {
      return apiKeyManager.validateKeys();
    } catch (error: any) {
      console.error('Error validating API keys:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:api-keys:clear', async (_event, service?: string) => {
    try {
      if (service) {
        apiKeyManager.clearKey(service as any);
      } else {
        apiKeyManager.clearAllKeys();
      }
      // Reset AI services
      scriptGenerator = null;
      voiceGenerator = null;
      imageGenerator = null;
      metadataGenerator = null;
      youtubeAPI = null;
      openaiProvider = null;
      elevenLabsProvider = null;
      return { success: true };
    } catch (error: any) {
      console.error('Error clearing API keys:', error);
      throw error;
    }
  });

  // Script Generation
  ipcMain.handle('contentforge:script:horror', async (_event, options: any) => {
    try {
      initAIServices();
      if (!scriptGenerator) throw new Error('OpenAI API key not configured');
      return await scriptGenerator.generateHorrorStory(options);
    } catch (error: any) {
      console.error('Error generating horror script:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:script:lofi', async (_event, options: any) => {
    try {
      initAIServices();
      if (!scriptGenerator) throw new Error('OpenAI API key not configured');
      return await scriptGenerator.generateLofiDescription(options);
    } catch (error: any) {
      console.error('Error generating lofi script:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:script:explainer', async (_event, options: any) => {
    try {
      initAIServices();
      if (!scriptGenerator) throw new Error('OpenAI API key not configured');
      return await scriptGenerator.generateExplainerScript(options);
    } catch (error: any) {
      console.error('Error generating explainer script:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:script:motivational', async (_event, options: any) => {
    try {
      initAIServices();
      if (!scriptGenerator) throw new Error('OpenAI API key not configured');
      return await scriptGenerator.generateMotivationalScript(options);
    } catch (error: any) {
      console.error('Error generating motivational script:', error);
      throw error;
    }
  });

  // Voice Generation
  ipcMain.handle('contentforge:voice:generate', async (_event, text: string, filename: string, options?: any) => {
    try {
      initAIServices();
      if (!voiceGenerator) throw new Error('Voice generation API keys not configured');
      return await voiceGenerator.generateNarration(text, filename, options);
    } catch (error: any) {
      console.error('Error generating voice:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:voice:list-voices', async (_event, provider: 'elevenlabs' | 'openai') => {
    try {
      initAIServices();
      if (provider === 'elevenlabs') {
        if (!elevenLabsProvider) throw new Error('ElevenLabs API key not configured');
        return await elevenLabsProvider.listVoices();
      } else {
        // OpenAI has fixed voices
        return [
          { id: 'alloy', name: 'Alloy' },
          { id: 'echo', name: 'Echo' },
          { id: 'fable', name: 'Fable' },
          { id: 'onyx', name: 'Onyx' },
          { id: 'nova', name: 'Nova' },
          { id: 'shimmer', name: 'Shimmer' },
        ];
      }
    } catch (error: any) {
      console.error('Error listing voices:', error);
      throw error;
    }
  });

  // Image Generation
  ipcMain.handle('contentforge:image:generate', async (_event, prompt: string, options?: any) => {
    try {
      initAIServices();
      if (!imageGenerator) throw new Error('OpenAI API key not configured');
      return await imageGenerator.generate(prompt, options);
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:image:horror-scene', async (_event, description: string, options?: any) => {
    try {
      initAIServices();
      if (!imageGenerator) throw new Error('OpenAI API key not configured');
      return await imageGenerator.generateHorrorScene(description, options);
    } catch (error: any) {
      console.error('Error generating horror scene:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:image:lofi-background', async (_event, description: string, options?: any) => {
    try {
      initAIServices();
      if (!imageGenerator) throw new Error('OpenAI API key not configured');
      return await imageGenerator.generateLofiBackground(description, options);
    } catch (error: any) {
      console.error('Error generating lofi background:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:image:batch', async (_event, prompts: any[]) => {
    try {
      initAIServices();
      if (!imageGenerator) throw new Error('OpenAI API key not configured');
      return await imageGenerator.generateBatch(prompts);
    } catch (error: any) {
      console.error('Error generating batch images:', error);
      throw error;
    }
  });

  // YouTube Integration
  ipcMain.handle('contentforge:youtube:upload', async (_event, videoPath: string, metadata: any) => {
    try {
      initAIServices();
      if (!youtubeAPI) throw new Error('YouTube credentials not configured');
      return await youtubeAPI.uploadVideo(videoPath, metadata);
    } catch (error: any) {
      console.error('Error uploading to YouTube:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:youtube:metadata:generate', async (_event, options: any) => {
    try {
      initAIServices();
      if (!metadataGenerator) throw new Error('OpenAI API key not configured');
      return await metadataGenerator.generateFullMetadata(options);
    } catch (error: any) {
      console.error('Error generating metadata:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:youtube:metadata:title', async (_event, options: any) => {
    try {
      initAIServices();
      if (!metadataGenerator) throw new Error('OpenAI API key not configured');
      return await metadataGenerator.generateTitle(options);
    } catch (error: any) {
      console.error('Error generating title:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:youtube:metadata:description', async (_event, options: any) => {
    try {
      initAIServices();
      if (!metadataGenerator) throw new Error('OpenAI API key not configured');
      return await metadataGenerator.generateDescription(options);
    } catch (error: any) {
      console.error('Error generating description:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:youtube:metadata:tags', async (_event, options: any) => {
    try {
      initAIServices();
      if (!metadataGenerator) throw new Error('OpenAI API key not configured');
      return await metadataGenerator.generateTags(options);
    } catch (error: any) {
      console.error('Error generating tags:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:youtube:playlists', async () => {
    try {
      initAIServices();
      if (!youtubeAPI) throw new Error('YouTube credentials not configured');
      return await youtubeAPI.listPlaylists();
    } catch (error: any) {
      console.error('Error listing playlists:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:youtube:create-playlist', async (_event, options: any) => {
    try {
      initAIServices();
      if (!youtubeAPI) throw new Error('YouTube credentials not configured');
      return await youtubeAPI.createPlaylist(options);
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  });

  // Cost Tracking
  ipcMain.handle('contentforge:cost:stats', async () => {
    try {
      const stats: any = {};

      if (scriptGenerator) {
        stats.scriptGeneration = scriptGenerator.getCostStats();
      }
      if (voiceGenerator) {
        stats.voiceGeneration = voiceGenerator.getCostStats();
      }
      if (imageGenerator) {
        stats.imageGeneration = imageGenerator.getCostStats();
      }
      if (metadataGenerator) {
        stats.metadataGeneration = metadataGenerator.getCostStats();
      }

      return stats;
    } catch (error: any) {
      console.error('Error getting cost stats:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:cache:stats', async () => {
    try {
      const stats: any = {};

      if (scriptGenerator) {
        stats.scriptGeneration = scriptGenerator.getCacheStats();
      }
      if (metadataGenerator) {
        stats.metadataGeneration = metadataGenerator.getCacheStats();
      }

      return stats;
    } catch (error: any) {
      console.error('Error getting cache stats:', error);
      throw error;
    }
  });

  ipcMain.handle('contentforge:cache:clear', async (_event, type?: string) => {
    try {
      // Cache clearing would be implemented here
      // For now, just return success
      return { success: true };
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  });

  // ============================================================================
  // Phase 6: Analytics & Scheduling IPC Handlers
  // ============================================================================

  // Analytics: Get cost summary
  ipcMain.handle('analytics:cost-summary', async (event, startDate?: number, endDate?: number) => {
    try {
      // Placeholder - in production, would call AnalyticsService
      return {
        total_cost: 125.50,
        costs_by_service: {
          openai: 85.30,
          elevenlabs: 32.20,
          youtube: 8.00,
        },
        costs_by_day: [],
        costs_by_operation: {},
      };
    } catch (error: any) {
      console.error('Error getting cost summary:', error);
      throw error;
    }
  });

  // Analytics: Get performance stats
  ipcMain.handle('analytics:performance-stats', async (event, startDate?: number, endDate?: number) => {
    try {
      // Placeholder - in production, would call AnalyticsService
      return {
        total_operations: 1250,
        successful_operations: 1187,
        failed_operations: 63,
        average_duration_ms: 3200,
        cache_hit_rate: 0.68,
        operations_by_type: {},
        operations_by_day: [],
      };
    } catch (error: any) {
      console.error('Error getting performance stats:', error);
      throw error;
    }
  });

  // Analytics: Get generation stats
  ipcMain.handle('analytics:generation-stats', async (event, startDate?: number, endDate?: number) => {
    try {
      // Placeholder - in production, would call AnalyticsService
      return {
        total_scripts: 320,
        total_voice_files: 298,
        total_images: 412,
        total_videos: 145,
        total_uploads: 75,
        success_rate: 94.96,
        average_script_length: 850,
        average_video_duration: 180,
      };
    } catch (error: any) {
      console.error('Error getting generation stats:', error);
      throw error;
    }
  });

  // Scheduling: Create scheduled job
  ipcMain.handle('scheduling:create-job', async (event, job: any) => {
    try {
      // Placeholder - in production, would call SchedulingService
      console.log('Creating scheduled job:', job);
      return { id: Date.now(), ...job };
    } catch (error: any) {
      console.error('Error creating scheduled job:', error);
      throw error;
    }
  });

  // Scheduling: Get all jobs
  ipcMain.handle('scheduling:get-jobs', async (event, filter?: any) => {
    try {
      // Placeholder - in production, would call SchedulingService
      return [];
    } catch (error: any) {
      console.error('Error getting scheduled jobs:', error);
      throw error;
    }
  });

  // Scheduling: Update job
  ipcMain.handle('scheduling:update-job', async (event, id: number, updates: any) => {
    try {
      // Placeholder - in production, would call SchedulingService
      console.log('Updating scheduled job:', id, updates);
      return true;
    } catch (error: any) {
      console.error('Error updating scheduled job:', error);
      throw error;
    }
  });

  // Scheduling: Delete job
  ipcMain.handle('scheduling:delete-job', async (event, id: number) => {
    try {
      // Placeholder - in production, would call SchedulingService
      console.log('Deleting scheduled job:', id);
      return true;
    } catch (error: any) {
      console.error('Error deleting scheduled job:', error);
      throw error;
    }
  });

  // Initialize AI services on startup if keys exist
  initAIServices();
}

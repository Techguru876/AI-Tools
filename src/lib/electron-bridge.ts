/**
 * Electron Bridge
 * Provides a unified API for Electron IPC communication
 * This replaces Tauri's invoke() pattern with Electron's IPC
 */

// Check if running in Electron
export const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Get electron API safely
const getAPI = () => {
  if (!isElectron()) {
    throw new Error('Not running in Electron environment');
  }
  return window.electronAPI;
};

/**
 * Project Management
 */
export const project = {
  create: async (name: string) => {
    return getAPI().createProject(name);
  },

  open: async (path: string) => {
    return getAPI().openProject(path);
  },

  save: async (data: any) => {
    return getAPI().saveProject(data);
  },

  list: async () => {
    return getAPI().listProjects();
  },
};

/**
 * Asset Management
 */
export const assets = {
  import: async (path: string) => {
    return getAPI().importAsset(path);
  },

  generateProxy: async (assetId: string) => {
    return getAPI().generateProxy(assetId);
  },

  list: async () => {
    return getAPI().listAssets();
  },

  get: async (assetId: string) => {
    return getAPI().getAsset(assetId);
  },

  delete: async (assetId: string) => {
    return getAPI().deleteAsset(assetId);
  },

  procesImage: async (assetId: string, operations: any) => {
    return getAPI().processImage(assetId, operations);
  },

  generateThumbnail: async (assetId: string) => {
    return getAPI().generateThumbnail(assetId);
  },
};

/**
 * Timeline Operations
 */
export const timeline = {
  addClip: async (clip: any) => {
    return getAPI().addClipToTimeline(clip);
  },

  removeClip: async (clipId: string) => {
    return getAPI().removeClip(clipId);
  },

  updateClip: async (clipId: string, updates: any) => {
    return getAPI().updateClip(clipId, updates);
  },

  get: async () => {
    return getAPI().getTimeline();
  },
};

/**
 * Video Processing
 */
export const video = {
  getFrame: async (time: number) => {
    return getAPI().getFrameAtTime(time);
  },

  startPreview: async () => {
    return getAPI().startPreview();
  },

  stopPreview: async () => {
    return getAPI().stopPreview();
  },

  seek: async (time: number) => {
    return getAPI().seekPreview(time);
  },
};

/**
 * Export Operations
 */
export const exportMedia = {
  video: async (config: any) => {
    return getAPI().exportVideo(config);
  },

  image: async (config: any) => {
    return getAPI().exportImage(config);
  },

  gif: async (config: any) => {
    return getAPI().exportGIF(config);
  },
};

/**
 * File Dialogs
 */
export const dialogs = {
  openFile: async (options?: any) => {
    return getAPI().openFile(options);
  },

  saveFile: async (options?: any) => {
    return getAPI().saveFile(options);
  },

  openDirectory: async () => {
    return getAPI().openDirectory();
  },
};

/**
 * Event Listeners
 */
export const events = {
  onFrameReady: (callback: (framePath: string) => void) => {
    getAPI().onFrameReady(callback);
  },

  onExportProgress: (callback: (progress: number, stage: string) => void) => {
    getAPI().onExportProgress(callback);
  },

  onAssetProcessed: (callback: (assetId: string, status: string) => void) => {
    getAPI().onAssetProcessed(callback);
  },

  onError: (callback: (error: string) => void) => {
    getAPI().onError(callback);
  },

  removeFrameReadyListener: () => {
    getAPI().removeFrameReadyListener();
  },

  removeExportProgressListener: () => {
    getAPI().removeExportProgressListener();
  },
};

/**
 * Template Management (ContentForge)
 */
export const templates = {
  list: async (niche?: string) => {
    return getAPI().listTemplates(niche);
  },

  get: async (templateId: string) => {
    return getAPI().getTemplate(templateId);
  },

  save: async (template: any) => {
    return getAPI().saveTemplate(template);
  },

  delete: async (templateId: string) => {
    return getAPI().deleteTemplate(templateId);
  },

  clone: async (templateId: string, newName: string) => {
    return getAPI().cloneTemplate(templateId, newName);
  },

  resolve: async (templateId: string, variables: Record<string, any>) => {
    return getAPI().resolveTemplate(templateId, variables);
  },

  validate: async (templateId: string, variables: Record<string, any>) => {
    return getAPI().validateTemplate(templateId, variables);
  },

  getStats: async () => {
    return getAPI().getTemplateStats();
  },

  initBuiltIn: async () => {
    return getAPI().initBuiltInTemplates();
  },
};

/**
 * Batch Processing (ContentForge)
 */
export const batch = {
  addJob: async (job: {
    templateId: string;
    variables: Record<string, any>;
    outputPath: string;
    metadata?: any;
  }) => {
    return getAPI().addBatchJob(job);
  },

  addJobs: async (jobs: Array<{
    templateId: string;
    variables: Record<string, any>;
    outputPath: string;
    metadata?: any;
  }>) => {
    return getAPI().addBatchJobs(jobs);
  },

  getJob: async (jobId: string) => {
    return getAPI().getBatchJob(jobId);
  },

  listJobs: async (status?: string, limit?: number) => {
    return getAPI().listBatchJobs(status, limit);
  },

  cancelJob: async (jobId: string) => {
    return getAPI().cancelBatchJob(jobId);
  },

  clearFinished: async () => {
    return getAPI().clearFinishedJobs();
  },

  getStats: async () => {
    return getAPI().getBatchStats();
  },

  startProcessing: async () => {
    return getAPI().startBatchProcessing();
  },

  stopProcessing: async () => {
    return getAPI().stopBatchProcessing();
  },

  // Event listeners
  onJobQueued: (callback: (job: any) => void) => {
    getAPI().onBatchJobQueued(callback);
  },

  onJobStarted: (callback: (job: any) => void) => {
    getAPI().onBatchJobStarted(callback);
  },

  onJobProgress: (callback: (jobId: string, progress: number, stage: string) => void) => {
    getAPI().onBatchJobProgress(callback);
  },

  onJobCompleted: (callback: (job: any) => void) => {
    getAPI().onBatchJobCompleted(callback);
  },

  onJobFailed: (callback: (job: any, error: string) => void) => {
    getAPI().onBatchJobFailed(callback);
  },

  onQueueEmpty: (callback: () => void) => {
    getAPI().onBatchQueueEmpty(callback);
  },
};

/**
 * ContentForge AI Services
 */
export const contentforge = {
  // API Key Management
  apiKeys: {
    setOpenAI: async (apiKey: string) => {
      return getAPI().cfSetOpenAIKey(apiKey);
    },

    setElevenLabs: async (apiKey: string) => {
      return getAPI().cfSetElevenLabsKey(apiKey);
    },

    setYouTube: async (credentials: any) => {
      return getAPI().cfSetYouTubeCredentials(credentials);
    },

    validate: async () => {
      return getAPI().cfValidateAPIKeys();
    },

    clear: async (service?: string) => {
      return getAPI().cfClearAPIKeys(service);
    },
  },

  // Script Generation
  script: {
    horror: async (options: {
      duration: number;
      theme?: string;
      setting?: string;
      pov?: 'first' | 'third';
    }) => {
      return getAPI().cfGenerateHorrorScript(options);
    },

    lofi: async (options: {
      trackName: string;
      mood?: string;
      tags?: string[];
    }) => {
      return getAPI().cfGenerateLofiScript(options);
    },

    explainer: async (options: {
      topic: string;
      duration: number;
      targetAudience?: string;
      style?: string;
    }) => {
      return getAPI().cfGenerateExplainerScript(options);
    },

    motivational: async (options: {
      theme: string;
      count?: number;
    }) => {
      return getAPI().cfGenerateMotivationalScript(options);
    },
  },

  // Voice Generation
  voice: {
    generate: async (text: string, filename: string, options?: {
      provider?: 'elevenlabs' | 'openai' | 'auto';
      voiceId?: string;
      quality?: 'standard' | 'high';
    }) => {
      return getAPI().cfGenerateVoice(text, filename, options);
    },

    listVoices: async (provider: 'elevenlabs' | 'openai') => {
      return getAPI().cfListVoices(provider);
    },
  },

  // Image Generation
  image: {
    generate: async (prompt: string, options?: {
      filename?: string;
      size?: '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: string;
    }) => {
      return getAPI().cfGenerateImage(prompt, options);
    },

    horrorScene: async (description: string, options?: {
      filename?: string;
      intensity?: 'subtle' | 'moderate' | 'extreme';
    }) => {
      return getAPI().cfGenerateHorrorScene(description, options);
    },

    lofiBackground: async (description: string, options?: {
      filename?: string;
      mood?: 'chill' | 'cozy' | 'dreamy' | 'nostalgic';
    }) => {
      return getAPI().cfGenerateLofiBackground(description, options);
    },

    batch: async (prompts: Array<{
      prompt: string;
      filename?: string;
      style?: string;
    }>) => {
      return getAPI().cfGenerateBatchImages(prompts);
    },
  },

  // YouTube Integration
  youtube: {
    upload: async (videoPath: string, metadata: {
      title: string;
      description: string;
      tags: string[];
      categoryId?: string;
      privacyStatus?: 'public' | 'private' | 'unlisted';
      thumbnailPath?: string;
      playlistId?: string;
    }) => {
      return getAPI().cfUploadToYouTube(videoPath, metadata);
    },

    metadata: {
      generate: async (options: {
        niche: string;
        topic: string;
        script?: string;
        duration?: number;
        style?: 'clickbait' | 'professional' | 'casual';
      }) => {
        return getAPI().cfGenerateYouTubeMetadata(options);
      },

      title: async (options: {
        niche: string;
        topic: string;
        style?: 'clickbait' | 'professional' | 'casual';
        maxLength?: number;
      }) => {
        return getAPI().cfGenerateYouTubeTitle(options);
      },

      description: async (options: {
        niche: string;
        topic: string;
        script?: string;
        duration?: number;
        keywords?: string[];
      }) => {
        return getAPI().cfGenerateYouTubeDescription(options);
      },

      tags: async (options: {
        niche: string;
        topic: string;
        title?: string;
        maxTags?: number;
      }) => {
        return getAPI().cfGenerateYouTubeTags(options);
      },
    },

    playlists: {
      list: async () => {
        return getAPI().cfListYouTubePlaylists();
      },

      create: async (options: {
        title: string;
        description?: string;
        privacyStatus?: 'public' | 'private' | 'unlisted';
      }) => {
        return getAPI().cfCreateYouTubePlaylist(options);
      },
    },
  },

  // Cost & Cache Tracking
  tracking: {
    getCostStats: async () => {
      return getAPI().cfGetCostStats();
    },

    getCacheStats: async () => {
      return getAPI().cfGetCacheStats();
    },

    clearCache: async (type?: string) => {
      return getAPI().cfClearCache(type);
    },
  },
};

/**
 * App Info
 */
export const getAppInfo = () => {
  if (!isElectron()) {
    return { platform: 'web', version: '1.0.0', name: 'ContentForge Studio' };
  }
  return window.appInfo;
};

// Legacy Tauri-style invoke for backward compatibility
export const invoke = async (command: string, args?: any) => {
  console.warn(`Legacy invoke("${command}") called. Consider using the new API.`);

  // Map old Tauri commands to new Electron API
  const commandMap: Record<string, () => Promise<any>> = {
    'create_project': () => project.create(args.name),
    'open_project': () => project.open(args.path),
    'save_project': () => project.save(args.data),
    'import_asset': () => assets.import(args.path),
    'export_video': () => exportMedia.video(args.config),
    // Add more mappings as needed
  };

  const handler = commandMap[command];
  if (!handler) {
    throw new Error(`Unknown command: ${command}`);
  }

  return handler();
};

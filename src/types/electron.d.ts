// Type definitions for Electron IPC API

export interface ElectronAPI {
  // Project management
  createProject: (name: string) => Promise<any>;
  openProject: (path: string) => Promise<any>;
  saveProject: (data: any) => Promise<void>;
  listProjects: () => Promise<any[]>;

  // Asset management
  importAsset: (path: string) => Promise<any>;
  generateProxy: (assetId: string) => Promise<string>;
  listAssets: () => Promise<any[]>;
  getAsset: (assetId: string) => Promise<any>;
  deleteAsset: (assetId: string) => Promise<void>;

  // Timeline operations
  addClipToTimeline: (clip: any) => Promise<any>;
  removeClip: (clipId: string) => Promise<void>;
  updateClip: (clipId: string, updates: any) => Promise<void>;
  getTimeline: () => Promise<any>;

  // Video processing
  getFrameAtTime: (time: number) => Promise<string>;
  startPreview: () => Promise<void>;
  stopPreview: () => Promise<void>;
  seekPreview: (time: number) => Promise<string>;

  // Image processing
  processImage: (assetId: string, operations: any) => Promise<string>;
  generateThumbnail: (assetId: string) => Promise<string>;

  // Export
  exportVideo: (config: any) => Promise<void>;
  exportImage: (config: any) => Promise<void>;
  exportGIF: (config: any) => Promise<void>;

  // File dialogs
  openFile: (options?: any) => Promise<string | undefined>;
  saveFile: (options?: any) => Promise<string | undefined>;
  openDirectory: () => Promise<string | undefined>;

  // Event listeners
  onFrameReady: (callback: (framePath: string) => void) => void;
  onExportProgress: (callback: (progress: number, stage: string) => void) => void;
  onAssetProcessed: (callback: (assetId: string, status: string) => void) => void;
  onError: (callback: (error: string) => void) => void;

  // Remove listeners
  removeFrameReadyListener: () => void;
  removeExportProgressListener: () => void;
}

export interface AppInfo {
  platform: string;
  version: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    appInfo: AppInfo;
  }
}

export {};

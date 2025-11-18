/**
 * ELECTRON MAIN PROCESS
 *
 * This is the entry point for the Electron main process.
 * It handles:
 * - Application lifecycle management
 * - Window creation and management
 * - IPC communication with renderer process
 * - File system operations
 * - Native OS integrations
 */

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { VideoProcessor } from './modules/VideoProcessor';
import { ImageProcessor } from './modules/ImageProcessor';
import { AudioProcessor } from './modules/AudioProcessor';
import { AIService } from './modules/AIService';
import { ProjectManager } from './modules/ProjectManager';
import { ExportManager } from './modules/ExportManager';

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let mainWindow: BrowserWindow | null = null;
let videoProcessor: VideoProcessor;
let imageProcessor: ImageProcessor;
let audioProcessor: AudioProcessor;
let aiService: AIService;
let projectManager: ProjectManager;
let exportManager: ExportManager;

const isDev = process.env.NODE_ENV === 'development';

// ============================================================================
// APPLICATION LIFECYCLE
// ============================================================================

/**
 * Initialize the application
 * Sets up all services and modules
 */
async function initialize() {
  console.log('Initializing application...');

  // Initialize core modules
  videoProcessor = new VideoProcessor();
  imageProcessor = new ImageProcessor();
  audioProcessor = new AudioProcessor();
  aiService = new AIService();
  projectManager = new ProjectManager();
  exportManager = new ExportManager();

  // Set up IPC handlers
  setupIPC();

  console.log('Application initialized successfully');
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#1E1E1E',
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Required for loading local media files
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

/**
 * Create application menu
 */
function createMenu() {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-project');
          },
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-open-project');
          },
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save');
          },
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-as');
          },
        },
        { type: 'separator' },
        {
          label: 'Import Media',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow?.webContents.send('menu-import-media');
          },
        },
        {
          label: 'Export',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow?.webContents.send('menu-export');
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

/**
 * Set up IPC communication handlers
 * These handle messages from the renderer process
 */
function setupIPC() {
  // ========== PROJECT MANAGEMENT ==========

  ipcMain.handle('project:create', async (event, settings) => {
    return await projectManager.createProject(settings);
  });

  ipcMain.handle('project:open', async (event, filePath) => {
    return await projectManager.openProject(filePath);
  });

  ipcMain.handle('project:save', async (event, project) => {
    return await projectManager.saveProject(project);
  });

  ipcMain.handle('project:save-as', async (event, project, filePath) => {
    return await projectManager.saveProjectAs(project, filePath);
  });

  // ========== FILE OPERATIONS ==========

  ipcMain.handle('file:select', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('file:select-save', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('file:read', async (event, filePath) => {
    return fs.promises.readFile(filePath);
  });

  ipcMain.handle('file:write', async (event, filePath, data) => {
    return fs.promises.writeFile(filePath, data);
  });

  // ========== VIDEO PROCESSING ==========

  ipcMain.handle('video:import', async (event, filePath) => {
    return await videoProcessor.importVideo(filePath);
  });

  ipcMain.handle('video:get-metadata', async (event, filePath) => {
    return await videoProcessor.getMetadata(filePath);
  });

  ipcMain.handle('video:extract-frame', async (event, filePath, time) => {
    return await videoProcessor.extractFrame(filePath, time);
  });

  ipcMain.handle('video:generate-thumbnail', async (event, filePath) => {
    return await videoProcessor.generateThumbnail(filePath);
  });

  ipcMain.handle('video:trim', async (event, filePath, startTime, endTime) => {
    return await videoProcessor.trim(filePath, startTime, endTime);
  });

  ipcMain.handle('video:apply-effect', async (event, clipId, effect) => {
    return await videoProcessor.applyEffect(clipId, effect);
  });

  // ========== IMAGE PROCESSING ==========

  ipcMain.handle('image:import', async (event, filePath) => {
    return await imageProcessor.importImage(filePath);
  });

  ipcMain.handle('image:get-metadata', async (event, filePath) => {
    return await imageProcessor.getMetadata(filePath);
  });

  ipcMain.handle('image:resize', async (event, imageData, width, height) => {
    return await imageProcessor.resize(imageData, width, height);
  });

  ipcMain.handle('image:apply-adjustment', async (event, layerId, adjustment) => {
    return await imageProcessor.applyAdjustment(layerId, adjustment);
  });

  ipcMain.handle('image:apply-filter', async (event, layerId, filter) => {
    return await imageProcessor.applyFilter(layerId, filter);
  });

  // ========== AUDIO PROCESSING ==========

  ipcMain.handle('audio:import', async (event, filePath) => {
    return await audioProcessor.importAudio(filePath);
  });

  ipcMain.handle('audio:get-waveform', async (event, filePath) => {
    return await audioProcessor.getWaveform(filePath);
  });

  ipcMain.handle('audio:apply-effect', async (event, clipId, effect) => {
    return await audioProcessor.applyEffect(clipId, effect);
  });

  ipcMain.handle('audio:mix', async (event, clips, settings) => {
    return await audioProcessor.mix(clips, settings);
  });

  // ========== AI FEATURES ==========

  ipcMain.handle('ai:detect-scenes', async (event, filePath) => {
    return await aiService.detectScenes(filePath);
  });

  ipcMain.handle('ai:auto-reframe', async (event, clipId, targetAspectRatio) => {
    return await aiService.autoReframe(clipId, targetAspectRatio);
  });

  ipcMain.handle('ai:remove-background', async (event, layerId) => {
    return await aiService.removeBackground(layerId);
  });

  ipcMain.handle('ai:select-subject', async (event, layerId) => {
    return await aiService.selectSubject(layerId);
  });

  ipcMain.handle('ai:enhance-portrait', async (event, layerId) => {
    return await aiService.enhancePortrait(layerId);
  });

  ipcMain.handle('ai:upscale', async (event, layerId, scale) => {
    return await aiService.upscale(layerId, scale);
  });

  ipcMain.handle('ai:generate-caption', async (event, clipId) => {
    return await aiService.generateCaption(clipId);
  });

  ipcMain.handle('ai:transcribe', async (event, audioPath) => {
    return await aiService.transcribe(audioPath);
  });

  // ========== EXPORT ==========

  ipcMain.handle('export:start', async (event, project, settings) => {
    return await exportManager.startExport(project, settings);
  });

  ipcMain.handle('export:cancel', async (event, jobId) => {
    return await exportManager.cancelExport(jobId);
  });

  ipcMain.on('export:progress', (event, jobId) => {
    // Send progress updates to renderer
    exportManager.on('progress', (data) => {
      mainWindow?.webContents.send('export:progress', data);
    });
  });

  // ========== SYSTEM ==========

  ipcMain.handle('system:get-info', async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    };
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

// When Electron has finished initialization
app.whenReady().then(async () => {
  await initialize();
  createWindow();

  app.on('activate', () => {
    // On macOS, recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app quit
app.on('before-quit', async () => {
  // Clean up resources
  console.log('Cleaning up before quit...');
  // TODO: Save any unsaved work, close database connections, etc.
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // TODO: Log to file or error reporting service
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // TODO: Log to file or error reporting service
});

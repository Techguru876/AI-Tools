import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { setupIpcHandlers } from './ipc-handlers';
import { initializeDefaultTemplates } from './services/templates/initializeTemplates';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    title: 'ContentForge Studio',
    show: false, // Show after ready-to-show
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('\n=== CONTENTFORGE STUDIO STARTUP ===');
  console.log('User Data Path:', app.getPath('userData'));
  console.log('Database Path:', path.join(app.getPath('userData'), 'contentforge.db'));
  console.log('Database exists:', fs.existsSync(path.join(app.getPath('userData'), 'contentforge.db')));

  console.log('\n=== INITIALIZING DEFAULT TEMPLATES ===');
  initializeDefaultTemplates();

  console.log('\n=== SETTING UP IPC HANDLERS ===');
  setupIpcHandlers();

  console.log('\n=== CREATING WINDOW ===');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

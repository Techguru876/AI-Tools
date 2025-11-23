"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ipc_handlers_1 = require("./ipc-handlers");
const initializeTemplates_1 = require("./services/templates/initializeTemplates");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1600,
        height: 1000,
        minWidth: 1280,
        minHeight: 720,
        backgroundColor: '#1a1a2e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
            webSecurity: true,
        },
        title: 'ContentForge Studio',
        show: false, // Show after ready-to-show
    });
    // Load app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    console.log('\n=== CONTENTFORGE STUDIO STARTUP ===');
    console.log('User Data Path:', electron_1.app.getPath('userData'));
    console.log('Database Path:', path_1.default.join(electron_1.app.getPath('userData'), 'contentforge.db'));
    console.log('Database exists:', fs_1.default.existsSync(path_1.default.join(electron_1.app.getPath('userData'), 'contentforge.db')));
    console.log('\n=== INITIALIZING DEFAULT TEMPLATES ===');
    (0, initializeTemplates_1.initializeDefaultTemplates)();
    console.log('\n=== SETTING UP IPC HANDLERS ===');
    (0, ipc_handlers_1.setupIpcHandlers)();
    console.log('\n=== CREATING WINDOW ===');
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});
//# sourceMappingURL=main.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uuid_1 = require("uuid");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const sharp_1 = __importDefault(require("sharp"));
const os_1 = __importDefault(require("os"));
const electron_1 = require("electron");
class AssetService {
    constructor() {
        // Initialize paths
        this.appDataPath = path_1.default.join(os_1.default.homedir(), 'PhotoVideoPro');
        this.assetsDir = path_1.default.join(this.appDataPath, 'assets');
        this.proxiesDir = path_1.default.join(this.appDataPath, 'proxies');
        this.thumbnailsDir = path_1.default.join(this.appDataPath, 'thumbnails');
        // Initialize database
        this.db = new better_sqlite3_1.default(path_1.default.join(this.appDataPath, 'projects.db'));
        this.initDatabase();
        this.ensureDirectories();
    }
    async ensureDirectories() {
        try {
            await promises_1.default.mkdir(this.assetsDir, { recursive: true });
            await promises_1.default.mkdir(this.proxiesDir, { recursive: true });
            await promises_1.default.mkdir(this.thumbnailsDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating directories:', error);
        }
    }
    initDatabase() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        original_path TEXT NOT NULL,
        filename TEXT NOT NULL,
        type TEXT NOT NULL,
        duration REAL,
        width INTEGER,
        height INTEGER,
        fps REAL,
        codec TEXT,
        bitrate INTEGER,
        has_proxy INTEGER DEFAULT 0,
        proxy_path TEXT,
        thumbnail_path TEXT,
        file_size INTEGER,
        imported_at INTEGER NOT NULL
      )
    `);
        // Create indexes
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_assets_type
      ON assets(type);
      CREATE INDEX IF NOT EXISTS idx_assets_imported
      ON assets(imported_at DESC);
    `);
    }
    async importAsset(filePath) {
        const id = (0, uuid_1.v4)();
        const filename = path_1.default.basename(filePath);
        const stats = await promises_1.default.stat(filePath);
        let metadata;
        let assetType;
        // Determine asset type and extract metadata
        const ext = path_1.default.extname(filePath).toLowerCase();
        if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
            metadata = await this.extractVideoMetadata(filePath);
            assetType = 'video';
        }
        else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            metadata = await this.extractImageMetadata(filePath);
            assetType = 'image';
        }
        else if (['.mp3', '.wav', '.aac', '.flac'].includes(ext)) {
            metadata = await this.extractAudioMetadata(filePath);
            assetType = 'audio';
        }
        else {
            throw new Error('Unsupported file type');
        }
        const asset = {
            id,
            original_path: filePath,
            filename,
            type: assetType,
            duration: metadata.duration || null,
            width: metadata.width || null,
            height: metadata.height || null,
            fps: metadata.fps || null,
            codec: metadata.codec || null,
            bitrate: metadata.bitrate || null,
            has_proxy: 0,
            proxy_path: null,
            thumbnail_path: null,
            file_size: stats.size,
            imported_at: Date.now(),
        };
        const stmt = this.db.prepare(`
      INSERT INTO assets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(asset.id, asset.original_path, asset.filename, asset.type, asset.duration, asset.width, asset.height, asset.fps, asset.codec, asset.bitrate, asset.has_proxy, asset.proxy_path, asset.thumbnail_path, asset.file_size, asset.imported_at);
        // Generate thumbnail asynchronously
        this.generateThumbnail(asset.id).catch(err => console.error('Error generating thumbnail:', err));
        return asset;
    }
    extractVideoMetadata(filePath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                resolve({
                    duration: metadata.format.duration,
                    width: videoStream?.width,
                    height: videoStream?.height,
                    fps: videoStream ? this.parseFrameRate(videoStream.r_frame_rate || '30/1') : null,
                    codec: videoStream?.codec_name,
                    bitrate: metadata.format.bit_rate ? parseInt(String(metadata.format.bit_rate)) : 0,
                    hasAudio: !!audioStream,
                });
            });
        });
    }
    async extractImageMetadata(filePath) {
        const metadata = await (0, sharp_1.default)(filePath).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
        };
    }
    extractAudioMetadata(filePath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                resolve({
                    duration: metadata.format.duration,
                    codec: audioStream?.codec_name,
                    bitrate: metadata.format.bit_rate ? parseInt(String(metadata.format.bit_rate)) : 0,
                    sampleRate: audioStream?.sample_rate,
                });
            });
        });
    }
    parseFrameRate(frameRate) {
        const parts = frameRate.split('/');
        if (parts.length === 2) {
            return parseInt(parts[0]) / parseInt(parts[1]);
        }
        return parseFloat(frameRate);
    }
    async generateProxy(assetId) {
        const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }
        if (asset.type !== 'video') {
            throw new Error('Proxies only supported for video assets');
        }
        const proxyPath = path_1.default.join(this.proxiesDir, `${assetId}_proxy.mp4`);
        return new Promise((resolve, reject) => {
            const mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
            (0, fluent_ffmpeg_1.default)(asset.original_path)
                .outputOptions([
                '-vf', 'scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2',
                '-c:v', 'libx264',
                '-crf', '23',
                '-preset', 'fast',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
            ])
                .on('progress', (progress) => {
                mainWindow?.webContents.send('asset-processed', assetId, `Generating proxy: ${Math.round(progress.percent || 0)}%`);
            })
                .on('end', () => {
                // Update database
                this.db.prepare('UPDATE assets SET has_proxy = 1, proxy_path = ? WHERE id = ?')
                    .run(proxyPath, assetId);
                mainWindow?.webContents.send('asset-processed', assetId, 'complete');
                resolve(proxyPath);
            })
                .on('error', (err) => {
                mainWindow?.webContents.send('error', `Proxy generation failed: ${err.message}`);
                reject(err);
            })
                .save(proxyPath);
        });
    }
    async generateThumbnail(assetId) {
        const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }
        const thumbnailPath = path_1.default.join(this.thumbnailsDir, `${assetId}_thumb.jpg`);
        if (asset.type === 'video') {
            return new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(asset.original_path)
                    .screenshots({
                    timestamps: [Math.min(1, (asset.duration || 1) / 2)],
                    filename: `${assetId}_thumb.jpg`,
                    folder: this.thumbnailsDir,
                    size: '320x180',
                })
                    .on('end', () => {
                    this.db.prepare('UPDATE assets SET thumbnail_path = ? WHERE id = ?')
                        .run(thumbnailPath, assetId);
                    resolve(thumbnailPath);
                })
                    .on('error', reject);
            });
        }
        else if (asset.type === 'image') {
            await (0, sharp_1.default)(asset.original_path)
                .resize(320, 180, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
            this.db.prepare('UPDATE assets SET thumbnail_path = ? WHERE id = ?')
                .run(thumbnailPath, assetId);
            return thumbnailPath;
        }
        throw new Error('Thumbnails not supported for this asset type');
    }
    async processImage(assetId, operations) {
        const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
        if (!asset || asset.type !== 'image') {
            throw new Error('Asset not found or not an image');
        }
        const outputPath = path_1.default.join(this.assetsDir, `${assetId}_processed.png`);
        let pipeline = (0, sharp_1.default)(asset.original_path);
        // Apply operations
        if (operations.resize) {
            pipeline = pipeline.resize(operations.resize.width, operations.resize.height);
        }
        if (operations.rotate) {
            pipeline = pipeline.rotate(operations.rotate);
        }
        if (operations.flip) {
            pipeline = pipeline.flip();
        }
        if (operations.flop) {
            pipeline = pipeline.flop();
        }
        if (operations.grayscale) {
            pipeline = pipeline.grayscale();
        }
        if (operations.blur) {
            pipeline = pipeline.blur(operations.blur);
        }
        if (operations.sharpen) {
            pipeline = pipeline.sharpen();
        }
        await pipeline.toFile(outputPath);
        return outputPath;
    }
    async listAssets() {
        return this.db.prepare('SELECT * FROM assets ORDER BY imported_at DESC').all();
    }
    async getAsset(assetId) {
        return this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
    }
    async deleteAsset(assetId) {
        const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
        if (asset) {
            // Delete proxy and thumbnail
            try {
                if (asset.proxy_path)
                    await promises_1.default.unlink(asset.proxy_path);
                if (asset.thumbnail_path)
                    await promises_1.default.unlink(asset.thumbnail_path);
            }
            catch (error) {
                console.error('Error deleting asset files:', error);
            }
            // Delete from database
            this.db.prepare('DELETE FROM assets WHERE id = ?').run(assetId);
        }
    }
    close() {
        this.db.close();
    }
}
exports.AssetService = AssetService;
//# sourceMappingURL=asset-service.js.map
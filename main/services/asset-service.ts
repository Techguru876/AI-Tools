import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import sharp from 'sharp';
import os from 'os';
import { BrowserWindow } from 'electron';

export class AssetService {
  private db: Database.Database;
  private assetsDir: string;
  private proxiesDir: string;
  private thumbnailsDir: string;
  private appDataPath: string;

  constructor() {
    // Initialize paths
    this.appDataPath = path.join(os.homedir(), 'PhotoVideoPro');
    this.assetsDir = path.join(this.appDataPath, 'assets');
    this.proxiesDir = path.join(this.appDataPath, 'proxies');
    this.thumbnailsDir = path.join(this.appDataPath, 'thumbnails');

    // Initialize database
    this.db = new Database(path.join(this.appDataPath, 'projects.db'));
    this.initDatabase();
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.assetsDir, { recursive: true });
      await fs.mkdir(this.proxiesDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  private initDatabase() {
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

  async importAsset(filePath: string): Promise<any> {
    const id = uuidv4();
    const filename = path.basename(filePath);
    const stats = await fs.stat(filePath);

    let metadata: any;
    let assetType: string;

    // Determine asset type and extract metadata
    const ext = path.extname(filePath).toLowerCase();
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
      metadata = await this.extractVideoMetadata(filePath);
      assetType = 'video';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      metadata = await this.extractImageMetadata(filePath);
      assetType = 'image';
    } else if (['.mp3', '.wav', '.aac', '.flac'].includes(ext)) {
      metadata = await this.extractAudioMetadata(filePath);
      assetType = 'audio';
    } else {
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

    stmt.run(
      asset.id,
      asset.original_path,
      asset.filename,
      asset.type,
      asset.duration,
      asset.width,
      asset.height,
      asset.fps,
      asset.codec,
      asset.bitrate,
      asset.has_proxy,
      asset.proxy_path,
      asset.thumbnail_path,
      asset.file_size,
      asset.imported_at
    );

    // Generate thumbnail asynchronously
    this.generateThumbnail(asset.id).catch(err =>
      console.error('Error generating thumbnail:', err)
    );

    return asset;
  }

  private extractVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
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
          bitrate: parseInt(metadata.format.bit_rate || '0'),
          hasAudio: !!audioStream,
        });
      });
    });
  }

  private async extractImageMetadata(filePath: string): Promise<any> {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };
  }

  private extractAudioMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration,
          codec: audioStream?.codec_name,
          bitrate: parseInt(metadata.format.bit_rate || '0'),
          sampleRate: audioStream?.sample_rate,
        });
      });
    });
  }

  private parseFrameRate(frameRate: string): number {
    const parts = frameRate.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(frameRate);
  }

  async generateProxy(assetId: string): Promise<string> {
    const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId) as any;

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.type !== 'video') {
      throw new Error('Proxies only supported for video assets');
    }

    const proxyPath = path.join(this.proxiesDir, `${assetId}_proxy.mp4`);

    return new Promise((resolve, reject) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];

      ffmpeg(asset.original_path)
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

  async generateThumbnail(assetId: string): Promise<string> {
    const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId) as any;

    if (!asset) {
      throw new Error('Asset not found');
    }

    const thumbnailPath = path.join(this.thumbnailsDir, `${assetId}_thumb.jpg`);

    if (asset.type === 'video') {
      return new Promise((resolve, reject) => {
        ffmpeg(asset.original_path)
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
    } else if (asset.type === 'image') {
      await sharp(asset.original_path)
        .resize(320, 180, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      this.db.prepare('UPDATE assets SET thumbnail_path = ? WHERE id = ?')
        .run(thumbnailPath, assetId);

      return thumbnailPath;
    }

    throw new Error('Thumbnails not supported for this asset type');
  }

  async processImage(assetId: string, operations: any): Promise<string> {
    const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId) as any;

    if (!asset || asset.type !== 'image') {
      throw new Error('Asset not found or not an image');
    }

    const outputPath = path.join(this.assetsDir, `${assetId}_processed.png`);
    let pipeline = sharp(asset.original_path);

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

  async listAssets(): Promise<any[]> {
    return this.db.prepare('SELECT * FROM assets ORDER BY imported_at DESC').all() as any[];
  }

  async getAsset(assetId: string): Promise<any> {
    return this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
  }

  async deleteAsset(assetId: string): Promise<void> {
    const asset = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId) as any;

    if (asset) {
      // Delete proxy and thumbnail
      try {
        if (asset.proxy_path) await fs.unlink(asset.proxy_path);
        if (asset.thumbnail_path) await fs.unlink(asset.thumbnail_path);
      } catch (error) {
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

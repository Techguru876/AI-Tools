import { google, youtube_v3 } from 'googleapis';
import fs from 'fs';
import { EventEmitter } from 'events';

/**
 * YouTube Video Metadata
 */
export interface YouTubeMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
  madeForKids?: boolean;
  thumbnailPath?: string;
  playlistId?: string;
}

/**
 * YouTube Upload Progress
 */
export interface UploadProgress {
  uploaded: number;
  total: number;
  percent: number;
  stage: 'uploading' | 'processing' | 'complete';
}

/**
 * YouTube API Service
 * Handles video uploads and metadata management
 */
export class YouTubeAPI extends EventEmitter {
  private youtube: youtube_v3.Youtube;
  private oauth2Client: any;

  constructor(credentials: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }) {
    super();

    this.oauth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      'urn:ietf:wg:oauth:2.0:oob' // For installed apps
    );

    this.oauth2Client.setCredentials({
      refresh_token: credentials.refreshToken,
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  /**
   * Upload video to YouTube
   */
  async uploadVideo(
    videoPath: string,
    metadata: YouTubeMetadata
  ): Promise<{
    videoId: string;
    url: string;
  }> {
    const fileSize = fs.statSync(videoPath).size;

    this.emit('upload-start', { path: videoPath, size: fileSize });

    try {
      const response = await this.youtube.videos.insert(
        {
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: metadata.title,
              description: metadata.description,
              tags: metadata.tags,
              categoryId: metadata.categoryId || '22', // People & Blogs
            },
            status: {
              privacyStatus: metadata.privacyStatus || 'private',
              madeForKids: metadata.madeForKids || false,
            },
          },
          media: {
            body: fs.createReadStream(videoPath),
          },
        },
        {
          onUploadProgress: (evt) => {
            const progress: UploadProgress = {
              uploaded: evt.bytesRead,
              total: fileSize,
              percent: (evt.bytesRead / fileSize) * 100,
              stage: 'uploading',
            };
            this.emit('upload-progress', progress);
          },
        }
      );

      const videoId = response.data.id!;

      // Upload thumbnail if provided
      if (metadata.thumbnailPath) {
        await this.uploadThumbnail(videoId, metadata.thumbnailPath);
      }

      // Add to playlist if specified
      if (metadata.playlistId) {
        await this.addToPlaylist(videoId, metadata.playlistId);
      }

      this.emit('upload-complete', { videoId, url: `https://youtube.com/watch?v=${videoId}` });

      return {
        videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
      };
    } catch (error: any) {
      this.emit('upload-error', error);
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }

  /**
   * Upload custom thumbnail
   */
  async uploadThumbnail(videoId: string, thumbnailPath: string): Promise<void> {
    await this.youtube.thumbnails.set({
      videoId,
      media: {
        body: fs.createReadStream(thumbnailPath),
      },
    });
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(videoId: string, playlistId: string): Promise<void> {
    await this.youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      },
    });
  }

  /**
   * Create new playlist
   */
  async createPlaylist(options: {
    title: string;
    description?: string;
    privacyStatus?: 'public' | 'private' | 'unlisted';
  }): Promise<string> {
    const response = await this.youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: options.title,
          description: options.description || '',
        },
        status: {
          privacyStatus: options.privacyStatus || 'public',
        },
      },
    });

    return response.data.id!;
  }

  /**
   * Update video metadata
   */
  async updateVideo(videoId: string, metadata: Partial<YouTubeMetadata>): Promise<void> {
    const requestBody: any = {
      id: videoId,
    };

    if (metadata.title || metadata.description || metadata.tags) {
      requestBody.snippet = {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
      };
    }

    if (metadata.privacyStatus) {
      requestBody.status = {
        privacyStatus: metadata.privacyStatus,
      };
    }

    await this.youtube.videos.update({
      part: ['snippet', 'status'],
      requestBody,
    });
  }

  /**
   * Get video details
   */
  async getVideo(videoId: string): Promise<any> {
    const response = await this.youtube.videos.list({
      part: ['snippet', 'status', 'statistics'],
      id: [videoId],
    });

    return response.data.items?.[0] || null;
  }

  /**
   * List playlists
   */
  async listPlaylists(): Promise<Array<{ id: string; title: string }>> {
    const response = await this.youtube.playlists.list({
      part: ['snippet'],
      mine: true,
      maxResults: 50,
    });

    return (response.data.items || []).map(item => ({
      id: item.id!,
      title: item.snippet?.title || '',
    }));
  }

  /**
   * Get channel analytics
   */
  async getAnalytics(options?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    // Note: This requires YouTube Analytics API to be enabled
    // Simplified version here
    const response = await this.youtube.channels.list({
      part: ['statistics'],
      mine: true,
    });

    return response.data.items?.[0]?.statistics || null;
  }

  /**
   * Validate credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.youtube.channels.list({
        part: ['snippet'],
        mine: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

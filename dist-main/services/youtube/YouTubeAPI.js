"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeAPI = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const events_1 = require("events");
/**
 * YouTube API Service
 * Handles video uploads and metadata management
 */
class YouTubeAPI extends events_1.EventEmitter {
    constructor(credentials) {
        super();
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(credentials.clientId, credentials.clientSecret, 'urn:ietf:wg:oauth:2.0:oob' // For installed apps
        );
        this.oauth2Client.setCredentials({
            refresh_token: credentials.refreshToken,
        });
        this.youtube = googleapis_1.google.youtube({
            version: 'v3',
            auth: this.oauth2Client,
        });
    }
    /**
     * Upload video to YouTube
     */
    async uploadVideo(videoPath, metadata) {
        const fileSize = fs_1.default.statSync(videoPath).size;
        this.emit('upload-start', { path: videoPath, size: fileSize });
        try {
            const response = await this.youtube.videos.insert({
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
                    body: fs_1.default.createReadStream(videoPath),
                },
            }, {
                onUploadProgress: (evt) => {
                    const progress = {
                        uploaded: evt.bytesRead,
                        total: fileSize,
                        percent: (evt.bytesRead / fileSize) * 100,
                        stage: 'uploading',
                    };
                    this.emit('upload-progress', progress);
                },
            });
            const videoId = response.data.id;
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
        }
        catch (error) {
            this.emit('upload-error', error);
            throw new Error(`YouTube upload failed: ${error.message}`);
        }
    }
    /**
     * Upload custom thumbnail
     */
    async uploadThumbnail(videoId, thumbnailPath) {
        await this.youtube.thumbnails.set({
            videoId,
            media: {
                body: fs_1.default.createReadStream(thumbnailPath),
            },
        });
    }
    /**
     * Add video to playlist
     */
    async addToPlaylist(videoId, playlistId) {
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
    async createPlaylist(options) {
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
        return response.data.id;
    }
    /**
     * Update video metadata
     */
    async updateVideo(videoId, metadata) {
        const requestBody = {
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
    async getVideo(videoId) {
        const response = await this.youtube.videos.list({
            part: ['snippet', 'status', 'statistics'],
            id: [videoId],
        });
        return response.data.items?.[0] || null;
    }
    /**
     * List playlists
     */
    async listPlaylists() {
        const response = await this.youtube.playlists.list({
            part: ['snippet'],
            mine: true,
            maxResults: 50,
        });
        return (response.data.items || []).map(item => ({
            id: item.id,
            title: item.snippet?.title || '',
        }));
    }
    /**
     * Get channel analytics
     */
    async getAnalytics(options) {
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
    async validateCredentials() {
        try {
            await this.youtube.channels.list({
                part: ['snippet'],
                mine: true,
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.YouTubeAPI = YouTubeAPI;
//# sourceMappingURL=YouTubeAPI.js.map
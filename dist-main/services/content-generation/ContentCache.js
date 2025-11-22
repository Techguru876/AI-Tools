"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentCache = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
/**
 * Content Cache
 * Caches AI-generated content to avoid regeneration and save costs
 */
class ContentCache {
    constructor() {
        const dbPath = path_1.default.join(os_1.default.homedir(), 'ContentForge', 'content-cache.db');
        this.db = new better_sqlite3_1.default(dbPath);
        this.initDatabase();
    }
    initDatabase() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS content_cache (
        hash TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        accessed_at INTEGER NOT NULL,
        access_count INTEGER DEFAULT 0,
        cost_saved REAL DEFAULT 0
      )
    `);
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cache_type
      ON content_cache(type);

      CREATE INDEX IF NOT EXISTS idx_cache_accessed
      ON content_cache(accessed_at DESC);

      CREATE INDEX IF NOT EXISTS idx_cache_created
      ON content_cache(created_at DESC);
    `);
    }
    /**
     * Generate hash from prompt
     */
    hashPrompt(prompt) {
        return crypto_1.default.createHash('sha256').update(prompt).digest('hex');
    }
    /**
     * Get cached content
     */
    async get(type, prompt) {
        const hash = this.hashPrompt(prompt);
        const row = this.db.prepare(`
      SELECT content, metadata FROM content_cache
      WHERE hash = ? AND type = ?
    `).get(hash, type);
        if (!row)
            return null;
        // Update access stats
        this.db.prepare(`
      UPDATE content_cache
      SET accessed_at = ?, access_count = access_count + 1
      WHERE hash = ?
    `).run(Date.now(), hash);
        return JSON.parse(row.content);
    }
    /**
     * Set cached content
     */
    async set(type, prompt, content, options) {
        const hash = this.hashPrompt(prompt);
        this.db.prepare(`
      INSERT OR REPLACE INTO content_cache
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(hash, type, prompt, JSON.stringify(content), options?.metadata ? JSON.stringify(options.metadata) : null, Date.now(), Date.now(), 0, options?.costSaved || 0);
    }
    /**
     * Check if content is cached
     */
    has(type, prompt) {
        const hash = this.hashPrompt(prompt);
        const row = this.db.prepare(`
      SELECT 1 FROM content_cache WHERE hash = ? AND type = ?
    `).get(hash, type);
        return !!row;
    }
    /**
     * Clear cache by type
     */
    async clear(type) {
        if (type) {
            const result = this.db.prepare('DELETE FROM content_cache WHERE type = ?').run(type);
            return result.changes;
        }
        else {
            const result = this.db.prepare('DELETE FROM content_cache').run();
            return result.changes;
        }
    }
    /**
     * Clear old cache entries
     */
    async clearOldEntries(olderThanDays = 30) {
        const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
        const result = this.db.prepare(`
      DELETE FROM content_cache WHERE accessed_at < ?
    `).run(cutoffTime);
        return result.changes;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        // Total entries
        const totalRow = this.db.prepare('SELECT COUNT(*) as count FROM content_cache').get();
        const total = totalRow.count;
        // By type
        const typeRows = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM content_cache
      GROUP BY type
    `).all();
        const byType = {};
        typeRows.forEach(row => {
            byType[row.type] = row.count;
        });
        // Total cost saved
        const costRow = this.db.prepare(`
      SELECT SUM(cost_saved * access_count) as total FROM content_cache
    `).get();
        const totalCostSaved = costRow?.total || 0;
        // Most accessed
        const mostAccessed = this.db.prepare(`
      SELECT type, SUM(access_count) as accessCount
      FROM content_cache
      GROUP BY type
      ORDER BY accessCount DESC
      LIMIT 10
    `).all();
        return {
            total,
            byType,
            totalCostSaved,
            mostAccessed,
        };
    }
    close() {
        this.db.close();
    }
}
exports.ContentCache = ContentCache;
//# sourceMappingURL=ContentCache.js.map
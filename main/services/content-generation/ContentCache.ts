import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import os from 'os';

/**
 * Content Cache
 * Caches AI-generated content to avoid regeneration and save costs
 */
export class ContentCache {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(os.homedir(), 'ContentForge', 'content-cache.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
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
  private hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  /**
   * Get cached content
   */
  async get(type: string, prompt: string): Promise<any | null> {
    const hash = this.hashPrompt(prompt);

    const row = this.db.prepare(`
      SELECT content, metadata FROM content_cache
      WHERE hash = ? AND type = ?
    `).get(hash, type) as any;

    if (!row) return null;

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
  async set(
    type: string,
    prompt: string,
    content: any,
    options?: {
      metadata?: any;
      costSaved?: number;
    }
  ): Promise<void> {
    const hash = this.hashPrompt(prompt);

    this.db.prepare(`
      INSERT OR REPLACE INTO content_cache
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      hash,
      type,
      prompt,
      JSON.stringify(content),
      options?.metadata ? JSON.stringify(options.metadata) : null,
      Date.now(),
      Date.now(),
      0,
      options?.costSaved || 0
    );
  }

  /**
   * Check if content is cached
   */
  has(type: string, prompt: string): boolean {
    const hash = this.hashPrompt(prompt);

    const row = this.db.prepare(`
      SELECT 1 FROM content_cache WHERE hash = ? AND type = ?
    `).get(hash, type);

    return !!row;
  }

  /**
   * Clear cache by type
   */
  async clear(type?: string): Promise<number> {
    if (type) {
      const result = this.db.prepare('DELETE FROM content_cache WHERE type = ?').run(type);
      return result.changes;
    } else {
      const result = this.db.prepare('DELETE FROM content_cache').run();
      return result.changes;
    }
  }

  /**
   * Clear old cache entries
   */
  async clearOldEntries(olderThanDays: number = 30): Promise<number> {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const result = this.db.prepare(`
      DELETE FROM content_cache WHERE accessed_at < ?
    `).run(cutoffTime);

    return result.changes;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    totalCostSaved: number;
    mostAccessed: Array<{ type: string; accessCount: number }>;
  } {
    // Total entries
    const totalRow = this.db.prepare('SELECT COUNT(*) as count FROM content_cache').get() as any;
    const total = totalRow.count;

    // By type
    const typeRows = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM content_cache
      GROUP BY type
    `).all() as any[];

    const byType: Record<string, number> = {};
    typeRows.forEach(row => {
      byType[row.type] = row.count;
    });

    // Total cost saved
    const costRow = this.db.prepare(`
      SELECT SUM(cost_saved * access_count) as total FROM content_cache
    `).get() as any;
    const totalCostSaved = costRow?.total || 0;

    // Most accessed
    const mostAccessed = this.db.prepare(`
      SELECT type, SUM(access_count) as accessCount
      FROM content_cache
      GROUP BY type
      ORDER BY accessCount DESC
      LIMIT 10
    `).all() as any[];

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

import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

/**
 * Analytics Service
 *
 * Tracks all ContentForge operations for insights and reporting:
 * - Cost tracking (per service, per operation)
 * - Generation history (scripts, voice, images)
 * - Video render statistics
 * - YouTube upload metrics
 * - Cache performance
 * - Error tracking
 */

export interface AnalyticsEvent {
  id?: number;
  timestamp: number;
  event_type: 'script_generation' | 'voice_generation' | 'image_generation' | 'video_render' | 'youtube_upload' | 'cache_hit' | 'cache_miss' | 'error';
  service: 'openai' | 'elevenlabs' | 'youtube' | 'template_engine' | 'batch_processor' | 'cache' | 'system';
  operation: string;
  status: 'success' | 'failure' | 'in_progress';
  duration_ms?: number;
  cost_usd?: number;
  metadata?: Record<string, any>;
  error_message?: string;
}

export interface CostSummary {
  total_cost: number;
  costs_by_service: Record<string, number>;
  costs_by_day: Array<{ date: string; cost: number }>;
  costs_by_operation: Record<string, number>;
}

export interface PerformanceStats {
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  average_duration_ms: number;
  cache_hit_rate: number;
  operations_by_type: Record<string, number>;
  operations_by_day: Array<{ date: string; count: number }>;
}

export interface GenerationStats {
  total_scripts: number;
  total_voice_files: number;
  total_images: number;
  total_videos: number;
  total_uploads: number;
  success_rate: number;
  average_script_length: number;
  average_video_duration: number;
}

export class AnalyticsService {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const defaultPath = path.join(app.getPath('userData'), 'analytics.db');
    this.db = new Database(dbPath || defaultPath);
    this.initializeDatabase();
  }

  /**
   * Initialize database schema
   */
  private initializeDatabase(): void {
    // Analytics events table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        service TEXT NOT NULL,
        operation TEXT NOT NULL,
        status TEXT NOT NULL,
        duration_ms INTEGER,
        cost_usd REAL,
        metadata TEXT,
        error_message TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_events_service ON analytics_events(service);
      CREATE INDEX IF NOT EXISTS idx_events_status ON analytics_events(status);
    `);

    console.log('✓ Analytics database initialized');
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: AnalyticsEvent): number {
    const stmt = this.db.prepare(`
      INSERT INTO analytics_events (
        timestamp, event_type, service, operation, status,
        duration_ms, cost_usd, metadata, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      event.timestamp,
      event.event_type,
      event.service,
      event.operation,
      event.status,
      event.duration_ms || null,
      event.cost_usd || null,
      event.metadata ? JSON.stringify(event.metadata) : null,
      event.error_message || null
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Get cost summary
   */
  getCostSummary(startDate?: number, endDate?: number): CostSummary {
    const start = startDate || 0;
    const end = endDate || Date.now();

    // Total cost
    const totalResult = this.db.prepare(`
      SELECT COALESCE(SUM(cost_usd), 0) as total_cost
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
        AND cost_usd IS NOT NULL
    `).get(start, end) as { total_cost: number };

    // Costs by service
    const serviceResults = this.db.prepare(`
      SELECT service, SUM(cost_usd) as cost
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
        AND cost_usd IS NOT NULL
      GROUP BY service
    `).all(start, end) as Array<{ service: string; cost: number }>;

    const costs_by_service: Record<string, number> = {};
    for (const row of serviceResults) {
      costs_by_service[row.service] = row.cost;
    }

    // Costs by day
    const dailyResults = this.db.prepare(`
      SELECT
        date(timestamp / 1000, 'unixepoch') as date,
        SUM(cost_usd) as cost
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
        AND cost_usd IS NOT NULL
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `).all(start, end) as Array<{ date: string; cost: number }>;

    // Costs by operation
    const operationResults = this.db.prepare(`
      SELECT operation, SUM(cost_usd) as cost
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
        AND cost_usd IS NOT NULL
      GROUP BY operation
    `).all(start, end) as Array<{ operation: string; cost: number }>;

    const costs_by_operation: Record<string, number> = {};
    for (const row of operationResults) {
      costs_by_operation[row.operation] = row.cost;
    }

    return {
      total_cost: totalResult.total_cost,
      costs_by_service,
      costs_by_day: dailyResults,
      costs_by_operation,
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(startDate?: number, endDate?: number): PerformanceStats {
    const start = startDate || 0;
    const end = endDate || Date.now();

    // Overall stats
    const overallStats = this.db.prepare(`
      SELECT
        COUNT(*) as total_operations,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failed,
        AVG(duration_ms) as avg_duration
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
    `).get(start, end) as {
      total_operations: number;
      successful: number;
      failed: number;
      avg_duration: number;
    };

    // Cache stats
    const cacheStats = this.db.prepare(`
      SELECT
        SUM(CASE WHEN event_type = 'cache_hit' THEN 1 ELSE 0 END) as hits,
        SUM(CASE WHEN event_type = 'cache_miss' THEN 1 ELSE 0 END) as misses
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
    `).get(start, end) as { hits: number; misses: number };

    const cache_hit_rate = cacheStats.hits + cacheStats.misses > 0
      ? cacheStats.hits / (cacheStats.hits + cacheStats.misses)
      : 0;

    // Operations by type
    const typeResults = this.db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY event_type
    `).all(start, end) as Array<{ event_type: string; count: number }>;

    const operations_by_type: Record<string, number> = {};
    for (const row of typeResults) {
      operations_by_type[row.event_type] = row.count;
    }

    // Operations by day
    const dailyResults = this.db.prepare(`
      SELECT
        date(timestamp / 1000, 'unixepoch') as date,
        COUNT(*) as count
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `).all(start, end) as Array<{ date: string; count: number }>;

    return {
      total_operations: overallStats.total_operations,
      successful_operations: overallStats.successful,
      failed_operations: overallStats.failed,
      average_duration_ms: overallStats.avg_duration || 0,
      cache_hit_rate,
      operations_by_type,
      operations_by_day: dailyResults,
    };
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(startDate?: number, endDate?: number): GenerationStats {
    const start = startDate || 0;
    const end = endDate || Date.now();

    const stats = this.db.prepare(`
      SELECT
        SUM(CASE WHEN event_type = 'script_generation' THEN 1 ELSE 0 END) as total_scripts,
        SUM(CASE WHEN event_type = 'voice_generation' THEN 1 ELSE 0 END) as total_voice,
        SUM(CASE WHEN event_type = 'image_generation' THEN 1 ELSE 0 END) as total_images,
        SUM(CASE WHEN event_type = 'video_render' THEN 1 ELSE 0 END) as total_videos,
        SUM(CASE WHEN event_type = 'youtube_upload' THEN 1 ELSE 0 END) as total_uploads,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
      FROM analytics_events
      WHERE timestamp BETWEEN ? AND ?
    `).get(start, end) as {
      total_scripts: number;
      total_voice: number;
      total_images: number;
      total_videos: number;
      total_uploads: number;
      success_rate: number;
    };

    // Average script length (from metadata)
    const scriptMetadata = this.db.prepare(`
      SELECT metadata
      FROM analytics_events
      WHERE event_type = 'script_generation'
        AND timestamp BETWEEN ? AND ?
        AND status = 'success'
        AND metadata IS NOT NULL
    `).all(start, end) as Array<{ metadata: string }>;

    let totalScriptLength = 0;
    let scriptCount = 0;
    for (const row of scriptMetadata) {
      try {
        const meta = JSON.parse(row.metadata);
        if (meta.length) {
          totalScriptLength += meta.length;
          scriptCount++;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Average video duration (from metadata)
    const videoMetadata = this.db.prepare(`
      SELECT metadata
      FROM analytics_events
      WHERE event_type = 'video_render'
        AND timestamp BETWEEN ? AND ?
        AND status = 'success'
        AND metadata IS NOT NULL
    `).all(start, end) as Array<{ metadata: string }>;

    let totalVideoDuration = 0;
    let videoCount = 0;
    for (const row of videoMetadata) {
      try {
        const meta = JSON.parse(row.metadata);
        if (meta.duration) {
          totalVideoDuration += meta.duration;
          videoCount++;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    return {
      total_scripts: stats.total_scripts || 0,
      total_voice_files: stats.total_voice || 0,
      total_images: stats.total_images || 0,
      total_videos: stats.total_videos || 0,
      total_uploads: stats.total_uploads || 0,
      success_rate: stats.success_rate || 0,
      average_script_length: scriptCount > 0 ? totalScriptLength / scriptCount : 0,
      average_video_duration: videoCount > 0 ? totalVideoDuration / videoCount : 0,
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit = 100, eventType?: string): AnalyticsEvent[] {
    let query = `
      SELECT *
      FROM analytics_events
      ${eventType ? 'WHERE event_type = ?' : ''}
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    const stmt = this.db.prepare(query);
    const results = eventType
      ? stmt.all(eventType, limit)
      : stmt.all(limit);

    return results.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      event_type: row.event_type,
      service: row.service,
      operation: row.operation,
      status: row.status,
      duration_ms: row.duration_ms,
      cost_usd: row.cost_usd,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      error_message: row.error_message,
    }));
  }

  /**
   * Get error summary
   */
  getErrorSummary(startDate?: number, endDate?: number): Array<{ operation: string; count: number; last_error: string }> {
    const start = startDate || 0;
    const end = endDate || Date.now();

    return this.db.prepare(`
      SELECT
        operation,
        COUNT(*) as count,
        MAX(error_message) as last_error
      FROM analytics_events
      WHERE status = 'failure'
        AND timestamp BETWEEN ? AND ?
      GROUP BY operation
      ORDER BY count DESC
      LIMIT 20
    `).all(start, end) as Array<{ operation: string; count: number; last_error: string }>;
  }

  /**
   * Clear old analytics data
   */
  clearOldData(olderThanDays = 90): number {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const result = this.db.prepare(`
      DELETE FROM analytics_events
      WHERE timestamp < ?
    `).run(cutoff);

    return result.changes;
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

/**
 * Cost Tracker
 * Tracks API usage costs across all providers
 */
export class CostTracker {
  private db: Database.Database;
  private provider: string;

  constructor(provider: string) {
    const dbPath = path.join(os.homedir(), 'ContentForge', 'costs.db');
    this.db = new Database(dbPath);
    this.provider = provider;
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        operation TEXT,
        cost REAL NOT NULL,
        metadata TEXT,
        timestamp INTEGER NOT NULL
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_costs_provider
      ON api_costs(provider);

      CREATE INDEX IF NOT EXISTS idx_costs_timestamp
      ON api_costs(timestamp DESC);
    `);
  }

  /**
   * Add a cost entry
   */
  addCost(cost: number, operation?: string, metadata?: any): void {
    this.db.prepare(`
      INSERT INTO api_costs (provider, operation, cost, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      this.provider,
      operation || null,
      cost,
      metadata ? JSON.stringify(metadata) : null,
      Date.now()
    );
  }

  /**
   * Get cost statistics
   */
  getStats(): {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byOperation: Record<string, number>;
  } {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekStart = now - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    // Total cost
    const totalRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs WHERE provider = ?
    `).get(this.provider) as any;
    const total = totalRow?.total || 0;

    // Today
    const todayRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, todayStart) as any;
    const today = todayRow?.total || 0;

    // This week
    const weekRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, weekStart) as any;
    const thisWeek = weekRow?.total || 0;

    // This month
    const monthRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, monthStart) as any;
    const thisMonth = monthRow?.total || 0;

    // By operation
    const operations = this.db.prepare(`
      SELECT operation, SUM(cost) as total
      FROM api_costs
      WHERE provider = ? AND operation IS NOT NULL
      GROUP BY operation
    `).all(this.provider) as any[];

    const byOperation: Record<string, number> = {};
    operations.forEach(row => {
      byOperation[row.operation] = row.total;
    });

    return {
      total,
      today,
      thisWeek,
      thisMonth,
      byOperation,
    };
  }

  /**
   * Get detailed cost history
   */
  getHistory(limit: number = 100): Array<{
    operation: string | null;
    cost: number;
    timestamp: number;
    metadata?: any;
  }> {
    const rows = this.db.prepare(`
      SELECT operation, cost, metadata, timestamp
      FROM api_costs
      WHERE provider = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(this.provider, limit) as any[];

    return rows.map(row => ({
      operation: row.operation,
      cost: row.cost,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  /**
   * Get all providers' costs
   */
  static getAllProviderCosts(db?: Database.Database): Record<string, number> {
    const database = db || new Database(path.join(os.homedir(), 'ContentForge', 'costs.db'));

    const rows = database.prepare(`
      SELECT provider, SUM(cost) as total
      FROM api_costs
      GROUP BY provider
    `).all() as any[];

    const costs: Record<string, number> = {};
    rows.forEach(row => {
      costs[row.provider] = row.total;
    });

    return costs;
  }

  close() {
    this.db.close();
  }
}

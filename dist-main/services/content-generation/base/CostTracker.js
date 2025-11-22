"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostTracker = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
/**
 * Cost Tracker
 * Tracks API usage costs across all providers
 */
class CostTracker {
    constructor(provider) {
        const dbPath = path_1.default.join(os_1.default.homedir(), 'ContentForge', 'costs.db');
        this.db = new better_sqlite3_1.default(dbPath);
        this.provider = provider;
        this.initDatabase();
    }
    initDatabase() {
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
    addCost(cost, operation, metadata) {
        this.db.prepare(`
      INSERT INTO api_costs (provider, operation, cost, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(this.provider, operation || null, cost, metadata ? JSON.stringify(metadata) : null, Date.now());
    }
    /**
     * Get cost statistics
     */
    getStats() {
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const weekStart = now - 7 * 24 * 60 * 60 * 1000;
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        // Total cost
        const totalRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs WHERE provider = ?
    `).get(this.provider);
        const total = totalRow?.total || 0;
        // Today
        const todayRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, todayStart);
        const today = todayRow?.total || 0;
        // This week
        const weekRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, weekStart);
        const thisWeek = weekRow?.total || 0;
        // This month
        const monthRow = this.db.prepare(`
      SELECT SUM(cost) as total FROM api_costs
      WHERE provider = ? AND timestamp >= ?
    `).get(this.provider, monthStart);
        const thisMonth = monthRow?.total || 0;
        // By operation
        const operations = this.db.prepare(`
      SELECT operation, SUM(cost) as total
      FROM api_costs
      WHERE provider = ? AND operation IS NOT NULL
      GROUP BY operation
    `).all(this.provider);
        const byOperation = {};
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
    getHistory(limit = 100) {
        const rows = this.db.prepare(`
      SELECT operation, cost, metadata, timestamp
      FROM api_costs
      WHERE provider = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(this.provider, limit);
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
    static getAllProviderCosts(db) {
        const database = db || new better_sqlite3_1.default(path_1.default.join(os_1.default.homedir(), 'ContentForge', 'costs.db'));
        const rows = database.prepare(`
      SELECT provider, SUM(cost) as total
      FROM api_costs
      GROUP BY provider
    `).all();
        const costs = {};
        rows.forEach(row => {
            costs[row.provider] = row.total;
        });
        return costs;
    }
    close() {
        this.db.close();
    }
}
exports.CostTracker = CostTracker;
//# sourceMappingURL=CostTracker.js.map
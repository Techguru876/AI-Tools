"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const events_1 = require("events");
class SchedulingService extends events_1.EventEmitter {
    constructor(dbPath) {
        super();
        this.checkInterval = null;
        this.runningJobs = new Map();
        const defaultPath = path_1.default.join(electron_1.app.getPath('userData'), 'scheduling.db');
        this.db = new better_sqlite3_1.default(dbPath || defaultPath);
        this.initializeDatabase();
    }
    /**
     * Initialize database schema
     */
    initializeDatabase() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        job_type TEXT NOT NULL,
        schedule_type TEXT NOT NULL,
        scheduled_time INTEGER NOT NULL,
        recurrence_config TEXT,
        job_config TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        enabled INTEGER NOT NULL DEFAULT 1,
        last_run INTEGER,
        next_run INTEGER,
        run_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        last_error TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      CREATE TABLE IF NOT EXISTS job_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        status TEXT NOT NULL,
        result TEXT,
        error_message TEXT,
        duration_ms INTEGER,
        FOREIGN KEY (job_id) REFERENCES scheduled_jobs(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_jobs_next_run ON scheduled_jobs(next_run);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON scheduled_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_executions_job_id ON job_executions(job_id);
    `);
        console.log('✓ Scheduling database initialized');
    }
    /**
     * Create a new scheduled job
     */
    createJob(job) {
        const next_run = this.calculateNextRun(job);
        const stmt = this.db.prepare(`
      INSERT INTO scheduled_jobs (
        name, description, job_type, schedule_type, scheduled_time,
        recurrence_config, job_config, enabled, next_run
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(job.name, job.description || null, job.job_type, job.schedule_type, job.scheduled_time, job.recurrence_config ? JSON.stringify(job.recurrence_config) : null, JSON.stringify(job.job_config), job.enabled ? 1 : 0, next_run);
        return result.lastInsertRowid;
    }
    /**
     * Calculate next run time for a job
     */
    calculateNextRun(job) {
        const now = Date.now();
        if (job.schedule_type === 'once') {
            return job.scheduled_time;
        }
        const config = job.recurrence_config || {};
        const date = new Date();
        if (job.schedule_type === 'daily') {
            // scheduled_time is time of day (e.g., 8:00 AM = 8 * 60 * 60 * 1000)
            const targetTime = job.scheduled_time;
            const todayAtTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() + targetTime;
            if (todayAtTarget > now) {
                return todayAtTarget;
            }
            else {
                // Schedule for tomorrow
                return todayAtTarget + (24 * 60 * 60 * 1000);
            }
        }
        if (job.schedule_type === 'weekly') {
            const targetDay = config.day_of_week || 0; // Default to Sunday
            const targetTime = job.scheduled_time;
            const currentDay = date.getDay();
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget < 0) {
                daysUntilTarget += 7;
            }
            else if (daysUntilTarget === 0) {
                // Check if we've passed the target time today
                const todayAtTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() + targetTime;
                if (todayAtTarget <= now) {
                    daysUntilTarget = 7;
                }
            }
            const nextRunDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysUntilTarget);
            return nextRunDate.getTime() + targetTime;
        }
        if (job.schedule_type === 'monthly') {
            const targetDay = config.day_of_month || 1;
            const targetTime = job.scheduled_time;
            let targetMonth = date.getMonth();
            let targetYear = date.getFullYear();
            // If we've passed the target day this month, schedule for next month
            if (date.getDate() > targetDay) {
                targetMonth++;
                if (targetMonth > 11) {
                    targetMonth = 0;
                    targetYear++;
                }
            }
            else if (date.getDate() === targetDay) {
                // Check if we've passed the target time today
                const todayAtTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() + targetTime;
                if (todayAtTarget <= now) {
                    targetMonth++;
                    if (targetMonth > 11) {
                        targetMonth = 0;
                        targetYear++;
                    }
                }
            }
            const nextRunDate = new Date(targetYear, targetMonth, targetDay);
            return nextRunDate.getTime() + targetTime;
        }
        return now;
    }
    /**
     * Update a scheduled job
     */
    updateJob(id, updates) {
        const fields = [];
        const values = [];
        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.scheduled_time !== undefined) {
            fields.push('scheduled_time = ?');
            values.push(updates.scheduled_time);
        }
        if (updates.recurrence_config !== undefined) {
            fields.push('recurrence_config = ?');
            values.push(JSON.stringify(updates.recurrence_config));
        }
        if (updates.job_config !== undefined) {
            fields.push('job_config = ?');
            values.push(JSON.stringify(updates.job_config));
        }
        if (updates.enabled !== undefined) {
            fields.push('enabled = ?');
            values.push(updates.enabled ? 1 : 0);
        }
        if (fields.length === 0) {
            return false;
        }
        fields.push('updated_at = ?');
        values.push(Date.now());
        values.push(id);
        const stmt = this.db.prepare(`
      UPDATE scheduled_jobs
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
        const result = stmt.run(...values);
        // Recalculate next_run if schedule changed
        if (updates.scheduled_time !== undefined || updates.recurrence_config !== undefined) {
            const job = this.getJob(id);
            if (job) {
                const next_run = this.calculateNextRun(job);
                this.db.prepare('UPDATE scheduled_jobs SET next_run = ? WHERE id = ?').run(next_run, id);
            }
        }
        return result.changes > 0;
    }
    /**
     * Delete a scheduled job
     */
    deleteJob(id) {
        const result = this.db.prepare('DELETE FROM scheduled_jobs WHERE id = ?').run(id);
        return result.changes > 0;
    }
    /**
     * Get a scheduled job by ID
     */
    getJob(id) {
        const row = this.db.prepare('SELECT * FROM scheduled_jobs WHERE id = ?').get(id);
        if (!row)
            return null;
        return this.deserializeJob(row);
    }
    /**
     * Get all scheduled jobs
     */
    getAllJobs(filter) {
        let query = 'SELECT * FROM scheduled_jobs';
        const conditions = [];
        const params = [];
        if (filter?.enabled !== undefined) {
            conditions.push('enabled = ?');
            params.push(filter.enabled ? 1 : 0);
        }
        if (filter?.status) {
            conditions.push('status = ?');
            params.push(filter.status);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY next_run ASC';
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => this.deserializeJob(row));
    }
    /**
     * Get jobs that are due to run
     */
    getDueJobs() {
        const now = Date.now();
        const rows = this.db.prepare(`
      SELECT * FROM scheduled_jobs
      WHERE enabled = 1
        AND status != 'running'
        AND next_run <= ?
      ORDER BY next_run ASC
    `).all(now);
        return rows.map(row => this.deserializeJob(row));
    }
    /**
     * Deserialize job from database row
     */
    deserializeJob(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            job_type: row.job_type,
            schedule_type: row.schedule_type,
            scheduled_time: row.scheduled_time,
            recurrence_config: row.recurrence_config ? JSON.parse(row.recurrence_config) : undefined,
            job_config: JSON.parse(row.job_config),
            status: row.status,
            enabled: row.enabled === 1,
            last_run: row.last_run,
            next_run: row.next_run,
            run_count: row.run_count,
            error_count: row.error_count,
            last_error: row.last_error,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    /**
     * Start the scheduling service
     */
    start(intervalMs = 60000) {
        if (this.checkInterval) {
            return; // Already running
        }
        console.log('✓ Scheduling service started (check interval:', intervalMs, 'ms)');
        // Check immediately
        this.checkAndRunJobs();
        // Then check periodically
        this.checkInterval = setInterval(() => {
            this.checkAndRunJobs();
        }, intervalMs);
    }
    /**
     * Stop the scheduling service
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('✓ Scheduling service stopped');
        }
    }
    /**
     * Check for due jobs and run them
     */
    async checkAndRunJobs() {
        const dueJobs = this.getDueJobs();
        for (const job of dueJobs) {
            if (!this.runningJobs.has(job.id)) {
                this.runJob(job);
            }
        }
    }
    /**
     * Run a specific job
     */
    async runJob(job) {
        if (!job.id)
            return;
        this.runningJobs.set(job.id, true);
        // Update job status
        this.db.prepare(`
      UPDATE scheduled_jobs
      SET status = 'running', last_run = ?
      WHERE id = ?
    `).run(Date.now(), job.id);
        // Create execution record
        const execId = this.db.prepare(`
      INSERT INTO job_executions (job_id, started_at, status)
      VALUES (?, ?, 'running')
    `).run(job.id, Date.now()).lastInsertRowid;
        const startTime = Date.now();
        try {
            // Emit event for job execution
            this.emit('job:start', job);
            // Simulate job execution (in real implementation, this would call the actual service)
            // For now, we'll just emit an event and let the main process handle it
            this.emit('job:execute', job);
            // Mark as completed
            const duration = Date.now() - startTime;
            this.db.prepare(`
        UPDATE job_executions
        SET status = 'completed', completed_at = ?, duration_ms = ?
        WHERE id = ?
      `).run(Date.now(), duration, execId);
            // Update job
            const next_run = job.schedule_type === 'once' ? null : this.calculateNextRun(job);
            this.db.prepare(`
        UPDATE scheduled_jobs
        SET status = ?, run_count = run_count + 1, next_run = ?, updated_at = ?
        WHERE id = ?
      `).run(job.schedule_type === 'once' ? 'completed' : 'pending', next_run, Date.now(), job.id);
            this.emit('job:complete', job);
        }
        catch (error) {
            // Mark as failed
            const duration = Date.now() - startTime;
            this.db.prepare(`
        UPDATE job_executions
        SET status = 'failed', completed_at = ?, duration_ms = ?, error_message = ?
        WHERE id = ?
      `).run(Date.now(), duration, error.message, execId);
            // Update job
            this.db.prepare(`
        UPDATE scheduled_jobs
        SET status = 'failed', error_count = error_count + 1, last_error = ?, updated_at = ?
        WHERE id = ?
      `).run(error.message, Date.now(), job.id);
            this.emit('job:error', job, error);
        }
        finally {
            this.runningJobs.delete(job.id);
        }
    }
    /**
     * Get job execution history
     */
    getJobExecutions(jobId, limit = 50) {
        const rows = this.db.prepare(`
      SELECT * FROM job_executions
      WHERE job_id = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(jobId, limit);
        return rows.map(row => ({
            id: row.id,
            job_id: row.job_id,
            started_at: row.started_at,
            completed_at: row.completed_at,
            status: row.status,
            result: row.result ? JSON.parse(row.result) : undefined,
            error_message: row.error_message,
            duration_ms: row.duration_ms,
        }));
    }
    /**
     * Close database connection
     */
    close() {
        this.stop();
        this.db.close();
    }
}
exports.SchedulingService = SchedulingService;
//# sourceMappingURL=SchedulingService.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = void 0;
const events_1 = require("events");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
const TemplateEngine_1 = require("../templates/TemplateEngine");
const FFmpegCompositor_1 = require("../FFmpegCompositor");
/**
 * Batch Processor
 *
 * Manages a queue of video rendering jobs
 * Supports parallel processing with configurable concurrency
 * Emits events for progress tracking
 *
 * Events:
 * - job-queued: (job: BatchJob) => void
 * - job-started: (job: BatchJob) => void
 * - job-progress: (jobId: string, progress: number, stage: string) => void
 * - job-completed: (job: BatchJob) => void
 * - job-failed: (job: BatchJob, error: Error) => void
 * - queue-empty: () => void
 */
class BatchProcessor extends events_1.EventEmitter {
    constructor(maxConcurrent = 2) {
        super();
        this.appDataPath = path_1.default.join(os_1.default.homedir(), 'ContentForge');
        this.db = new better_sqlite3_1.default(path_1.default.join(this.appDataPath, 'contentforge.db'));
        this.templateEngine = new TemplateEngine_1.TemplateEngine();
        this.compositor = new FFmpegCompositor_1.FFmpegCompositor();
        this.maxConcurrent = maxConcurrent;
        this.currentJobs = new Set();
        this.processingInterval = null;
        this.initDatabase();
    }
    initDatabase() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS batch_jobs (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        variables TEXT NOT NULL,
        output_path TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        error_message TEXT,
        created_at INTEGER NOT NULL,
        started_at INTEGER,
        completed_at INTEGER,
        estimated_duration INTEGER,
        metadata TEXT
      )
    `);
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status
      ON batch_jobs(status);

      CREATE INDEX IF NOT EXISTS idx_jobs_created
      ON batch_jobs(created_at DESC);
    `);
    }
    /**
     * Add a single job to the queue
     */
    addJob(job) {
        const jobId = (0, uuid_1.v4)();
        const batchJob = {
            id: jobId,
            template_id: job.templateId,
            variables: job.variables,
            output_path: job.outputPath,
            status: 'queued',
            progress: 0,
            created_at: Date.now(),
            metadata: job.metadata,
        };
        this.saveJob(batchJob);
        this.emit('job-queued', batchJob);
        console.log(`✓ Job queued: ${jobId}`);
        // Start processing if not already running
        this.startProcessing();
        return jobId;
    }
    /**
     * Add multiple jobs to the queue
     */
    addBatchJobs(jobs) {
        const jobIds = [];
        for (const job of jobs) {
            const jobId = this.addJob(job);
            jobIds.push(jobId);
        }
        console.log(`✓ Added ${jobs.length} jobs to batch queue`);
        return jobIds;
    }
    /**
     * Get job by ID
     */
    getJob(jobId) {
        const row = this.db.prepare('SELECT * FROM batch_jobs WHERE id = ?').get(jobId);
        if (!row)
            return null;
        return {
            id: row.id,
            template_id: row.template_id,
            variables: JSON.parse(row.variables),
            output_path: row.output_path,
            status: row.status,
            progress: row.progress,
            error_message: row.error_message,
            created_at: row.created_at,
            started_at: row.started_at,
            completed_at: row.completed_at,
            estimated_duration: row.estimated_duration,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
    }
    /**
     * List all jobs
     */
    listJobs(status, limit) {
        let query = 'SELECT * FROM batch_jobs';
        const params = [];
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        query += ' ORDER BY created_at DESC';
        if (limit) {
            query += ' LIMIT ?';
            params.push(limit);
        }
        const rows = this.db.prepare(query).all(...params);
        return rows.map(row => ({
            id: row.id,
            template_id: row.template_id,
            variables: JSON.parse(row.variables),
            output_path: row.output_path,
            status: row.status,
            progress: row.progress,
            error_message: row.error_message,
            created_at: row.created_at,
            started_at: row.started_at,
            completed_at: row.completed_at,
            estimated_duration: row.estimated_duration,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        }));
    }
    /**
     * Cancel a job
     */
    cancelJob(jobId) {
        const job = this.getJob(jobId);
        if (!job)
            return false;
        if (job.status === 'completed' || job.status === 'failed') {
            return false; // Cannot cancel finished jobs
        }
        this.updateJobStatus(jobId, 'cancelled');
        this.currentJobs.delete(jobId);
        console.log(`✓ Job cancelled: ${jobId}`);
        return true;
    }
    /**
     * Clear all completed/failed/cancelled jobs
     */
    clearFinishedJobs() {
        const result = this.db.prepare("DELETE FROM batch_jobs WHERE status IN ('completed', 'failed', 'cancelled')").run();
        console.log(`✓ Cleared ${result.changes} finished jobs`);
        return result.changes;
    }
    /**
     * Get batch statistics
     */
    getStats() {
        const total = this.db.prepare('SELECT COUNT(*) as count FROM batch_jobs').get().count;
        const byStatus = this.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM batch_jobs
      GROUP BY status
    `).all();
        const stats = {
            total,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            averageRenderTime: 0,
            totalRenderTime: 0,
        };
        byStatus.forEach(row => {
            const status = row.status;
            if (status in stats) {
                stats[status] = row.count;
            }
        });
        // Calculate average render time for completed jobs
        const renderTimes = this.db.prepare(`
      SELECT (completed_at - started_at) as render_time
      FROM batch_jobs
      WHERE status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL
    `).all();
        if (renderTimes.length > 0) {
            stats.totalRenderTime = renderTimes.reduce((sum, row) => sum + row.render_time, 0);
            stats.averageRenderTime = stats.totalRenderTime / renderTimes.length;
        }
        return stats;
    }
    /**
     * Start processing queue
     */
    startProcessing() {
        if (this.processingInterval)
            return; // Already running
        console.log('▶ Starting batch processor...');
        this.processingInterval = setInterval(() => {
            this.processNextJobs();
        }, 2000); // Check every 2 seconds
        // Process immediately
        this.processNextJobs();
    }
    /**
     * Stop processing queue
     */
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            console.log('⏸ Batch processor stopped');
        }
    }
    /**
     * Process next available jobs
     */
    async processNextJobs() {
        // Check how many slots are available
        const availableSlots = this.maxConcurrent - this.currentJobs.size;
        if (availableSlots <= 0)
            return; // All slots occupied
        // Get next pending jobs
        const nextJobs = this.db
            .prepare('SELECT * FROM batch_jobs WHERE status = ? ORDER BY created_at ASC LIMIT ?')
            .all('queued', availableSlots);
        for (const jobRow of nextJobs) {
            const job = {
                id: jobRow.id,
                template_id: jobRow.template_id,
                variables: JSON.parse(jobRow.variables),
                output_path: jobRow.output_path,
                status: jobRow.status,
                progress: jobRow.progress,
                created_at: jobRow.created_at,
                metadata: jobRow.metadata ? JSON.parse(jobRow.metadata) : undefined,
            };
            this.processJob(job).catch(err => {
                console.error(`Error processing job ${job.id}:`, err);
            });
        }
    }
    /**
     * Process a single job
     */
    async processJob(job) {
        this.currentJobs.add(job.id);
        try {
            // Update status to processing
            this.updateJobStatus(job.id, 'processing');
            this.updateJob(job.id, { started_at: Date.now() });
            const updatedJob = this.getJob(job.id);
            this.emit('job-started', updatedJob);
            console.log(`▶ Processing job: ${job.id}`);
            // Get template
            const template = this.templateEngine.getTemplate(job.template_id);
            if (!template) {
                throw new Error(`Template not found: ${job.template_id}`);
            }
            // Resolve variables
            const resolved = this.templateEngine.resolveVariables(template, job.variables);
            // Estimate duration
            const estimate = this.compositor.estimateRenderTime(resolved);
            this.updateJob(job.id, { estimated_duration: Math.round(estimate.estimatedSeconds) });
            // Render video
            await this.compositor.renderTemplate(resolved, job.output_path, (progress, stage) => {
                this.updateJob(job.id, { progress });
                this.emit('job-progress', job.id, progress, stage);
            });
            // Mark as completed
            this.updateJobStatus(job.id, 'completed');
            this.updateJob(job.id, {
                completed_at: Date.now(),
                progress: 100,
            });
            const completedJob = this.getJob(job.id);
            this.emit('job-completed', completedJob);
            console.log(`✓ Job completed: ${job.id}`);
        }
        catch (error) {
            console.error(`✗ Job failed: ${job.id}`, error);
            this.updateJobStatus(job.id, 'failed');
            this.updateJob(job.id, {
                error_message: error.message,
                completed_at: Date.now(),
            });
            const failedJob = this.getJob(job.id);
            this.emit('job-failed', failedJob, error);
        }
        finally {
            this.currentJobs.delete(job.id);
            // Check if queue is empty
            const pendingCount = this.db.prepare("SELECT COUNT(*) as count FROM batch_jobs WHERE status IN ('queued', 'processing')").get().count;
            if (pendingCount === 0) {
                this.emit('queue-empty');
                console.log('✓ Batch queue empty');
            }
        }
    }
    /**
     * Save job to database
     */
    saveJob(job) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO batch_jobs
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(job.id, job.template_id, JSON.stringify(job.variables), job.output_path, job.status, job.progress, job.error_message || null, job.created_at, job.started_at || null, job.completed_at || null, job.estimated_duration || null, job.metadata ? JSON.stringify(job.metadata) : null);
    }
    /**
     * Update job status
     */
    updateJobStatus(jobId, status) {
        this.db.prepare('UPDATE batch_jobs SET status = ? WHERE id = ?').run(status, jobId);
    }
    /**
     * Update job fields
     */
    updateJob(jobId, updates) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        if (fields.length === 0)
            return;
        values.push(jobId);
        this.db.prepare(`UPDATE batch_jobs SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
    /**
     * Cleanup and close
     */
    close() {
        this.stopProcessing();
        this.db.close();
        this.templateEngine.close();
    }
}
exports.BatchProcessor = BatchProcessor;
//# sourceMappingURL=BatchProcessor.js.map
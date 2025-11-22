import { EventEmitter } from 'events';
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { TemplateEngine, ResolvedTemplate } from '../templates/TemplateEngine';
import { FFmpegCompositor } from '../FFmpegCompositor';

/**
 * Batch Job Status
 */
export type JobStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Batch Job Definition
 */
export interface BatchJob {
  id: string;
  template_id: string;
  variables: Record<string, any>;
  output_path: string;
  status: JobStatus;
  progress: number;
  error_message?: string;
  created_at: number;
  started_at?: number;
  completed_at?: number;
  estimated_duration?: number;
  metadata?: {
    youtube_upload?: boolean;
    youtube_metadata?: any;
    priority?: number;
  };
}

/**
 * Batch Statistics
 */
export interface BatchStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

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
export class BatchProcessor extends EventEmitter {
  private db: Database.Database;
  private templateEngine: TemplateEngine;
  private compositor: FFmpegCompositor;
  private appDataPath: string;
  private maxConcurrent: number;
  private currentJobs: Set<string>;
  private processingInterval: NodeJS.Timeout | null;

  constructor(maxConcurrent: number = 2) {
    super();
    this.appDataPath = path.join(os.homedir(), 'ContentForge');
    this.db = new Database(path.join(this.appDataPath, 'contentforge.db'));
    this.templateEngine = new TemplateEngine();
    this.compositor = new FFmpegCompositor();
    this.maxConcurrent = maxConcurrent;
    this.currentJobs = new Set();
    this.processingInterval = null;

    this.initDatabase();
  }

  private initDatabase() {
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
  addJob(job: {
    templateId: string;
    variables: Record<string, any>;
    outputPath: string;
    metadata?: any;
  }): string {
    const jobId = uuidv4();

    const batchJob: BatchJob = {
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
  addBatchJobs(jobs: Array<{
    templateId: string;
    variables: Record<string, any>;
    outputPath: string;
    metadata?: any;
  }>): string[] {
    const jobIds: string[] = [];

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
  getJob(jobId: string): BatchJob | null {
    const row = this.db.prepare('SELECT * FROM batch_jobs WHERE id = ?').get(jobId) as any;

    if (!row) return null;

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
  listJobs(status?: JobStatus, limit?: number): BatchJob[] {
    let query = 'SELECT * FROM batch_jobs';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const rows = this.db.prepare(query).all(...params) as any[];

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
  cancelJob(jobId: string): boolean {
    const job = this.getJob(jobId);

    if (!job) return false;

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
  clearFinishedJobs(): number {
    const result = this.db.prepare(
      "DELETE FROM batch_jobs WHERE status IN ('completed', 'failed', 'cancelled')"
    ).run();

    console.log(`✓ Cleared ${result.changes} finished jobs`);
    return result.changes;
  }

  /**
   * Get batch statistics
   */
  getStats(): BatchStats {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM batch_jobs').get() as any).count;

    const byStatus = this.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM batch_jobs
      GROUP BY status
    `).all() as any[];

    const stats: BatchStats = {
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
      const status = row.status as JobStatus;
      if (status in stats) {
        (stats as any)[status] = row.count;
      }
    });

    // Calculate average render time for completed jobs
    const renderTimes = this.db.prepare(`
      SELECT (completed_at - started_at) as render_time
      FROM batch_jobs
      WHERE status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL
    `).all() as any[];

    if (renderTimes.length > 0) {
      stats.totalRenderTime = renderTimes.reduce((sum, row) => sum + row.render_time, 0);
      stats.averageRenderTime = stats.totalRenderTime / renderTimes.length;
    }

    return stats;
  }

  /**
   * Start processing queue
   */
  private startProcessing() {
    if (this.processingInterval) return; // Already running

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
  private async processNextJobs() {
    // Check how many slots are available
    const availableSlots = this.maxConcurrent - this.currentJobs.size;

    if (availableSlots <= 0) return; // All slots occupied

    // Get next pending jobs
    const nextJobs = this.db
      .prepare('SELECT * FROM batch_jobs WHERE status = ? ORDER BY created_at ASC LIMIT ?')
      .all('queued', availableSlots) as any[];

    for (const jobRow of nextJobs) {
      const job: BatchJob = {
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
  private async processJob(job: BatchJob): Promise<void> {
    this.currentJobs.add(job.id);

    try {
      // Update status to processing
      this.updateJobStatus(job.id, 'processing');
      this.updateJob(job.id, { started_at: Date.now() });

      const updatedJob = this.getJob(job.id)!;
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
      await this.compositor.renderTemplate(
        resolved,
        job.output_path,
        (progress, stage) => {
          this.updateJob(job.id, { progress });
          this.emit('job-progress', job.id, progress, stage);
        }
      );

      // Mark as completed
      this.updateJobStatus(job.id, 'completed');
      this.updateJob(job.id, {
        completed_at: Date.now(),
        progress: 100,
      });

      const completedJob = this.getJob(job.id)!;
      this.emit('job-completed', completedJob);

      console.log(`✓ Job completed: ${job.id}`);

    } catch (error: any) {
      console.error(`✗ Job failed: ${job.id}`, error);

      this.updateJobStatus(job.id, 'failed');
      this.updateJob(job.id, {
        error_message: error.message,
        completed_at: Date.now(),
      });

      const failedJob = this.getJob(job.id)!;
      this.emit('job-failed', failedJob, error);

    } finally {
      this.currentJobs.delete(job.id);

      // Check if queue is empty
      const pendingCount = (this.db.prepare(
        "SELECT COUNT(*) as count FROM batch_jobs WHERE status IN ('queued', 'processing')"
      ).get() as any).count;

      if (pendingCount === 0) {
        this.emit('queue-empty');
        console.log('✓ Batch queue empty');
      }
    }
  }

  /**
   * Save job to database
   */
  private saveJob(job: BatchJob) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO batch_jobs
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      job.id,
      job.template_id,
      JSON.stringify(job.variables),
      job.output_path,
      job.status,
      job.progress,
      job.error_message || null,
      job.created_at,
      job.started_at || null,
      job.completed_at || null,
      job.estimated_duration || null,
      job.metadata ? JSON.stringify(job.metadata) : null
    );
  }

  /**
   * Update job status
   */
  private updateJobStatus(jobId: string, status: JobStatus) {
    this.db.prepare('UPDATE batch_jobs SET status = ? WHERE id = ?').run(status, jobId);
  }

  /**
   * Update job fields
   */
  private updateJob(jobId: string, updates: Partial<BatchJob>) {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) return;

    values.push(jobId);

    this.db.prepare(
      `UPDATE batch_jobs SET ${fields.join(', ')} WHERE id = ?`
    ).run(...values);
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

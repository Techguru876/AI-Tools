import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export class ProjectService {
  private db: Database.Database;
  private projectsDir: string;
  private appDataPath: string;

  constructor() {
    // Initialize app data directory
    this.appDataPath = path.join(os.homedir(), 'PhotoVideoPro');
    this.projectsDir = path.join(this.appDataPath, 'projects');

    // Initialize database
    this.db = new Database(path.join(this.appDataPath, 'projects.db'));
    this.initDatabase();
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.appDataPath, { recursive: true });
      await fs.mkdir(this.projectsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        timeline_data TEXT,
        settings TEXT,
        created_at INTEGER NOT NULL,
        modified_at INTEGER NOT NULL,
        last_opened_at INTEGER
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_projects_modified
      ON projects(modified_at DESC)
    `);
  }

  async createProject(name: string): Promise<any> {
    const id = uuidv4();
    const projectPath = path.join(this.projectsDir, `${id}.pvp`);

    const project = {
      id,
      name,
      path: projectPath,
      timeline_data: JSON.stringify({ tracks: [] }),
      settings: JSON.stringify({
        resolution: { width: 1920, height: 1080 },
        framerate: 30,
        audioSampleRate: 48000,
      }),
      created_at: Date.now(),
      modified_at: Date.now(),
      last_opened_at: Date.now(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      project.id,
      project.name,
      project.path,
      project.timeline_data,
      project.settings,
      project.created_at,
      project.modified_at,
      project.last_opened_at
    );

    return project;
  }

  async openProject(projectPath: string): Promise<any> {
    const project = this.db.prepare('SELECT * FROM projects WHERE path = ?').get(projectPath) as any;

    if (!project) {
      throw new Error('Project not found');
    }

    // Update last opened time
    this.db.prepare(`
      UPDATE projects
      SET last_opened_at = ?
      WHERE id = ?
    `).run(Date.now(), project.id);

    return {
      ...project,
      timeline_data: JSON.parse(project.timeline_data),
      settings: JSON.parse(project.settings),
    };
  }

  async saveProject(data: any): Promise<void> {
    if (!data.id) {
      throw new Error('Project ID required');
    }

    this.db.prepare(`
      UPDATE projects
      SET timeline_data = ?, modified_at = ?
      WHERE id = ?
    `).run(JSON.stringify(data.timeline), Date.now(), data.id);
  }

  async listProjects(): Promise<any[]> {
    const projects = this.db.prepare(`
      SELECT * FROM projects
      ORDER BY modified_at DESC
      LIMIT 50
    `).all() as any[];

    return projects.map(project => ({
      ...project,
      timeline_data: JSON.parse(project.timeline_data),
      settings: JSON.parse(project.settings),
    }));
  }

  async deleteProject(projectId: string): Promise<void> {
    const project = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;

    if (project) {
      // Delete project file
      try {
        await fs.unlink(project.path);
      } catch (error) {
        console.error('Error deleting project file:', error);
      }

      // Delete from database
      this.db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    }
  }

  close() {
    this.db.close();
  }
}

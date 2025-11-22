"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uuid_1 = require("uuid");
const os_1 = __importDefault(require("os"));
class ProjectService {
    constructor() {
        // Initialize app data directory
        this.appDataPath = path_1.default.join(os_1.default.homedir(), 'PhotoVideoPro');
        this.projectsDir = path_1.default.join(this.appDataPath, 'projects');
        // Initialize database
        this.db = new better_sqlite3_1.default(path_1.default.join(this.appDataPath, 'projects.db'));
        this.initDatabase();
        this.ensureDirectories();
    }
    async ensureDirectories() {
        try {
            await promises_1.default.mkdir(this.appDataPath, { recursive: true });
            await promises_1.default.mkdir(this.projectsDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating directories:', error);
        }
    }
    initDatabase() {
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
    async createProject(name) {
        const id = (0, uuid_1.v4)();
        const projectPath = path_1.default.join(this.projectsDir, `${id}.pvp`);
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
        stmt.run(project.id, project.name, project.path, project.timeline_data, project.settings, project.created_at, project.modified_at, project.last_opened_at);
        return project;
    }
    async openProject(projectPath) {
        const project = this.db.prepare('SELECT * FROM projects WHERE path = ?').get(projectPath);
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
    async saveProject(data) {
        if (!data.id) {
            throw new Error('Project ID required');
        }
        this.db.prepare(`
      UPDATE projects
      SET timeline_data = ?, modified_at = ?
      WHERE id = ?
    `).run(JSON.stringify(data.timeline), Date.now(), data.id);
    }
    async listProjects() {
        const projects = this.db.prepare(`
      SELECT * FROM projects
      ORDER BY modified_at DESC
      LIMIT 50
    `).all();
        return projects.map(project => ({
            ...project,
            timeline_data: JSON.parse(project.timeline_data),
            settings: JSON.parse(project.settings),
        }));
    }
    async deleteProject(projectId) {
        const project = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
        if (project) {
            // Delete project file
            try {
                await promises_1.default.unlink(project.path);
            }
            catch (error) {
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
exports.ProjectService = ProjectService;
//# sourceMappingURL=project-service.js.map
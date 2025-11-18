/**
 * PROJECT MANAGER MODULE
 *
 * Handles project lifecycle:
 * - Create new projects
 * - Open existing projects
 * - Save projects
 * - Manage project assets
 * - Project templates
 * - Auto-save functionality
 * - Project versioning
 *
 * Projects are saved as JSON files with references to media assets
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectSettings, Timeline, Composition } from '../../shared/types';

export class ProjectManager {
  private currentProject: Project | null;
  private autoSaveInterval: NodeJS.Timeout | null;
  private projectsDir: string;

  constructor() {
    this.currentProject = null;
    this.autoSaveInterval = null;
    this.projectsDir = path.join(process.cwd(), 'projects');

    if (!fs.existsSync(this.projectsDir)) {
      fs.mkdirSync(this.projectsDir, { recursive: true });
    }

    console.log('ProjectManager initialized');
  }

  /**
   * Create a new project
   */
  async createProject(settings: Partial<ProjectSettings>): Promise<Project> {
    console.log('Creating new project');

    const defaultSettings: ProjectSettings = {
      resolution: { width: 1920, height: 1080 },
      frameRate: 30,
      aspectRatio: '16:9',
      colorSpace: 'sRGB',
      bitDepth: 8,
      audioSampleRate: 48000,
      duration: 0,
      ...settings,
    };

    const project: Project = {
      id: uuidv4(),
      name: 'Untitled Project',
      type: 'hybrid',
      createdAt: new Date(),
      modifiedAt: new Date(),
      settings: defaultSettings,
      assets: [],
      metadata: {
        author: '',
        description: '',
        tags: [],
        customFields: {},
      },
    };

    // Initialize timeline for video projects
    if (project.type === 'video' || project.type === 'hybrid') {
      project.timeline = this.createDefaultTimeline();
    }

    // Initialize composition for image projects
    if (project.type === 'image' || project.type === 'hybrid') {
      project.composition = this.createDefaultComposition(
        defaultSettings.resolution.width,
        defaultSettings.resolution.height
      );
    }

    this.currentProject = project;
    this.startAutoSave();

    return project;
  }

  /**
   * Create default timeline structure
   */
  private createDefaultTimeline(): Timeline {
    return {
      id: uuidv4(),
      tracks: [
        {
          id: uuidv4(),
          name: 'Video 1',
          type: 'video',
          clips: [],
          locked: false,
          muted: false,
          solo: false,
          height: 60,
          effects: [],
        },
        {
          id: uuidv4(),
          name: 'Audio 1',
          type: 'audio',
          clips: [],
          locked: false,
          muted: false,
          solo: false,
          height: 60,
          effects: [],
        },
      ],
      duration: 0,
      playhead: 0,
      markers: [],
      zoomLevel: 1,
    };
  }

  /**
   * Create default composition structure
   */
  private createDefaultComposition(width: number, height: number): Composition {
    return {
      id: uuidv4(),
      name: 'Main Composition',
      width,
      height,
      layers: [
        {
          id: uuidv4(),
          name: 'Background',
          type: 'image',
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: 'normal',
          transform: {
            position: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            rotation: 0,
            opacity: 1,
          },
          effects: [],
        },
      ],
      activeLayerId: null,
      guides: [],
      rulers: true,
      grid: {
        enabled: false,
        snapToGrid: false,
        gridSize: 10,
        subdivisions: 4,
        color: { r: 128, g: 128, b: 128, a: 0.5 },
      },
    };
  }

  /**
   * Open an existing project from file
   */
  async openProject(filePath: string): Promise<Project> {
    console.log(`Opening project: ${filePath}`);

    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      const project: Project = JSON.parse(data);

      // Convert date strings back to Date objects
      project.createdAt = new Date(project.createdAt);
      project.modifiedAt = new Date(project.modifiedAt);

      // Validate project structure
      this.validateProject(project);

      // Verify that asset files still exist
      await this.verifyAssets(project);

      this.currentProject = project;
      this.startAutoSave();

      console.log(`Project loaded: ${project.name}`);
      return project;
    } catch (error) {
      console.error('Error opening project:', error);
      throw new Error('Failed to open project file');
    }
  }

  /**
   * Validate project structure
   */
  private validateProject(project: Project): void {
    if (!project.id || !project.name || !project.type) {
      throw new Error('Invalid project structure');
    }

    if (!project.settings || !project.assets || !project.metadata) {
      throw new Error('Project is missing required fields');
    }

    // Validate project type
    if (!['video', 'image', 'hybrid'].includes(project.type)) {
      throw new Error('Invalid project type');
    }

    console.log('Project validation passed');
  }

  /**
   * Verify that asset files exist
   */
  private async verifyAssets(project: Project): Promise<void> {
    console.log(`Verifying ${project.assets.length} assets...`);

    const missingAssets: string[] = [];

    for (const asset of project.assets) {
      try {
        await fs.promises.access(asset.filePath);
      } catch {
        missingAssets.push(asset.name);
        console.warn(`Asset not found: ${asset.filePath}`);
      }
    }

    if (missingAssets.length > 0) {
      console.warn(`${missingAssets.length} assets are missing`);
      // Could prompt user to relocate missing files
    }
  }

  /**
   * Save project to file
   */
  async saveProject(project: Project, filePath?: string): Promise<string> {
    console.log('Saving project...');

    project.modifiedAt = new Date();

    // Default save path if not provided
    if (!filePath) {
      filePath = path.join(this.projectsDir, `${project.name}.pvep`);
    }

    try {
      const data = JSON.stringify(project, null, 2);
      await fs.promises.writeFile(filePath, data, 'utf-8');

      console.log(`Project saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Error saving project:', error);
      throw new Error('Failed to save project');
    }
  }

  /**
   * Save project with a new path (Save As)
   */
  async saveProjectAs(project: Project, filePath: string): Promise<string> {
    console.log(`Saving project as: ${filePath}`);

    // Update project name based on file name
    project.name = path.basename(filePath, path.extname(filePath));

    return await this.saveProject(project, filePath);
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(interval: number = 300000): void {
    // Default: auto-save every 5 minutes
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(async () => {
      if (this.currentProject) {
        console.log('Auto-saving project...');
        await this.autoSaveProject(this.currentProject);
      }
    }, interval);

    console.log(`Auto-save enabled (interval: ${interval}ms)`);
  }

  /**
   * Auto-save project to temp location
   */
  private async autoSaveProject(project: Project): Promise<void> {
    const autoSavePath = path.join(
      this.projectsDir,
      'autosave',
      `${project.id}_autosave.pvep`
    );

    const autoSaveDir = path.dirname(autoSavePath);
    if (!fs.existsSync(autoSaveDir)) {
      fs.mkdirSync(autoSaveDir, { recursive: true });
    }

    try {
      await this.saveProject(project, autoSavePath);
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('Auto-save disabled');
    }
  }

  /**
   * Get current project
   */
  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  /**
   * Close current project
   */
  closeProject(): void {
    console.log('Closing current project');
    this.stopAutoSave();
    this.currentProject = null;
  }

  /**
   * Export project metadata for sharing
   */
  async exportMetadata(project: Project, outputPath: string): Promise<void> {
    const metadata = {
      id: project.id,
      name: project.name,
      type: project.type,
      settings: project.settings,
      metadata: project.metadata,
      createdAt: project.createdAt,
      modifiedAt: project.modifiedAt,
      assetCount: project.assets.length,
    };

    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    console.log(`Project metadata exported to ${outputPath}`);
  }

  /**
   * Create project from template
   */
  async createFromTemplate(templateId: string, name: string): Promise<Project> {
    console.log(`Creating project from template: ${templateId}`);

    // Load template
    const templatePath = path.join(this.projectsDir, 'templates', `${templateId}.pvep`);

    if (!fs.existsSync(templatePath)) {
      throw new Error('Template not found');
    }

    const template = await this.openProject(templatePath);

    // Create new project based on template
    const project: Project = {
      ...template,
      id: uuidv4(),
      name,
      createdAt: new Date(),
      modifiedAt: new Date(),
      assets: [], // Start with no assets
    };

    this.currentProject = project;
    return project;
  }

  /**
   * Get list of recent projects
   */
  async getRecentProjects(limit: number = 10): Promise<Array<{ name: string; path: string; modifiedAt: Date }>> {
    console.log('Getting recent projects...');

    const recentProjects: Array<{ name: string; path: string; modifiedAt: Date }> = [];

    try {
      const files = await fs.promises.readdir(this.projectsDir);

      for (const file of files) {
        if (file.endsWith('.pvep')) {
          const filePath = path.join(this.projectsDir, file);
          const stats = await fs.promises.stat(filePath);

          recentProjects.push({
            name: path.basename(file, '.pvep'),
            path: filePath,
            modifiedAt: stats.mtime,
          });
        }
      }

      // Sort by modification time
      recentProjects.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

      return recentProjects.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent projects:', error);
      return [];
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('Cleaning up project manager resources');
    this.stopAutoSave();
    this.currentProject = null;
  }
}

import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

/**
 * Template Layer Types
 */
export interface TemplateLayer {
  id: string;
  type: 'video' | 'image' | 'audio' | 'text' | 'shape' | 'effect';
  name: string;
  start_time: number;
  duration: number;
  properties: Record<string, any>;
  z_index: number;
}

/**
 * Template Variable Definition
 */
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'image' | 'video' | 'audio' | 'color';
  required: boolean;
  default?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * Template Definition
 */
export interface Template {
  id: string;
  name: string;
  niche: 'lofi' | 'horror' | 'explainer' | 'motivational' | 'news' | 'facts' | 'custom';
  description: string;
  duration: number;
  resolution: [number, number];
  framerate: number;
  layers: TemplateLayer[];
  variables: Record<string, TemplateVariable>;
  metadata: {
    created_at: number;
    modified_at: number;
    author?: string;
    tags?: string[];
    preview_url?: string;
  };
}

/**
 * Resolved Template (variables replaced)
 */
export interface ResolvedTemplate extends Omit<Template, 'variables'> {
  resolved_variables: Record<string, any>;
}

/**
 * Template Engine
 * Core system for managing video templates with variable substitution
 */
export class TemplateEngine {
  private db: Database.Database;
  private appDataPath: string;
  private templatesDir: string;

  constructor() {
    this.appDataPath = path.join(os.homedir(), 'ContentForge');
    this.templatesDir = path.join(this.appDataPath, 'templates');

    // Ensure directories exist BEFORE creating database (synchronously)
    this.ensureDirectoriesSync();

    this.db = new Database(path.join(this.appDataPath, 'contentforge.db'));

    this.initDatabase();
  }

  private ensureDirectoriesSync() {
    try {
      const fsSync = require('fs');
      if (!fsSync.existsSync(this.appDataPath)) {
        fsSync.mkdirSync(this.appDataPath, { recursive: true });
      }
      if (!fsSync.existsSync(this.templatesDir)) {
        fsSync.mkdirSync(this.templatesDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating templates directory:', error);
    }
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        niche TEXT NOT NULL,
        description TEXT,
        duration REAL NOT NULL,
        resolution TEXT NOT NULL,
        framerate INTEGER NOT NULL,
        layers TEXT NOT NULL,
        variables TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        modified_at INTEGER NOT NULL
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_templates_niche
      ON templates(niche);

      CREATE INDEX IF NOT EXISTS idx_templates_created
      ON templates(created_at DESC);
    `);
  }

  /**
   * Save template to database
   */
  saveTemplate(template: Template): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO templates
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      template.id,
      template.name,
      template.niche,
      template.description,
      template.duration,
      JSON.stringify(template.resolution),
      template.framerate,
      JSON.stringify(template.layers),
      JSON.stringify(template.variables),
      JSON.stringify(template.metadata),
      template.metadata.created_at,
      template.metadata.modified_at
    );
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): Template | null {
    const row = this.db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      niche: row.niche,
      description: row.description,
      duration: row.duration,
      resolution: JSON.parse(row.resolution),
      framerate: row.framerate,
      layers: JSON.parse(row.layers),
      variables: JSON.parse(row.variables),
      metadata: JSON.parse(row.metadata),
    };
  }

  /**
   * List all templates
   */
  listTemplates(niche?: string): Template[] {
    let query = 'SELECT * FROM templates';
    const params: any[] = [];

    if (niche) {
      query += ' WHERE niche = ?';
      params.push(niche);
    }

    query += ' ORDER BY created_at DESC';

    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      niche: row.niche,
      description: row.description,
      duration: row.duration,
      resolution: JSON.parse(row.resolution),
      framerate: row.framerate,
      layers: JSON.parse(row.layers),
      variables: JSON.parse(row.variables),
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): void {
    this.db.prepare('DELETE FROM templates WHERE id = ?').run(templateId);
  }

  /**
   * Validate variables against template requirements
   */
  validateVariables(template: Template, variables: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required variables
    for (const [varName, varDef] of Object.entries(template.variables)) {
      if (varDef.required && !(varName in variables)) {
        errors.push(`Missing required variable: ${varName}`);
        continue;
      }

      const value = variables[varName];
      if (value === undefined) continue;

      // Type validation
      if (varDef.type === 'number' && typeof value !== 'number') {
        errors.push(`Variable ${varName} must be a number`);
      } else if (varDef.type === 'string' && typeof value !== 'string') {
        errors.push(`Variable ${varName} must be a string`);
      } else if (varDef.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Variable ${varName} must be a boolean`);
      }

      // Validation rules
      if (varDef.validation) {
        const val = varDef.validation;

        if (val.min !== undefined && typeof value === 'number' && value < val.min) {
          errors.push(`Variable ${varName} must be >= ${val.min}`);
        }

        if (val.max !== undefined && typeof value === 'number' && value > val.max) {
          errors.push(`Variable ${varName} must be <= ${val.max}`);
        }

        if (val.pattern && typeof value === 'string' && !new RegExp(val.pattern).test(value)) {
          errors.push(`Variable ${varName} does not match required pattern`);
        }

        if (val.enum && !val.enum.includes(value)) {
          errors.push(`Variable ${varName} must be one of: ${val.enum.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Resolve template variables
   * Replaces ${VARIABLE} placeholders with actual values
   */
  resolveVariables(template: Template, variables: Record<string, any>): ResolvedTemplate {
    // Validate first
    const validation = this.validateVariables(template, variables);
    if (!validation.valid) {
      throw new Error(`Variable validation failed: ${validation.errors.join(', ')}`);
    }

    // Fill in defaults for missing optional variables
    const resolvedVars = { ...variables };
    for (const [varName, varDef] of Object.entries(template.variables)) {
      if (!(varName in resolvedVars) && varDef.default !== undefined) {
        resolvedVars[varName] = varDef.default;
      }
    }

    // Deep clone template
    const resolved: any = JSON.parse(JSON.stringify(template));

    // Recursive function to replace variables in all strings
    const replaceInObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/\$\{(\w+)\}/g, (match, varName) => {
          if (varName in resolvedVars) {
            return String(resolvedVars[varName]);
          }
          return match; // Keep placeholder if variable not found
        });
      } else if (Array.isArray(obj)) {
        return obj.map(replaceInObject);
      } else if (obj && typeof obj === 'object') {
        const newObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
          newObj[key] = replaceInObject(value);
        }
        return newObj;
      }
      return obj;
    };

    // Replace variables in layers
    resolved.layers = replaceInObject(template.layers);

    // Remove variables property and add resolved_variables
    delete resolved.variables;
    resolved.resolved_variables = resolvedVars;

    return resolved as ResolvedTemplate;
  }

  /**
   * Clone template with new ID
   */
  cloneTemplate(templateId: string, newName: string): Template {
    const original = this.getTemplate(templateId);
    if (!original) {
      throw new Error('Template not found');
    }

    const clone: Template = {
      ...JSON.parse(JSON.stringify(original)),
      id: `template_${Date.now()}`,
      name: newName,
      metadata: {
        ...original.metadata,
        created_at: Date.now(),
        modified_at: Date.now(),
      },
    };

    this.saveTemplate(clone);
    return clone;
  }

  /**
   * Get template statistics
   */
  getStats(): {
    total: number;
    byNiche: Record<string, number>;
  } {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM templates').get() as any).count;

    const byNiche = this.db.prepare(`
      SELECT niche, COUNT(*) as count
      FROM templates
      GROUP BY niche
    `).all() as any[];

    const nicheStats: Record<string, number> = {};
    byNiche.forEach(row => {
      nicheStats[row.niche] = row.count;
    });

    return { total, byNiche: nicheStats };
  }

  close() {
    this.db.close();
  }
}

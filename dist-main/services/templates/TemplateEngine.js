"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
/**
 * Template Engine
 * Core system for managing video templates with variable substitution
 */
class TemplateEngine {
    constructor() {
        this.appDataPath = path_1.default.join(os_1.default.homedir(), 'ContentForge');
        this.templatesDir = path_1.default.join(this.appDataPath, 'templates');
        // Ensure directories exist BEFORE creating database (synchronously)
        this.ensureDirectoriesSync();
        this.db = new better_sqlite3_1.default(path_1.default.join(this.appDataPath, 'contentforge.db'));
        this.initDatabase();
    }
    ensureDirectoriesSync() {
        try {
            const fsSync = require('fs');
            if (!fsSync.existsSync(this.appDataPath)) {
                fsSync.mkdirSync(this.appDataPath, { recursive: true });
            }
            if (!fsSync.existsSync(this.templatesDir)) {
                fsSync.mkdirSync(this.templatesDir, { recursive: true });
            }
        }
        catch (error) {
            console.error('Error creating templates directory:', error);
        }
    }
    initDatabase() {
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
    saveTemplate(template) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO templates
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(template.id, template.name, template.niche, template.description, template.duration, JSON.stringify(template.resolution), template.framerate, JSON.stringify(template.layers), JSON.stringify(template.variables), JSON.stringify(template.metadata), template.metadata.created_at, template.metadata.modified_at);
    }
    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        const row = this.db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
        if (!row)
            return null;
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
    listTemplates(niche) {
        let query = 'SELECT * FROM templates';
        const params = [];
        if (niche) {
            query += ' WHERE niche = ?';
            params.push(niche);
        }
        query += ' ORDER BY created_at DESC';
        const rows = this.db.prepare(query).all(...params);
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
    deleteTemplate(templateId) {
        this.db.prepare('DELETE FROM templates WHERE id = ?').run(templateId);
    }
    /**
     * Validate variables against template requirements
     */
    validateVariables(template, variables) {
        const errors = [];
        // Check required variables
        for (const [varName, varDef] of Object.entries(template.variables)) {
            if (varDef.required && !(varName in variables)) {
                errors.push(`Missing required variable: ${varName}`);
                continue;
            }
            const value = variables[varName];
            if (value === undefined)
                continue;
            // Type validation
            if (varDef.type === 'number' && typeof value !== 'number') {
                errors.push(`Variable ${varName} must be a number`);
            }
            else if (varDef.type === 'string' && typeof value !== 'string') {
                errors.push(`Variable ${varName} must be a string`);
            }
            else if (varDef.type === 'boolean' && typeof value !== 'boolean') {
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
    resolveVariables(template, variables) {
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
        const resolved = JSON.parse(JSON.stringify(template));
        // Recursive function to replace variables in all strings
        const replaceInObject = (obj) => {
            if (typeof obj === 'string') {
                return obj.replace(/\$\{(\w+)\}/g, (match, varName) => {
                    if (varName in resolvedVars) {
                        return String(resolvedVars[varName]);
                    }
                    return match; // Keep placeholder if variable not found
                });
            }
            else if (Array.isArray(obj)) {
                return obj.map(replaceInObject);
            }
            else if (obj && typeof obj === 'object') {
                const newObj = {};
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
        return resolved;
    }
    /**
     * Clone template with new ID
     */
    cloneTemplate(templateId, newName) {
        const original = this.getTemplate(templateId);
        if (!original) {
            throw new Error('Template not found');
        }
        const clone = {
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
    getStats() {
        const total = this.db.prepare('SELECT COUNT(*) as count FROM templates').get().count;
        const byNiche = this.db.prepare(`
      SELECT niche, COUNT(*) as count
      FROM templates
      GROUP BY niche
    `).all();
        const nicheStats = {};
        byNiche.forEach(row => {
            nicheStats[row.niche] = row.count;
        });
        return { total, byNiche: nicheStats };
    }
    close() {
        this.db.close();
    }
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=TemplateEngine.js.map
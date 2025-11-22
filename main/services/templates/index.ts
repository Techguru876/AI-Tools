/**
 * Template Registry
 * Export all available templates
 */

export { TemplateEngine } from './TemplateEngine';
export type { Template, TemplateLayer, TemplateVariable, ResolvedTemplate } from './TemplateEngine';
export { createLofiTemplate } from './lofi-template';

// Import all built-in templates
import { createLofiTemplate } from './lofi-template';

/**
 * Get all built-in templates
 */
export function getAllBuiltInTemplates() {
  return {
    lofi: createLofiTemplate(),
    // Future templates will be added here:
    // horror: createHorrorTemplate(),
    // explainer: createExplainerTemplate(),
    // motivational: createMotivationalTemplate(),
  };
}

/**
 * Initialize template database with built-in templates
 */
export async function initializeTemplates(engine: any) {
  const templates = getAllBuiltInTemplates();

  for (const template of Object.values(templates)) {
    try {
      engine.saveTemplate(template);
      console.log(`✓ Initialized template: ${template.name}`);
    } catch (error) {
      console.error(`✗ Failed to initialize template ${template.name}:`, error);
    }
  }
}

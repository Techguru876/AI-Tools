/**
 * Template Registry
 * Export all available templates
 */

export { TemplateEngine } from './TemplateEngine';
export type { Template, TemplateLayer, TemplateVariable, ResolvedTemplate } from './TemplateEngine';
export { createLofiTemplate } from './lofi-template';
export { createHorrorTemplate } from './horror-template';
export { createExplainerTemplate } from './explainer-template';
export { createMotivationalTemplate } from './motivational-template';
export { createNewsTemplate } from './news-template';
export { createFunFactsTemplate } from './funfacts-template';
export { createProductReviewTemplate } from './product-review-template';

// Import all built-in templates
import { createLofiTemplate } from './lofi-template';
import { createHorrorTemplate } from './horror-template';
import { createExplainerTemplate } from './explainer-template';
import { createMotivationalTemplate } from './motivational-template';
import { createNewsTemplate } from './news-template';
import { createFunFactsTemplate } from './funfacts-template';
import { createProductReviewTemplate } from './product-review-template';

/**
 * Get all built-in templates
 */
export function getAllBuiltInTemplates() {
  return {
    lofi: createLofiTemplate(),
    horror: createHorrorTemplate(),
    explainer: createExplainerTemplate(),
    motivational: createMotivationalTemplate(),
    news: createNewsTemplate(),
    funfacts: createFunFactsTemplate(),
    productReview: createProductReviewTemplate(),
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

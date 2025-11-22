"use strict";
/**
 * Template Registry
 * Export all available templates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHorrorTemplate = exports.createLofiTemplate = exports.TemplateEngine = void 0;
exports.getAllBuiltInTemplates = getAllBuiltInTemplates;
exports.initializeTemplates = initializeTemplates;
var TemplateEngine_1 = require("./TemplateEngine");
Object.defineProperty(exports, "TemplateEngine", { enumerable: true, get: function () { return TemplateEngine_1.TemplateEngine; } });
var lofi_template_1 = require("./lofi-template");
Object.defineProperty(exports, "createLofiTemplate", { enumerable: true, get: function () { return lofi_template_1.createLofiTemplate; } });
var horror_template_1 = require("./horror-template");
Object.defineProperty(exports, "createHorrorTemplate", { enumerable: true, get: function () { return horror_template_1.createHorrorTemplate; } });
// Import all built-in templates
const lofi_template_2 = require("./lofi-template");
const horror_template_2 = require("./horror-template");
/**
 * Get all built-in templates
 */
function getAllBuiltInTemplates() {
    return {
        lofi: (0, lofi_template_2.createLofiTemplate)(),
        horror: (0, horror_template_2.createHorrorTemplate)(),
        // Future templates will be added here:
        // explainer: createExplainerTemplate(),
        // motivational: createMotivationalTemplate(),
    };
}
/**
 * Initialize template database with built-in templates
 */
async function initializeTemplates(engine) {
    const templates = getAllBuiltInTemplates();
    for (const template of Object.values(templates)) {
        try {
            engine.saveTemplate(template);
            console.log(`✓ Initialized template: ${template.name}`);
        }
        catch (error) {
            console.error(`✗ Failed to initialize template ${template.name}:`, error);
        }
    }
}
//# sourceMappingURL=index.js.map
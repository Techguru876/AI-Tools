"use strict";
/**
 * Template Registry
 * Export all available templates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductReviewTemplate = exports.createFunFactsTemplate = exports.createNewsTemplate = exports.createMotivationalTemplate = exports.createExplainerTemplate = exports.createHorrorTemplate = exports.createLofiTemplate = exports.TemplateEngine = void 0;
exports.getAllBuiltInTemplates = getAllBuiltInTemplates;
exports.initializeTemplates = initializeTemplates;
var TemplateEngine_1 = require("./TemplateEngine");
Object.defineProperty(exports, "TemplateEngine", { enumerable: true, get: function () { return TemplateEngine_1.TemplateEngine; } });
var lofi_template_1 = require("./lofi-template");
Object.defineProperty(exports, "createLofiTemplate", { enumerable: true, get: function () { return lofi_template_1.createLofiTemplate; } });
var horror_template_1 = require("./horror-template");
Object.defineProperty(exports, "createHorrorTemplate", { enumerable: true, get: function () { return horror_template_1.createHorrorTemplate; } });
var explainer_template_1 = require("./explainer-template");
Object.defineProperty(exports, "createExplainerTemplate", { enumerable: true, get: function () { return explainer_template_1.createExplainerTemplate; } });
var motivational_template_1 = require("./motivational-template");
Object.defineProperty(exports, "createMotivationalTemplate", { enumerable: true, get: function () { return motivational_template_1.createMotivationalTemplate; } });
var news_template_1 = require("./news-template");
Object.defineProperty(exports, "createNewsTemplate", { enumerable: true, get: function () { return news_template_1.createNewsTemplate; } });
var funfacts_template_1 = require("./funfacts-template");
Object.defineProperty(exports, "createFunFactsTemplate", { enumerable: true, get: function () { return funfacts_template_1.createFunFactsTemplate; } });
var product_review_template_1 = require("./product-review-template");
Object.defineProperty(exports, "createProductReviewTemplate", { enumerable: true, get: function () { return product_review_template_1.createProductReviewTemplate; } });
// Import all built-in templates
const lofi_template_2 = require("./lofi-template");
const horror_template_2 = require("./horror-template");
const explainer_template_2 = require("./explainer-template");
const motivational_template_2 = require("./motivational-template");
const news_template_2 = require("./news-template");
const funfacts_template_2 = require("./funfacts-template");
const product_review_template_2 = require("./product-review-template");
/**
 * Get all built-in templates
 */
function getAllBuiltInTemplates() {
    return {
        lofi: (0, lofi_template_2.createLofiTemplate)(),
        horror: (0, horror_template_2.createHorrorTemplate)(),
        explainer: (0, explainer_template_2.createExplainerTemplate)(),
        motivational: (0, motivational_template_2.createMotivationalTemplate)(),
        news: (0, news_template_2.createNewsTemplate)(),
        funfacts: (0, funfacts_template_2.createFunFactsTemplate)(),
        productReview: (0, product_review_template_2.createProductReviewTemplate)(),
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
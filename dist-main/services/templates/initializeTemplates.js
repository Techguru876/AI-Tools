"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDefaultTemplates = initializeDefaultTemplates;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const TemplateEngine_1 = require("./TemplateEngine");
const lofi_template_1 = require("./lofi-template");
const horror_template_1 = require("./horror-template");
const explainer_template_1 = require("./explainer-template");
const motivational_template_1 = require("./motivational-template");
const news_template_1 = require("./news-template");
const funfacts_template_1 = require("./funfacts-template");
const product_review_template_1 = require("./product-review-template");
/**
 * Initialize default templates on app startup
 * This function creates all built-in templates if they don't exist
 */
function initializeDefaultTemplates() {
    try {
        const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'contentforge.db');
        console.log('📁 Initializing templates with DB path:', dbPath);
        const templateEngine = new TemplateEngine_1.TemplateEngine();
        // Check existing templates
        console.log('🔍 Checking for existing templates...');
        const existingTemplates = templateEngine.listTemplates();
        console.log(`📊 Found ${existingTemplates.length} existing templates`);
        if (existingTemplates.length > 0) {
            console.log('✓ Templates already initialized:');
            existingTemplates.forEach(t => {
                console.log(`   - ${t.name} (${t.niche}) - ID: ${t.id}`);
            });
            return;
        }
        console.log('📝 No templates found. Creating defaults...');
        // Create all default templates
        const templates = [
            { fn: lofi_template_1.createLofiTemplate, name: 'Lofi Stream' },
            { fn: horror_template_1.createHorrorTemplate, name: 'Horror Story' },
            { fn: explainer_template_1.createExplainerTemplate, name: 'Explainer' },
            { fn: motivational_template_1.createMotivationalTemplate, name: 'Motivational' },
            { fn: news_template_1.createNewsTemplate, name: 'News' },
            { fn: funfacts_template_1.createFunFactsTemplate, name: 'Fun Facts' },
            { fn: product_review_template_1.createProductReviewTemplate, name: 'Product Review' },
        ];
        let successCount = 0;
        for (const { fn, name } of templates) {
            try {
                console.log(`\n📄 Creating template: ${name}...`);
                const template = fn();
                console.log(`   Template ID: ${template.id}`);
                console.log(`   Niche: ${template.niche}`);
                console.log(`   Duration: ${template.duration}s`);
                console.log(`   Layers: ${template.layers.length}`);
                templateEngine.saveTemplate(template);
                console.log(`✓ ${name} template saved successfully`);
                successCount++;
            }
            catch (error) {
                console.error(`✗ Failed to create ${name} template:`, error.message);
            }
        }
        // Verify they were saved
        console.log('\n🔍 Verifying saved templates...');
        const savedTemplates = templateEngine.listTemplates();
        console.log(`📊 Now have ${savedTemplates.length} templates in database`);
        if (savedTemplates.length > 0) {
            console.log('\n✓ TEMPLATES INITIALIZED SUCCESSFULLY!');
            console.log('📋 Available templates:');
            savedTemplates.forEach(t => {
                console.log(`   - ${t.name} (${t.niche})`);
                console.log(`     ID: ${t.id}`);
                console.log(`     Duration: ${t.duration}s`);
                console.log(`     Layers: ${t.layers.length}`);
                console.log(`     Variables: ${Object.keys(t.variables).length}`);
            });
        }
        else {
            console.error('\n✗ TEMPLATES WERE NOT SAVED PROPERLY!');
            console.error('This is a critical error. Template system will not function.');
        }
        console.log(`\n📈 Summary: ${successCount}/${templates.length} templates created successfully`);
    }
    catch (error) {
        console.error('\n❌ ERROR in initializeDefaultTemplates:', error);
        console.error('Stack trace:', error.stack);
    }
}
//# sourceMappingURL=initializeTemplates.js.map
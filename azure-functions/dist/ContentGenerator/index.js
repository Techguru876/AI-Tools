"use strict";
/**
 * Azure Function: Content Generator
 *
 * Timer-triggered function that calls the blog's /api/cron endpoint
 * to generate new content on a schedule.
 *
 * Schedule: Every 4 hours
 */
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
async function contentGenerator(myTimer, context) {
    const startTime = new Date().toISOString();
    context.log(`[ContentGenerator] Starting at ${startTime}`);
    const blogUrl = process.env.BLOG_API_URL || 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        context.error('[ContentGenerator] CRON_SECRET not configured');
        return;
    }
    try {
        context.log(`[ContentGenerator] Calling ${blogUrl}/api/cron`);
        const response = await fetch(`${blogUrl}/api/cron`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cronSecret}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            context.error(`[ContentGenerator] API returned ${response.status}: ${errorText}`);
            return;
        }
        const result = await response.json();
        context.log('[ContentGenerator] Generation complete:', JSON.stringify(result, null, 2));
        context.log(`[ContentGenerator] Generated ${result.totalGenerated || 0} articles`);
    }
    catch (error) {
        context.error('[ContentGenerator] Failed:', error);
    }
    const endTime = new Date().toISOString();
    context.log(`[ContentGenerator] Finished at ${endTime}`);
}
functions_1.app.timer('contentGenerator', {
    schedule: '0 0 */4 * * *',
    handler: contentGenerator
});
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const RateLimiter_1 = require("./RateLimiter");
const CostTracker_1 = require("./CostTracker");
/**
 * Base Provider
 * Abstract class for all AI service providers
 * Provides rate limiting, retry logic, and cost tracking
 */
class BaseProvider {
    constructor(apiKey, rateLimit = 60 // Requests per minute
    ) {
        this.maxRetries = 3;
        this.apiKey = apiKey;
        this.rateLimiter = new RateLimiter_1.RateLimiter(rateLimit);
        this.costTracker = new CostTracker_1.CostTracker(this.getProviderName());
    }
    /**
     * Make a rate-limited request with retry logic
     */
    async makeRequest(requestFn, estimatedCost, operation) {
        // Wait for rate limit slot
        await this.rateLimiter.waitForSlot();
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const result = await requestFn();
                // Track successful request cost
                this.costTracker.addCost(estimatedCost, operation);
                return result;
            }
            catch (error) {
                lastError = error;
                // Don't retry on auth errors
                if (error.status === 401 || error.status === 403) {
                    throw new Error(`Authentication failed for ${this.getProviderName()}: ${error.message}`);
                }
                // Don't retry on invalid request errors
                if (error.status === 400 || error.status === 422) {
                    throw new Error(`Invalid request to ${this.getProviderName()}: ${error.message}`);
                }
                // Exponential backoff for retriable errors
                if (attempt < this.maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw new Error(`Request to ${this.getProviderName()} failed after ${this.maxRetries} attempts: ${lastError?.message}`);
    }
    /**
     * Get cost statistics for this provider
     */
    getCostStats() {
        return this.costTracker.getStats();
    }
    /**
     * Get rate limiter statistics
     */
    getRateLimitStats() {
        return this.rateLimiter.getStats();
    }
    /**
     * Validate API key (to be implemented by subclasses if needed)
     */
    async validateAPIKey() {
        return !!this.apiKey;
    }
    /**
     * Close resources
     */
    close() {
        this.costTracker.close();
    }
}
exports.BaseProvider = BaseProvider;
//# sourceMappingURL=BaseProvider.js.map
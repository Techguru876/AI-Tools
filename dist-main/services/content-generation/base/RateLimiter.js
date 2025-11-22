"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
/**
 * Rate Limiter
 * Controls API request frequency to avoid hitting rate limits
 */
class RateLimiter {
    constructor(maxRequestsPerMinute) {
        this.requests = [];
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }
    /**
     * Wait for an available request slot
     * Implements sliding window rate limiting
     */
    async waitForSlot() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        // Remove requests older than 1 minute
        this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
        if (this.requests.length >= this.maxRequestsPerMinute) {
            // Calculate wait time until oldest request expires
            const oldestRequest = this.requests[0];
            const waitTime = 60000 - (now - oldestRequest) + 100; // +100ms buffer
            await new Promise(resolve => setTimeout(resolve, waitTime));
            // Recursive check after waiting
            return this.waitForSlot();
        }
        // Add current request timestamp
        this.requests.push(now);
    }
    /**
     * Get current usage statistics
     */
    getStats() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const requestsLastMinute = this.requests.filter(t => t > oneMinuteAgo).length;
        const availableSlots = this.maxRequestsPerMinute - requestsLastMinute;
        const utilizationPercent = (requestsLastMinute / this.maxRequestsPerMinute) * 100;
        return {
            requestsLastMinute,
            availableSlots,
            utilizationPercent,
        };
    }
    /**
     * Reset the rate limiter
     */
    reset() {
        this.requests = [];
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=RateLimiter.js.map
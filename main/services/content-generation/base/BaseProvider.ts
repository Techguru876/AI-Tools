import { RateLimiter } from './RateLimiter';
import { CostTracker } from './CostTracker';

/**
 * Base Provider
 * Abstract class for all AI service providers
 * Provides rate limiting, retry logic, and cost tracking
 */
export abstract class BaseProvider {
  protected rateLimiter: RateLimiter;
  protected costTracker: CostTracker;
  protected maxRetries: number = 3;
  protected apiKey: string;

  constructor(
    apiKey: string,
    rateLimit: number = 60  // Requests per minute
  ) {
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter(rateLimit);
    this.costTracker = new CostTracker(this.getProviderName());
  }

  /**
   * Get provider name (must be implemented by subclass)
   */
  abstract getProviderName(): string;

  /**
   * Make a rate-limited request with retry logic
   */
  protected async makeRequest<T>(
    requestFn: () => Promise<T>,
    estimatedCost: number,
    operation?: string
  ): Promise<T> {
    // Wait for rate limit slot
    await this.rateLimiter.waitForSlot();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await requestFn();

        // Track successful request cost
        this.costTracker.addCost(estimatedCost, operation);

        return result;
      } catch (error: any) {
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

    throw new Error(
      `Request to ${this.getProviderName()} failed after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Get cost statistics for this provider
   */
  getCostStats(): {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byOperation: Record<string, number>;
  } {
    return this.costTracker.getStats();
  }

  /**
   * Get rate limiter statistics
   */
  getRateLimitStats(): {
    requestsLastMinute: number;
    availableSlots: number;
    utilizationPercent: number;
  } {
    return this.rateLimiter.getStats();
  }

  /**
   * Validate API key (to be implemented by subclasses if needed)
   */
  async validateAPIKey(): Promise<boolean> {
    return !!this.apiKey;
  }

  /**
   * Close resources
   */
  close() {
    this.costTracker.close();
  }
}

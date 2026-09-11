import type { RetryOptions } from './types.js';

/** Pre-configured retry strategies for common use cases. */
export const presets: Record<string, Partial<RetryOptions>> = {
  aggressive: { maxAttempts: 5, baseDelay: 500, backoffFactor: 1.5, jitter: true },
  conservative: { maxAttempts: 3, baseDelay: 2000, backoffFactor: 3, jitter: false },
  network: { maxAttempts: 4, baseDelay: 1000, maxDelay: 30_000, backoffFactor: 2, jitter: true },
  database: { maxAttempts: 3, baseDelay: 500, maxDelay: 5000, backoffFactor: 2, jitter: false },
};

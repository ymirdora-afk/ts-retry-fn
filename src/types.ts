export interface RetryOptions {
  /** Maximum number of attempts before throwing RetryError. Default: 3 */
  maxAttempts?: number;
  /** Initial delay in milliseconds before the first retry. Default: 1000 */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds. */
  maxDelay?: number;
  /** Multiplier applied to the delay after each attempt. Default: 2 */
  backoffFactor?: number;
  /** Whether to randomize backoff delay with full jitter. Default: false */
  jitter?: boolean;
  /** Optional AbortSignal to cancel pending retries */
  signal?: AbortSignal;
}

export class RetryError extends Error {
  readonly attempts: number;
  readonly lastError: unknown;

  constructor(message: string, attempts: number, lastError: unknown) {
    super(message);
    this.name = 'RetryError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

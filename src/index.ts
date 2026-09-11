import type { RetryOptions } from './types.js';
import { RetryError } from './types.js';

export { RetryError };
export type { RetryOptions };

/**
 * Calculates backoff delay with exponential multiplier, optional max cap, and jitter.
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoffFactor: number,
  maxDelay?: number,
  jitter?: boolean
): number {
  const exponential = baseDelay * Math.pow(backoffFactor, attempt - 1);
  const capped = maxDelay !== undefined ? Math.min(exponential, maxDelay) : exponential;

  if (jitter) {
    return Math.floor(Math.random() * capped);
  }

  return Math.floor(capped);
}

/**
 * Sleep helper that rejects immediately if the AbortSignal is triggered.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('The operation was aborted', 'AbortError'));
      return;
    }

    let onAbort: (() => void) | undefined;
    const timer = setTimeout(() => {
      if (signal && onAbort) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    }, ms);

    if (signal) {
      onAbort = () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException('The operation was aborted', 'AbortError'));
      };
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

/**
 * Retries an asynchronous function with exponential backoff, jitter, and abort signal support.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay,
    backoffFactor = 2,
    jitter = false,
    signal,
  } = options;

  if (maxAttempts < 1) {
    throw new RangeError('maxAttempts must be at least 1');
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('The operation was aborted', 'AbortError');
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (signal?.aborted) {
        throw signal.reason ?? new DOMException('The operation was aborted', 'AbortError');
      }

      if (attempt === maxAttempts) {
        break;
      }

      const delay = calculateDelay(attempt, baseDelay, backoffFactor, maxDelay, jitter);
      await sleep(delay, signal);
    }
  }

  throw new RetryError(
    `Operation failed after ${maxAttempts} attempt${maxAttempts === 1 ? '' : 's'}`,
    maxAttempts,
    lastError
  );
}

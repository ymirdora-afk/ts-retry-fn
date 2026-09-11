/** Calculate delay with optional jitter for retry attempts. */
export function calculateDelay(
  attempt: number,
  baseDelay: number,
  factor: number,
  maxDelay: number | undefined,
  jitter: boolean,
): number {
  let delay = baseDelay * Math.pow(factor, attempt);
  if (maxDelay !== undefined) delay = Math.min(delay, maxDelay);
  if (jitter) delay *= Math.random();
  return Math.floor(delay);
}

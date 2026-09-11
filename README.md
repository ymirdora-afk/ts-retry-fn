# ts-retry-fn

A lightweight retry utility with exponential backoff, jitter, and abort signal support.

## Installation

```bash
npm install ts-retry-fn
```

## Usage

```typescript
import { retry, RetryError } from 'ts-retry-fn';

// Basic usage with exponential backoff
const result = await retry(async () => {
  return await fetchUserData(userId);
});

// Advanced configuration with jitter and cancellation
const controller = new AbortController();

try {
  const data = await retry(
    async () => {
      return await callFlakyService();
    },
    {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 2,
      jitter: true,
      signal: controller.signal,
    }
  );
} catch (err) {
  if (err instanceof RetryError) {
    console.error(`Failed after ${err.attempts} attempts:`, err.lastError);
  }
}
```

## API

### `retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>`

Executes `fn` and retries on failure according to `options`.

#### Options (`RetryOptions`)

- `maxAttempts` (number, default: `3`): Maximum number of attempts before throwing `RetryError`.
- `baseDelay` (number, default: `1000`): Initial delay in milliseconds before first retry.
- `maxDelay` (number, optional): Maximum delay cap in milliseconds.
- `backoffFactor` (number, default: `2`): Multiplier applied to delay after each attempt.
- `jitter` (boolean, default: `false`): Randomize delay with full jitter to avoid thundering herds.
- `signal` (AbortSignal, optional): An `AbortSignal` to cancel pending retries.

### `RetryError`

Thrown when all attempts are exhausted. Extends `Error`.
- `attempts`: The total number of attempts performed.
- `lastError`: The error thrown on the final attempt.

## License

MIT

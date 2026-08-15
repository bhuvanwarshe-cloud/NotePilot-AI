/**
 * ============================================================================
 * Retry Policy
 * ============================================================================
 *
 * Generic retry engine used by all AI providers.
 *
 * Features:
 * - Exponential backoff
 * - Retry only retryable AIErrors
 * - Configurable retry policy
 * - Provider agnostic
 * ============================================================================
 */

import type {
  RetryOptions,
} from './types';

import {
  AIError,
} from './errors';


// -----------------------------------------------------------------------------
// Default Retry Configuration
// -----------------------------------------------------------------------------

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {

  maxRetries: 2,

  initialDelayMs: 1000,

  maxDelayMs: 8000,

  backoffMultiplier: 2,

};


// -----------------------------------------------------------------------------
// Delay Helper
// -----------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {

  return new Promise(

    resolve => setTimeout(resolve, ms)

  );

}


// -----------------------------------------------------------------------------
// Exponential Backoff
// -----------------------------------------------------------------------------

function calculateDelay(
  attempt: number,
  options: RetryOptions
): number {

  const delay =
    options.initialDelayMs *
    Math.pow(
      options.backoffMultiplier,
      attempt
    );

  return Math.min(

    delay,

    options.maxDelayMs

  );

}


// -----------------------------------------------------------------------------
// Retry Executor
// -----------------------------------------------------------------------------

export async function executeWithRetry<T>(

  operation: () => Promise<T>,

  options: RetryOptions = DEFAULT_RETRY_OPTIONS,

  onRetry?: (
    attempt: number,
    error: Error,
    delayMs: number
  ) => void,

): Promise<T> {

  let lastError: Error | undefined;

  for (

    let attempt = 0;

    attempt <= options.maxRetries;

    attempt++

  ) {

    try {

      return await operation();

    }

    catch (error) {

      lastError =
        error instanceof Error
          ? error
          : new Error(
              String(error)
            );

      // ---------------------------------------------------------
      // Non-AI errors
      // ---------------------------------------------------------

if (!(lastError instanceof AIError)) {
  throw lastError;
}

if (options.shouldRetry) {
  if (!options.shouldRetry(lastError)) {
    throw lastError;
  }
} else if (!lastError.retryable) {
  throw lastError;
}

      // ---------------------------------------------------------
      // Retry limit reached
      // ---------------------------------------------------------

      if (

        attempt >= options.maxRetries

      ) {

        throw lastError;

      }

      const delayMs =
        calculateDelay(
          attempt,
          options
        );

      onRetry?.(

        attempt + 1,

        lastError,

        delayMs

      );

      await sleep(

        delayMs

      );

    }

  }

  throw lastError ??
    new Error(
      'Retry failed.'
    );

}
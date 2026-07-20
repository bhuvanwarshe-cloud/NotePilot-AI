/**
 * geminiResilience.ts
 *
 * Resilience layer for Gemini API operations.
 *
 * Responsibilities:
 *
 * - retry transient Gemini/API failures
 * - exponential backoff with jitter
 * - classify failures into stable NotePilot error codes
 * - preserve permanent failures without pointless retries
 *
 * This module is intentionally independent of YouTube and
 * KnowledgeRepresentation logic.
 */


// ─────────────────────────────────────────────────────────────────────────────
// Error Codes
// ─────────────────────────────────────────────────────────────────────────────

export type GeminiProviderErrorCode =
  | 'GEMINI_RATE_LIMITED'
  | 'GEMINI_HIGH_DEMAND'
  | 'GEMINI_TIMEOUT'
  | 'GEMINI_NETWORK_ERROR'
  | 'GEMINI_AUTH_ERROR'
  | 'GEMINI_MODEL_UNAVAILABLE'
  | 'GEMINI_INVALID_REQUEST'
  | 'GEMINI_REQUEST_FAILED';


// ─────────────────────────────────────────────────────────────────────────────
// Typed Error
// ─────────────────────────────────────────────────────────────────────────────

export class GeminiProviderError extends Error {

  constructor(
    message: string,

    public readonly code:
      GeminiProviderErrorCode,

    public readonly retryable:
      boolean,

    public readonly status?:
      number,

    public readonly cause?:
      unknown
  ) {

    super(message);

    this.name =
      'GeminiProviderError';

  }

}


// ─────────────────────────────────────────────────────────────────────────────
// Retry Options
// ─────────────────────────────────────────────────────────────────────────────

export interface GeminiRetryOptions {

  /**
   * Total attempts including the first request.
   *
   * Example:
   *
   * maxAttempts = 3
   *
   * attempt 1
   * retry 1
   * retry 2
   */
  maxAttempts:
    number;


  /**
   * Initial exponential-backoff delay.
   */
  baseDelayMs:
    number;


  /**
   * Maximum backoff delay.
   */
  maxDelayMs:
    number;

}


// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: GeminiRetryOptions = {

  maxAttempts:
    readPositiveInteger(
      process.env.GEMINI_MAX_ATTEMPTS,
      3
    ),

  baseDelayMs:
    readPositiveInteger(
      process.env.GEMINI_RETRY_BASE_DELAY_MS,
      2000
    ),

  maxDelayMs:
    readPositiveInteger(
      process.env.GEMINI_RETRY_MAX_DELAY_MS,
      10000
    ),

};


// ─────────────────────────────────────────────────────────────────────────────
// Public Retry API
// ─────────────────────────────────────────────────────────────────────────────

export async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  options: Partial<GeminiRetryOptions> = {}
): Promise<T> {

  const config: GeminiRetryOptions = {

    ...DEFAULT_OPTIONS,

    ...options,

  };


  if (
    config.maxAttempts < 1
  ) {

    throw new Error(
      'Gemini retry maxAttempts must be at least 1.'
    );

  }


  let lastError:
    GeminiProviderError | null =
      null;


  for (
    let attempt = 1;
    attempt <= config.maxAttempts;
    attempt += 1
  ) {

    try {

      console.log(
        `[GeminiResilience] Attempt ${attempt}/${config.maxAttempts}`
      );


      const result =
        await operation();


      if (
        attempt > 1
      ) {

        console.log(
          `[GeminiResilience] Request succeeded on attempt ${attempt} ✓`
        );

      }


      return result;

    } catch (error) {

      const classified =
        classifyGeminiError(
          error
        );


      lastError =
        classified;


      console.warn(
        `[GeminiResilience] Attempt ${attempt}/${config.maxAttempts} failed`
      );

      console.warn(
        `[GeminiResilience] Code: ${classified.code}`
      );

      console.warn(
        `[GeminiResilience] Status: ${classified.status ?? 'unknown'}`
      );

      console.warn(
        `[GeminiResilience] Retryable: ${classified.retryable}`
      );

      console.warn(
        `[GeminiResilience] Message: ${classified.message}`
      );


      // Permanent error → fail immediately.
      if (
        !classified.retryable
      ) {

        throw classified;

      }


      // Retryable, but no attempts remain.
      if (
        attempt >= config.maxAttempts
      ) {

        break;

      }


      const delayMs =
        calculateBackoffDelay(
          attempt,
          config.baseDelayMs,
          config.maxDelayMs
        );


      console.warn(
        `[GeminiResilience] Retrying in ${delayMs}ms...`
      );


      await delay(
        delayMs
      );

    }

  }


  if (
    lastError
  ) {

    throw new GeminiProviderError(

      `Gemini request failed after ${config.maxAttempts} attempts: ${lastError.message}`,

      lastError.code,

      false,

      lastError.status,

      lastError

    );

  }


  throw new GeminiProviderError(

    'Gemini request failed for an unknown reason.',

    'GEMINI_REQUEST_FAILED',

    false

  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Error Classification
// ─────────────────────────────────────────────────────────────────────────────

export function classifyGeminiError(
  error: unknown
): GeminiProviderError {

  if (
    error instanceof GeminiProviderError
  ) {

    return error;

  }


  const status =
    extractStatus(
      error
    );


  const message =
    extractErrorMessage(
      error
    );


  const normalized =
    message.toLowerCase();


  // ── Rate limiting ──────────────────────────────────────────────────────────

  if (
    status === 429 ||
    normalized.includes(
      'rate limit'
    ) ||
    normalized.includes(
      'resource_exhausted'
    )
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_RATE_LIMITED',

      true,

      status,

      error

    );

  }


  // ── High demand / service unavailable ─────────────────────────────────────

  if (
    status === 503 ||
    normalized.includes(
      'high demand'
    ) ||
    normalized.includes(
      '"status":"unavailable"'
    ) ||
    normalized.includes(
      'service unavailable'
    )
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_HIGH_DEMAND',

      true,

      status,

      error

    );

  }


  // ── Gateway/server transient failures ─────────────────────────────────────

  if (
    status === 500 ||
    status === 502 ||
    status === 504
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_REQUEST_FAILED',

      true,

      status,

      error

    );

  }


  // ── Timeout ────────────────────────────────────────────────────────────────

  if (
    normalized.includes(
      'timeout'
    ) ||
    normalized.includes(
      'timed out'
    ) ||
    normalized.includes(
      'und_err_connect_timeout'
    ) ||
    normalized.includes(
      'aborterror'
    )
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_TIMEOUT',

      true,

      status,

      error

    );

  }


  // ── Network ────────────────────────────────────────────────────────────────

  if (
    normalized.includes(
      'fetch failed'
    ) ||
    normalized.includes(
      'econnreset'
    ) ||
    normalized.includes(
      'econnrefused'
    ) ||
    normalized.includes(
      'enotfound'
    ) ||
    normalized.includes(
      'socket hang up'
    ) ||
    normalized.includes(
      'network'
    )
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_NETWORK_ERROR',

      true,

      status,

      error

    );

  }


  // ── Authentication / permission ────────────────────────────────────────────

  if (
    status === 401 ||
    status === 403
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_AUTH_ERROR',

      false,

      status,

      error

    );

  }


  // ── Missing/deprecated model ───────────────────────────────────────────────

  if (
    status === 404 &&
    (
      normalized.includes(
        'model'
      ) ||
      normalized.includes(
        'models/'
      )
    )
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_MODEL_UNAVAILABLE',

      false,

      status,

      error

    );

  }


  // ── Invalid request ────────────────────────────────────────────────────────

  if (
    status === 400
  ) {

    return new GeminiProviderError(

      message,

      'GEMINI_INVALID_REQUEST',

      false,

      status,

      error

    );

  }


  // ── Unknown failure ────────────────────────────────────────────────────────

  return new GeminiProviderError(

    message,

    'GEMINI_REQUEST_FAILED',

    false,

    status,

    error

  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Backoff
// ─────────────────────────────────────────────────────────────────────────────

function calculateBackoffDelay(
  failedAttempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {

  const exponentialDelay =
    baseDelayMs *
    Math.pow(
      2,
      failedAttempt - 1
    );


  const cappedDelay =
    Math.min(
      exponentialDelay,
      maxDelayMs
    );


  /**
   * Add up to 25% jitter.
   *
   * This prevents multiple concurrent NotePilot jobs from retrying Gemini
   * at exactly the same instant after a provider outage.
   */
  const jitter =
    Math.floor(
      Math.random() *
      cappedDelay *
      0.25
    );


  return (
    cappedDelay +
    jitter
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function delay(
  ms: number
): Promise<void> {

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );

}


function extractStatus(
  error: unknown
): number | undefined {

  if (
    typeof error !== 'object' ||
    error === null
  ) {

    return undefined;

  }


  const candidate =
    error as Record<string, unknown>;


  if (
    typeof candidate.status ===
    'number'
  ) {

    return candidate.status;

  }


  if (
    typeof candidate.code ===
    'number'
  ) {

    return candidate.code;

  }


  return undefined;

}


function extractErrorMessage(
  error: unknown
): string {

  if (
    error instanceof Error
  ) {

    const cause =
      error.cause;


    if (
      cause instanceof Error
    ) {

      return (
        `${error.message} | Cause: ${cause.message}`
      );

    }


    return (
      error.message ||
      error.name
    );

  }


  if (
    typeof error ===
    'string'
  ) {

    return error;

  }


  try {

    return JSON.stringify(
      error
    );

  } catch {

    return String(
      error
    );

  }

}


function readPositiveInteger(
  value: string | undefined,
  fallback: number
): number {

  const parsed =
    Number(
      value
    );


  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <= 0
  ) {

    return fallback;

  }


  return Math.floor(
    parsed
  );

}
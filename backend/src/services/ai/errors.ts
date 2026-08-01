/**
 * ============================================================================
 * AI Infrastructure Errors
 * ============================================================================
 *
 * Custom error hierarchy used across the AI infrastructure.
 *
 * Every provider should throw one of these errors instead of generic Error.
 * ============================================================================
 */

export abstract class AIError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);

    this.name = this.constructor.name;
  }
}

/**
 * Quota exhausted for current API key.
 */
export class QuotaExceededError extends AIError {
  constructor(message = 'API quota exhausted.') {
    super(message, true);
  }
}

/**
 * Provider temporarily unavailable.
 */
export class ServiceUnavailableError extends AIError {
  constructor(message = 'AI service temporarily unavailable.') {
    super(message, true);
  }
}

/**
 * Too many requests.
 */
export class RateLimitError extends AIError {
  constructor(message = 'Rate limit exceeded.') {
    super(message, true);
  }
}

/**
 * Timeout while calling provider.
 */
export class ProviderTimeoutError extends AIError {
  constructor(message = 'AI provider timed out.') {
    super(message, true);
  }
}

/**
 * Invalid API Key.
 */
export class InvalidAPIKeyError extends AIError {
  constructor(message = 'Invalid API key.') {
    super(message, true);
  }
}

/**
 * Invalid request from our side.
 */
export class InvalidRequestError extends AIError {
  constructor(message = 'Invalid AI request.') {
    super(message, false);
  }
}

/**
 * Response parsing failed.
 */
export class ResponseParseError extends AIError {
  constructor(message = 'Failed to parse AI response.') {
    super(message, false);
  }
}

/**
 * All available provider keys failed.
 */
export class AllKeysExhaustedError extends AIError {
  constructor(message = 'All configured API keys failed.') {
    super(message, false);
  }
}

/**
 * Unknown provider failure.
 */
export class UnknownProviderError extends AIError {
  constructor(message = 'Unknown AI provider error.') {
    super(message, false);
  }
}
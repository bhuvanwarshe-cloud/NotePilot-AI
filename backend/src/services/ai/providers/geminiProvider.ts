/**
 * ============================================================================
 * Gemini Provider
 * ============================================================================
 *
 * Production implementation of the Gemini AI Provider.
 *
 * Responsibilities:
 *
 * • Iterate through configured Gemini API keys
 * • Retry transient failures
 * • Automatically fail over to the next API key
 * • Normalize Gemini responses
 * • Map SDK errors into AIErrors
 * * • Never expose API keys in logs
 *
 * This class is the ONLY place in the application that directly communicates
 * with the Gemini SDK.
 *
 * ============================================================================
 */

import {
  GenerateContentResponse,
} from "@google/genai";

import {
  executeWithRetry,
  DEFAULT_RETRY_OPTIONS,
} from "../retryPolicy";

import {
  AIProvider,
  AIProviderInterface,
  AIRequest,
  AIResponse,
  APIKeyInfo,
} from "../types";

import {
  AIError,
  AllKeysExhaustedError,
  InvalidAPIKeyError,
  InvalidRequestError,
  ProviderTimeoutError,
  QuotaExceededError,
  RateLimitError,
  ResponseParseError,
  ServiceUnavailableError,
  UnknownProviderError,
} from "../errors";

import {
  GeminiKeyPool,
} from "./gemini/geminiKeyPool";

import {
  GeminiClientFactory,
} from "./gemini/geminiClientFactory";


// -----------------------------------------------------------------------------
// Gemini Provider
// -----------------------------------------------------------------------------

export class GeminiProvider
  implements AIProviderInterface {

  // ---------------------------------------------------------------------------
  // Dependencies
  // ---------------------------------------------------------------------------

  private readonly keyPool =
    new GeminiKeyPool();

  private readonly clientFactory =
    new GeminiClientFactory();

  // ---------------------------------------------------------------------------
  // Default Model
  // ---------------------------------------------------------------------------

  private readonly defaultModel =
    "gemini-2.5-flash";

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor() {

    // Intentionally empty.

    // Dependencies are initialized above.

  }

    // ---------------------------------------------------------------------------
  // Public Entry Point
  // ---------------------------------------------------------------------------

  /**
   * Generates AI content using the configured Gemini API keys.
   *
   * Flow:
   *
   * Request
   *    ↓
   * Key #1
   *    ↓
   * Retry transient failures
   *    ↓
   * Success?
   *    ├── Yes → Return
   *    └── No
   *            ↓
   * Key #2
   *            ↓
   * Retry
   *            ↓
   * ...
   *            ↓
   * All Keys Failed
   */
  private shouldRotateKey(error: AIError): boolean {
  return (
    error instanceof QuotaExceededError ||
    error instanceof RateLimitError ||
    error instanceof InvalidAPIKeyError ||
    error instanceof ServiceUnavailableError ||
    error instanceof ProviderTimeoutError
  );
}

  public async generateContent(
    request: AIRequest
  ): Promise<AIResponse> {

    this.validateRequest(request);

    const errors: Error[] = [];

    for (const key of this.keyPool.iterator()) {

      try {

        return await this.tryGenerateWithKey(
          key,
          request
        );

      }

      catch (error) {

        const mapped =
          this.mapProviderError(error);

        errors.push(mapped);

        this.logKeyFailure(
          key.index,
          mapped
        );

        // If the error isn't retryable across keys,
        // immediately abort.
       if (mapped instanceof AIError) {
  if (this.shouldRotateKey(mapped)) {
    continue;
  }

  if (!mapped.retryable) {
    throw mapped;
  }
}

throw mapped;

        // Otherwise continue with the next key.
      }

    }

    throw new AllKeysExhaustedError(

      `All ${this.keyPool.size()} Gemini API keys failed.`

    );

  }

    // ---------------------------------------------------------------------------
  // Single-Key Generation
  // ---------------------------------------------------------------------------

  /**
   * Attempts generation using ONE Gemini API key.
   *
   * Retries transient failures using executeWithRetry().
   *
   * Does NOT rotate API keys.
   *
   * Key rotation is handled by generateContent().
   */
  private async tryGenerateWithKey(
    key: APIKeyInfo,
    request: AIRequest
  ): Promise<AIResponse> {

    const client =
      this.clientFactory.createClient(key);

const response =
  await executeWithRetry(
    async () => {
      return await this.executeGeminiRequest(
        client,
        request,
        key
      );
    },
    {
      ...DEFAULT_RETRY_OPTIONS,

      shouldRetry: (error: Error) =>
        error instanceof ServiceUnavailableError ||
        error instanceof ProviderTimeoutError,
    },

    (
      attempt,
      error,
      delay
    ) => {
      this.logRetry(
        key.index,
        attempt,
        delay,
        error
      );
    }
  );

    return this.parseResponse(

      response,

      request,

      key

    );

  }


  // ---------------------------------------------------------------------------
  // Request Validation
  // ---------------------------------------------------------------------------

  /**
   * Validates an incoming AI request before sending it to Gemini.
   */
  private validateRequest(
    request: AIRequest
  ): void {

    if (

      !request.prompt ||

      request.prompt.trim().length === 0

    ) {

      throw new InvalidRequestError(

        "Prompt cannot be empty."

      );

    }

    if (

      request.maxOutputTokens !== undefined &&

      request.maxOutputTokens <= 0

    ) {

      throw new InvalidRequestError(

        "maxOutputTokens must be greater than zero."

      );

    }

    if (

      request.temperature !== undefined &&

      (

        request.temperature < 0 ||

        request.temperature > 2

      )

    ) {

      throw new InvalidRequestError(

        "Temperature must be between 0 and 2."

      );

    }

  }
    // ---------------------------------------------------------------------------
  // Gemini SDK Request
  // ---------------------------------------------------------------------------

  /**
   * Executes a single request against Gemini.
   *
   * This method is intentionally "dumb".
   *
   * It:
   *  - calls Gemini
   *  - returns the raw SDK response
   *
   * It does NOT:
   *  - retry
   *  - rotate keys
   *  - parse output
   */
  private async executeGeminiRequest(
    client: ReturnType<GeminiClientFactory["createClient"]>,
    request: AIRequest,
    key: APIKeyInfo,
  ): Promise<GenerateContentResponse> {

    const model =
      request.model ??
      this.defaultModel;

    try {

      const response =
        await client.models.generateContent({

          model,

          contents:
            request.prompt,

          config: {

            systemInstruction:
              request.systemInstruction,

            temperature:
              request.temperature,

            maxOutputTokens:
              request.maxOutputTokens,

            responseMimeType:
              request.responseMimeType,

          },

        });

      return response;

    }

    catch (error) {

      // Bubble the SDK error upward.
      // mapProviderError() will classify it.
      throw error;

    }

  }

    // ---------------------------------------------------------------------------
  // Response Parser
  // ---------------------------------------------------------------------------

  /**
   * Converts the Gemini SDK response into the standardized AIResponse.
   *
   * The rest of NotePilot should NEVER directly consume the Gemini SDK response.
   */
  private parseResponse(
    response: GenerateContentResponse,
    request: AIRequest,
    key: APIKeyInfo,
  ): AIResponse {

    const text =
      response.text;

    if (

      !text ||

      text.trim().length === 0

    ) {

      throw new ResponseParseError(

        "Gemini returned an empty response."

      );

    }

    return {

      text,

      provider:
        AIProvider.GEMINI,

      model:
        request.model ??
        this.defaultModel,

      keyIndex:
        key.index,

      usage: {

        inputTokens:
          response.usageMetadata?.promptTokenCount,

        outputTokens:
          response.usageMetadata?.candidatesTokenCount,

        totalTokens:
          response.usageMetadata?.totalTokenCount,

      },

      metadata: {

        finishReason:
          response.candidates?.[0]?.finishReason,

        responseId:
          response.responseId,

      },

    };

  }


    // ---------------------------------------------------------------------------
  // Error Mapping
  // ---------------------------------------------------------------------------

  /**
   * Converts unknown Gemini SDK errors into standardized AI errors.
   *
   * Priority:
   *
   * 1. HTTP Status
   * 2. SDK Error Code
   * 3. Message Inspection
   * 4. Unknown Error
   */
  private mapProviderError(
    error: unknown,
  ): AIError {

    // Already mapped.

    if (error instanceof AIError) {

      return error;

    }

    const err =
      error as Record<string, unknown>;

    const message =
      String(
        err?.message ??
        "Unknown Gemini provider error."
      );

    const status =
      typeof err?.status === "number"
        ? err.status
        : undefined;

    const code =
      typeof err?.code === "string"
        ? err.code.toUpperCase()
        : undefined;

    // -----------------------------------------------------------------------
    // HTTP Status Mapping
    // -----------------------------------------------------------------------

    switch (status) {

      case 400:
        return new InvalidRequestError(message);

      case 401:
      case 403:
        return new InvalidAPIKeyError(message);

      case 408:
        return new ProviderTimeoutError(message);

      case 429:
        return new RateLimitError(message);

      case 503:
      case 504:
        return new ServiceUnavailableError(message);

    }

    // -----------------------------------------------------------------------
    // SDK Error Code Mapping
    // -----------------------------------------------------------------------

    switch (code) {

      case "RESOURCE_EXHAUSTED":
        return new QuotaExceededError(message);

      case "UNAUTHENTICATED":
        return new InvalidAPIKeyError(message);

      case "PERMISSION_DENIED":
        return new InvalidAPIKeyError(message);

      case "DEADLINE_EXCEEDED":
        return new ProviderTimeoutError(message);

      case "UNAVAILABLE":
        return new ServiceUnavailableError(message);

    }

    // -----------------------------------------------------------------------
    // Message Inspection
    // -----------------------------------------------------------------------

    const lower =
      message.toLowerCase();

    if (

      lower.includes("quota") ||

      lower.includes("resource exhausted")

    ) {

      return new QuotaExceededError(message);

    }

    if (

      lower.includes("429") ||

      lower.includes("rate limit")

    ) {

      return new RateLimitError(message);

    }

    if (

      lower.includes("api key") ||

      lower.includes("authentication") ||

      lower.includes("unauthorized")

    ) {

      return new InvalidAPIKeyError(message);

    }

    if (

      lower.includes("timeout") ||

      lower.includes("deadline")

    ) {

      return new ProviderTimeoutError(message);

    }

    if (

      lower.includes("503") ||

      lower.includes("service unavailable") ||

      lower.includes("temporarily unavailable")

    ) {

      return new ServiceUnavailableError(message);

    }

    return new UnknownProviderError(message);

  }

    // ---------------------------------------------------------------------------
  // Logging Helpers
  // ---------------------------------------------------------------------------

  /**
   * Logs retry attempts.
   *
   * NOTE:
   * Never log API keys.
   * Only log the key index.
   */
  private logRetry(
    keyIndex: number,
    attempt: number,
    delayMs: number,
    error: Error,
  ): void {

    console.info(

      `[GeminiProvider] Retry ${attempt}`,

      {

        keyIndex,

        delayMs,

        error: error.message,

      }

    );

  }

  /**
   * Logs when an API key ultimately fails.
   */
  private logKeyFailure(
    keyIndex: number,
    error: AIError,
  ): void {

    console.warn(

      `[GeminiProvider] API Key Failed`,

      {

        keyIndex,

        error: error.name,

        message: error.message,

        retryable: error.retryable,

      }

    );

   }

}
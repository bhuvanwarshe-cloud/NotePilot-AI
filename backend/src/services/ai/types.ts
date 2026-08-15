/**
 * ============================================================================
 * AI Infrastructure Types
 * ============================================================================
 *
 * Shared contracts used across the AI Provider Infrastructure.
 *
 * Responsibilities:
 * - Provider definitions
 * - Request/Response contracts
 * - Retry configuration
 * - Provider configuration
 * - Key pool contracts
 *
 * This file intentionally contains no implementation logic.
 * ============================================================================
 */

export enum AIProvider {
  GEMINI = "gemini",

  GROQ = "groq",

  OPENAI = "openai",
}

export interface AIRequest {
  prompt: string;

  systemInstruction?: string;

  temperature?: number;

  maxOutputTokens?: number;

  model?: string;

  responseMimeType?: string;
}

export interface AIResponse {
  text: string;

  provider: AIProvider;

  model: string;

  keyIndex: number;

  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  metadata?: Record<string, unknown>;
}

export interface RetryOptions {
  maxRetries: number;

  initialDelayMs: number;

  maxDelayMs: number;

  backoffMultiplier: number;

  shouldRetry?: (error: Error) => boolean;
}

export interface AIProviderConfig {
  provider: AIProvider;

  defaultModel: string;

  retryOptions: RetryOptions;
}

export interface APIKeyInfo {
  key: string;

  index: number;
}

export interface AIProviderInterface {
  generateContent(request: AIRequest): Promise<AIResponse>;
}
/**
 * ============================================================================
 * Provider Router
 * ============================================================================
 *
 * Central entry point for AI provider selection.
 *
 * Responsibilities:
 *
 * • Select the appropriate provider
 * • Hide provider implementations from the rest of the application
 * • Allow future provider expansion
 *
 * Current Providers:
 *
 * ✓ Gemini
 *
 * Future:
 *
 * ✓ OpenAI
 * ✓ Claude
 * ✓ Grok
 * ✓ DeepSeek
 * ============================================================================
 */

import {
  GeminiProvider,
} from "./providers/geminiProvider";

import type {
  AIProviderInterface,
} from "./types";



export class ProviderRouter {

  // ---------------------------------------------------------------------------
  // Provider Factory
  // ---------------------------------------------------------------------------

  /**
   * Returns the configured AI provider.
   *
   * Currently:
   *
   *   Gemini
   *
   * Future:
   *
   *   Environment variables
   *   User preferences
   *   Cost routing
   *   Automatic failover
   */

  public createProvider(): AIProviderInterface {

    return new GeminiProvider();

  }

}
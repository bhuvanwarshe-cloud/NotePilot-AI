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
 * ============================================================================
 */

import {
  GeminiProvider,
} from "./providers/geminiProvider";

import {
  GroqProvider,
} from "./providers/groqProvider";

import {
  AIProvider,
  AIProviderInterface,
} from "./types";


export class ProviderRouter {

  /**
   * Returns the requested AI provider.
   *
   * If no provider is supplied, the provider configured in
   * AI_PROVIDER is used.
   */
  public createProvider(
    provider?: AIProvider
  ): AIProviderInterface {

    const selectedProvider =
      provider ??
      (
        process.env.AI_PROVIDER as AIProvider ??
        AIProvider.GEMINI
      );

    switch (selectedProvider) {

      case AIProvider.GEMINI:

        return new GeminiProvider();

      case AIProvider.GROQ:

        return new GroqProvider();

      default:

        throw new Error(
          `Unsupported AI provider: ${selectedProvider}`
        );

    }

  }

}
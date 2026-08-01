/**
 * ============================================================================
 * Gemini Client Factory
 * ============================================================================
 *
 * Creates configured Gemini SDK clients.
 *
 * Responsibilities:
 * - Create SDK clients
 * - Hide SDK initialization
 * - Keep SDK-specific code isolated
 *
 * ============================================================================
 */

import {
  GoogleGenAI,
} from "@google/genai";

import type {
  APIKeyInfo,
} from "../../types";


// -----------------------------------------------------------------------------
// Gemini Client Factory
// -----------------------------------------------------------------------------

export class GeminiClientFactory {

  /**
   * Creates a GoogleGenAI client for a specific API key.
   */
  createClient(
    apiKey: APIKeyInfo
  ): GoogleGenAI {

    return new GoogleGenAI({

      apiKey:
        apiKey.key,

    });

  }

}
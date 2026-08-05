/**
 * ============================================================================
 * AI Configuration
 * ============================================================================
 *
 * Central AI configuration shared across the backend.
 *
 * Current Default Provider:
 *
 * ✓ Gemini
 *
 * Future:
 *
 * ✓ OpenAI
 * ✓ Groq
 * ✓ Claude
 * ============================================================================
 */

export const aiConfig = {

  provider:
    process.env.AI_PROVIDER ??
    "gemini",

  model:
    process.env.AI_MODEL ??
    "gemini-3.5-flash",

  temperature:
    Number(
      process.env.AI_TEMPERATURE ??
      0.2,
    ),

  maxTokens:
    Number(
      process.env.AI_MAX_TOKENS ??
      1800,
    ),

  promptVersions: {

    system:
      process.env.SYSTEM_PROMPT_VERSION ??
      "v1",

    knowledge:
      process.env.KNOWLEDGE_PROMPT_VERSION ??
      "v1",

    notes:
      process.env.NOTES_PROMPT_VERSION ??
      "v1",

  },

};

export type SupportedAiProvider =
  "gemini";
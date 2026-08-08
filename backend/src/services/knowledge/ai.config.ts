/**
 * ============================================================================
 * AI Configuration
 * ============================================================================
 *
 * Central configuration for all AI tasks.
 *
 * Each task may use a different provider and model.
 * ============================================================================
 */

export const aiConfig = {

  sourceUnderstanding: {

    provider:
      process.env.SOURCE_UNDERSTANDING_PROVIDER ??
      "gemini",

    model:
      process.env.SOURCE_UNDERSTANDING_MODEL ??
      "gemini-2.5-flash",

  },

  notes: {

    provider:
      process.env.NOTES_PROVIDER ??
      "groq",

    model:
      process.env.NOTES_MODEL ??
      "llama-3.3-70b-versatile",

  },

  flashcards: {

    provider:
      process.env.FLASHCARDS_PROVIDER ??
      "groq",

    model:
      process.env.FLASHCARDS_MODEL ??
      "llama-3.3-70b-versatile",

  },

  quiz: {

  provider:
    process.env.QUIZ_PROVIDER ??
    "groq",

  model:
    process.env.QUIZ_MODEL ??
    "llama-3.3-70b-versatile",

  maxTokens:
    Number(
      process.env.QUIZ_MAX_TOKENS ??
      5000
    ),

},

  temperature:
    Number(
      process.env.AI_TEMPERATURE ??
      0.2
    ),

  maxTokens:
    Number(
      process.env.AI_MAX_TOKENS ??
      1800
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
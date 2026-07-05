export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'groq',
  model: process.env.AI_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  temperature: Number(process.env.AI_TEMPERATURE || 0.2),
  maxTokens: Number(process.env.AI_MAX_TOKENS || 1800),
  promptVersions: {
    system: process.env.SYSTEM_PROMPT_VERSION || 'v1',
    knowledge: process.env.KNOWLEDGE_PROMPT_VERSION || 'v1',
    notes: process.env.NOTES_PROMPT_VERSION || 'v1',
  },
};

export type SupportedAiProvider = 'groq';

import { aiConfig } from '../ai.config';
import { GroqProvider } from './groq.provider';

export interface GenerationRequest {
  systemPrompt: string;
  taskPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiProvider {
  providerName: string;
  generate(request: GenerationRequest): Promise<string>;
}

export class ProviderRouter {
  createProvider(): AiProvider {
    if (aiConfig.provider === 'groq') {
      return new GroqProvider(aiConfig.model);
    }

    throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
  }
}

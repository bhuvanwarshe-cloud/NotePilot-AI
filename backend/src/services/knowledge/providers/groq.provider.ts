import Groq from 'groq-sdk';
import { aiConfig } from '../ai.config';
import type { AiProvider, GenerationRequest } from './provider.router';
import { log } from '../../../utils/logger';

export class GroqProvider implements AiProvider {
  readonly providerName = 'groq';
  private readonly client: Groq;

  constructor(private readonly model: string = aiConfig.model) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set. Add it to backend/.env');
    }

    this.client = new Groq({ apiKey });
  }

  async generate(request: GenerationRequest): Promise<string> {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: request.model || this.model,
      temperature: request.temperature ?? aiConfig.temperature,
      max_tokens: request.maxTokens ?? aiConfig.maxTokens,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.taskPrompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content ?? '';
    const durationMs = Date.now() - startTime;

    log.info('GroqProvider', 'Knowledge generation response received', {
      'Model': request.model || this.model,
      'Duration': `${durationMs}ms`,
      'Chars': String(content.length),
    });

    return content;
  }
}

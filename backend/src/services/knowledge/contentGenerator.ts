import { systemPrompt } from './prompts/system.prompt';
import { notesPrompt } from './prompts/notes.prompt';
import { philosophyPrompt } from './prompts/shared/philosophy.prompt';
import { formattingPrompt } from './prompts/shared/formatting.prompt';
import { aiConfig } from './ai.config';
import { ProviderRouter } from './providers/provider.router';
import type { GenerationMetadata, KnowledgeArtifact } from './types';
import { MarkdownFormatter } from './markdownFormatter';
import { log } from '../../utils/logger';

export interface ContentGenerationRequest {
  lectureId: string;
  title?: string | null;
  transcriptText: string;
  language?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export class ContentGenerator {
  constructor(
    private readonly providerRouter = new ProviderRouter(),
    private readonly markdownFormatter = new MarkdownFormatter()
  ) {}

  async generateNotes(request: ContentGenerationRequest): Promise<{ content: string; metadata: GenerationMetadata; artifact: KnowledgeArtifact }> {
    const provider = this.providerRouter.createProvider();
    const system = [systemPrompt, philosophyPrompt, formattingPrompt].join('\n\n');
    const task = `${notesPrompt}\n\nLecture title: ${request.title ?? 'Untitled lecture'}\n\nTranscript:\n${request.transcriptText}`;

    const generatedText = await provider.generate({
      systemPrompt: system,
      taskPrompt: task,
      model: aiConfig.model,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens,
    });

    const formattedContent = this.markdownFormatter.format(generatedText);

    const artifact: KnowledgeArtifact = {
      topics: [],
      definitions: [],
      formulae: [],
      examples: [],
      importantConcepts: [],
      examInsights: [],
      rawMarkdown: formattedContent,
    };

    const metadata: GenerationMetadata = {
      provider: provider.providerName,
      model: aiConfig.model,
      systemPromptVersion: aiConfig.promptVersions.system,
      taskPromptVersion: aiConfig.promptVersions.notes,
      temperature: aiConfig.temperature,
      generatedAt: new Date().toISOString(),
    };

    log.success('ContentGenerator', 'Notes content generated', {
      'Lecture ID': request.lectureId,
      'Provider': metadata.provider,
      'Model': metadata.model,
      'Chars': String(formattedContent.length),
    });

    return { content: formattedContent, metadata, artifact };
  }
}

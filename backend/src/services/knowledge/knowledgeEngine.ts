import { log } from '../../utils/logger';
import { ContentGenerator } from './contentGenerator';
import type { KnowledgeArtifactRepository } from './knowledgeArtifact.repository';
import type { GenerationMetadata, KnowledgeArtifact, KnowledgeGenerationInput } from './types';

export class KnowledgeEngine {
  constructor(
    private readonly contentGenerator: ContentGenerator,
    private readonly artifactRepository: KnowledgeArtifactRepository
  ) {}

  async generateNotes(input: KnowledgeGenerationInput): Promise<{ content: string; metadata: GenerationMetadata; artifact: KnowledgeArtifact }> {
    log.info('KnowledgeEngine', 'Starting knowledge generation flow', {
      'Lecture ID': input.lectureId,
      'Language': input.language ?? 'unknown',
      'Source': input.source ?? 'unknown',
    });

    const result = await this.contentGenerator.generateNotes({
      lectureId: input.lectureId,
      title: input.title,
      transcriptText: input.transcriptText,
      language: input.language,
      source: input.source,
      metadata: input.metadata,
    });

    await this.artifactRepository.saveArtifact(input.lectureId, result.artifact, {
      provider: result.metadata.provider,
      model: result.metadata.model,
      systemPromptVersion: result.metadata.systemPromptVersion,
      taskPromptVersion: result.metadata.taskPromptVersion,
      generatedAt: result.metadata.generatedAt,
    });

    return result;
  }
}

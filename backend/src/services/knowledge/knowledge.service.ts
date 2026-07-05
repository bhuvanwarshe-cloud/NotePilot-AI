import { SupabaseClient } from '@supabase/supabase-js';
import { insertNote } from '../../repositories/notes.repository';
import { updateAIJobStatus } from '../aiJob.service';
import { log } from '../../utils/logger';
import { KnowledgeEngine } from './knowledgeEngine';
import { InMemoryKnowledgeArtifactRepository } from './knowledgeArtifact.repository';
import { ContentGenerator } from './contentGenerator';
import type { KnowledgeGenerationInput } from './types';

export interface GenerateNotesOptions {
  supabase: SupabaseClient;
  lectureId: string;
  aiJobId: string;
  input: KnowledgeGenerationInput;
}

export async function generateNotesFromTranscript(opts: GenerateNotesOptions): Promise<{ noteId: string }> {
  const { supabase, lectureId, aiJobId, input } = opts;

  const artifactRepository = new InMemoryKnowledgeArtifactRepository();
  const knowledgeEngine = new KnowledgeEngine(new ContentGenerator(), artifactRepository);

  try {
    await updateAIJobStatus(supabase, aiJobId, 'processing', 'understanding', 90);
    const result = await knowledgeEngine.generateNotes(input);

    await updateAIJobStatus(supabase, aiJobId, 'processing', 'notes_generation', 95);

    const { id: noteId } = await insertNote(supabase, {
      lectureId,
      content: result.content,
      generatedBy: 'knowledge-engine',
      status: 'completed',
      version: 1,
      title: input.title ?? 'Smart Notes',
      sourceType: 'ai',
    });

    await updateAIJobStatus(supabase, aiJobId, 'completed', 'completed', 100);

    log.success('KnowledgeService', 'Smart notes saved', {
      'Lecture ID': lectureId,
      'Note ID': noteId,
      'Provider': result.metadata.provider,
      'Model': result.metadata.model,
    });

    return { noteId };
  } catch (error: any) {
    await updateAIJobStatus(supabase, aiJobId, 'failed', 'notes_generation', 0, error?.message ?? 'Knowledge generation failed').catch((err) => log.error('KnowledgeService', 'Could not update AI job to failed', err));
    throw error;
  }
}

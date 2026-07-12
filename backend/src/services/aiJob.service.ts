import { SupabaseClient } from '@supabase/supabase-js';

export type AiJobType = 'transcription' | 'notes' | 'flashcards' | 'quiz' | 'mind_map';

export async function createAIJob(
  supabase: SupabaseClient,
  userId: string,
  lectureId: string,
  source: string,
  processorKey: string,
  inputType: string,
  textContent?: string,
  jobType: AiJobType = 'transcription',
  metadataOverrides?: Record<string, unknown>
) {
  const metadata: Record<string, unknown> = {
    source,
    processorKey,
    inputType,
    ...(metadataOverrides ?? {}),
  };

  if (textContent) {
    metadata.textContent = textContent;
  }

  const { data, error } = await supabase
    .from('ai_jobs')
    .insert({
      user_id: userId,
      lecture_id: lectureId,
      job_type: jobType,
      status: 'pending',
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create AI job: ${error.message}`);
  }

  return data;
}

/**
 * Updates an AI job's status, fine-grained stage label, progress, and
 * optional error message.
 *
 * stage examples: 'validating' | 'fetching_metadata' | 'downloading_audio' |
 *                 'transcribing' | 'saving_transcript' | 'done' | <failed_at_stage>
 */
export async function updateAIJobStatus(
  supabase: SupabaseClient,
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'manual_action_required',
  stage: string,
  progress: number = 0,
  errorMessage?: string
) {
  const { data: existingJob, error: fetchError } = await supabase
    .from('ai_jobs')
    .select('metadata')
    .eq('id', jobId)
    .single();

  const existingMetadata = (existingJob?.metadata as Record<string, unknown> | undefined) ?? {};
  const metadataUpdate: Record<string, unknown> = {
    ...existingMetadata,
    stage,
  };

  if (errorMessage) metadataUpdate.errorMessage = errorMessage;

  const updates: Record<string, unknown> = {
    status,
    progress,
    metadata: metadataUpdate,
  };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  } else if (status === 'processing' && stage === 'validating') {
    updates.started_at = new Date().toISOString();
  }

  if (errorMessage) {
    updates.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('ai_jobs')
    .update(updates)
    .eq('id', jobId);

  if (fetchError) {
    console.error(`[updateAIJobStatus] Failed to load existing metadata for job ${jobId}:`, fetchError.message);
  }

  if (error) {
    // Non-fatal: log but don't throw — status update failure must not crash the pipeline
    console.error(`[updateAIJobStatus] Failed to update job ${jobId}:`, error.message);
  }
}

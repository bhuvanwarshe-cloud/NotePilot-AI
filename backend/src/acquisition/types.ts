import type { SupabaseClient } from '@supabase/supabase-js';

export type AcquisitionSource =
  | 'youtube'
  | 'audio';

interface BaseAcquisitionInput {
  lectureId: string;
  aiJobId: string;
  supabase: SupabaseClient;
}

export interface YouTubeAcquisitionInput extends BaseAcquisitionInput {
  source: 'youtube';
  url: string;
}

export interface AudioAcquisitionInput extends BaseAcquisitionInput {
  source: 'audio';
  filePath: string;
  fileName: string;
  mimeType: string;
}

export type TranscriptAcquisitionInput =
  | YouTubeAcquisitionInput
  | AudioAcquisitionInput;
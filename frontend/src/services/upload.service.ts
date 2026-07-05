import { supabase } from '../lib/supabase';
import type { SourceType } from '../pages/Upload/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UploadLectureParams {
  title: string;
  source: SourceType;
  file?: File;
  url?: string;
  text?: string;
}

export interface UploadLectureResponse {
  lectureId: string;
  title: string;
  status: string;
  createdAt: string;
  source: string;
  aiJobId: string;
}

export async function uploadLecture(params: UploadLectureParams): Promise<UploadLectureResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload.');
  }

  let body: any;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${session.access_token}`,
  };

  // As requested, YouTube and Text sources use JSON, others use multipart/form-data
  if (['youtube', 'text'].includes(params.source)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      title: params.title,
      source: params.source,
      url: params.url,
      text: params.text,
    });
  } else {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('source', params.source);
    if (params.file) {
      formData.append('file', params.file);
    }
    body = formData;
  }

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers,
    body,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || result.error || 'Failed to upload lecture');
  }

  return result.data as UploadLectureResponse;
}

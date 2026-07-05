export type UploadStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface QueuedFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export type SourceType = 'audio' | 'video' | 'youtube' | 'pdf' | 'textbook' | 'handwritten' | 'text';

export interface SourceConfigItem {
  id: SourceType;
  title: string;
  description: string;
  icon: any; // We'll pass the lucide-react component
  acceptedTypes: string;
  maxFileSize: string;
  multiple: boolean;
  tips: string[];
  processor: string;
}

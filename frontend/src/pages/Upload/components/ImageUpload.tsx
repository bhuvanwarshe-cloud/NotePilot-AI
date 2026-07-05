import { DropzoneUpload } from './DropzoneUpload';
import { sourceConfig } from '../sourceConfig';

interface ImageUploadProps {
  sourceId: 'textbook' | 'handwritten';
  onFilesAdded: (files: File[]) => void;
}

export function ImageUpload({ sourceId, onFilesAdded }: ImageUploadProps) {
  const config = sourceConfig[sourceId];
  
  return (
    <DropzoneUpload
      title={config.title}
      description={config.description}
      acceptedTypes={config.acceptedTypes}
      icon={config.icon}
      multiple={config.multiple}
      maxFileSize={config.maxFileSize}
      onFilesAdded={onFilesAdded}
    />
  );
}

import { DropzoneUpload } from './DropzoneUpload';
import { sourceConfig } from '../sourceConfig';

interface AudioUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export function AudioUpload({ onFilesAdded }: AudioUploadProps) {
  const config = sourceConfig.audio;
  
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

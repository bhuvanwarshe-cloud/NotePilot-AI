import { DropzoneUpload } from './DropzoneUpload';
import { sourceConfig } from '../sourceConfig';

interface VideoUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export function VideoUpload({ onFilesAdded }: VideoUploadProps) {
  const config = sourceConfig.video;
  
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

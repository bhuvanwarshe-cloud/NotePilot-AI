import { DropzoneUpload } from './DropzoneUpload';
import { sourceConfig } from '../sourceConfig';

interface PDFUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export function PDFUpload({ onFilesAdded }: PDFUploadProps) {
  const config = sourceConfig.pdf;
  
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

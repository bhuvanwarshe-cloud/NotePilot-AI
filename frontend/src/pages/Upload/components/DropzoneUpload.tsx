import { useState } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface DropzoneUploadProps {
  title: string;
  description: string;
  acceptedTypes: string;
  icon: any;
  multiple: boolean;
  maxFileSize: string;
  placeholderText?: string;
  onFilesAdded: (files: File[]) => void;
}

export function DropzoneUpload({
  title,
  description,
  acceptedTypes,
  icon: Icon,
  multiple,
  maxFileSize,
  onFilesAdded
}: DropzoneUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesAdded(multiple ? files : [files[0]]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesAdded(multiple ? files : [files[0]]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        background: isDragActive ? 'var(--np-blue-subtle)' : 'var(--np-surface)',
        border: `2px dashed ${isDragActive ? 'var(--np-blue)' : 'var(--np-border-strong)'}`,
        borderRadius: 24,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        position: 'relative',
        width: '100%',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple={multiple}
        accept={acceptedTypes}
        onChange={handleChange}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        }}
        title=""
      />
      
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: isDragActive ? 'var(--np-blue)' : 'var(--np-bg-secondary)',
        color: isDragActive ? '#fff' : 'var(--np-text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        transition: 'all 0.2s ease'
      }}>
        <Icon size={32} />
      </div>

      <h3 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 700, color: 'var(--np-text-primary)' }}>
        {isDragActive ? 'Drop your files here' : title}
      </h3>
      
      <p style={{ margin: '0 0 24px 0', fontSize: 16, color: 'var(--np-text-secondary)', maxWidth: 400 }}>
        {description}
      </p>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        background: 'var(--np-blue)',
        color: '#fff',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
      }}>
        <Upload size={18} />
        Select {multiple ? 'Files' : 'File'}
      </div>
      
      <p style={{ margin: '24px 0 0 0', fontSize: 13, color: 'var(--np-text-muted)' }}>
        Max file size: {maxFileSize}
      </p>
    </motion.div>
  );
}

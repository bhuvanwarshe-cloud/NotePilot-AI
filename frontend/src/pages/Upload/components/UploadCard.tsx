import { X, FileAudio, FileVideo, FileText, File as FileIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { QueuedFile } from '../types';

interface UploadCardProps {
  queuedFile: QueuedFile;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getIcon(type: string) {
  if (type.startsWith('audio/')) return <FileAudio size={24} color="var(--np-blue)" />;
  if (type.startsWith('video/')) return <FileVideo size={24} color="var(--np-purple)" />;
  if (type.startsWith('application/pdf')) return <FileText size={24} color="#EF4444" />;
  return <FileIcon size={24} color="var(--np-text-secondary)" />;
}

export function UploadCard({ queuedFile, onRemove }: UploadCardProps) {
  const { id, file, status, progress, error } = queuedFile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: 'var(--np-shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Progress Bar */}
      {status === 'uploading' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            background: 'linear-gradient(90deg, var(--np-blue), var(--np-purple))',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--np-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getIcon(file.type)}
      </div>

      {/* File Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--np-text-primary)',
            margin: '0 0 4px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {file.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--np-text-muted)' }}>
          <span>{formatSize(file.size)}</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--np-border-strong)' }} />
          
          {/* Status Badge */}
          {status === 'queued' && <span>Ready to upload</span>}
          {status === 'uploading' && <span style={{ color: 'var(--np-blue)' }}>Uploading {progress}%</span>}
          {status === 'processing' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--np-purple)' }}>
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
            </span>
          )}
          {status === 'completed' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981' }}>
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
          {status === 'failed' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#EF4444' }}>
              <AlertCircle size={12} /> {error || 'Failed'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onRemove(id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          color: 'var(--np-text-muted)',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--np-bg-secondary)';
          (e.currentTarget as HTMLElement).style.color = 'var(--np-text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--np-text-muted)';
        }}
      >
        <X size={18} />
      </button>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </motion.div>
  );
}

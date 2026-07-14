import { motion } from 'framer-motion';
import { UploadCloud, FileAudio, FileVideo, FileText, CheckCircle2, Loader2, AlertCircle, Upload } from 'lucide-react';
import type { Lecture } from './RecentLectures';
import { Link } from 'react-router-dom';

interface RecentUploadsProps {
  uploads: Lecture[];
}

export function RecentUploads({ uploads }: RecentUploadsProps) {
  if (uploads.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'audio': return <FileAudio size={16} />;
      case 'video':
      case 'youtube': return <FileVideo size={16} />;
      case 'pdf':
      case 'text':
      default: return <FileText size={16} />;
    }
  };

  const getStatusDisplay = (upload: Lecture) => {
    // AI job metadata takes priority: manualActionRequired is stored in metadata,
    // not in status (which stays 'failed' to remain within the Postgres enum).
    if (upload.jobManualAction === true) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--np-yellow, #F59E0B)', fontSize: 12, fontWeight: 500 }}>
            <AlertCircle size={12} />
            Access restricted
          </div>
          {upload.jobUserMessage && (
            <p style={{
              margin: 0,
              fontSize: 11,
              color: 'var(--np-text-secondary)',
              lineHeight: 1.5,
              maxWidth: 340,
            }}>
              {upload.jobUserMessage}
            </p>
          )}
          <Link
            to="/upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--np-blue)',
              textDecoration: 'none',
              marginTop: 2,
            }}
          >
            <Upload size={10} />
            Upload audio instead
          </Link>
        </div>
      );
    }

    // Lecture lifecycle states
    switch (upload.status) {
      case 'uploaded':
      case 'processing':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--np-blue)', fontSize: 12, fontWeight: 500 }}>
            <Loader2 size={12} className="animate-spin" />
            Processing Transcript...
          </div>
        );
      case 'transcribed':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 500 }}>
            <Loader2 size={12} className="animate-spin" />
            Generating Smart Notes...
          </div>
        );
      case 'completed':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 500 }}>
            <CheckCircle2 size={12} />
            Ready to Study
          </div>
        );
      case 'failed':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--np-error)', fontSize: 12, fontWeight: 500 }}>
            <AlertCircle size={12} />
            Processing failed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <UploadCloud size={20} color="var(--np-text-primary)" />
        <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--np-text-primary)', margin: 0 }}>
          Recent Uploads
        </h2>
      </div>

      <div style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 16,
        boxShadow: 'var(--np-shadow-card)',
        overflow: 'hidden'
      }}>
        {uploads.map((upload, index) => (
          <div
            key={upload.id}
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: index < uploads.length - 1 ? '1px solid var(--np-border)' : 'none',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--np-bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--np-text-secondary)',
                flexShrink: 0
              }}>
                {getIcon(upload.type)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  margin: '0 0 4px 0', fontSize: 14, fontWeight: 600,
                  color: 'var(--np-text-primary)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {upload.title || 'Untitled Upload'}
                </p>
                {getStatusDisplay(upload)}
              </div>
            </div>
            
            <div style={{ fontSize: 12, color: 'var(--np-text-muted)', flexShrink: 0 }}>
              {upload.date}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

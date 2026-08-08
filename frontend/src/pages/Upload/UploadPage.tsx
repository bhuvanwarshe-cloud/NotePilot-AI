import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadHero } from './components/UploadHero';
import { SourceSelector } from './components/SourceSelector';
import { UploadTips } from './components/UploadTips';
import { AudioUpload } from './components/AudioUpload';
import { VideoUpload } from './components/VideoUpload';
import { PDFUpload } from './components/PDFUpload';
import { ImageUpload } from './components/ImageUpload';
import { YouTubeUpload } from './components/YouTubeUpload';
import { TextUpload } from './components/TextUpload';
import type { SourceType } from './types';
import { sourceConfig } from './sourceConfig';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadLecture } from '../../services/upload.service';

export function UploadPage() {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (params: { file?: File; url?: string; text?: string }) => {
    if (!selectedSource) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Determine a title based on the input
      let title = 'Untitled Lecture';
      if (params.file) {
        title = params.file.name;
      } else if (params.url) {
        title = params.url; // We'll fetch real title later in the pipeline
      } else if (params.text) {
        title = params.text.substring(0, 30) + '...';
      }

      await uploadLecture({
        title,
        source: selectedSource,
        file: params.file,
        url: params.url,
        text: params.text
      });
      
      // On success, redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload lecture');
      setIsUploading(false);
    }
  };

  const renderUploader = () => {
    if (isUploading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--np-blue)', marginBottom: 16 }} />
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Uploading to NotePilot...</h3>
          <p style={{ margin: '8px 0 0 0', color: 'var(--np-text-secondary)' }}>Please do not close this window.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--np-error)',
            borderRadius: 12,
            color: 'var(--np-error)'
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {(() => {
          switch (selectedSource) {
            case 'audio':
              return <AudioUpload onFilesAdded={(files) => handleUpload({ file: files[0] })} />;
            case 'video':
              return <VideoUpload onFilesAdded={(files) => handleUpload({ file: files[0] })} />;
            case 'pdf':
              return <PDFUpload onFilesAdded={(files) => handleUpload({ file: files[0] })} />;
            case 'textbook':
            case 'handwritten':
              return <ImageUpload sourceId={selectedSource} onFilesAdded={(files) => handleUpload({ file: files[0] })} />;
            case 'youtube':
              return <YouTubeUpload onUpload={(url) => handleUpload({ url })} />;
            case 'text':
              return <TextUpload onUpload={(text) => handleUpload({ text })} />;
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="np-dashboard-grid" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <UploadHero />

      <div className="np-main-grid" style={{ gap: 32 }}>
        {/* Left Column — 8 of 12 on desktop, full-width on mobile */}
        <div className="np-col-8" style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {!selectedSource ? (
              <motion.div
                key="selector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <SourceSelector onSelectSource={setSelectedSource} />
              </motion.div>
            ) : (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%' }}
              >
                {!isUploading && (
                  <div style={{ marginBottom: 24 }}>
                    <button
                      onClick={() => { setSelectedSource(null); setError(null); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--np-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '8px 0',
                        transition: 'color 0.2s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--np-text-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--np-text-secondary)'}
                    >
                      <ArrowLeft size={16} />
                      Change Source
                    </button>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700, color: 'var(--np-text-primary)' }}>
                      {sourceConfig[selectedSource].title} Upload
                    </h2>
                  </div>
                )}
                
                {renderUploader()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column — 4 of 12 on desktop, full-width on mobile */}
        <div className="np-col-4">
          <UploadTips source={selectedSource} />
        </div>
      </div>
    </div>
  );
}

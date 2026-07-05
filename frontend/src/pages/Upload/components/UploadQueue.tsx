import { AnimatePresence } from 'framer-motion';
import { UploadCard } from './UploadCard';
import type { QueuedFile } from '../types';

interface UploadQueueProps {
  queuedFiles: QueuedFile[];
  onRemove: (id: string) => void;
}

export function UploadQueue({ queuedFiles, onRemove }: UploadQueueProps) {
  if (queuedFiles.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
      <AnimatePresence>
        {queuedFiles.map((qFile) => (
          <UploadCard key={qFile.id} queuedFile={qFile} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

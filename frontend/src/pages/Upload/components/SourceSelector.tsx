import { motion } from 'framer-motion';
import { SourceCard } from './SourceCard';
import { sourceConfig } from '../sourceConfig';
import type { SourceType } from '../types';

interface SourceSelectorProps {
  onSelectSource: (source: SourceType) => void;
}

export function SourceSelector({ onSelectSource }: SourceSelectorProps) {
  const sources = Object.values(sourceConfig);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
        width: '100%',
      }}
    >
      {sources.map((source) => (
        <SourceCard
          key={source.id}
          source={source}
          onClick={() => onSelectSource(source.id)}
        />
      ))}
    </motion.div>
  );
}

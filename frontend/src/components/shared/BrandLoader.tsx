import { motion } from 'framer-motion';

interface BrandLoaderProps {
  className?: string;
}

export function BrandLoader({ className = '' }: BrandLoaderProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <motion.img
        src="/logo-icon.svg"
        alt="Loading..."
        className="w-full h-full object-contain"
        animate={{ 
          filter: [
            'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))', 
            'drop-shadow(0 0 16px rgba(139, 92, 246, 0.6))', 
            'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))'
          ] 
        }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { DesignSystem } from '@/styles/design-system';

export function AnimatedGradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-30 blur-[100px]"
        style={{ background: DesignSystem.colors.electricBlue }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-30 blur-[100px]"
        style={{ background: DesignSystem.colors.purpleAccent }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full blur-[120px]"
        style={{ background: `linear-gradient(to right, ${DesignSystem.colors.electricBlue}, ${DesignSystem.colors.purpleAccent})` }}
      />
    </div>
  );
}

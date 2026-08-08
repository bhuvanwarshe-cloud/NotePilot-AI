import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function QuizLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', minHeight: 400 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Loader2 size={40} color="var(--np-blue)" />
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: 24, color: 'var(--np-text-secondary)', fontSize: 16, fontWeight: 500 }}>
        Loading your quiz...
      </motion.p>
    </div>
  );
}

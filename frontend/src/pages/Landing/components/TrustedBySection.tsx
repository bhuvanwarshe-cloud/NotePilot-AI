import { motion } from 'framer-motion';

const stats = [
  { label: 'Lectures Processed', value: '2.5M+', color: '#3B82F6' },
  { label: 'Notes Generated', value: '10M+', color: '#8B5CF6' },
  { label: 'Flashcards Created', value: '50M+', color: '#10B981' },
  { label: 'Study Hours Saved', value: '5M+', color: '#F59E0B' },
];

export function TrustedBySection() {
  return (
    <section className="relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] mb-10"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Trusted by students at 500+ universities worldwide
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center relative group"
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"
                style={{ background: stat.color }}
              />
              <div
                className="text-3xl md:text-4xl font-extrabold mb-2 tabular-nums"
                style={{
                  background: `linear-gradient(135deg, #fff 0%, ${stat.color} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

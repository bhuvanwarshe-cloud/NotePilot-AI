import { motion } from 'framer-motion';
import { UploadCloud, Cpu, BrainCircuit } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Upload Any Material',
    description: 'Drag and drop your lecture recordings (video/audio), YouTube links, PDFs, or PowerPoint slides.',
    icon: UploadCloud,
    iconColor: 'var(--np-blue)',
  },
  {
    number: '02',
    title: 'AI Processing Engine',
    description: 'Our advanced models transcribe, analyze, and structure the content into digestible learning modules instantly.',
    icon: Cpu,
    iconColor: 'var(--np-purple)',
  },
  {
    number: '03',
    title: 'Study Smarter',
    description: 'Review structured notes, test yourself with flashcards, and ask the AI Tutor for clarification on complex topics.',
    icon: BrainCircuit,
    iconColor: 'var(--np-green)',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative overflow-hidden"
      style={{
        background: 'var(--np-bg-secondary)',
        borderTop: '1px solid var(--np-border)',
        borderBottom: '1px solid var(--np-border)',
      }}
    >
      {/* Decorative gradient blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl -z-10 pointer-events-none"
        style={{ background: 'var(--np-blue-subtle)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--np-text-primary)' }}
          >
            How NotePilot Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl"
            style={{ color: 'var(--np-text-secondary)' }}
          >
            From raw lecture to exam-ready mastery in three simple steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div
            className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5"
            style={{
              background: `linear-gradient(90deg, var(--np-blue), var(--np-purple))`,
              opacity: 0.4,
            }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative flex flex-col items-center text-center"
              >
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 relative z-10 transition-all duration-300"
                  style={{
                    background: 'var(--np-surface)',
                    border: '1px solid var(--np-border)',
                    boxShadow: 'var(--np-shadow-card)',
                  }}
                >
                  {/* Step number badge */}
                  <div
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                      color: '#fff',
                      boxShadow: '0 2px 8px var(--np-blue-glow)',
                    }}
                  >
                    {step.number}
                  </div>
                  <Icon size={32} style={{ color: step.iconColor }} />
                </div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: 'var(--np-text-primary)' }}
                >
                  {step.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--np-text-secondary)' }}>
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

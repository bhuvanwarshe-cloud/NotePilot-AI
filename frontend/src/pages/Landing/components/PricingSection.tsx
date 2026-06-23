import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 relative"
      style={{
        background: 'var(--np-bg-secondary)',
        borderTop: '1px solid var(--np-border)',
        borderBottom: '1px solid var(--np-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--np-text-primary)' }}
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl"
            style={{ color: 'var(--np-text-secondary)' }}
          >
            Start for free, upgrade when you need more power.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="p-8 h-full flex flex-col rounded-2xl"
              style={{
                background: 'var(--np-surface)',
                border: '1px solid var(--np-border)',
                boxShadow: 'var(--np-shadow-card)',
              }}
            >
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--np-text-primary)' }}
              >
                Free
              </h3>
              <p className="mb-6" style={{ color: 'var(--np-text-secondary)' }}>
                Perfect for trying out NotePilot.
              </p>
              <div
                className="text-4xl font-extrabold mb-8"
                style={{ color: 'var(--np-text-primary)' }}
              >
                $0
                <span className="text-lg font-normal" style={{ color: 'var(--np-text-secondary)' }}>
                  /mo
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  '3 hours of lecture processing / mo',
                  'Basic notes & summaries',
                  'Limited flashcards',
                  'Standard support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 shrink-0 mr-3 mt-0.5" style={{ color: 'var(--np-blue)' }} />
                    <span style={{ color: 'var(--np-text-primary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full font-semibold rounded-xl"
                style={{
                  background: 'var(--np-surface-raised)',
                  border: '1px solid var(--np-border-strong)',
                  color: 'var(--np-text-primary)',
                }}
              >
                Get Started
              </Button>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative h-full">
              {/* Gradient border glow */}
              <div
                className="absolute inset-0 rounded-2xl blur-sm -z-10"
                style={{
                  background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                  opacity: 0.5,
                }}
              />
              <div
                className="p-8 h-full flex flex-col rounded-2xl relative"
                style={{
                  background: 'var(--np-surface)',
                  border: '1px solid var(--np-blue)',
                  boxShadow: '0 0 30px var(--np-blue-glow)',
                }}
              >
                {/* Badge */}
                <div
                  className="absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                    color: '#fff',
                  }}
                >
                  Most Popular
                </div>

                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Pro
                </h3>
                <p className="mb-6" style={{ color: 'var(--np-text-secondary)' }}>
                  For serious students who want to ace every exam.
                </p>
                <div
                  className="text-4xl font-extrabold mb-8"
                  style={{ color: 'var(--np-text-primary)' }}
                >
                  $12
                  <span className="text-lg font-normal" style={{ color: 'var(--np-text-secondary)' }}>
                    /mo
                  </span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    'Unlimited lecture processing',
                    'Advanced hierarchical notes',
                    'Unlimited flashcards & mind maps',
                    'AI Tutor access',
                    'Exam Mode crash courses',
                    'Priority support',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 shrink-0 mr-3 mt-0.5" style={{ color: 'var(--np-purple)' }} />
                      <span style={{ color: 'var(--np-text-primary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full font-semibold rounded-xl border-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                    color: '#fff',
                    boxShadow: '0 0 15px var(--np-blue-glow)',
                  }}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

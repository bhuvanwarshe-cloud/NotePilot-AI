import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export function CTASection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ borderTop: '1px solid var(--np-border)' }}
    >
      {/* Background gradient — adapts per theme */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, var(--np-blue-subtle), transparent)' }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-12 overflow-hidden backdrop-blur-xl"
          style={{
            background: 'var(--np-surface)',
            border: '1px solid var(--np-border-strong)',
            boxShadow: 'var(--np-shadow-elevated)',
          }}
        >
          {/* Decorative glows */}
          <div
            className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] rotate-12 blur-3xl rounded-full -z-10"
            style={{ background: 'var(--np-blue-subtle)' }}
          />
          <div
            className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] -rotate-12 blur-3xl rounded-full -z-10"
            style={{ background: 'var(--np-purple-subtle)' }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                boxShadow: '0 0 24px var(--np-blue-glow)',
              }}
            >
              <Rocket className="w-8 h-8" style={{ color: '#fff' }} />
            </div>

            <h2
              className="text-4xl md:text-5xl font-extrabold mb-6"
              style={{ color: 'var(--np-text-primary)' }}
            >
              Ready to upgrade your GPA?
            </h2>
            <p
              className="text-xl mb-10 max-w-2xl mx-auto"
              style={{ color: 'var(--np-text-secondary)' }}
            >
              Join thousands of students who are already learning faster, retaining more, and saving hours of study time every week.
            </p>

            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-lg rounded-full border-0 font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
                color: '#fff',
                boxShadow: '0 0 30px var(--np-blue-glow)',
              }}
            >
              <Link to="/signup">Start Learning for Free</Link>
            </Button>
            <p className="text-sm mt-4" style={{ color: 'var(--np-text-muted)' }}>
              No credit card required. Free plan available.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

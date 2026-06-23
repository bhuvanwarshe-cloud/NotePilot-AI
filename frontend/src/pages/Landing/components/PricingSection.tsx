import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-backgroundSecondary/50 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
          <p className="text-xl text-textSecondary">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-textPrimary mb-2">Free</h3>
              <p className="text-textSecondary mb-6">Perfect for trying out NotePilot.</p>
              
              <div className="text-4xl font-extrabold mb-8">$0<span className="text-lg text-textSecondary font-normal">/mo</span></div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {['3 hours of lecture processing / mo', 'Basic notes & summaries', 'Limited flashcards', 'Standard support'].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-electricBlue shrink-0 mr-3 mt-0.5" />
                    <span className="text-textPrimary">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="w-full bg-surface border border-border hover:bg-white/10 text-white">Get Started</Button>
            </GlassCard>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-electricBlue to-purpleAccent rounded-[1rem] blur-[2px] -z-10" />
              <GlassCard className="p-8 h-full flex flex-col border-electricBlue/50">
                <div className="absolute top-0 right-0 bg-electricBlue text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-purpleAccent mb-2">Pro</h3>
                <p className="text-textSecondary mb-6">For serious students who want to ace every exam.</p>
                
                <div className="text-4xl font-extrabold mb-8">$12<span className="text-lg text-textSecondary font-normal">/mo</span></div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {['Unlimited lecture processing', 'Advanced hierarchical notes', 'Unlimited flashcards & mind maps', 'AI Tutor access', 'Exam Mode crash courses', 'Priority support'].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-purpleAccent shrink-0 mr-3 mt-0.5" />
                      <span className="text-textPrimary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full bg-electricBlue hover:bg-blue-600 text-white border-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">Upgrade to Pro</Button>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

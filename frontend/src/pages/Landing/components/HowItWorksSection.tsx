import { motion } from 'framer-motion';
import { UploadCloud, Cpu, BrainCircuit } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Upload Any Material',
    description: 'Drag and drop your lecture recordings (video/audio), YouTube links, PDFs, or PowerPoint slides.',
    icon: <UploadCloud className="w-8 h-8 text-electricBlue" />
  },
  {
    number: '02',
    title: 'AI Processing Engine',
    description: 'Our advanced models transcribe, analyze, and structure the content into digestible learning modules instantly.',
    icon: <Cpu className="w-8 h-8 text-purpleAccent" />
  },
  {
    number: '03',
    title: 'Study Smarter',
    description: 'Review structured notes, test yourself with flashcards, and ask the AI Tutor for clarification on complex topics.',
    icon: <BrainCircuit className="w-8 h-8 text-green-400" />
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-backgroundSecondary/30 border-y border-border/30 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electricBlue/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            How NotePilot Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-textSecondary"
          >
            From raw lecture to exam-ready mastery in three simple steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-electricBlue/50 to-purpleAccent/50" />

          {steps.map((step, index) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-2xl bg-surface border border-border shadow-xl flex items-center justify-center mb-8 relative z-10 group hover:border-electricBlue/50 transition-colors">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-electricBlue text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {step.number}
                </div>
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-textPrimary mb-4">{step.title}</h3>
              <p className="text-textSecondary leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

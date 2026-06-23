import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  BookOpen,
  Target,
  ListTodo,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Brain,
} from 'lucide-react';

function ExamDashboard() {
  const topics = [
    { name: 'Backpropagation', yield: 95, color: '#EF4444' },
    { name: 'Activation Functions', yield: 82, color: '#F59E0B' },
    { name: 'Gradient Descent', yield: 76, color: '#8B5CF6' },
    { name: 'Regularization', yield: 61, color: '#3B82F6' },
    { name: 'CNN Architecture', yield: 54, color: '#10B981' },
  ];

  const questions = [
    'Explain the vanishing gradient problem and how ReLU mitigates it.',
    'Compare Adam optimizer vs SGD with momentum.',
    'What is dropout and when should you use it?',
  ];

  const mcqs = [
    { q: 'Which activation function prevents vanishing gradients?', options: ['Sigmoid', 'ReLU', 'Tanh', 'Linear'], answer: 1 },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(9, 12, 24, 0.95)',
        border: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Exam Mode</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Neural Networks — Final</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" style={{ color: '#F87171' }} />
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-sm font-bold"
            style={{ color: '#F87171' }}
          >
            6h 42m left
          </motion.span>
        </div>
      </div>

      {/* Content grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Important Topics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4 col-span-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>High-Yield Topics</span>
          </div>
          <div className="space-y-2.5">
            {topics.map((topic, i) => (
              <motion.div
                key={topic.name}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{topic.name}</span>
                  <span className="text-xs font-bold" style={{ color: topic.color }}>{topic.yield}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${topic.yield}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }}
                    style={{ background: topic.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revision Notes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Revision Notes</span>
          </div>
          <div className="space-y-2">
            {[
              { term: 'Backprop', def: 'Chain rule applied backwards to compute gradients.' },
              { term: 'ReLU', def: 'f(x)=max(0,x). Fast, non-saturating activation.' },
              { term: 'Dropout', def: 'Randomly zeros neurons during training to prevent overfitting.' },
            ].map((note, i) => (
              <motion.div
                key={note.term}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-2 rounded-lg"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
              >
                <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>{note.term}: </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{note.def}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Expected Questions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Predicted Questions</span>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="flex items-start gap-2 p-2 rounded-lg"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}
              >
                <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: '#A78BFA' }}>Q{i + 1}.</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{q}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* MCQ Practice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>MCQ Practice</span>
          </div>
          {mcqs.map((mcq, i) => (
            <div key={i}>
              <p className="text-xs font-medium text-white mb-3">{mcq.q}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {mcq.options.map((opt, j) => (
                  <motion.div
                    key={opt}
                    whileHover={{ scale: 1.02 }}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                    style={{
                      background: j === mcq.answer ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${j === mcq.answer ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      color: j === mcq.answer ? '#34D399' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {j === mcq.answer && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {opt}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cheat Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-4 col-span-1 md:col-span-2"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(236,72,153,0.05) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: '#C084FC' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>One-Page Cheat Sheet</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(139,92,246,0.2)', color: '#C084FC' }}>Auto-generated</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '🧠', term: 'Backprop', val: 'Chain rule → backwards' },
              { emoji: '⚡', term: 'ReLU', val: 'f(x) = max(0,x)' },
              { emoji: '🎯', term: 'Loss', val: 'MSE or Cross-Entropy' },
              { emoji: '🔄', term: 'Adam', val: 'Adaptive momentum opt.' },
              { emoji: '🛡️', term: 'Dropout', val: 'p=0.5 during train' },
              { emoji: '📉', term: 'LR Decay', val: 'Step or cosine schedule' },
            ].map((item, i) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="text-xs"
              >
                <span className="mr-1">{item.emoji}</span>
                <span className="font-bold text-white">{item.term}:</span>{' '}
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.val}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export function ExamModeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 -z-10" style={{ background: 'rgba(139,92,246,0.02)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Exam Mode
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            "Prepare me for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 60%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              tomorrow's exam"
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg max-w-2xl mx-auto mb-10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Just say the word. NotePilot synthesizes every lecture, generates high-yield topics, revision notes, predicted questions, MCQs, and a one-page cheat sheet — automatically.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {[
              { icon: AlertTriangle, label: 'Important Topics', color: '#EF4444' },
              { icon: BookOpen,       label: 'Revision Notes',  color: '#3B82F6' },
              { icon: Target,         label: 'Expected Questions', color: '#8B5CF6' },
              { icon: ListTodo,       label: 'MCQs',            color: '#10B981' },
              { icon: FileText,       label: 'Cheat Sheet',     color: '#EC4899' },
              { icon: Brain,          label: 'AI-Powered',      color: '#F59E0B' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow behind dashboard */}
          <div
            className="absolute inset-0 rounded-3xl blur-3xl -z-10 opacity-40"
            style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)' }}
          />
          <ExamDashboard />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            asChild
            size="lg"
            className="h-13 px-10 text-base font-semibold rounded-full border-0 text-white group"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              boxShadow: '0 0 30px rgba(139,92,246,0.35)',
            }}
          >
            <a href="/signup" className="flex items-center gap-2">
              Try Exam Mode Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

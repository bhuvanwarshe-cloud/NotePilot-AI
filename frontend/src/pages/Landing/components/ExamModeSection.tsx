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
    { name: 'Backpropagation',    yield: 95, color: '#EF4444' },
    { name: 'Activation Functions', yield: 82, color: '#F59E0B' },
    { name: 'Gradient Descent',   yield: 76, color: '#8B5CF6' },
    { name: 'Regularization',     yield: 61, color: '#3B82F6' },
    { name: 'CNN Architecture',   yield: 54, color: '#10B981' },
  ];

  const questions = [
    'Explain the vanishing gradient problem and how ReLU mitigates it.',
    'Compare Adam optimizer vs SGD with momentum.',
    'What is dropout and when should you use it?',
  ];

  const mcqs = [
    { q: 'Which activation function prevents vanishing gradients?', options: ['Sigmoid', 'ReLU', 'Tanh', 'Linear'], answer: 1 },
  ];

  const panelStyle = {
    background: 'var(--np-surface-raised)',
    border: '1px solid var(--np-border)',
  };

  const labelStyle = { color: 'var(--np-text-muted)' };

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-purple)',
        boxShadow: 'var(--np-shadow-elevated)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--np-border)', background: 'var(--np-bg-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#fff' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--np-text-primary)' }}>Exam Mode</p>
            <p className="text-xs" style={{ color: 'var(--np-text-muted)' }}>Neural Networks — Final</p>
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

        {/* High-Yield Topics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4 col-span-1"
          style={panelStyle}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>High-Yield Topics</span>
          </div>
          <div className="space-y-2.5">
            {topics.map((topic, i) => (
              <motion.div key={topic.name} initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--np-text-secondary)' }}>{topic.name}</span>
                  <span className="text-xs font-bold" style={{ color: topic.color }}>{topic.yield}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--np-bg-primary)' }}>
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
          style={panelStyle}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Revision Notes</span>
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
                style={{ background: 'var(--np-blue-subtle)', border: '1px solid var(--np-blue-glow)' }}
              >
                <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>{note.term}: </span>
                <span className="text-xs" style={{ color: 'var(--np-text-secondary)' }}>{note.def}</span>
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
          style={panelStyle}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Predicted Questions</span>
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
                style={{ background: 'var(--np-purple-subtle)', border: '1px solid var(--np-purple-glow)' }}
              >
                <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: '#A78BFA' }}>Q{i + 1}.</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--np-text-secondary)' }}>{q}</p>
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
          style={panelStyle}
        >
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>MCQ Practice</span>
          </div>
          {mcqs.map((mcq, i) => (
            <div key={i}>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--np-text-primary)' }}>{mcq.q}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {mcq.options.map((opt, j) => (
                  <motion.div
                    key={opt}
                    whileHover={{ scale: 1.02 }}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                    style={{
                      background: j === mcq.answer ? 'rgba(16,185,129,0.15)' : 'var(--np-surface)',
                      border: `1px solid ${j === mcq.answer ? 'rgba(16,185,129,0.35)' : 'var(--np-border)'}`,
                      color: j === mcq.answer ? '#34D399' : 'var(--np-text-secondary)',
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
            background: 'var(--np-purple-subtle)',
            border: '1px solid var(--np-purple-glow)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: '#C084FC' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>One-Page Cheat Sheet</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(139,92,246,0.2)', color: '#C084FC' }}>Auto-generated</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '🧠', term: 'Backprop',  val: 'Chain rule → backwards' },
              { emoji: '⚡', term: 'ReLU',      val: 'f(x) = max(0,x)' },
              { emoji: '🎯', term: 'Loss',       val: 'MSE or Cross-Entropy' },
              { emoji: '🔄', term: 'Adam',       val: 'Adaptive momentum opt.' },
              { emoji: '🛡️', term: 'Dropout',   val: 'p=0.5 during train' },
              { emoji: '📉', term: 'LR Decay',   val: 'Step or cosine schedule' },
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
                <span className="font-bold" style={{ color: 'var(--np-text-primary)' }}>{item.term}:</span>{' '}
                <span style={{ color: 'var(--np-text-secondary)' }}>{item.val}</span>
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
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: 'var(--np-bg-secondary)' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, var(--np-purple-subtle) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
            style={{ background: 'var(--np-purple-subtle)', color: 'var(--np-purple)', border: '1px solid var(--np-purple-glow)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Exam Mode
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            style={{ color: 'var(--np-text-primary)' }}
          >
            "Prepare me for{' '}
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 60%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              tomorrow's exam"
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg max-w-2xl mx-auto mb-10"
            style={{ color: 'var(--np-text-secondary)' }}
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
              { icon: AlertTriangle, label: 'Important Topics',   color: '#EF4444' },
              { icon: BookOpen,      label: 'Revision Notes',     color: '#3B82F6' },
              { icon: Target,        label: 'Expected Questions', color: '#8B5CF6' },
              { icon: ListTodo,      label: 'MCQs',               color: '#10B981' },
              { icon: FileText,      label: 'Cheat Sheet',        color: '#EC4899' },
              { icon: Brain,         label: 'AI-Powered',         color: '#F59E0B' },
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
          <div
            className="absolute inset-0 rounded-3xl blur-3xl -z-10 opacity-30"
            style={{ background: 'radial-gradient(ellipse at center, var(--np-purple) 0%, var(--np-pink) 50%, transparent 70%)' }}
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
            className="h-13 px-10 text-base font-semibold rounded-full border-0 group"
            style={{
              background: 'linear-gradient(135deg, var(--np-purple), var(--np-pink))',
              color: '#fff',
              boxShadow: '0 0 30px var(--np-purple-glow)',
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

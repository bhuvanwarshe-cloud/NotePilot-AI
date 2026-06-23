import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mic, FileText, Layers, Network, Bot, Target } from 'lucide-react';

// ── Interactive previews per feature ────────────────────────────────────────

function TranscriptionPreview() {
  const lines = [
    { text: 'Professor: Today we explore backpropagation...', speaker: 'Prof', color: '#60A5FA' },
    { text: 'The chain rule forms the mathematical foundation—', speaker: 'Prof', color: '#60A5FA' },
    { text: '—for computing gradients across layers.', speaker: 'Prof', color: '#60A5FA' },
    { text: '[Slide change: Gradient flow diagram]', speaker: 'SYS', color: '#8B5CF6' },
    { text: 'Student: Could you explain vanishing gradients?', speaker: 'Stu', color: '#10B981' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden p-5" style={{ background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>transcript.vtt</span>
        <motion.div
          className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          LIVE
        </motion.div>
      </div>
      <div className="space-y-3">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-3"
          >
            <span
              className="text-xs font-bold font-mono px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0"
              style={{ background: `${line.color}20`, color: line.color, minWidth: 32, textAlign: 'center' }}
            >
              {line.speaker}
            </span>
            <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{line.text}</span>
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-0.5 h-4 ml-12 rounded"
          style={{ background: '#60A5FA' }}
        />
      </div>
    </div>
  );
}

function SmartNotesPreview() {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5" style={{ background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold text-white">📄 Machine Learning — Week 3</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>AI Summary</span>
      </div>
      {[
        { level: 'h2', text: '1. Backpropagation', color: '#A78BFA' },
        { level: 'p',  text: 'Algorithm to compute gradients by applying the chain rule recursively through network layers.' },
        { level: 'h3', text: '1.1 Vanishing Gradient Problem', color: '#60A5FA' },
        { level: 'p',  text: 'Gradients shrink exponentially in deep nets. ReLU activations mitigate this effect.' },
        { level: 'tag', text: '🔑 Key Concept' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="mb-2"
        >
          {item.level === 'h2' && <p className="text-sm font-bold mb-1" style={{ color: item.color }}>{item.text}</p>}
          {item.level === 'h3' && <p className="text-xs font-semibold mb-1 pl-3" style={{ color: item.color }}>{item.text}</p>}
          {item.level === 'p' && <p className="text-xs pl-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.text}</p>}
          {item.level === 'tag' && (
            <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D' }}>{item.text}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function FlashcardsPreview() {
  const cards = [
    { q: 'What is backpropagation?', a: 'An algorithm using chain rule to compute gradients in neural networks.' },
    { q: 'Define ReLU activation', a: 'f(x) = max(0, x). Prevents vanishing gradient by not saturating for positive inputs.' },
  ];

  return (
    <div className="relative space-y-3">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, rotateX: -15, y: 20 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="relative rounded-2xl overflow-hidden p-5 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(10,14,26,0.9) 60%)`,
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
        >
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#34D399' }}>Q</p>
          <p className="text-sm font-medium text-white mb-3">{card.q}</p>
          <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#60A5FA' }}>A</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{card.a}</p>
          <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>
            Card {i + 1}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MindMapPreview() {
  return (
    <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 220 }}>
      {/* Center node */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative px-4 py-2 rounded-xl text-sm font-bold text-white mb-4"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}
        >
          Neural Networks
        </motion.div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: 'Backprop', color: '#60A5FA' },
            { label: 'Activation', color: '#8B5CF6' },
            { label: 'Loss Fn', color: '#EC4899' },
            { label: 'Optimizer', color: '#10B981' },
            { label: 'Layers', color: '#F59E0B' },
            { label: 'Training', color: '#06B6D4' },
          ].map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.08, y: -2 }}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold text-center cursor-pointer"
              style={{
                background: `${node.color}18`,
                border: `1px solid ${node.color}40`,
                color: node.color,
              }}
            >
              {node.label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AITutorPreview() {
  const messages = [
    { role: 'user', text: 'What is the vanishing gradient problem?' },
    { role: 'ai', text: 'Great question! In deep networks, gradients shrink as they propagate backwards through sigmoid activations, making early layers learn very slowly...' },
    { role: 'user', text: 'How does ReLU solve this?' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #EC4899)' }}>
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">AI Tutor</p>
          <p className="text-xs" style={{ color: '#34D399' }}>Powered by your lecture</p>
        </div>
        <motion.div
          className="ml-auto w-2 h-2 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </div>
      <div className="p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.07)'}`,
                color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
              }}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="flex items-center gap-1.5 px-3 py-2"
        >
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />
          ))}
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>AI is typing...</span>
        </motion.div>
      </div>
    </div>
  );
}

function ExamModePreview() {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5" style={{ background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" /> Exam Mode Active
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full animate-pulse" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>6 hrs left</span>
      </div>
      {[
        { label: 'Backpropagation', pct: 92, color: '#EF4444' },
        { label: 'Activation Fns', pct: 74, color: '#F59E0B' },
        { label: 'Optimizers', pct: 58, color: '#8B5CF6' },
      ].map((topic, i) => (
        <motion.div key={topic.label} className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{topic.label}</span>
            <span className="text-xs font-bold" style={{ color: topic.color }}>{topic.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${topic.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.8 }}
              style={{ background: topic.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Feature data ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: Mic,
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.3)',
    title: 'Lecture Transcription',
    description: 'Upload any audio or video — lectures, podcasts, YouTube links. Our AI produces perfectly formatted, speaker-detected transcripts in seconds with 98%+ accuracy.',
    preview: <TranscriptionPreview />,
    badge: 'Live transcription',
  },
  {
    icon: FileText,
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.3)',
    title: 'Smart Notes',
    description: 'AI extracts key concepts, definitions, and summaries, then organizes them into a hierarchical structure you can scan, edit, and export instantly.',
    preview: <SmartNotesPreview />,
    badge: 'Auto-structured',
  },
  {
    icon: Layers,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.3)',
    title: 'Flashcards',
    description: 'Spaced-repetition ready flashcards auto-generated from your lecture content. Study efficiently and remember more with science-backed review scheduling.',
    preview: <FlashcardsPreview />,
    badge: 'Spaced repetition',
  },
  {
    icon: Network,
    color: '#EC4899',
    glow: 'rgba(236,72,153,0.3)',
    title: 'Mind Maps',
    description: 'Visualize complex topics and see how concepts connect. Interactive mind maps generated automatically from any lecture or document.',
    preview: <MindMapPreview />,
    badge: 'Interactive',
  },
  {
    icon: Bot,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.3)',
    title: 'AI Tutor',
    description: 'Chat with your lecture. Ask any question and get answers grounded strictly in your uploaded material — not hallucinations from the internet.',
    preview: <AITutorPreview />,
    badge: 'Grounded in your lecture',
  },
  {
    icon: Target,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.3)',
    title: 'Exam Mode',
    description: 'One click turns your study materials into a high-yield exam prep plan. Get predicted questions, revision notes, and MCQs tailored to what matters most.',
    preview: <ExamModePreview />,
    badge: 'Exam-day ready',
  },
];

function FeatureShowcase({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
    >
      {/* Copy */}
      <div className="flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-5"
            style={{ background: `${feature.color}18`, color: feature.color, border: `1px solid ${feature.color}30` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: feature.color }} />
            {feature.badge}
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${feature.color}15`,
                border: `1px solid ${feature.color}30`,
                boxShadow: `0 0 20px ${feature.glow}`,
              }}
            >
              <Icon className="w-7 h-7" style={{ color: feature.color }} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{feature.title}</h3>
          </div>

          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 400 }}>
            {feature.description}
          </p>
        </motion.div>
      </div>

      {/* Visual preview */}
      <motion.div
        className="flex-1 w-full"
        initial={{ opacity: 0, x: isEven ? 20 : -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-3xl blur-3xl -z-10 opacity-30"
            style={{ background: `radial-gradient(ellipse at center, ${feature.color} 0%, transparent 70%)` }}
          />
          {feature.preview}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            ✦ Everything you need
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            One platform.{' '}
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Six superpowers.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            From raw lecture to exam mastery. Everything built into one seamless AI-powered workspace.
          </motion.p>
        </div>

        {/* Feature showcases */}
        <div className="space-y-32">
          {features.map((feature, i) => (
            <FeatureShowcase key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

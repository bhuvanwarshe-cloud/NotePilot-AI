import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Play,
  Upload,
  FileText,
  BookOpen,
  Layers,
  HelpCircle,
  Bot,
  CheckCircle2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { BrandLoader } from '@/components/shared/BrandLoader';
import { brand } from '@/styles/brand';

const pipelineSteps = [
  { icon: Upload,     label: 'Audio Upload',         color: '#3B82F6', glow: 'rgba(59,130,246,0.4)' },
  { icon: FileText,   label: 'Transcript Generated', color: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' },
  { icon: BookOpen,   label: 'Smart Notes Created',  color: '#06B6D4', glow: 'rgba(6,182,212,0.4)'  },
  { icon: Layers,     label: 'Flashcards Ready',     color: '#10B981', glow: 'rgba(16,185,129,0.4)' },
  { icon: HelpCircle, label: 'Quiz Generated',       color: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
  { icon: Bot,        label: 'AI Tutor Available',   color: '#EC4899', glow: 'rgba(236,72,153,0.4)' },
];

function AnimatedPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const cycle = () => {
      setActiveStep(0);
      setCompletedSteps([]);

      pipelineSteps.forEach((_, i) => {
        setTimeout(() => {
          setActiveStep(i);
          if (i > 0) setCompletedSteps(prev => [...prev, i - 1]);
        }, i * 900);
      });

      setTimeout(() => {
        setCompletedSteps(pipelineSteps.map((_, i) => i));
      }, pipelineSteps.length * 900 + 200);
    };

    cycle();
    const interval = setInterval(cycle, pipelineSteps.length * 900 + 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full">
      {/* Outer glow halo */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-30 -z-10"
        style={{ background: 'radial-gradient(ellipse at center, #3B82F6 0%, #8B5CF6 50%, transparent 70%)' }}
      />

      {/* Browser chrome */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden border"
        style={{
          background: 'var(--np-surface-overlay)',
          borderColor: 'var(--np-border)',
          boxShadow: 'var(--np-shadow-elevated)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--np-border)', background: 'var(--np-bg-secondary)' }}>
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <div className="ml-3 flex-1 rounded-md px-3 py-1 text-xs font-mono" style={{ background: 'var(--np-surface)', color: 'var(--np-text-muted)' }}>
            notepilot.ai/process
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--np-text-muted)' }}>Processing</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--np-text-primary)' }}>Machine_Learning_Lec_1.mp4</p>
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'var(--np-blue-subtle)', color: 'var(--np-blue)', border: '1px solid var(--np-blue-glow)' }}
            >
              <Zap className="w-3 h-3" /> AI Active
            </motion.div>
          </div>

          {/* Pipeline steps */}
          <div className="space-y-3">
            {pipelineSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              const isDone = completedSteps.includes(i);
              const isPending = !isActive && !isDone;

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                  className="relative flex items-center gap-4 p-3 rounded-xl transition-all duration-500"
                  style={{
                    background: isActive
                      ? brand.status.processing.bg
                      : isDone
                      ? brand.status.done.bg
                      : brand.status.pending.bg,
                    border: isActive
                      ? `1px solid ${brand.status.processing.border}`
                      : isDone
                      ? `1px solid ${brand.status.done.border}`
                      : `1px solid ${brand.status.pending.border}`,
                    boxShadow: isActive ? `0 0 20px ${brand.glows.statusProcessing}` : 'none',
                  }}
                >
                  {/* Connector line */}
                  {i < pipelineSteps.length - 1 && (
                    <div
                      className="absolute left-[27px] top-full w-0.5 h-3 z-10"
                      style={{
                        background: isDone ? brand.status.done.color : brand.status.pending.border,
                        transition: 'background 0.5s',
                      }}
                    />
                  )}

                  {/* Icon circle */}
                  <div
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                    style={{
                      background: isActive ? 'var(--np-surface)' : isDone ? brand.status.done.bg : 'var(--np-surface-raised)',
                      border: isActive ? `1px solid ${brand.colors.primary}` : isDone ? `1px solid ${brand.status.done.border}` : `1px solid ${brand.status.pending.border}`,
                      boxShadow: isActive ? `0 0 12px ${brand.glows.statusProcessing}` : 'none',
                    }}
                  >
                    {isDone ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: brand.status.done.color }} />
                      </motion.div>
                    ) : isActive ? (
                      <BrandLoader className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" style={{ color: brand.status.pending.color }} />
                    )}

                    {/* Pulse ring when active using brand gradient */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                        style={{ 
                          background: brand.gradients.processing,
                          border: `1px solid ${brand.colors.primary}` 
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="text-sm font-medium transition-all duration-500 flex-1"
                    style={{
                      color: isActive ? 'var(--np-text-primary)' : isDone ? 'var(--np-text-primary)' : 'var(--np-text-muted)',
                    }}
                  >
                    {step.label}
                  </span>

                  {/* Status badge */}
                  {isDone && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: brand.status.done.bg, color: brand.status.done.color }}
                    >
                      Done
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5"
                      style={{ background: brand.status.processing.bg, color: brand.status.processing.color }}
                    >
                      <BrandLoader className="w-3 h-3" /> Processing
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--np-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--np-text-muted)' }}>Progress</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--np-text-primary)' }}>
                {Math.round(((completedSteps.length + (activeStep < pipelineSteps.length ? 0.5 : 0)) / pipelineSteps.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--np-surface-raised)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: brand.gradients.primary }}
                animate={{
                  width: `${Math.round(((completedSteps.length + (activeStep < pipelineSteps.length ? 0.5 : 0)) / pipelineSteps.length) * 100)}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16" style={{ background: 'var(--np-bg-primary)' }}>
      {/* ── Animated background ─────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        {/* Mesh gradient base — adapts per theme via CSS var */}
        <div className="absolute inset-0" style={{ background: 'var(--np-hero-bg)' }} />

        {/* Floating orbs */}
        {[
          { size: 600, x: '-10%', y: '-10%', varName: 'var(--np-orb1)', dur: 12 },
          { size: 500, x: '60%',  y: '40%',  varName: 'var(--np-orb2)', dur: 15 },
          { size: 400, x: '30%',  y: '70%',  varName: 'var(--np-orb3)', dur: 18 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.varName }}
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Particle dots */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['var(--np-blue)', 'var(--np-purple)', 'var(--np-pink)', 'var(--np-green)'][Math.floor(Math.random() * 4)],
              opacity: Math.random() * 0.25 + 0.05,
            }}
            animate={{ opacity: [0.05, 0.3, 0.05], scale: [1, 1.5, 1] }}
            transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}

        {/* Grid overlay — theme-reactive opacity */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 'var(--np-grid-opacity)',
            backgroundImage: 'linear-gradient(var(--np-border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--np-border-strong) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-medium"
              style={{
                background: 'var(--np-blue-subtle)',
                border: '1px solid var(--np-blue-glow)',
                color: 'var(--np-blue)',
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              NotePilot AI 2.0 — Now Live
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-extrabold tracking-tight leading-[1.08] mb-6"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4.5rem)' }}
            >
              Transform Any Lecture Into{' '}
              <span
                className="relative"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Exam Success
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg leading-relaxed mb-10"
              style={{ color: 'var(--np-text-secondary)', maxWidth: '480px' }}
            >
              Upload recordings, videos, PDFs, or textbook chapters and instantly generate notes, flashcards, mind maps, quizzes, and AI-powered explanations.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button
                asChild
                size="lg"
                className="relative overflow-hidden h-13 px-8 text-base font-semibold rounded-full text-white border-0 group"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 30px rgba(59,130,246,0.35), 0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Link to="/signup" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base font-semibold rounded-full group"
                style={{
                  background: 'var(--np-surface)',
                  border: '1px solid var(--np-border-strong)',
                  color: 'var(--np-text-primary)',
                }}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { value: '10,000+', label: 'Notes Generated' },
                { value: '2,500+',  label: 'Hours Saved'     },
                { value: 'AI',      label: 'Powered Learning'},
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))' }}
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--np-text-primary)' }}>{stat.value}</span>
                  <span className="text-sm" style={{ color: 'var(--np-text-muted)' }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Pipeline mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <AnimatedPipeline />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

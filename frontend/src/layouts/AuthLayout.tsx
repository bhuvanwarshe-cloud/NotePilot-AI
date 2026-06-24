import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoFull } from '@/components/shared/LogoFull';
import { LogoIcon } from '@/components/shared/LogoIcon';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Star, Sparkles, FileText, LayoutDashboard, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "NotePilot completely changed how I study. I went from struggling to acing my midterms.",
    author: "Sarah J.",
    role: "Medical Student, Harvard",
    avatar: "SJ",
  },
  {
    quote: "The flashcard generation is practically magic. It saves me hours every week.",
    author: "David M.",
    role: "Computer Science, MIT",
    avatar: "DM",
  },
  {
    quote: "It's like having a 24/7 tutor who understands my professor perfectly.",
    author: "Emily R.",
    role: "Law Student, Stanford",
    avatar: "ER",
  },
];

const illustrationItems = [
  { icon: FileText, label: 'Smart Notes Generated', color: '#3B82F6' },
  { icon: LayoutDashboard, label: '50 Flashcards Ready', color: '#8B5CF6' },
  { icon: Sparkles, label: 'AI Tutor Available', color: '#F59E0B' },
];

export function AuthLayout() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Root: flex row, full viewport height, overflow hidden
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        width: '100%',
        background: 'var(--np-bg-primary)',
        color: 'var(--np-text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Theme Toggle (always top-right) ─── */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 200 }}>
        <ThemeToggle />
      </div>

      {/* ══════════════════════════════════════════════
          LEFT PANEL — 50% width, desktop only
          hidden on <lg via className
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          // flexShrink:0 + exact width: prevents ANY compression
          flexShrink: 0,
          width: '50%',
          minHeight: '100vh',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          borderRight: '1px solid var(--np-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'rgba(59,130,246,0.22)', filter: 'blur(90px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'rgba(139,92,246,0.18)', filter: 'blur(90px)' }} />
        </div>

        {/* ── Content (stacked, relative, z:1) ── */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>

          {/* 1. Logo */}
          <Link to="/" style={{ display: 'inline-block', marginBottom: '48px' }}>
            <LogoFull className="h-10" />
          </Link>

          {/* 2. Headline */}
          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
            Transform Any Lecture Into{' '}
            <span style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Exam-Ready Notes
            </span>
          </h1>

          {/* 3. Description */}
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--np-text-secondary)', maxWidth: '400px', margin: '0 0 40px 0' }}>
            Upload lectures, PDFs, videos, and textbooks. Get notes, flashcards, quizzes, and AI tutoring instantly.
          </p>

          {/* 4. Product illustration card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              background: 'var(--np-surface-overlay)',
              border: '1px solid var(--np-border-strong)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles style={{ width: '18px', height: '18px', color: '#3B82F6' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>AI Synthesis Complete</p>
                <p style={{ fontSize: '12px', color: 'var(--np-text-muted)', margin: '2px 0 0 0' }}>Machine_Learning_Lec_1.mp4</p>
              </div>
            </div>
            {/* Card rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {illustrationItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)' }}
                >
                  <item.icon style={{ width: '15px', height: '15px', color: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>{item.label}</span>
                  <CheckCircle style={{ width: '14px', height: '14px', color: 'var(--np-success)', flexShrink: 0 }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 5. Testimonial — pinned to bottom */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--np-border)', paddingTop: '28px', maxWidth: '480px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} style={{ width: '14px', height: '14px', color: '#F59E0B', fill: '#F59E0B' }} />)}
              </div>
              <p style={{ fontSize: '15px', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.65, color: 'var(--np-text-primary)', margin: '0 0 16px 0' }}>
                "{testimonials[activeTestimonial].quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>{testimonials[activeTestimonial].author}</p>
                  <p style={{ fontSize: '12px', color: 'var(--np-text-muted)', margin: '2px 0 0 0' }}>{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — flex:1 takes remaining space
          On mobile: 100% width (left is hidden)
          On desktop: exactly the other 50%
      ══════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Mobile: logo top-left */}
        <div className="block lg:hidden" style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <Link to="/">
            <LogoIcon className="h-9" />
          </Link>
        </div>

        {/* Auth form container — strict 480px, NEVER collapses */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

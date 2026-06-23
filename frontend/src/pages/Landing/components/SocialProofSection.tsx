import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Aryan Mehta',
    role: 'Engineering Student',
    university: 'IIT Bombay • CS, 3rd Year',
    avatar: 'AM',
    avatarGrad: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
    quote: "I uploaded a 2-hour lecture on operating systems and had perfectly formatted notes, 40 flashcards, and a practice quiz in under 3 minutes. I don't know how I survived without this.",
    stars: 5,
    badge: 'Top Contributor',
    badgeColor: '#3B82F6',
    stat: '40 flashcards in 3 min',
  },
  {
    name: 'Priya Sharma',
    role: 'Medical Student',
    university: 'AIIMS Delhi • MBBS, 2nd Year',
    avatar: 'PS',
    avatarGrad: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
    quote: "Anatomy lectures are brutal. NotePilot's Exam Mode literally saved my practical. I said 'prepare me for tomorrow's viva' and it gave me a prioritized list of structures with mnemonics and likely questions. Insane.",
    stars: 5,
    badge: 'Exam Mode Fan',
    badgeColor: '#EC4899',
    stat: '15 hrs saved last week',
  },
  {
    name: 'Marcus Johnson',
    role: 'College Student',
    university: 'UCLA • Economics, 4th Year',
    avatar: 'MJ',
    avatarGrad: 'linear-gradient(135deg, #10B981, #3B82F6)',
    quote: "The AI Tutor feature is genuinely different. I asked it questions about a recorded lecture and it cited specific timestamps. It only answers from your material — not random internet stuff. That's huge for accuracy.",
    stars: 5,
    badge: 'Power User',
    badgeColor: '#10B981',
    stat: 'Uses it 6x/week',
  },
  {
    name: 'Sarah Chen',
    role: 'Law Student',
    university: 'Harvard Law School • 1L',
    avatar: 'SC',
    avatarGrad: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    quote: 'Case law annotations and mind maps from case briefs. I never thought an AI tool would actually understand legal text this well. My study sessions went from 5 hours to 2.',
    stars: 5,
    badge: 'Verified Student',
    badgeColor: '#F59E0B',
    stat: '60% faster prep time',
  },
  {
    name: 'Rahul Patel',
    role: 'Engineering Student',
    university: 'NIT Trichy • Electronics, 4th Year',
    avatar: 'RP',
    avatarGrad: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    quote: 'VLSI design notes were absolute chaos in my recordings. NotePilot turned 3 weeks of lectures into a clean, structured wiki I can actually search and review. Mind-blowing.',
    stars: 5,
    badge: 'Power User',
    badgeColor: '#8B5CF6',
    stat: '3 weeks → clean notes',
  },
  {
    name: 'Anika Ross',
    role: 'Grad Student',
    university: 'Stanford University • MBA, Year 1',
    avatar: 'AR',
    avatarGrad: 'linear-gradient(135deg, #06B6D4, #10B981)',
    quote: 'Used it for a case competition. Uploaded 6 industry reports and had a comprehensive brief, key statistics, and Q&A prep in 20 minutes. We won the competition.',
    stars: 5,
    badge: 'Competition Winner',
    badgeColor: '#06B6D4',
    stat: 'Won case competition',
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#F59E0B' }} />
      ))}
    </div>
  );
}

function TestimonialCard({ t, delay = 0 }: { t: typeof testimonials[0]; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="relative rounded-2xl p-6 flex flex-col gap-4 group cursor-default"
      style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        boxShadow: 'var(--np-shadow-card)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
        style={{ background: `radial-gradient(ellipse at center, ${t.badgeColor}15 0%, transparent 70%)` }}
      />

      {/* Quote icon */}
      <Quote className="w-6 h-6 opacity-15 absolute top-5 right-5" style={{ color: t.badgeColor }} />

      {/* Stars */}
      <StarRating count={t.stars} />

      {/* Quote text */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--np-text-secondary)' }}>
        "{t.quote}"
      </p>

      {/* Stat pill */}
      <div
        className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1 text-xs font-semibold"
        style={{ background: `${t.badgeColor}18`, color: t.badgeColor, border: `1px solid ${t.badgeColor}30` }}
      >
        ✦ {t.stat}
      </div>

      {/* Author */}
      <div
        className="flex items-center gap-3 pt-3"
        style={{ borderTop: '1px solid var(--np-border)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: t.avatarGrad, boxShadow: `0 0 12px ${t.badgeColor}40`, color: '#fff' }}
        >
          {t.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold" style={{ color: 'var(--np-text-primary)' }}>
              {t.name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${t.badgeColor}18`, color: t.badgeColor }}
            >
              {t.badge}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--np-text-muted)' }}>
            {t.university}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="py-32 relative overflow-hidden"
      style={{ background: 'var(--np-bg-primary)' }}
    >
      {/* Background ambiance */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 60%, var(--np-blue-subtle) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <Star className="w-3.5 h-3.5 fill-current" /> Loved by students
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5"
            style={{ color: 'var(--np-text-primary)' }}
          >
            Real students.{' '}
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Real results.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base max-w-xl mx-auto"
            style={{ color: 'var(--np-text-secondary)' }}
          >
            From engineering to medicine to law — students worldwide use NotePilot to study smarter and outperform their peers.
          </motion.p>

          {/* Aggregate stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-8 mt-8"
          >
            <div className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: 'var(--np-text-primary)' }}>4.9</p>
              <div className="flex justify-center my-1"><StarRating count={5} /></div>
              <p className="text-xs" style={{ color: 'var(--np-text-muted)' }}>Average rating</p>
            </div>
            <div className="w-px h-12" style={{ background: 'var(--np-border-strong)' }} />
            <div className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: 'var(--np-text-primary)' }}>50K+</p>
              <p className="text-xs mt-2" style={{ color: 'var(--np-text-muted)' }}>Active students</p>
            </div>
            <div className="w-px h-12" style={{ background: 'var(--np-border-strong)' }} />
            <div className="text-center">
              <p className="text-3xl font-extrabold" style={{ color: 'var(--np-text-primary)' }}>500+</p>
              <p className="text-xs mt-2" style={{ color: 'var(--np-text-muted)' }}>Universities</p>
            </div>
          </motion.div>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

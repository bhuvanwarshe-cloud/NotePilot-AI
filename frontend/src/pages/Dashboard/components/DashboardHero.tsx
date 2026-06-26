import { motion } from 'framer-motion';
import { Upload, Mic, Video, FileText, PlaySquare, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DashboardHero() {
  const { user, profile } = useAuth();
  
  const displayName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Student';
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const emoji = hour < 12 ? '☀️' : hour < 18 ? '☕' : '🌙';

  const supportedFormats = [
    { icon: Mic, label: 'Audio Recording' },
    { icon: Video, label: 'Video Lecture' },
    { icon: FileText, label: 'PDF Slides' },
    { icon: PlaySquare, label: 'YouTube Link' },
    { icon: BookOpen, label: 'Textbook Chapter' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border"
      style={{
        background: 'var(--np-surface-overlay)',
        borderColor: 'var(--np-border)',
      }}
    >
      {/* Background Glow */}
      <div 
        className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.3) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 p-8 md:p-10 lg:p-12 flex flex-col md:flex-row gap-10 items-center justify-between">
        
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--np-blue)' }}>
              {greeting}, {displayName} {emoji}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--np-text-primary)' }}>
              Ready to transform <br className="hidden md:block" />
              today's lectures?
            </h1>
            <p className="text-base md:text-lg max-w-lg" style={{ color: 'var(--np-text-secondary)' }}>
              Upload your raw study materials and let AI instantly generate notes, flashcards, quizzes, and mind maps.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {supportedFormats.map((format, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ 
                  background: 'var(--np-bg-primary)',
                  borderColor: 'var(--np-border)',
                  color: 'var(--np-text-secondary)'
                }}
              >
                <format.icon size={14} style={{ color: 'var(--np-blue)' }} />
                {format.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Upload Area (Placeholder) */}
        <div className="w-full md:w-[400px] shrink-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors"
            style={{
              borderColor: 'var(--np-border-strong)',
              background: 'var(--np-surface)',
            }}
            onMouseEnter={e => {
              (e.currentTarget).style.borderColor = 'var(--np-blue)';
              (e.currentTarget).style.background = 'var(--np-surface-raised)';
            }}
            onMouseLeave={e => {
              (e.currentTarget).style.borderColor = 'var(--np-border-strong)';
              (e.currentTarget).style.background = 'var(--np-surface)';
            }}
          >
            <div 
              className="w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-transform group-hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,58,237,0.1))' }}
            >
              <Upload size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--np-text-primary)' }}>
              Upload Your First Lecture
            </h3>
            <p className="text-sm text-center mb-4" style={{ color: 'var(--np-text-muted)' }}>
              Drag & drop files here or click to browse
            </p>
            <button 
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))' }}
            >
              Browse Files
            </button>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

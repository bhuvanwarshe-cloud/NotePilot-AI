import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, FileText, BookOpenText, BrainCircuit, Library, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState() {
  const navigate = useNavigate();

  const steps = [
    { icon: <UploadCloud size={20} />, title: "Upload your first lecture", color: "var(--np-blue)" },
    { icon: <FileText size={20} />, title: "AI extracts transcript", color: "var(--np-purple)" },
    { icon: <BookOpenText size={20} />, title: "Creates Smart Notes", color: "#10B981" },
    { icon: <BrainCircuit size={20} />, title: "Generates Flashcards", color: "#F59E0B" },
    { icon: <Library size={20} />, title: "Build your knowledge library", color: "var(--np-text-primary)" },
  ];

  return (
    <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 32,
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          padding: '48px',
          boxShadow: 'var(--np-shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 28,
          background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 12px 24px rgba(59, 130, 246, 0.25)'
        }}>
          <Sparkles size={32} color="#fff" />
        </div>
        
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 32px 0', color: 'var(--np-text-primary)', letterSpacing: '-0.02em' }}>
          Your AI Study Library is Empty
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320, marginBottom: 40 }}>
          {steps.map((step, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
              key={index}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 20px',
                background: 'var(--np-bg-secondary)',
                borderRadius: 16,
                width: '100%',
                border: '1px solid var(--np-border)',
              }}>
                <div style={{ color: step.color }}>{step.icon}</div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--np-text-primary)' }}>{step.title}</span>
              </div>
              
              {index < steps.length - 1 && (
                <div style={{ width: 2, height: 16, background: 'var(--np-border-strong)' }} />
              )}
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard/upload')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 28px',
            border: 'none',
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}
        >
          Upload Lecture <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

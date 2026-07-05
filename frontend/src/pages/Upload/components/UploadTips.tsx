import { Info, Lock, Lightbulb, Upload, FileText, StickyNote, BrainCircuit, CheckSquare, GitMerge, Bot } from 'lucide-react';
import type { SourceType } from '../types';
import { sourceConfig } from '../sourceConfig';
import { motion } from 'framer-motion';

const TIMELINE = [
  { icon: Upload, title: 'Upload', desc: 'Securely transfer your file' },
  { icon: FileText, title: 'Extract Text', desc: 'AI processes audio or text' },
  { icon: StickyNote, title: 'Smart Notes', desc: 'Structured summary generated' },
  { icon: BrainCircuit, title: 'Flashcards', desc: 'Key concepts extracted' },
  { icon: CheckSquare, title: 'Quiz', desc: 'Test your knowledge' },
  { icon: GitMerge, title: 'Mind Map', desc: 'Visual connections created' },
  { icon: Bot, title: 'AI Tutor', desc: 'Ask questions anytime' },
];

interface UploadTipsProps {
  source: SourceType | null;
}

export function UploadTips({ source }: UploadTipsProps) {
  const activeConfig = source ? sourceConfig[source] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {activeConfig && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--np-surface)',
            border: '1px solid var(--np-border)',
            borderRadius: 16,
            padding: 24,
            boxShadow: 'var(--np-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--np-amber)' }}>
            <Lightbulb size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--np-text-primary)' }}>
              Tips for {activeConfig.title}
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--np-text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeConfig.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Privacy Notice */}
      <div
        style={{
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--np-shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--np-text-primary)' }}>
          <Lock size={18} color="var(--np-green)" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Private & Secure</h3>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
          Your lectures are strictly private. We use industry-standard encryption for all uploads. Audio and video files are processed securely and never used to train third-party models.
        </p>
      </div>

      {/* Pipeline Timeline */}
      <div
        style={{
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--np-shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--np-text-primary)' }}>
          <Info size={18} color="var(--np-blue)" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Your Study Pipeline</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TIMELINE.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={step.title} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--np-blue-subtle)',
                    color: 'var(--np-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <StepIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--np-text-primary)', marginBottom: 2 }}>
                      {idx + 1}. {step.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--np-text-muted)' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
                {idx < TIMELINE.length - 1 && (
                  <div style={{
                    width: 2,
                    height: 24,
                    background: 'var(--np-border-strong)',
                    marginLeft: 17,
                    marginTop: 4,
                    marginBottom: 4,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

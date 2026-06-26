import { Library, ScrollText, BrainCircuit, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface StatData {
  label: string;
  value: string | number;
  Icon: React.ComponentType<{ size?: number }>;
  accentColor: string;
  accentBg: string;
  badge?: React.ReactNode;
}

export function QuickStats() {
  const { profile } = useAuth();
  const plan = profile?.plan ?? 'Free';

  const STATS: StatData[] = [
    {
      label: 'Lectures',
      value: 0,
      Icon: Library,
      accentColor: 'var(--np-blue)',
      accentBg: 'var(--np-blue-subtle)',
    },
    {
      label: 'Notes',
      value: 0,
      Icon: ScrollText,
      accentColor: 'var(--np-purple)',
      accentBg: 'var(--np-purple-subtle)',
    },
    {
      label: 'Flashcards',
      value: 0,
      Icon: BrainCircuit,
      accentColor: '#10B981',
      accentBg: 'rgba(16,185,129,0.10)',
    },
    {
      label: 'Plan',
      value: plan,
      Icon: Zap,
      accentColor: 'var(--np-amber)',
      accentBg: 'rgba(245,158,11,0.10)',
      badge:
        plan === 'Free' ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, var(--np-blue), var(--np-purple))',
              color: '#fff',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Upgrade
          </span>
        ) : undefined,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}
    >
      {STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </motion.div>
  );
}

function StatCard({ stat }: { stat: StatData }) {
  return (
    <div
      style={{
        background: 'var(--np-surface)',
        border: '1px solid var(--np-border)',
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: 'var(--np-shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: stat.accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <stat.Icon size={18} />
        </div>
        {stat.badge}
      </div>

      <div>
        <p
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--np-text-primary)',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {stat.value}
        </p>
        <p
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: 'var(--np-text-muted)',
          }}
        >
          {stat.label}
        </p>
      </div>
    </div>
  );
}

import type React from 'react';

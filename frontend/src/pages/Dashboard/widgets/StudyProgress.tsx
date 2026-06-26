import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StudyStats {
  weeklyGoalPct?: number;
  masteryScore?: number;
  streakDays?: number;
  totalMinutes?: number;
}

interface StudyProgressProps {
  stats: StudyStats;
}

export function StudyProgress({ stats }: StudyProgressProps) {
  const hasAnyData = Object.values(stats).some(
    (v) => v !== undefined && v !== 0
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
    >
      <h2
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--np-text-primary)',
          margin: '0 0 16px',
        }}
      >
        Study Progress
      </h2>

      <div
        style={{
          background: 'var(--np-surface)',
          border: '1px solid var(--np-border)',
          borderRadius: 16,
          padding: '36px 28px',
          boxShadow: 'var(--np-shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 12,
        }}
      >
        {!hasAnyData ? (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--np-blue-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} color="var(--np-blue)" />
            </div>

            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--np-text-primary)',
                margin: 0,
              }}
            >
              No progress yet
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'var(--np-text-secondary)',
                lineHeight: 1.6,
                maxWidth: 240,
                margin: 0,
              }}
            >
              Complete your first lecture to start tracking your study progress.
            </p>

            {/* Zeroed progress bar */}
            <div style={{ width: '100%', marginTop: 8 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--np-text-muted)',
                  marginBottom: 6,
                }}
              >
                <span>Weekly Goal</span>
                <span>0%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 4,
                  background: 'var(--np-bg-secondary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '0%',
                    height: '100%',
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--np-blue), var(--np-purple))',
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {stats.weeklyGoalPct !== undefined && (
              <ProgressBar label="Weekly Goal" pct={stats.weeklyGoalPct} />
            )}
            {stats.masteryScore !== undefined && (
              <div style={{ textAlign: 'left', width: '100%' }}>
                <p style={{ fontSize: 12, color: 'var(--np-text-muted)', marginBottom: 2 }}>
                  Mastery Score
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--np-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stats.masteryScore}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--np-text-muted)',
          marginBottom: 6,
        }}
      >
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 4,
          background: 'var(--np-bg-secondary)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, var(--np-blue), var(--np-purple))',
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  );
}

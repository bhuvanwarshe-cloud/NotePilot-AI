import { useMemo } from 'react';
import { DashboardGrid, DashboardMainGrid } from './layouts/DashboardGrid';
import {
  DashboardHero,
  QuickStats,
  RecentLectures,
  TodaysFocus,
  AiActivity,
  StudyProgress,
} from './widgets';

/**
 * DashboardPage
 * 
 * Phase 5: Static layout with honest empty states.
 * Phase 6: Replace empty arrays/objects with real Supabase queries.
 * 
 * Layout:
 *   Hero         (full-width, 60/40 grid)
 *   QuickStats   (4-column row)
 *   ─────────────────────────────────────────
 *   Left (8/12)  Right (4/12)
 *   Recent       AiActivity
 *   Lectures     StudyProgress
 *   TodaysFocus
 */
export function DashboardPage() {
  const emptyLectures  = useMemo(() => [], []);
  const emptyFocus     = useMemo(() => [], []);
  const emptyActivity  = useMemo(() => [], []);
  const emptyStats     = useMemo(() => ({}), []);

  return (
    <DashboardGrid>
      {/* Hero */}
      <DashboardHero />

      {/* Quick Stats */}
      <QuickStats />

      {/* 12-column main grid */}
      <DashboardMainGrid>
        {/* Left column — 8 of 12 */}
        <div
          style={{
            gridColumn: 'span 8',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <RecentLectures lectures={emptyLectures} />
          <TodaysFocus items={emptyFocus} />
        </div>

        {/* Right column — 4 of 12 */}
        <div
          style={{
            gridColumn: 'span 4',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <AiActivity activities={emptyActivity} />
          <StudyProgress stats={emptyStats} />
        </div>
      </DashboardMainGrid>
    </DashboardGrid>
  );
}

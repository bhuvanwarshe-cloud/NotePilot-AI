
import { DashboardGrid, DashboardMainGrid } from './layouts/DashboardGrid';
import {
  DashboardHero,
  QuickStats,
  TodaysFocus,
  StudyProgress,
  ContinueLearning,
  RecentUploads,
} from './widgets';

import { useDashboardData } from '@/hooks/useDashboardData';

/**
 * DashboardPage
 * 
 * Phase 5.1: Connected to real data using useDashboardData hook.
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
  const { lectures, recentNotes, lectureCount, noteCount, flashcardCount, stats } = useDashboardData();

  return (
    <DashboardGrid>
      {/* Hero */}
      <DashboardHero />

      {/* Quick Stats */}
      <QuickStats counts={{ lectureCount, noteCount, flashcardCount }} />

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
          <ContinueLearning items={recentNotes} />
          
          <TodaysFocus
            items={[]} // Could be populated with actual AI recommendations later
            title="Today's Focus"
            emptyTitle="You're all caught up!"
            emptyMessage="Upload more lectures to receive personalized study recommendations."
          />
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
          <RecentUploads uploads={lectures} />
          <StudyProgress stats={stats} />
        </div>
      </DashboardMainGrid>
    </DashboardGrid>
  );
}


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
 * All widgets consume the SAME `lectures` array from useDashboardData().
 * There is one canonical DashboardLecture model — no separate mappings
 * for RecentUploads vs ContinueLearning vs stats.
 *
 * Realtime updates flow: Supabase postgres_changes → fetchDashboardData()
 * → setLectures() → both widgets re-render with identical data.
 *
 * Layout:
 *   Hero         (full-width, 60/40 grid)
 *   QuickStats   (4-column row)
 *   ─────────────────────────────────────────────────────
 *   Left (8/12)        Right (4/12)
 *   ContinueLearning   RecentUploads
 *   TodaysFocus        StudyProgress
 */
export function DashboardPage() {
  const {
    lectures,
    lectureCount,
    noteCount,
    flashcardCount,
    stats,
  } = useDashboardData();

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
          {/*
           * ContinueLearning receives the SAME lectures array as RecentUploads.
           * It filters internally to only show completed lectures.
           * Title and thumbnail are guaranteed identical to RecentUploads entries.
           */}
          <ContinueLearning lectures={lectures} />

          <TodaysFocus
            items={[]}
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
          {/*
           * RecentUploads receives the same lectures array.
           * It shows all statuses (processing, completed, failed, etc.)
           * and slices to the 4 most recent.
           */}
          <RecentUploads uploads={lectures} />
          <StudyProgress stats={stats} />
        </div>
      </DashboardMainGrid>
    </DashboardGrid>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Activity } from '@/pages/Dashboard/widgets/AiActivity';
import type { StudyStats } from '@/pages/Dashboard/widgets/StudyProgress';

// ─────────────────────────────────────────────────────────────
// Canonical lecture model — shared by ALL dashboard widgets.
// RecentUploads, ContinueLearning, and QuickStats all read from
// this single type. Never create different mappings per widget.
// ─────────────────────────────────────────────────────────────
export interface DashboardLecture {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'text' | 'pdf' | 'youtube';
  status: string;                // uploaded | processing | transcribed | completed | failed
  thumbnailUrl: string | null;
  language: string | undefined;
  date: string;                  // formatted for display

  // AI job fields (from the most recent ai_jobs row for this lecture)
  jobStatus: string | undefined;
  jobManualAction: boolean;
  jobUserMessage: string | undefined;
  jobReason: string | undefined;
}

interface DashboardData {
  lectures: DashboardLecture[];
  activities: Activity[];
  lectureCount: number;
  noteCount: number;
  flashcardCount: number;
  stats: StudyStats;
  loading: boolean;
}

// Raw row shape returned by Supabase query
interface RawLecture {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  thumbnail_url: string | null;
  language: string | null;
  ai_jobs: Array<{
    id: string;
    status: string;
    metadata: Record<string, unknown> | null;
  }> | null;
}

function mapRawLecture(l: RawLecture): DashboardLecture {
  const jobs = Array.isArray(l.ai_jobs) ? l.ai_jobs : [];
  // ai_jobs are ordered descending by created_at in the query
  const latestJob = jobs[0] as { status: string; metadata?: Record<string, unknown> } | undefined;

  return {
    id: l.id,
    title: l.title,
    type: l.type as DashboardLecture['type'],
    status: l.status,
    thumbnailUrl: l.thumbnail_url ?? null,
    language: l.language ?? undefined,
    date: new Date(l.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    jobStatus: latestJob?.status,
    jobManualAction: latestJob?.metadata?.manualActionRequired === true,
    jobUserMessage:
      typeof latestJob?.metadata?.userMessage === 'string'
        ? latestJob.metadata.userMessage
        : undefined,
    jobReason:
      typeof latestJob?.metadata?.reason === 'string'
        ? latestJob.metadata.reason
        : undefined,
  };
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();

  const [lectures, setLectures] = useState<DashboardLecture[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lectureCount, setLectureCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [stats, setStats] = useState<StudyStats>({});
  const [loading, setLoading] = useState(true);

  // Use a ref so the fetchDashboardData callback is stable across renders
  // but can still read the latest `user` value.
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ─── Single fetch function ───────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    try {
      // 1. Lectures — canonical data for ALL widgets
      const { data: lecturesData, error: lecturesError } = await supabase
        .from('lectures')
        .select(`
          id,
          title,
          type,
          status,
          created_at,
          thumbnail_url,
          language,
          ai_jobs (
            id,
            status,
            metadata
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (lecturesError) throw lecturesError;

      const mappedLectures: DashboardLecture[] = (lecturesData ?? []).map(mapRawLecture);

      // 2. Recent lecture IDs for scoped counts
      const recentIds = mappedLectures.slice(0, 10).map((l) => l.id);

      // 3. Total lecture count (all, not just recent)
      const { count: lecCount } = await supabase
        .from('lectures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      // 4. Note and flashcard counts (scoped to user's lectures)
      let noteCountValue = 0;
      let flashcardCountValue = 0;

      if (recentIds.length > 0) {
        // Use user_id filter on a broader set to get accurate counts
        const { count: allLectureIds } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .in('lecture_id', recentIds);

        const { count: fcCount } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .in('lecture_id', recentIds);

        noteCountValue = allLectureIds ?? 0;
        flashcardCountValue = fcCount ?? 0;
      }

      // 5. Activity log
      const { data: activitiesData } = await supabase
        .from('activity_logs')
        .select('id, action_type, message, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // ─── Commit state ──────────────────────────────────────
      setLectures(mappedLectures);
      setLectureCount(lecCount ?? 0);
      setNoteCount(noteCountValue);
      setFlashcardCount(flashcardCountValue);

      setActivities(
        (activitiesData ?? []).map(
          (a: { id: string; action_type: string; message: string; created_at: string }) => ({
            id: a.id,
            type: (['transcript', 'flashcards', 'mindmap', 'quiz'].includes(a.action_type)
              ? a.action_type
              : 'notes') as Activity['type'],
            message: a.message,
            timestamp: new Date(a.created_at).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            }),
          })
        )
      );

      setStats({
        masteryScore: 0,
        weeklyGoalPct: 0,
        streakDays: 0,
        totalMinutes: 0,
      });
    } catch (error) {
      console.error('[useDashboardData] fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads user via ref

  // ─── Bootstrap + Realtime subscriptions ─────────────────────
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initial load
    fetchDashboardData();

    // Subscribe to ALL lecture changes for this user
    const channel = supabase
      .channel(`dashboard-realtime-${user.id}`)
      // lectures: INSERT, UPDATE, DELETE
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lectures',
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchDashboardData(); }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lectures',
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchDashboardData(); }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lectures',
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchDashboardData(); }
      )
      // ai_jobs: any status change triggers a re-fetch so the
      // lecture's jobStatus reflects the latest pipeline state
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_jobs',
        },
        () => { fetchDashboardData(); }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_jobs',
        },
        () => { fetchDashboardData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDashboardData]);

  return {
    lectures,
    activities,
    lectureCount,
    noteCount,
    flashcardCount,
    stats,
    loading,
  };
}

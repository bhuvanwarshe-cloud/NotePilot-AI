import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Lecture, Activity, StudyStats, SmartNoteItem } from '@/pages/Dashboard/widgets';

export function useDashboardData() {
  const { user } = useAuth();
  
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentNotes, setRecentNotes] = useState<SmartNoteItem[]>([]);
  
  const [lectureCount, setLectureCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  
  const [stats, setStats] = useState<StudyStats>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchData() {
      try {
        const { data: lecturesData } = await supabase
          .from('lectures')
          .select(`
            id, title, type, status, created_at,
            ai_jobs (
              id, status, metadata
            )
          `)
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(4);

        const lectureIds = (lecturesData || []).map((lecture: { id: string }) => lecture.id);

        const { data: notesData } = lectureIds.length > 0
          ? await supabase
              .from('notes')
              .select('id, title, content, status, created_at, lecture_id, lectures!inner(id, title, type, thumbnail_url)')
              .in('lecture_id', lectureIds)
              .order('created_at', { ascending: false })
              .limit(5)
          : { data: [] };

        const { data: activitiesData } = await supabase
          .from('activity_logs')
          .select('id, action_type, message, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const { count: lecCount } = await supabase
          .from('lectures')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id);

        let noteCountValue = 0;
        let flashcardCountValue = 0;

        if (lectureIds.length > 0) {
          const { count: noteCountResult } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .in('lecture_id', lectureIds);

          const { count: flashcardCountResult } = await supabase
            .from('flashcards')
            .select('*', { count: 'exact', head: true })
            .in('lecture_id', lectureIds);

          noteCountValue = noteCountResult || 0;
          flashcardCountValue = flashcardCountResult || 0;
        }

        if (!mounted) return;

        setLectures(
          (lecturesData || []).map((l: {
            id: string;
            title: string;
            type: string;
            created_at: string;
            status?: string;
            ai_jobs?: Array<{ id: string; status: string; metadata?: Record<string, unknown> }>;
          }) => {
            // Find the most recent transcription job for this lecture
            const jobs = Array.isArray(l.ai_jobs) ? l.ai_jobs : [];
            const latestJob = jobs[0] as { status: string; metadata?: Record<string, unknown> } | undefined;
            const jobStatus = latestJob?.status;
            const jobManualAction = latestJob?.metadata?.manualActionRequired === true;
            const jobUserMessage = typeof latestJob?.metadata?.userMessage === 'string'
              ? latestJob.metadata.userMessage
              : undefined;
            const jobReason = typeof latestJob?.metadata?.reason === 'string'
              ? latestJob.metadata.reason
              : undefined;

            return {
              id: l.id,
              title: l.title,
              type: l.type as 'audio' | 'video' | 'text' | 'pdf' | 'youtube',
              date: new Date(l.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
              status: l.status,
              jobStatus,
              jobManualAction,
              jobUserMessage,
              jobReason,
            };
          })
        );

        setRecentNotes(
          (notesData || []).map((note: any) => {
            const lecture = Array.isArray(note.lectures) ? note.lectures[0] : note.lectures;
            const content = note.content || '';
            const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
            const readingTime = Math.max(1, Math.ceil(wordCount / 200));
            
            return {
              id: note.id,
              lectureId: note.lecture_id,
              title: lecture?.title || note.title || 'Untitled Lecture',
              type: lecture?.type || 'Lecture',
              thumbnail_url: lecture?.thumbnail_url || null,
              readingTime,
              completed: note.status === 'completed',
              createdAt: note.created_at
            };
          })
        );

        setActivities(
          (activitiesData || []).map((activity: { id: string; action_type: string; message: string; created_at: string }) => ({
            id: activity.id,
            type: activity.action_type === 'transcript'
              ? 'transcript'
              : activity.action_type === 'flashcards'
                ? 'flashcards'
                : activity.action_type === 'mindmap'
                  ? 'mindmap'
                  : activity.action_type === 'quiz'
                    ? 'quiz'
                    : 'notes',
            message: activity.message,
            timestamp: new Date(activity.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
          }))
        );

        setLectureCount(lecCount || 0);
        setNoteCount(noteCountValue);
        setFlashcardCount(flashcardCountValue);
        
        setStats({
          masteryScore: 0,
          weeklyGoalPct: 0,
          streakDays: 0,
          totalMinutes: 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user]);

  return {
    lectures,
    activities,
    recentNotes,
    lectureCount,
    noteCount,
    flashcardCount,
    stats,
    loading
  };
}

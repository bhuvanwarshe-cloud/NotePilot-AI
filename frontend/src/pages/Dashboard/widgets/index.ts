export { DashboardHero } from './Hero';
export { QuickStats } from './QuickStats';
export { RecentLectures } from './RecentLectures';
export { TodaysFocus } from './TodaysFocus';
export { AiActivity } from './AiActivity';
export { StudyProgress } from './StudyProgress';
export { ContinueLearning } from './ContinueLearning';
export { RecentUploads } from './RecentUploads';

// Canonical dashboard lecture model — single source of truth for all widgets
export type { DashboardLecture } from '@/hooks/useDashboardData';

// Legacy types kept for backward compatibility
export type { Lecture } from './RecentLectures';
export type { FocusItem } from './TodaysFocus';
// SmartNoteItem is kept on ContinueLearning for backward compat but is no longer used for data flow
export type { SmartNoteItem } from './ContinueLearning';
export type { Activity } from './AiActivity';
export type { StudyStats } from './StudyProgress';

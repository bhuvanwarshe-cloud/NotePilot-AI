-- ============================================================
-- NotePilot: Comprehensive Core Schema + RLS
-- Phase 5.2 Database Architecture (Final 10/10 Version)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
    CREATE TYPE lecture_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lecture_type AS ENUM ('audio', 'video', 'pdf', 'youtube', 'textbook');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_job_type AS ENUM ('transcription', 'notes', 'flashcards', 'quiz', 'mind_map');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 1. LECTURES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lectures (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT           NOT NULL,
  description      TEXT,
  type             lecture_type   NOT NULL,
  status           lecture_status NOT NULL DEFAULT 'pending',
  storage_path     TEXT,
  thumbnail_url    TEXT,
  duration_seconds INTEGER,
  language         TEXT           DEFAULT 'en',
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON public.lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_user_created ON public.lectures(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lectures_status ON public.lectures(status);

-- ============================================================
-- 2. LECTURE FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lecture_files (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id        UUID        NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  original_filename TEXT        NOT NULL,
  bucket_name       TEXT        NOT NULL DEFAULT 'lecture-files',
  storage_path      TEXT        NOT NULL,
  file_type         TEXT,
  file_size         BIGINT,
  checksum          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lecture_files_lecture_id ON public.lecture_files(lecture_id);

-- ============================================================
-- 3. TRANSCRIPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transcripts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id      UUID        NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  content         TEXT,
  word_count      INTEGER,
  processing_time INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_transcripts_lecture_id ON public.transcripts(lecture_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_lecture_created ON public.transcripts(lecture_id, created_at);

-- ============================================================
-- 4. NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id  UUID           NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  title       TEXT,
  content     TEXT,
  version     INTEGER        NOT NULL DEFAULT 1,
  source_type TEXT           DEFAULT 'ai',
  generated_by TEXT,
  status      content_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notes_lecture_id ON public.notes(lecture_id);
CREATE INDEX IF NOT EXISTS idx_notes_lecture_created ON public.notes(lecture_id, created_at);

-- ============================================================
-- 5. FLASHCARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id  UUID           NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  front       TEXT           NOT NULL,
  back        TEXT           NOT NULL,
  difficulty  INTEGER        DEFAULT 1,
  order_index INTEGER        DEFAULT 0,
  generated_by TEXT,
  status      content_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_flashcards_lecture_id ON public.flashcards(lecture_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_lecture_created ON public.flashcards(lecture_id, created_at);
CREATE INDEX IF NOT EXISTS idx_flashcards_order ON public.flashcards(order_index);

-- ============================================================
-- 6. QUIZZES & QUIZ QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id  UUID           NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  title       TEXT           NOT NULL,
  generated_by TEXT,
  status      content_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_quizzes_lecture_id ON public.quizzes(lecture_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lecture_created ON public.quizzes(lecture_id, created_at);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID        NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  options     JSONB       NOT NULL,
  answer      TEXT        NOT NULL,
  explanation TEXT,
  order_index INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

-- ============================================================
-- 7. MIND MAPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mind_maps (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id  UUID           NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  data        JSONB,
  generated_by TEXT,
  status      content_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_mind_maps_lecture_id ON public.mind_maps(lecture_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_lecture_created ON public.mind_maps(lecture_id, created_at);

-- ============================================================
-- 8. STUDY SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id       UUID        REFERENCES public.lectures(id) ON DELETE CASCADE,
  duration_minutes INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON public.study_sessions(created_at);

-- ============================================================
-- 9. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ============================================================
-- 10. AI JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id    UUID          NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  job_type      ai_job_type   NOT NULL,
  status        ai_job_status NOT NULL DEFAULT 'pending',
  progress      INTEGER       DEFAULT 0,
  retry_count   INTEGER       DEFAULT 0,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  error_message TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON public.ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_status ON public.ai_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_lecture_id ON public.ai_jobs(lecture_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_jobs(status);

-- ============================================================
-- 11. USER SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme         TEXT        DEFAULT 'system',
  preferred_ai  TEXT        DEFAULT 'gemini',
  language      TEXT        DEFAULT 'en',
  notifications JSONB       DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. USER USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_usage (
  user_id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lectures_uploaded    INTEGER     DEFAULT 0,
  notes_generated      INTEGER     DEFAULT 0,
  flashcards_generated INTEGER     DEFAULT 0,
  quizzes_generated    INTEGER     DEFAULT 0,
  storage_used         BIGINT      DEFAULT 0,
  last_reset           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. LECTURE TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        DEFAULT '#3B82F6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

CREATE TABLE IF NOT EXISTS public.lecture_tags (
  lecture_id  UUID        NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  tag_id      UUID        NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lecture_id, tag_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lectures" ON public.lectures
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own files" ON public.lecture_files
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can manage own transcripts" ON public.transcripts
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can manage own flashcards" ON public.flashcards
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can manage own quizzes" ON public.quizzes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can manage own quiz questions" ON public.quiz_questions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.quizzes q 
    JOIN public.lectures l ON q.lecture_id = l.id 
    WHERE q.id = quiz_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own mind maps" ON public.mind_maps
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can manage own study sessions" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own activity logs" ON public.activity_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai jobs" ON public.ai_jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own user settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own usage stats" ON public.user_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own lecture tags" ON public.lecture_tags
  FOR ALL USING (EXISTS (SELECT 1 FROM public.lectures l WHERE l.id = lecture_id AND l.user_id = auth.uid()));

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lectures_updated_at BEFORE UPDATE ON public.lectures FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER transcripts_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER lecture_files_updated_at BEFORE UPDATE ON public.lecture_files FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER flashcards_updated_at BEFORE UPDATE ON public.flashcards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER mind_maps_updated_at BEFORE UPDATE ON public.mind_maps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER user_usage_updated_at BEFORE UPDATE ON public.user_usage FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- STORAGE BUCKETS (Optional initialization)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('lecture-files', 'lecture-files', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false) ON CONFLICT (id) DO NOTHING;

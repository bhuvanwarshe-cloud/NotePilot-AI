-- ============================================================
-- NotePilot: Phase 6B Upload Refinements
-- ============================================================

-- 1. Add 'uploaded' to lecture_status ENUM
ALTER TYPE lecture_status ADD VALUE IF NOT EXISTS 'uploaded';

-- 2. Add metadata JSONB column to ai_jobs to store source, processorKey, inputType
ALTER TABLE public.ai_jobs
ADD COLUMN IF NOT EXISTS metadata JSONB;

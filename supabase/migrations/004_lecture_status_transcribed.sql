-- ============================================================
-- NotePilot: Phase 6C.1 — Add 'transcribed' lecture status
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TYPE lecture_status ADD VALUE IF NOT EXISTS 'transcribed';

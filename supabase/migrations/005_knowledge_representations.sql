-- ============================================================================
-- 005_knowledge_representations.sql
--
-- Stores the canonical Knowledge Representation produced by the
-- Source Understanding layer.
--
-- This is NOT a user-facing artifact.
--
-- Source
--   ↓
-- Source Understanding
--   ↓
-- Canonical KnowledgeRepresentation
--   ↓
-- knowledge_representations
--   ↓
-- Knowledge Engine
--   ↓
-- notes / flashcards / quizzes / etc.
-- ============================================================================


create table if not exists public.knowledge_representations (

  id uuid
    primary key
    default gen_random_uuid(),

  lecture_id uuid
    not null
    references public.lectures(id)
    on delete cascade,

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  schema_version text
    not null,

  source_type text
    not null,

  provider text
    not null,

  model text,

  representation jsonb
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint knowledge_representations_lecture_unique
    unique (lecture_id)

);


-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists
  knowledge_representations_user_id_idx
on public.knowledge_representations(user_id);


create index if not exists
  knowledge_representations_lecture_id_idx
on public.knowledge_representations(lecture_id);


create index if not exists
  knowledge_representations_source_type_idx
on public.knowledge_representations(source_type);


-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.knowledge_representations
enable row level security;


-- Users may read only their own knowledge representations.

create policy
  "Users can read own knowledge representations"
on public.knowledge_representations
for select
using (
  auth.uid() = user_id
);


-- Users may insert only their own knowledge representations.

create policy
  "Users can insert own knowledge representations"
on public.knowledge_representations
for insert
with check (
  auth.uid() = user_id
);


-- Users may update only their own knowledge representations.

create policy
  "Users can update own knowledge representations"
on public.knowledge_representations
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


-- Users may delete only their own knowledge representations.

create policy
  "Users can delete own knowledge representations"
on public.knowledge_representations
for delete
using (
  auth.uid() = user_id
);
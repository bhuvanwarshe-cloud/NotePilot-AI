// ─── Flashcard Types ──────────────────────────────────────────────────────────
// Mirrors the Supabase `flashcards` table schema.

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 1 | 2 | 3;
  order_index: number;
  generated_by: string;
  status: string;
  lecture_id: string;
}

export type DifficultyLevel = 1 | 2 | 3;

export type DifficultyLabel = 'Easy' | 'Medium' | 'Hard';

export function getDifficultyLabel(difficulty: DifficultyLevel): DifficultyLabel {
  const map: Record<DifficultyLevel, DifficultyLabel> = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  };
  return map[difficulty];
}

export interface FlashcardStudyState {
  currentIndex: number;
  isFlipped: boolean;
}

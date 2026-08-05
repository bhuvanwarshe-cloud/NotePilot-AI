// ─────────────────────────────────────────────────────────────────────────────
// Quiz Difficulty
// ─────────────────────────────────────────────────────────────────────────────

export type QuizDifficulty =
  | "easy"
  | "medium"
  | "hard";


// ─────────────────────────────────────────────────────────────────────────────
// Quiz Question Type
//
// Future-ready.
//
// Today:
// - multiple_choice
//
// Future:
// - true_false
// - fill_blank
// - multiple_select
// ─────────────────────────────────────────────────────────────────────────────

export type QuizQuestionType =
  | "multiple_choice";


// ─────────────────────────────────────────────────────────────────────────────
// Quiz Option
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizOption {

  id: string;

  text: string;

}


// ─────────────────────────────────────────────────────────────────────────────
// Quiz Question
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizQuestion {

  question: string;

  type: QuizQuestionType;

  options: QuizOption[];

  correctOptionId: string;

  explanation: string;

  difficulty: QuizDifficulty;

  topic: string;

}


// ─────────────────────────────────────────────────────────────────────────────
// Quiz DTO
//
// This is the artifact returned by the AI.
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizDTO {

  title: string;

  description: string;

  estimatedDurationMinutes: number;

  questions: QuizQuestion[];

}
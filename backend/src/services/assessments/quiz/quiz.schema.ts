import { z } from "zod";


// ─────────────────────────────────────────────────────────────────────────────
// Quiz Difficulty
// ─────────────────────────────────────────────────────────────────────────────

export const QuizDifficultySchema = z.enum([
  "easy",
  "medium",
  "hard",
]);


// ─────────────────────────────────────────────────────────────────────────────
// Question Type
//
// Future-proof.
// Currently only multiple_choice is supported.
// ─────────────────────────────────────────────────────────────────────────────

export const QuizQuestionTypeSchema = z.enum([
  "multiple_choice",
]);


// ─────────────────────────────────────────────────────────────────────────────
// Option
// ─────────────────────────────────────────────────────────────────────────────

export const QuizOptionSchema = z.object({

  id: z
    .string()
    .min(1)
    .max(20),

  text: z
    .string()
    .min(1)
    .max(300),

});


// ─────────────────────────────────────────────────────────────────────────────
// Question
// ─────────────────────────────────────────────────────────────────────────────

export const QuizQuestionSchema = z.object({

  question: z
    .string()
    .min(10)
    .max(500),

  type:
    QuizQuestionTypeSchema,

  options: z
    .array(QuizOptionSchema)
    .length(4),

  correctOptionId: z
    .string()
    .min(1)
    .max(20),

  explanation: z
    .string()
    .min(10)
    .max(1000),

  difficulty:
    QuizDifficultySchema,

  topic: z
    .string()
    .min(2)
    .max(150),

});


// ─────────────────────────────────────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────────────────────────────────────

export const QuizSchema = z.object({

  title: z
    .string()
    .min(3)
    .max(200),

  description: z
    .string()
    .min(10)
    .max(1000),

  estimatedDurationMinutes: z
    .number()
    .int()
    .min(1)
    .max(180),

  questions: z
    .array(QuizQuestionSchema)
    .min(10)
    .max(25),

});


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type QuizDTO =
  z.infer<typeof QuizSchema>;

export type QuizQuestionDTO =
  z.infer<typeof QuizQuestionSchema>;

export type QuizOptionDTO =
  z.infer<typeof QuizOptionSchema>;
import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import type {
  QuizDTO,
} from "./quiz.schema";


// ─────────────────────────────────────────────────────────────────────────────
// Quiz Row
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizRow {

  id: string;

  lecture_id: string;

  title: string;

  description: string;

  estimated_duration_minutes: number;

  generated_by: string;

  status: string;

  created_at: string;

  updated_at: string;

}


// ─────────────────────────────────────────────────────────────────────────────
// Quiz Question Row
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizQuestionRow {

  id: string;

  quiz_id: string;

  question: string;

  type: string;

  options: unknown;

  correct_option_id: string;

  explanation: string;

  difficulty: number;

  topic: string;

  order_index: number;

}


// ─────────────────────────────────────────────────────────────────────────────
// Save Quiz Input
// ─────────────────────────────────────────────────────────────────────────────

export interface SaveQuizInput {

  lectureId: string;

  generatedBy: string;

  quiz: QuizDTO;

}


// ─────────────────────────────────────────────────────────────────────────────
// Save Quiz
// ─────────────────────────────────────────────────────────────────────────────

export async function saveQuiz(

  supabase: SupabaseClient,

  input: SaveQuizInput

): Promise<{

  quizId: string;

}> {

  // --------------------------------------------------------------------------
  // Delete previous quiz for this lecture
  // --------------------------------------------------------------------------

  const {

    data: existing,

  } = await supabase

    .from("quizzes")

    .select("id")

    .eq("lecture_id", input.lectureId);


  if (existing?.length) {

    const ids =
      existing.map(
        q => q.id
      );

    await supabase

      .from("quiz_questions")

      .delete()

      .in("quiz_id", ids);

    await supabase

      .from("quizzes")

      .delete()

      .eq("lecture_id", input.lectureId);

  }


  // --------------------------------------------------------------------------
  // Insert Quiz
  // --------------------------------------------------------------------------

  const {

    data: quiz,

    error: quizError,

  } = await supabase

    .from("quizzes")

    .insert({

      lecture_id:
        input.lectureId,

      title:
        input.quiz.title,

      description:
        input.quiz.description,

      estimated_duration_minutes:
        input.quiz.estimatedDurationMinutes,

      generated_by:
        input.generatedBy,

      status:
        "completed",

    })

    .select()

    .single();


  if (quizError || !quiz) {

    throw new Error(

      `Failed to save quiz: ${quizError?.message}`

    );

  }


  // --------------------------------------------------------------------------
  // Insert Questions
  // --------------------------------------------------------------------------

  const rows =
    input.quiz.questions.map(

      (

        question,

        index

      ) => ({

        quiz_id:
          quiz.id,

        question:
          question.question,

        type:
          question.type,

        options:
          question.options,

        correct_option_id:
          question.correctOptionId,

        explanation:
          question.explanation,

        difficulty:

          question.difficulty === "easy"

            ? 1

            : question.difficulty === "medium"

            ? 2

            : 3,

        topic:
          question.topic,

        order_index:
          index + 1,

      })

    );


  const {

    error:

      questionError,

  } = await supabase

    .from("quiz_questions")

    .insert(rows);


  if (questionError) {

    throw new Error(

      `Failed to save quiz questions: ${questionError.message}`

    );

  }


  return {

    quizId:
      quiz.id,

  };

}
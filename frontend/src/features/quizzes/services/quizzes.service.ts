import { supabase } from '@/lib/supabase';
import type { Quiz, QuizQuestion, QuizWithQuestions } from '../types';

export async function fetchQuizForLecture(lectureId: string): Promise<QuizWithQuestions | null> {
  const { data: quizzes, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('lecture_id', lectureId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (quizError) {
    throw new Error(quizError.message);
  }

  if (!quizzes || quizzes.length === 0) {
    return null; // No quiz for this lecture
  }

  const quiz = quizzes[0] as Quiz;

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('order_index', { ascending: true });

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  return {
    ...quiz,
    questions: (questions || []) as QuizQuestion[],
  };
}

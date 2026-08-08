export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: QuizOption[];
  answer: string;
  explanation: string | null;
  order_index: number;
}

export interface Quiz {
  id: string;
  lecture_id: string;
  title: string;
  generated_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

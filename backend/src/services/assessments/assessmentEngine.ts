import {
  QuizService,
} from "./quiz/quiz.service";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import type {
  KnowledgeRepresentation,
} from "../sourceUnderstanding/sourceUnderstanding.service";

import type {
  QuizDTO,
} from "./quiz/quiz.schema";

import {
  log,
} from "../../utils/logger";



export class AssessmentEngine {

  constructor(

    private readonly quizService =
      new QuizService(),

  ) {}



  // ---------------------------------------------------------------------------
  // Canonical Knowledge Representation
  //
  // Knowledge
  //      ↓
  // Quiz
  // ---------------------------------------------------------------------------

  async generateQuizFromKnowledge(

    supabase: SupabaseClient,

    lectureId: string,

    knowledge: KnowledgeRepresentation,

  ): Promise<QuizDTO> {

    log.info(

      "AssessmentEngine",

      "Starting quiz generation",

      {

        "Lecture ID":
          lectureId,

        "Title":
          knowledge.title,

      },

    );


    const quiz =

      await this.quizService.generateFromKnowledge({

        supabase,

        lectureId,

        knowledge,

      });


    log.success(

      "AssessmentEngine",

      "Quiz generation completed",

      {

        "Lecture ID":
          lectureId,

        "Questions":
          String(
            quiz.questions.length,
          ),

      },

    );


    return quiz;

  }

}
import {
ProviderRouter,
} from "../../ai/providerRouter";

import {
AIProvider,
} from "../../ai/types";

import {
  aiConfig,
} from "../../knowledge/ai.config";

import {
  systemPrompt,
} from "../../knowledge/prompts/system.prompt";

import {
  philosophyPrompt,
} from "../../knowledge/prompts/shared/philosophy.prompt";

import {
  formattingPrompt,
} from "../../knowledge/prompts/shared/formatting.prompt";

import {
  quizPrompt,
} from "./quiz.prompt";

import {
  AIJsonParser,
} from "../../ai/json/aiJsonParser";

import {
  QuizSchema,

  type QuizDTO,

} from "./quiz.schema";

import type {

  KnowledgeRepresentation,

} from "../../sourceUnderstanding/sourceUnderstanding.service";

import {

  log,

} from "../../../utils/logger";

import {

  saveQuiz,

} from "./quiz.repository";

import type {

  SupabaseClient,

} from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Request
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizGenerationRequest {

  supabase: SupabaseClient;

  lectureId: string;

  knowledge: KnowledgeRepresentation;

  generatedBy?: string;

}

export class QuizService {

  constructor(

    private readonly providerRouter =
      new ProviderRouter(),

  ) {}



  // ---------------------------------------------------------------------------
  // Generate Quiz From Canonical Knowledge Representation
  // ---------------------------------------------------------------------------

 async generateFromKnowledge(

  request: QuizGenerationRequest,

): Promise<QuizDTO> {

  const knowledge =
    request.knowledge;

  try {

    log.info(

      "QuizService",

      "Generating quiz from canonical knowledge",

      {

        "Lecture ID":
          request.lectureId,

        "Title":
          knowledge.title,

        "Topics":
          String(
            knowledge.topics.length,
          ),

        "Concepts":
          String(
            knowledge.concepts.length,
          ),

      },

    );


    const serializedKnowledge =
      JSON.stringify(

        knowledge,

        null,

        2,

      );


    const task =

`${quizPrompt}

The following is the canonical Knowledge Representation.

Generate a quiz ONLY from this information.

Lecture Title:
${knowledge.title}

Language:
${knowledge.language}

Knowledge Representation:

${serializedKnowledge}`;


    const quiz =

      await this.generateQuiz(

        request.lectureId,

        task,

      );


    await saveQuiz(

      request.supabase,

      {

        lectureId:
          request.lectureId,

        generatedBy:
          request.generatedBy ??
          "assessment-engine",

        quiz,

      },

    );


    log.success(

      "QuizService",

      "Quiz generated and persisted successfully",

      {

        "Lecture ID":
          request.lectureId,

        "Questions":
          String(
            quiz.questions.length,
          ),

      },

    );


    return quiz;

  }

  catch (error) {

    log.error(

      "QuizService",

      "Quiz generation failed",

      error,

    );

    throw error;

  }

}
    // ---------------------------------------------------------------------------
  // Generate Quiz
  //
  // Shared implementation
  //
  // Canonical KR
  //        ↓
  // AI Provider
  //        ↓
  // AIJsonParser
  //        ↓
  // Quiz DTO
  // ---------------------------------------------------------------------------

  private async generateQuiz(

    lectureId: string,

    task: string,

  ): Promise<QuizDTO> {

   const provider =
  this.providerRouter.createProvider(
    AIProvider.GROQ
  );


    const system =

      [

        systemPrompt,

        philosophyPrompt,

        formattingPrompt,

      ].join("\n\n");


    const response =

  await provider.generateContent({

    prompt:

`${system}

${task}`,

    model:
    aiConfig.quiz.model,

    temperature:
      aiConfig.temperature,

    maxOutputTokens:
      aiConfig.maxTokens,

    responseMimeType:
      "application/json",

  });


const generatedText =
  response.text;


    const quiz =

      AIJsonParser.parse(

        generatedText,

        QuizSchema,

      );


    log.success(

      "QuizService",

      "Quiz generated successfully",

      {

        "Lecture ID":
          lectureId,

        "Provider":
        response.provider,

       "model":
    aiConfig.quiz.model,

        "Questions":
          String(
            quiz.questions.length,
          ),

      },

    );


    return quiz;

  }
}
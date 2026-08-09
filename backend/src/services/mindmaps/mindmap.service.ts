import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  log,
} from "../../utils/logger";

import {
  ProviderRouter,
} from "../ai/providerRouter";

import {
  aiConfig,
} from "../knowledge/ai.config";

import {
  systemPrompt,
} from "../knowledge/prompts/system.prompt";

import {
  philosophyPrompt,
} from "../knowledge/prompts/shared/philosophy.prompt";

import {
  formattingPrompt,
} from "../knowledge/prompts/shared/formatting.prompt";

import {
  AIJsonParser,
} from "../ai/json/aiJsonParser";

import {
  MindMapSchema,
  type MindMapDTO,
} from "./mindmap.schema";

import {
  mindMapPrompt,
} from "./mindmap.prompt";

import {
  saveMindMap,
} from "./mindmap.repository";

import type {
  KnowledgeRepresentation,
} from "../sourceUnderstanding/sourceUnderstanding.service";

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateMindMapOptions {

  supabase:
    SupabaseClient;

  lectureId:
    string;

  knowledge:
    KnowledgeRepresentation;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Mind Map
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMindMapFromKnowledgeRepresentation(
  opts: GenerateMindMapOptions,
): Promise<{
  mindMapId: string;
  mindMap: MindMapDTO;
}> {

  const {
    supabase,
    lectureId,
    knowledge,
  } = opts;

  try {

    log.info(
      "MindMapService",
      "Starting mind map generation from canonical knowledge",
      {
        "Lecture ID":
          lectureId,

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

    // ------------------------------------------------------------------------
    // Serialize canonical knowledge
    // ------------------------------------------------------------------------

    const serializedKnowledge =
      JSON.stringify(
        knowledge,
        null,
        2,
      );

    // ------------------------------------------------------------------------
    // Build task
    // ------------------------------------------------------------------------

    const task = `
${mindMapPrompt}

Lecture Title:
${knowledge.title}

Language:
${knowledge.language}

Canonical Knowledge Representation:

${serializedKnowledge}
`;

    // ------------------------------------------------------------------------
    // Provider
    // ------------------------------------------------------------------------

    const provider =
      new ProviderRouter()
        .createProvider();

    const system = [
      systemPrompt,
      philosophyPrompt,
      formattingPrompt,
    ].join("\n\n");

    // ------------------------------------------------------------------------
    // Generate
    // ------------------------------------------------------------------------

    const response =
      await provider.generateContent({

        prompt:
          `${system}\n\n${task}`,

        model:
          aiConfig.mindMap.model,

        temperature:
          aiConfig.temperature,

        maxOutputTokens:
          aiConfig.maxTokens,

        responseMimeType:
          "application/json",
      });

    // ------------------------------------------------------------------------
    // Parse + validate
    // ------------------------------------------------------------------------

    const mindMap =
      AIJsonParser.parse(
        response.text,
        MindMapSchema,
      );

    // ------------------------------------------------------------------------
    // Persist
    // ------------------------------------------------------------------------

    const {
      mindMapId,
    } = await saveMindMap(
      supabase,
      {
        lectureId,

        generatedBy:
          response.provider,

        mindMap,
      },
    );

    log.success(
      "MindMapService",
      "Mind map generated and persisted successfully",
      {
        "Lecture ID":
          lectureId,

        "Mind Map ID":
          mindMapId,

        "Provider":
          response.provider,

        "Model":
          aiConfig.mindMap.model,

        "Nodes":
          String(
            mindMap.nodes.length,
          ),

        "Edges":
          String(
            mindMap.edges.length,
          ),
      },
    );

    return {
      mindMapId,
      mindMap,
    };

  } catch (error: unknown) {

    log.error(
      "MindMapService",
      "Mind map generation failed",
      error,
    );

    throw error;
  }
}
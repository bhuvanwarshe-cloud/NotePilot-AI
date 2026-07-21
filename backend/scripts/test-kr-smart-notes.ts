/**
 * test-kr-smart-notes.ts
 *
 * Phase 3.4.3
 *
 * Focused integration test:
 *
 * KnowledgeExtraction fixture
 *      ↓
 * Canonical KnowledgeRepresentation
 *      ↓
 * KnowledgeEngine
 *      ↓
 * ContentGenerator
 *      ↓
 * Smart Notes
 *
 * This test deliberately does NOT:
 *
 * - access YouTube
 * - run Gemini multimodal source understanding
 * - persist to Supabase
 * - create/update ai_jobs
 *
 * Goal:
 *
 * Verify that an already-created canonical KR can be transformed into
 * student-facing Smart Notes by the existing Knowledge Engine.
 */

import 'dotenv/config';

import {
  buildKnowledgeRepresentation,
} from '../src/services/knowledgeRepresentation/knowledgeRepresentation.builder';

import {
  validLLMLectureFixture,
} from '../src/services/knowledgeRepresentation/fixtures/llmLecture.fixture';

import {
  KnowledgeEngine,
} from '../src/services/knowledge/knowledgeEngine';

import {
  ContentGenerator,
} from '../src/services/knowledge/contentGenerator';

import {
  InMemoryKnowledgeArtifactRepository,
} from '../src/services/knowledge/knowledgeArtifact.repository';


// ─────────────────────────────────────────────────────────────────────────────
// Test
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {

  console.log('');
  console.log('==============================================');
  console.log(' NotePilot — KR → Smart Notes Integration Test');
  console.log('==============================================');
  console.log('');


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 1 — Build canonical KR from deterministic fixture
  //
  // We deliberately use the existing fixture rather than YouTube.
  //
  // This isolates Phase 3.4 from expensive/slow source understanding.
  // ───────────────────────────────────────────────────────────────────────────

  console.log(
    '[TEST] Stage 1 — Building canonical KnowledgeRepresentation'
  );


  const knowledge =
    buildKnowledgeRepresentation(
      validLLMLectureFixture,
      {

        sourceType:
          'youtube',

        provider:
          'GeminiYouTubeProvider',

        sourceUri:
          'https://www.youtube.com/watch?v=5sLYAQS9sWQ',

        externalId:
          '5sLYAQS9sWQ',

        processingTimeMs:
          1000,

        requestId:
          'phase-3.4.3-test',

        multimodal:
          true,

        extra: {

          model:
            'fixture-test',

        },

      }
    );


  console.log(
    `[TEST] Title: ${knowledge.title}`
  );

  console.log(
    `[TEST] Topics: ${knowledge.topics.length}`
  );

  console.log(
    `[TEST] Concepts: ${knowledge.concepts.length}`
  );

  console.log(
    `[TEST] Definitions: ${knowledge.definitions.length}`
  );

  console.log(
    `[TEST] Examples: ${knowledge.examples.length}`
  );

  console.log(
    `[TEST] Visual insights: ${knowledge.visualInsights?.length ?? 0}`
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 2 — Create Knowledge Engine
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log(
    '[TEST] Stage 2 — Creating Knowledge Engine'
  );


  const artifactRepository =
    new InMemoryKnowledgeArtifactRepository();


  const knowledgeEngine =
    new KnowledgeEngine(

      new ContentGenerator(),

      artifactRepository

    );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 3 — Generate Smart Notes FROM canonical KR
  //
  // This is the exact generation boundary used by the new YouTube pipeline
  // after source understanding has completed.
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log(
    '[TEST] Stage 3 — Generating Smart Notes from canonical KR'
  );


  const startedAt =
    Date.now();


  const result =
    await knowledgeEngine.generateNotesFromKnowledge(

      'phase-3.4.3-lecture',

      knowledge

    );


  const elapsedMs =
    Date.now() -
    startedAt;


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 4 — Validate generated result
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log(
    '[TEST] Stage 4 — Validating generated Smart Notes'
  );


  if (
    !result.content ||
    result.content.trim().length === 0
  ) {

    throw new Error(
      'Smart Notes generation returned empty content.'
    );

  }


  if (
    result.content.length < 100
  ) {

    throw new Error(
      `Smart Notes content is unexpectedly short (${result.content.length} characters).`
    );

  }


  if (
    !result.metadata.provider
  ) {

    throw new Error(
      'Generation metadata is missing provider.'
    );

  }


  if (
    !result.metadata.model
  ) {

    throw new Error(
      'Generation metadata is missing model.'
    );

  }


  if (
    result.artifact.rawMarkdown !==
    result.content
  ) {

    throw new Error(
      'KnowledgeArtifact.rawMarkdown does not match generated Smart Notes content.'
    );

  }


  // ───────────────────────────────────────────────────────────────────────────
  // Output
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log('==============================================');
  console.log(' SMART NOTES RESULT');
  console.log('==============================================');

  console.log(
    `Provider       : ${result.metadata.provider}`
  );

  console.log(
    `Model          : ${result.metadata.model}`
  );

  console.log(
    `Content length : ${result.content.length} chars`
  );

  console.log(
    `Generation time: ${elapsedMs}ms`
  );


  console.log('');
  console.log('----------------------------------------------');
  console.log(' SMART NOTES PREVIEW');
  console.log('----------------------------------------------');
  console.log('');


  /*
   * Print only a preview so terminal output remains readable.
   */

  const previewLength =
    2500;


  console.log(
    result.content.length >
      previewLength

      ? `${result.content.slice(
          0,
          previewLength
        )}\n\n... [preview truncated]`

      : result.content
  );


  console.log('');
  console.log('==============================================');
  console.log(' PRESERVATION / CONTRACT CHECKS');
  console.log('==============================================');

  console.log(
    '  Canonical KR accepted             ✓'
  );

  console.log(
    '  Knowledge Engine executed         ✓'
  );

  console.log(
    '  Smart Notes content generated     ✓'
  );

  console.log(
    '  Markdown artifact preserved       ✓'
  );

  console.log(
    '  Provider metadata preserved       ✓'
  );

  console.log(
    '  Model metadata preserved          ✓'
  );


  console.log('');
  console.log('==============================================');
  console.log(' KR → SMART NOTES TEST PASSED ✓');
  console.log('==============================================');
  console.log('');

}


// ─────────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch(
    (
      error: unknown
    ) => {

      console.error('');
      console.error('==============================================');
      console.error(' KR → SMART NOTES TEST FAILED ✗');
      console.error('==============================================');
      console.error('');


      if (
        error instanceof Error
      ) {

        console.error(
          error.stack ??
          error.message
        );

      } else {

        console.error(
          error
        );

      }


      process.exitCode =
        1;

    }
  );
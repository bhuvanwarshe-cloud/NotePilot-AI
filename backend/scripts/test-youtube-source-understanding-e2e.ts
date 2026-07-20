/**
 * test-youtube-source-understanding-e2e.ts
 *
 * Phase 2.4.3
 *
 * Full end-to-end test:
 *
 * YouTube URL
 *      ↓
 * URL validation + canonicalization
 *      ↓
 * SourceUnderstandingService
 *      ↓
 * GeminiYouTubeProvider + resilience
 *      ↓
 * KnowledgeExtraction
 *      ↓
 * KnowledgeRepresentationBuilder
 *      ↓
 * Canonical KnowledgeRepresentation v1.0
 *
 * NOTE:
 * This test makes a REAL Gemini API request.
 */

import 'dotenv/config';

import {
  validateYouTubeUrl,
  buildVideoContext,
} from '../src/processors/youtube/youtubeValidator';

import {
  understandYouTubeSource,
} from '../src/services/sourceUnderstanding/sourceUnderstanding.service';


// ─────────────────────────────────────────────────────────────────────────────
// Test Source
// ─────────────────────────────────────────────────────────────────────────────

const TEST_URL =
  process.env.TEST_YOUTUBE_URL ||
  'https://www.youtube.com/watch?v=5sLYAQS9sWQ';


// ─────────────────────────────────────────────────────────────────────────────
// Assertions
// ─────────────────────────────────────────────────────────────────────────────

function assert(
  condition: unknown,
  message: string
): asserts condition {

  if (!condition) {

    throw new Error(
      `Assertion failed: ${message}`
    );

  }

}


// ─────────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {

  console.log(
    '\n=============================================='
  );

  console.log(
    ' NotePilot — YouTube Source Understanding E2E'
  );

  console.log(
    '==============================================\n'
  );


  const startedAt =
    Date.now();


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 1 — Validate + canonicalize
  // ───────────────────────────────────────────────────────────────────────────

  console.log(
    '[E2E] Stage 1 — Validating YouTube URL'
  );


  const {
    videoId,
  } =
    validateYouTubeUrl(
      TEST_URL
    );


  const context =
    buildVideoContext(
      TEST_URL,
      videoId
    );


  console.log(
    `[E2E] Video ID: ${context.videoId}`
  );

  console.log(
    `[E2E] Canonical URL: ${context.canonicalUrl}`
  );


  assert(
    context.videoId.length === 11,
    'Expected a valid 11-character YouTube video ID.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 2 — Understand source
  // ───────────────────────────────────────────────────────────────────────────

  console.log(
    '\n[E2E] Stage 2 — Running SourceUnderstandingService'
  );


  const result =
    await understandYouTubeSource({

      videoId:
        context.videoId,

      canonicalUrl:
        context.canonicalUrl,

      requestId:
        'e2e-youtube-source-understanding',

    });


  // ───────────────────────────────────────────────────────────────────────────
  // Stage 3 — Validate final canonical representation
  // ───────────────────────────────────────────────────────────────────────────

  console.log(
    '\n[E2E] Stage 3 — Verifying canonical result'
  );


  const knowledge =
    result.knowledge;


  assert(
    knowledge.schemaVersion === '1.0',
    `Expected schema version 1.0, received ${knowledge.schemaVersion}.`
  );


  assert(
    knowledge.source.sourceType === 'youtube',
    `Expected sourceType youtube, received ${knowledge.source.sourceType}.`
  );


  assert(
    knowledge.source.externalId === context.videoId,
    'Expected source externalId to match YouTube video ID.'
  );


  assert(
    knowledge.source.sourceUri === context.canonicalUrl,
    'Expected canonical YouTube URL to be preserved.'
  );


  assert(
    knowledge.title.trim().length > 0,
    'Expected a non-empty title.'
  );


  assert(
    knowledge.overview.trim().length > 0,
    'Expected a non-empty overview.'
  );


  assert(
    knowledge.topics.length > 0,
    'Expected at least one topic.'
  );


  assert(
    knowledge.concepts.length > 0,
    'Expected at least one concept.'
  );


  assert(
    result.extraction.title === knowledge.title,
    'Expected extraction title to be preserved in canonical representation.'
  );


  assert(
    result.metadata.provider.length > 0,
    'Expected provider metadata.'
  );


  assert(
    result.metadata.model.length > 0,
    'Expected model metadata.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Summary
  // ───────────────────────────────────────────────────────────────────────────

  const totalMs =
    Date.now() -
    startedAt;


  console.log(
    '\n=============================================='
  );

  console.log(
    ' FINAL CANONICAL KNOWLEDGE'
  );

  console.log(
    '=============================================='
  );


  console.log(
    `Schema version   : ${knowledge.schemaVersion}`
  );

  console.log(
    `Title            : ${knowledge.title}`
  );

  console.log(
    `Language         : ${knowledge.language}`
  );

  console.log(
    `Source           : ${knowledge.source.sourceType}`
  );

  console.log(
    `Provider         : ${result.metadata.provider}`
  );

  console.log(
    `Model            : ${result.metadata.model}`
  );

  console.log(
    `Video ID         : ${knowledge.source.externalId}`
  );

  console.log(
    `Topics           : ${knowledge.topics.length}`
  );

  console.log(
    `Concepts         : ${knowledge.concepts.length}`
  );

  console.log(
    `Definitions      : ${knowledge.definitions.length}`
  );

  console.log(
    `Formulas         : ${knowledge.formulas.length}`
  );

  console.log(
    `Examples         : ${knowledge.examples.length}`
  );

  console.log(
    `Visual insights  : ${knowledge.visualInsights?.length ?? 0}`
  );

  console.log(
    `Timeline entries : ${knowledge.timeline?.length ?? 0}`
  );

  console.log(
    `Total E2E time   : ${totalMs}ms`
  );


  console.log(
    '\nPreservation checks:'
  );

  console.log(
    '  URL → canonical context             ✓'
  );

  console.log(
    '  Gemini → structured extraction      ✓'
  );

  console.log(
    '  Structural validation               ✓'
  );

  console.log(
    '  Semantic integrity                  ✓'
  );

  console.log(
    '  Extraction → canonical KR           ✓'
  );

  console.log(
    '  Source metadata preserved           ✓'
  );

  console.log(
    '  Provider/model metadata preserved   ✓'
  );


  console.log(
    '\n=============================================='
  );

  console.log(
    ' YOUTUBE SOURCE UNDERSTANDING E2E PASSED ✓'
  );

  console.log(
    '==============================================\n'
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary
// ─────────────────────────────────────────────────────────────────────────────

main().catch(
  (error) => {

    console.error(
      '\n=============================================='
    );

    console.error(
      ' YOUTUBE SOURCE UNDERSTANDING E2E FAILED ✗'
    );

    console.error(
      '==============================================\n'
    );

    console.error(
      error
    );

    process.exitCode =
      1;

  }
);
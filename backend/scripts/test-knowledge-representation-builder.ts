/**
 * Phase 2.3
 *
 * Tests the deterministic conversion:
 *
 * KnowledgeExtraction
 *      ↓
 * integrity validation
 *      ↓
 * KnowledgeRepresentation Builder
 *      ↓
 * canonical Zod validation
 *      ↓
 * KnowledgeRepresentation
 *
 * No Gemini.
 * No Supabase.
 * No network.
 */

import {
  buildKnowledgeRepresentation,
} from '../src/services/knowledgeRepresentation/knowledgeRepresentation.builder';

import {
  validLLMLectureFixture,
} from '../src/services/knowledgeRepresentation/fixtures/llmLecture.fixture';

import {
  validateKnowledgeRepresentation,
} from '../src/services/knowledgeRepresentation/schema';


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


function main(): void {

  console.log(
    '\n=============================================='
  );

  console.log(
    ' NotePilot — KnowledgeRepresentation Builder Test'
  );

  console.log(
    '==============================================\n'
  );


  const startedAt =
    Date.now();


  // ---------------------------------------------------------------------------
  // Build canonical representation
  // ---------------------------------------------------------------------------

  const representation =
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
          152359,

        requestId:
          'phase-2-3-test',

        multimodal:
          true,

        processedAt:
          '2026-07-20T00:00:00.000Z',

        extra: {

          model:
            'gemini-3.5-flash',

        },

      }
    );


  const buildTimeMs =
    Date.now() - startedAt;


  // ---------------------------------------------------------------------------
  // Explicit canonical validation
  //
  // The builder already validates internally.
  // This second validation proves the returned object independently satisfies
  // the public canonical schema contract.
  // ---------------------------------------------------------------------------

  const validated =
    validateKnowledgeRepresentation(
      representation
    );


  console.log(
    'Canonical representation created:\n'
  );


  console.log(
    `Schema version   : ${validated.schemaVersion}`
  );

  console.log(
    `Title            : ${validated.title}`
  );

  console.log(
    `Language         : ${validated.language}`
  );

  console.log(
    `Source type      : ${validated.source.sourceType}`
  );

  console.log(
    `Provider         : ${validated.source.provider}`
  );

  console.log(
    `External ID      : ${validated.source.externalId ?? '(none)'}`
  );

  console.log(
    `Duration         : ${validated.source.durationSeconds ?? 0}s`
  );

  console.log(
    `Topics           : ${validated.topics.length}`
  );

  console.log(
    `Concepts         : ${validated.concepts.length}`
  );

  console.log(
    `Definitions      : ${validated.definitions.length}`
  );

  console.log(
    `Formulas         : ${validated.formulas.length}`
  );

  console.log(
    `Examples         : ${validated.examples.length}`
  );

  console.log(
    `Visual insights  : ${validated.visualInsights?.length ?? 0}`
  );

  console.log(
    `Timeline entries : ${validated.timeline?.length ?? 0}`
  );

  console.log(
    `Multimodal       : ${validated.processing.multimodal ?? false}`
  );

  console.log(
    `Visual detected  : ${validated.processing.visualContentDetected ?? false}`
  );

  console.log(
    `Build time       : ${buildTimeMs}ms`
  );


  // ---------------------------------------------------------------------------
  // Assertions — Root fields
  // ---------------------------------------------------------------------------

  assert(
    validated.title ===
      validLLMLectureFixture.title,

    'Title must be preserved.'
  );


  assert(
    validated.language ===
      validLLMLectureFixture.language,

    'Language must be preserved.'
  );


  assert(
    validated.overview ===
      validLLMLectureFixture.overview,

    'Overview must be preserved.'
  );


  // ---------------------------------------------------------------------------
  // Assertions — Source metadata
  // ---------------------------------------------------------------------------

  assert(
    validated.source.sourceType ===
      'youtube',

    'Source type must be youtube.'
  );


  assert(
    validated.source.provider ===
      'GeminiYouTubeProvider',

    'Provider must be preserved.'
  );


  assert(
    validated.source.externalId ===
      '5sLYAQS9sWQ',

    'YouTube video ID must be preserved.'
  );


  assert(
    validated.source.durationSeconds ===
      validLLMLectureFixture.durationSeconds,

    'Duration must be preserved.'
  );


  assert(
    validated.source.author ===
      validLLMLectureFixture.author,

    'Author must be preserved.'
  );


  // ---------------------------------------------------------------------------
  // Assertions — Knowledge collections
  // ---------------------------------------------------------------------------

  assert(
    validated.topics.length ===
      validLLMLectureFixture.topics.length,

    'Topic count must be preserved.'
  );


  assert(
    validated.concepts.length ===
      validLLMLectureFixture.concepts.length,

    'Concept count must be preserved.'
  );


  assert(
    validated.definitions.length ===
      validLLMLectureFixture.definitions.length,

    'Definition count must be preserved.'
  );


  assert(
    validated.formulas.length ===
      validLLMLectureFixture.formulas.length,

    'Formula count must be preserved.'
  );


  assert(
    validated.examples.length ===
      validLLMLectureFixture.examples.length,

    'Example count must be preserved.'
  );


  assert(
    (validated.visualInsights?.length ?? 0) ===
      (validLLMLectureFixture.visualInsights?.length ?? 0),

    'Visual insight count must be preserved.'
  );


  assert(
    (validated.timeline?.length ?? 0) ===
      (validLLMLectureFixture.timeline?.length ?? 0),

    'Timeline count must be preserved.'
  );


  // ---------------------------------------------------------------------------
  // Assertions — Cross-reference preservation
  // ---------------------------------------------------------------------------

  const foundationTopic =
    validated.topics.find(
      (topic) =>
        topic.id ===
        'topic_foundation_models'
    );


  assert(
    foundationTopic,
    'Foundation-model topic must exist.'
  );


  assert(
    foundationTopic.conceptIds?.includes(
      'concept_foundation_model'
    ),

    'Topic → concept reference must be preserved.'
  );


  assert(
    foundationTopic.definitionIds?.includes(
      'definition_foundation_model'
    ),

    'Topic → definition reference must be preserved.'
  );


  assert(
    foundationTopic.visualInsightIds?.includes(
      'visual_foundation_model_llm_diagram'
    ),

    'Topic → visual insight reference must be preserved.'
  );


  const transformerTopic =
    validated.topics.find(
      (topic) =>
        topic.id ===
        'topic_transformer_architecture'
    );


  assert(
    transformerTopic,
    'Transformer topic must exist.'
  );


  assert(
    transformerTopic.exampleIds?.includes(
      'example_next_word_prediction'
    ),

    'Topic → example reference must be preserved.'
  );


  // ---------------------------------------------------------------------------
  // Assertions — Visual/multimodal metadata
  // ---------------------------------------------------------------------------

  assert(
    validated.processing.multimodal ===
      true,

    'Processing metadata must identify multimodal extraction.'
  );


  assert(
    validated.processing.visualContentDetected ===
      true,

    'Visual content must be detected when visual insights exist.'
  );


  // ---------------------------------------------------------------------------
  // Assertions — Deterministic processing timestamp
  // ---------------------------------------------------------------------------

  assert(
    validated.processing.processedAt ===
      '2026-07-20T00:00:00.000Z',

    'Injected processedAt timestamp must be preserved.'
  );


  console.log(
    '\nPreservation checks:'
  );

  console.log(
    '  Root metadata                 ✓'
  );

  console.log(
    '  Source metadata               ✓'
  );

  console.log(
    '  Knowledge collections         ✓'
  );

  console.log(
    '  Topic → concept references    ✓'
  );

  console.log(
    '  Topic → definition references ✓'
  );

  console.log(
    '  Topic → example references    ✓'
  );

  console.log(
    '  Topic → visual references     ✓'
  );

  console.log(
    '  Multimodal metadata           ✓'
  );

  console.log(
    '  Deterministic timestamp       ✓'
  );


  console.log(
    '\n=============================================='
  );

  console.log(
    ' KNOWLEDGE REPRESENTATION BUILDER PASSED ✓'
  );

  console.log(
    '==============================================\n'
  );

}


try {

  main();

} catch (error) {

  console.error(
    '\n=============================================='
  );

  console.error(
    ' KNOWLEDGE REPRESENTATION BUILDER FAILED ✗'
  );

  console.error(
    '==============================================\n'
  );


  console.error(
    error instanceof Error
      ? error.message
      : error
  );


  process.exitCode =
    1;

}
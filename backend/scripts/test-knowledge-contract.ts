/**
 * Phase 1.4
 *
 * Knowledge Representation Contract Test
 *
 * Tests:
 *
 * 1. Valid extraction passes Zod validation.
 * 2. Valid extraction passes semantic integrity validation.
 * 3. Structurally invalid extraction fails Zod.
 * 4. Dangling concept reference is detected.
 * 5. Dangling topic reference is detected.
 * 6. Duplicate global IDs are detected.
 */

import {
  knowledgeExtractionSchema,
} from '../src/services/knowledgeRepresentation/extraction.schema';

import {
  validateKnowledgeIntegrity,
} from '../src/services/knowledgeRepresentation/integrity';

import {
  validLLMLectureFixture,
} from '../src/services/knowledgeRepresentation/fixtures/llmLecture.fixture';


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clone<T>(
  value: T
): T {

  return JSON.parse(
    JSON.stringify(value)
  ) as T;

}


function pass(
  message: string
): void {

  console.log(
    `✅ PASS — ${message}`
  );

}


function fail(
  message: string
): never {

  throw new Error(
    `❌ FAIL — ${message}`
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {

  console.log(
    '\n=============================================='
  );

  console.log(
    ' NotePilot — Knowledge Contract Test'
  );

  console.log(
    '==============================================\n'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1
  //
  // Valid fixture must pass structural validation.
  // ───────────────────────────────────────────────────────────────────────────

  const structuralResult =
    knowledgeExtractionSchema.safeParse(
      validLLMLectureFixture
    );


  if (
    !structuralResult.success
  ) {

    console.error(
      structuralResult.error.issues
    );

    fail(
      'Valid fixture failed structural validation.'
    );

  }


  pass(
    'Valid fixture passes Zod structural validation.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2
  //
  // Valid fixture must pass semantic integrity validation.
  // ───────────────────────────────────────────────────────────────────────────

  const integrityResult =
    validateKnowledgeIntegrity(
      structuralResult.data
    );


  if (
    !integrityResult.valid
  ) {

    console.error(
      integrityResult.issues
    );

    fail(
      'Valid fixture failed semantic integrity validation.'
    );

  }


  pass(
    'Valid fixture passes semantic integrity validation.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3
  //
  // Break the structure:
  //
  // topics should be an array, not a string.
  // ───────────────────────────────────────────────────────────────────────────

  const structurallyBroken =
    clone(
      validLLMLectureFixture
    ) as any;


  structurallyBroken.topics =
    'this should not be a string';


  const brokenStructureResult =
    knowledgeExtractionSchema.safeParse(
      structurallyBroken
    );


  if (
    brokenStructureResult.success
  ) {

    fail(
      'Structurally invalid fixture was incorrectly accepted.'
    );

  }


  pass(
    'Zod rejects structurally invalid AI output.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // TEST 4
  //
  // Add a concept reference that does not exist.
  // ───────────────────────────────────────────────────────────────────────────

  const danglingConcept =
    clone(
      validLLMLectureFixture
    );


  danglingConcept.topics[0]
    .conceptIds =
    [
      ...(danglingConcept.topics[0].conceptIds ?? []),

      'concept_does_not_exist',
    ];


  const danglingConceptStructure =
    knowledgeExtractionSchema.parse(
      danglingConcept
    );


  const danglingConceptResult =
    validateKnowledgeIntegrity(
      danglingConceptStructure
    );


  if (
    danglingConceptResult.valid
  ) {

    fail(
      'Dangling concept reference was not detected.'
    );

  }


  const conceptIssueFound =
    danglingConceptResult.issues.some(
      (issue) =>
        issue.referencedId ===
        'concept_does_not_exist'
    );


  if (
    !conceptIssueFound
  ) {

    console.error(
      danglingConceptResult.issues
    );

    fail(
      'Expected dangling concept issue was missing.'
    );

  }


  pass(
    'Dangling concept reference is detected.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // TEST 5
  //
  // Add a timeline → topic reference that does not exist.
  // ───────────────────────────────────────────────────────────────────────────

  const danglingTopic =
    clone(
      validLLMLectureFixture
    );


  danglingTopic.timeline[0]
    .relatedTopicIds =
    [
      'topic_missing',
    ];


  const danglingTopicStructure =
    knowledgeExtractionSchema.parse(
      danglingTopic
    );


  const danglingTopicResult =
    validateKnowledgeIntegrity(
      danglingTopicStructure
    );


  if (
    danglingTopicResult.valid
  ) {

    fail(
      'Dangling topic reference was not detected.'
    );

  }


  const topicIssueFound =
    danglingTopicResult.issues.some(
      (issue) =>
        issue.referencedId ===
        'topic_missing'
    );


  if (
    !topicIssueFound
  ) {

    console.error(
      danglingTopicResult.issues
    );

    fail(
      'Expected dangling topic issue was missing.'
    );

  }


  pass(
    'Dangling timeline → topic reference is detected.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // TEST 6
  //
  // Create a duplicate global ID.
  //
  // A concept intentionally receives the same ID as a topic.
  // ───────────────────────────────────────────────────────────────────────────

  const duplicateId =
    clone(
      validLLMLectureFixture
    );


  duplicateId.concepts[0].id =
    duplicateId.topics[0].id;


  const duplicateStructure =
    knowledgeExtractionSchema.parse(
      duplicateId
    );


  const duplicateResult =
    validateKnowledgeIntegrity(
      duplicateStructure
    );


  if (
    duplicateResult.valid
  ) {

    fail(
      'Duplicate global ID was not detected.'
    );

  }


  const duplicateIssueFound =
    duplicateResult.issues.some(
      (issue) =>
        issue.message.includes(
          'Duplicate ID'
        )
    );


  if (
    !duplicateIssueFound
  ) {

    console.error(
      duplicateResult.issues
    );

    fail(
      'Expected duplicate-ID issue was missing.'
    );

  }


  pass(
    'Duplicate global IDs are detected.'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Complete
  // ───────────────────────────────────────────────────────────────────────────

  console.log(
    '\n=============================================='
  );

  console.log(
    ' ALL KNOWLEDGE CONTRACT TESTS PASSED ✓'
  );

  console.log(
    '==============================================\n'
  );

}


try {

  main();

} catch (error) {

  console.error(
    '\nKnowledge contract test failed.'
  );

  console.error(
    error
  );

  process.exitCode =
    1;

}
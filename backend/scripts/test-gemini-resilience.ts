/**
 * test-gemini-resilience.ts
 *
 * Phase 2.4.2C
 *
 * Tests the Gemini resilience layer WITHOUT making real Gemini API calls.
 *
 * Cases:
 *
 * 1. Temporary 503 failures eventually succeed
 * 2. Permanent 404 model error fails immediately
 * 3. Repeated 503 failures stop after max attempts
 */

import {
  GeminiProviderError,
  withGeminiRetry,
} from '../src/services/sourceUnderstanding/providers/geminiResilience';


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
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


function createApiError(
  status: number,
  message: string
): Error & { status: number } {

  const error =
    new Error(message) as Error & {
      status: number;
    };

  error.status =
    status;

  return error;

}


// ─────────────────────────────────────────────────────────────────────────────
// Test 1
//
// 503 → 503 → success
// ─────────────────────────────────────────────────────────────────────────────

async function testTemporary503Recovery(): Promise<void> {

  console.log(
    '\n----------------------------------------------'
  );

  console.log(
    ' TEST 1 — Temporary 503 recovery'
  );

  console.log(
    '----------------------------------------------'
  );


  let attempts =
    0;


  const result =
    await withGeminiRetry(
      async () => {

        attempts += 1;


        if (attempts <= 2) {

          throw createApiError(
            503,
            'This model is currently experiencing high demand.'
          );

        }


        return {
          success: true,
          value: 'mock-gemini-response',
        };

      },
      {
        maxAttempts: 3,

        // Tiny delays so the unit-style test finishes quickly.
        baseDelayMs: 10,

        maxDelayMs: 20,
      }
    );


  assert(
    attempts === 3,
    `Expected exactly 3 attempts, received ${attempts}.`
  );


  assert(
    result.success === true,
    'Expected final operation to succeed.'
  );


  assert(
    result.value === 'mock-gemini-response',
    'Expected the successful mock response.'
  );


  console.log(
    `Attempts: ${attempts}`
  );

  console.log(
    'Result: success'
  );

  console.log(
    'TEST 1 PASSED ✓'
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Test 2
//
// Permanent model 404 → fail immediately
// ─────────────────────────────────────────────────────────────────────────────

async function testPermanent404Failure(): Promise<void> {

  console.log(
    '\n----------------------------------------------'
  );

  console.log(
    ' TEST 2 — Permanent 404 model failure'
  );

  console.log(
    '----------------------------------------------'
  );


  let attempts =
    0;


  try {

    await withGeminiRetry(
      async () => {

        attempts += 1;


        throw createApiError(
          404,
          'This model models/gemini-old-model is no longer available.'
        );

      },
      {
        maxAttempts: 3,
        baseDelayMs: 10,
        maxDelayMs: 20,
      }
    );


    throw new Error(
      'Expected the 404 test to fail, but it succeeded.'
    );

  } catch (error) {

    assert(
      error instanceof GeminiProviderError,
      'Expected GeminiProviderError.'
    );


    assert(
      error.code === 'GEMINI_MODEL_UNAVAILABLE',
      `Expected GEMINI_MODEL_UNAVAILABLE, received ${error.code}.`
    );


    assert(
      error.retryable === false,
      'Expected model-unavailable error to be non-retryable.'
    );


    assert(
      attempts === 1,
      `Expected exactly 1 attempt, received ${attempts}.`
    );


    console.log(
      `Code: ${error.code}`
    );

    console.log(
      `Retryable: ${error.retryable}`
    );

    console.log(
      `Attempts: ${attempts}`
    );

    console.log(
      'TEST 2 PASSED ✓'
    );

  }

}


// ─────────────────────────────────────────────────────────────────────────────
// Test 3
//
// 503 → 503 → 503 → retry exhaustion
// ─────────────────────────────────────────────────────────────────────────────

async function testRetryExhaustion(): Promise<void> {

  console.log(
    '\n----------------------------------------------'
  );

  console.log(
    ' TEST 3 — Retry exhaustion'
  );

  console.log(
    '----------------------------------------------'
  );


  let attempts =
    0;


  try {

    await withGeminiRetry(
      async () => {

        attempts += 1;


        throw createApiError(
          503,
          'This model is currently experiencing high demand.'
        );

      },
      {
        maxAttempts: 3,
        baseDelayMs: 10,
        maxDelayMs: 20,
      }
    );


    throw new Error(
      'Expected retry exhaustion, but operation succeeded.'
    );

  } catch (error) {

    assert(
      error instanceof GeminiProviderError,
      'Expected GeminiProviderError after retry exhaustion.'
    );


    assert(
      error.code === 'GEMINI_HIGH_DEMAND',
      `Expected GEMINI_HIGH_DEMAND, received ${error.code}.`
    );


    assert(
      error.retryable === false,
      'Expected exhausted retry error to be terminal.'
    );


    assert(
      attempts === 3,
      `Expected exactly 3 attempts, received ${attempts}.`
    );


    assert(
      error.message.includes(
        'failed after 3 attempts'
      ),
      'Expected final error message to mention retry exhaustion.'
    );


    console.log(
      `Code: ${error.code}`
    );

    console.log(
      `Retryable after exhaustion: ${error.retryable}`
    );

    console.log(
      `Attempts: ${attempts}`
    );

    console.log(
      'TEST 3 PASSED ✓'
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
    ' NotePilot — Gemini Resilience Test'
  );

  console.log(
    '=============================================='
  );


  await testTemporary503Recovery();

  await testPermanent404Failure();

  await testRetryExhaustion();


  console.log(
    '\n=============================================='
  );

  console.log(
    ' GEMINI RESILIENCE TESTS PASSED ✓'
  );

  console.log(
    '==============================================\n'
  );

}


main().catch(
  (error) => {

    console.error(
      '\n=============================================='
    );

    console.error(
      ' GEMINI RESILIENCE TESTS FAILED ✗'
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
import {
  executeWithRetry,
} from "./retryPolicy";

import {
  ServiceUnavailableError,
  QuotaExceededError,
} from "./errors";

async function run() {

  console.log("\n=== TEST 1: 503 retries ===");

  let attempts = 0;

  const result = await executeWithRetry(
    async () => {

      attempts++;

      console.log(`Attempt ${attempts}`);

      if (attempts < 3) {
        throw new ServiceUnavailableError(
          "Simulated 503"
        );
      }

      return "SUCCESS";
    },

    {
      maxRetries: 2,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,

      shouldRetry: (error) =>
        error instanceof ServiceUnavailableError,
    },

    (attempt, error, delay) => {

      console.log(
        `Retry ${attempt} after ${delay}ms`
      );

    }
  );

  console.log(
    "Result:",
    result
  );

  console.log(
    "Attempts:",
    attempts
  );


  console.log("\n=== TEST 2: Quota should NOT retry ===");

  let quotaAttempts = 0;

  try {

    await executeWithRetry(

      async () => {

        quotaAttempts++;

        console.log(
          `Attempt ${quotaAttempts}`
        );

        throw new QuotaExceededError(
          "Simulated quota exhaustion"
        );

      },

      {
        maxRetries: 2,

        initialDelayMs: 10,

        maxDelayMs: 100,

        backoffMultiplier: 2,

        shouldRetry: (error) =>
          error instanceof ServiceUnavailableError,
      }

    );

  } catch (error) {

    console.log(
      "Expected error:",
      error instanceof Error
        ? error.message
        : error
    );

  }

  console.log(
    "Quota attempts:",
    quotaAttempts
  );

}

run().catch(console.error);
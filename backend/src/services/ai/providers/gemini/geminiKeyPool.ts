/**
 * ============================================================================
 * Gemini API Key Pool
 * ============================================================================
 *
 * Responsibilities:
 * - Load all configured Gemini API keys
 * - Ignore missing/empty keys
 * - Rotate through keys
 * - Never expose secret keys
 *
 * Environment Variables:
 *
 * GEMINI_API_KEY_1=...
 * GEMINI_API_KEY_2=...
 * GEMINI_API_KEY_3=...
 * GEMINI_API_KEY_4=...
 * ...
 * ============================================================================
 */

import type {
  APIKeyInfo,
} from '../../types';

import {
  AllKeysExhaustedError,
} from '../../errors';


// -----------------------------------------------------------------------------
// Gemini Key Pool
// -----------------------------------------------------------------------------

export class GeminiKeyPool {

  private readonly keys: APIKeyInfo[];

  constructor() {

    this.keys = this.loadKeys();

  }

  // ---------------------------------------------------------------------------
  // Load all configured keys
  // ---------------------------------------------------------------------------

 private loadKeys(): APIKeyInfo[] {

  const keys: APIKeyInfo[] = [];

  // -------------------------------------------------------------------------
  // Legacy single API key support
  // -------------------------------------------------------------------------

  const legacyKey =
    process.env.GEMINI_API_KEY;

  if (

    legacyKey &&

    legacyKey.trim().length > 0

  ) {

    keys.push({

      key:
        legacyKey.trim(),

      index:
        1,

    });

  }

  // -------------------------------------------------------------------------
  // Multi-key support
  // -------------------------------------------------------------------------

  let index = 1;

  while (true) {

    const value =
      process.env[`GEMINI_API_KEY_${index}`];

    if (value === undefined) {

      break;

    }

    if (

      value.trim().length > 0

    ) {

      keys.push({

        key:
          value.trim(),

        index:
          keys.length + 1,

      });

    }

    index++;

  }

  if (keys.length === 0) {

    throw new Error(

      "No Gemini API keys configured."

    );

  }

  return keys;

}

  // ---------------------------------------------------------------------------
  // Total keys
  // ---------------------------------------------------------------------------

  size(): number {

    return this.keys.length;

  }

  // ---------------------------------------------------------------------------
  // Read-only copy
  // ---------------------------------------------------------------------------

  getAll(): APIKeyInfo[] {

    return [...this.keys];

  }

  // ---------------------------------------------------------------------------
  // Get key by position
  // ---------------------------------------------------------------------------

  get(index: number): APIKeyInfo {

    if (

      index < 0 ||

      index >= this.keys.length

    ) {

      throw new AllKeysExhaustedError();

    }

    return this.keys[index];

  }

  // ---------------------------------------------------------------------------
  // Iterate through all keys
  // ---------------------------------------------------------------------------

  *iterator(): Generator<APIKeyInfo> {

    for (const key of this.keys) {

      yield key;

    }

  }

}
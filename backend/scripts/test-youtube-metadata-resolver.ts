/**
 * test-youtube-metadata-resolver.ts
 *
 * Phase 3.5.2
 *
 * Pure deterministic test.
 *
 * No:
 *
 * - Gemini
 * - Groq
 * - Supabase
 * - YouTube network request
 *
 * Cost: $0
 * Runtime: effectively instant
 */

import {

  buildYouTubeCanonicalUrl,

  buildYouTubeThumbnailUrl,

  resolveYouTubeMetadata,

} from '../src/services/sourceUnderstanding/youtubeMetadata.resolver';


// ─────────────────────────────────────────────────────────────────────────────
// Test
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {

  console.log('');
  console.log('==============================================');
  console.log(' NotePilot — YouTube Metadata Resolver Test');
  console.log('==============================================');
  console.log('');


  const videoId =
    'gl1r1XV0SLw';


  // ───────────────────────────────────────────────────────────────────────────
  // Test 1 — Canonical URL
  // ───────────────────────────────────────────────────────────────────────────

  console.log(
    '[TEST 1] Building canonical URL'
  );


  const canonicalUrl =
    buildYouTubeCanonicalUrl(
      videoId
    );


  const expectedCanonicalUrl =
    `https://www.youtube.com/watch?v=${videoId}`;


  if (
    canonicalUrl !==
    expectedCanonicalUrl
  ) {

    throw new Error(
      [
        'Canonical URL mismatch.',
        `Expected: ${expectedCanonicalUrl}`,
        `Received: ${canonicalUrl}`,
      ].join('\n')
    );

  }


  console.log(
    `Canonical URL: ${canonicalUrl}`
  );

  console.log(
    'TEST 1 PASSED ✓'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Test 2 — Thumbnail
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log(
    '[TEST 2] Building thumbnail URL'
  );


  const thumbnailUrl =
    buildYouTubeThumbnailUrl(
      videoId
    );


  const expectedThumbnailUrl =
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


  if (
    thumbnailUrl !==
    expectedThumbnailUrl
  ) {

    throw new Error(
      [
        'Thumbnail URL mismatch.',
        `Expected: ${expectedThumbnailUrl}`,
        `Received: ${thumbnailUrl}`,
      ].join('\n')
    );

  }


  console.log(
    `Thumbnail URL: ${thumbnailUrl}`
  );

  console.log(
    'TEST 2 PASSED ✓'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Test 3 — Full resolver
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log(
    '[TEST 3] Resolving YouTube metadata'
  );


  const metadata =
    resolveYouTubeMetadata(
      videoId
    );


  if (
    metadata.videoId !==
    videoId
  ) {

    throw new Error(
      'Resolver did not preserve video ID.'
    );

  }


  if (
    metadata.canonicalUrl !==
    expectedCanonicalUrl
  ) {

    throw new Error(
      'Resolver returned incorrect canonical URL.'
    );

  }


  if (
    metadata.thumbnailUrl !==
    expectedThumbnailUrl
  ) {

    throw new Error(
      'Resolver returned incorrect thumbnail URL.'
    );

  }


  if (
    metadata.sourceType !==
    'youtube'
  ) {

    throw new Error(
      'Resolver returned incorrect source type.'
    );

  }


  console.log('');
  console.log('Resolved metadata:');
  console.log('');

  console.log(
    JSON.stringify(
      metadata,
      null,
      2
    )
  );


  console.log('');
  console.log(
    'TEST 3 PASSED ✓'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Test 4 — Invalid ID rejection
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log(
    '[TEST 4] Rejecting invalid video ID'
  );


  let invalidIdRejected =
    false;


  try {

    resolveYouTubeMetadata(
      'invalid'
    );

  } catch {

    invalidIdRejected =
      true;

  }


  if (
    !invalidIdRejected
  ) {

    throw new Error(
      'Resolver accepted an invalid YouTube video ID.'
    );

  }


  console.log(
    'Invalid ID rejected ✓'
  );

  console.log(
    'TEST 4 PASSED ✓'
  );


  // ───────────────────────────────────────────────────────────────────────────
  // Final
  // ───────────────────────────────────────────────────────────────────────────

  console.log('');
  console.log('==============================================');
  console.log(' YOUTUBE METADATA RESOLVER PASSED ✓');
  console.log('==============================================');

  console.log('');
  console.log('Contract checks:');

  console.log(
    '  Video ID validation             ✓'
  );

  console.log(
    '  Canonical URL derived           ✓'
  );

  console.log(
    '  Thumbnail URL derived           ✓'
  );

  console.log(
    '  Source metadata preserved       ✓'
  );

  console.log(
    '  No external API required        ✓'
  );

  console.log('');

}


main()
  .catch(
    (
      error: unknown
    ) => {

      console.error('');
      console.error('==============================================');
      console.error(' YOUTUBE METADATA RESOLVER FAILED ✗');
      console.error('==============================================');
      console.error('');


      console.error(

        error instanceof Error

          ? error.stack ??
            error.message

          : error

      );


      process.exitCode =
        1;

    }
  );
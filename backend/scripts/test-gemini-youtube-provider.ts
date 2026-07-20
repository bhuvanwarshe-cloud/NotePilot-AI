/**
 * Phase 2.2
 *
 * Real Gemini → YouTube → KnowledgeExtraction integration test.
 *
 * This does NOT:
 *
 * - write to Supabase
 * - modify lectures
 * - create AI jobs
 * - invoke the production YouTube processor
 *
 * It only proves:
 *
 * YouTube
 *    ↓
 * Gemini
 *    ↓
 * JSON
 *    ↓
 * Zod
 *    ↓
 * Integrity validation
 */

import 'dotenv/config';

import {
  GeminiYouTubeProvider,
} from '../src/services/sourceUnderstanding/providers/geminiYouTube.provider';


async function main(): Promise<void> {

  console.log(
    '\n=============================================='
  );

  console.log(
    ' NotePilot — Gemini Structured Extraction Test'
  );

  console.log(
    '==============================================\n'
  );


  const videoId =
    '5sLYAQS9sWQ';


  const canonicalUrl =
    `https://www.youtube.com/watch?v=${videoId}`;


  const provider =
    new GeminiYouTubeProvider();


  const result =
    await provider.extract({

      videoId,

      canonicalUrl,

    });


  const {
    extraction,
  } = result;


  console.log(
    '\n=============================================='
  );

  console.log(
    ' EXTRACTION PREVIEW'
  );

  console.log(
    '==============================================\n'
  );


  console.log(
    `Title: ${extraction.title}`
  );

  console.log(
    `Language: ${extraction.language}`
  );

  console.log(
    `Overview: ${extraction.overview}`
  );


  console.log(
    '\nTopics:'
  );


  extraction.topics.forEach(
    (topic, index) => {

      console.log(
        `${index + 1}. ${topic.title}`
      );

    }
  );


  console.log(
    '\nConcepts:'
  );


  extraction.concepts.forEach(
    (concept, index) => {

      console.log(
        `${index + 1}. ${concept.name}`
      );

    }
  );


  if (
    extraction.visualInsights.length > 0
  ) {

    console.log(
      '\nVisual Insights:'
    );


    extraction.visualInsights.forEach(
      (visual, index) => {

        console.log(
          `${index + 1}. [${visual.type}] ${visual.description}`
        );

      }
    );

  }


  console.log(
    '\n=============================================='
  );

  console.log(
    ' GEMINI STRUCTURED EXTRACTION PASSED ✓'
  );

  console.log(
    '==============================================\n'
  );

}


main()
  .catch(
    (error) => {

      console.error(
        '\n=============================================='
      );

      console.error(
        ' GEMINI STRUCTURED EXTRACTION FAILED ✗'
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
  );
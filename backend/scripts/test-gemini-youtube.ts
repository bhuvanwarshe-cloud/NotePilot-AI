import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY is missing. Add it to backend/.env before running this test.'
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

// Use the same IBM video that failed through yt-dlp on Render.
const YOUTUBE_URL =
  'https://www.youtube.com/watch?v=5sLYAQS9sWQ';

const PROMPT = `
You are analyzing an educational YouTube video for NotePilot AI,
an AI-powered study platform.

Analyze the actual contents of the provided video carefully.

Use BOTH:
- spoken/audio information
- useful visual information such as slides, diagrams, equations,
  demonstrations, labels, charts, or text shown on screen

Return a detailed educational analysis containing:

1. VIDEO TOPIC
Identify the main subject of the video.

2. OVERVIEW
Explain what the video teaches in a concise but complete way.

3. MAIN TOPICS
List the major topics in the order they are taught.

For each topic provide:
- topic name
- clear explanation
- important points
- relevant timestamp if identifiable

4. KEY CONCEPTS
Identify and explain the most important concepts a student should understand.

5. DEFINITIONS
List important technical terms and their meanings.

6. FORMULAS OR EQUATIONS
List and explain any formulas or equations taught or shown.
Do not invent formulas that are not supported by the video.

7. EXAMPLES
Describe important examples, analogies, or demonstrations used by the instructor.

8. VISUAL INSIGHTS
Identify useful information communicated visually through:
- slides
- diagrams
- drawings
- equations
- charts
- demonstrations

Explain information that would potentially be lost in a text-only transcript.

9. STUDY NOTES
Create well-structured study notes covering the lecture.

10. EXAM-RELEVANT POINTS
Identify concepts that would be especially important for revision or assessment.

11. TIMESTAMP MAP
Where possible, provide important timestamps in MM:SS format
with a short description of what is discussed there.

IMPORTANT:
- Base the answer only on information actually supported by the video.
- Do not fabricate missing information.
- Clearly state when something cannot be determined.
`;

async function main() {
  console.log('\n==============================================');
  console.log(' NotePilot — Gemini YouTube Phase 0 Test');
  console.log('==============================================');

  console.log(`\nYouTube URL:\n${YOUTUBE_URL}`);

  console.log('\nSending YouTube URL directly to Gemini...');
  console.log('No yt-dlp.');
  console.log('No audio download.');
  console.log('No Whisper.');
  console.log('No transcript extraction.\n');

  const startedAt = Date.now();

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash',

      input: [
        {
          type: 'video',
          uri: YOUTUBE_URL,
        },

        {
          type: 'text',
          text: PROMPT,
        },
      ],
    });

    const processingTimeMs = Date.now() - startedAt;

    console.log('\n==============================================');
    console.log(' GEMINI RESPONSE');
    console.log('==============================================\n');

    console.log(interaction.output_text);

    console.log('\n==============================================');
    console.log(' TEST COMPLETE');
    console.log('==============================================');

    console.log(
      `Processing time: ${(processingTimeMs / 1000).toFixed(2)} seconds`
    );

    console.log('\nPhase 0 evaluation:');
    console.log('1. Did Gemini understand the spoken lecture?');
    console.log('2. Did it identify the correct concepts?');
    console.log('3. Did it understand useful visuals?');
    console.log('4. Are timestamps reasonably accurate?');
    console.log('5. Are the generated notes grounded in the video?');
  } catch (error: unknown) {
    const processingTimeMs = Date.now() - startedAt;

    console.error('\n==============================================');
    console.error(' GEMINI TEST FAILED');
    console.error('==============================================');

    console.error(
      `Failed after ${(processingTimeMs / 1000).toFixed(2)} seconds`
    );

    if (error instanceof Error) {
      console.error('\nName:', error.name);
      console.error('Message:', error.message);

      if (error.stack) {
        console.error('\nStack:\n', error.stack);
      }
    } else {
      console.error('\nUnknown error:', error);
    }

    process.exitCode = 1;
  }
}

main();
/**
 * ============================================================================
 * Quiz Prompt
 * ============================================================================
 *
 * Generates a structured assessment from the canonical
 * Knowledge Representation.
 *
 * IMPORTANT:
 * Return ONLY valid JSON matching the required schema.
 * ============================================================================
 */

export const quizPrompt = `
Generate a comprehensive educational quiz from the supplied Knowledge Representation.

===========================
RULES
===========================

Return ONLY valid JSON.

Do NOT wrap the JSON inside markdown.

Do NOT include explanations outside the JSON.

Generate at least 10 multiple-choice questions.

Every question must be answerable ONLY from the supplied Knowledge Representation.

Distribute questions across all important topics.

Include a mix of:

- definitions
- concepts
- applications
- reasoning
- comparisons

===========================
REQUIRED JSON FORMAT
===========================

{
  "title": "Quiz title",

  "description": "Short quiz description",

  "estimatedDurationMinutes": 15,

  "questions": [

    {

      "id": "question_1",

      "type": "multiple_choice",

      "question": "Question text",

      "options": [

        {
          "id": "option_a",
          "text": "Option A"
        },

        {
          "id": "option_b",
          "text": "Option B"
        },

        {
          "id": "option_c",
          "text": "Option C"
        },

        {
          "id": "option_d",
          "text": "Option D"
        }

      ],

      "correctOptionId": "option_b",

      "difficulty": "easy",

      "topic": "Topic name",

      "explanation": "Why this answer is correct"

    }

  ]

}

===========================
IMPORTANT
===========================

- Generate AT LEAST 10 questions.
- Every question MUST have exactly four options.
- options MUST be objects.
- Every option must have an id and text.
- correctOptionId must match one of the option ids.
- difficulty must be exactly:
  - easy
  - medium
  - hard
- type must always be:
  "multiple_choice"
- topic must contain the related topic name.
- Return ONLY the JSON object.
`;
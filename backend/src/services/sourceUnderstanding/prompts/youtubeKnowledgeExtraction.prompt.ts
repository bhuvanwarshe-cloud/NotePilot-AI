/**
 * ============================================================================
 * YouTube Knowledge Extraction Prompt
 * ============================================================================
 *
 * Prompt used by the Gemini YouTube Source Understanding Provider.
 *
 * Responsibilities:
 *
 * - Define the expected KnowledgeExtraction JSON structure
 * - Enforce strict JSON output
 * - Enforce sourceReferences array structure
 * - Reduce malformed Gemini responses
 * - Keep prompt engineering separate from provider infrastructure
 *
 * ============================================================================
 */

import {
  KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
} from "../../knowledgeRepresentation/extraction.prompt";


// -----------------------------------------------------------------------------
// Prompt Builder
// -----------------------------------------------------------------------------

export function buildYouTubeKnowledgeExtractionPrompt(): string {

  return `
${KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT}


============================================================
OUTPUT FORMAT
============================================================

Return ONE valid JSON object.

The response MUST conform exactly to the structure described below.

Do NOT return:

- Markdown
- Code fences
- Commentary
- Explanations outside the JSON
- Additional text before the JSON
- Additional text after the JSON


============================================================
REQUIRED JSON SHAPE
============================================================

{
  "title": "string",

  "language": "ISO 639-1 language code",

  "overview": "string",

  "durationSeconds": 0,

  "author": "string",

  "topics": [
    {
      "id": "topic_example",

      "title": "string",

      "explanation": "string",

      "keyPoints": [
        {
          "id": "point_example",

          "text": "string",

          "sourceReference": {
            "timestampSeconds": 0,
            "label": "00:00"
          }
        }
      ],

      "conceptIds": [],

      "definitionIds": [],

      "formulaIds": [],

      "exampleIds": [],

      "visualInsightIds": [],

      "sourceReferences": [
        {
          "timestampSeconds": 0,
          "label": "00:00"
        }
      ]
    }
  ],

  "concepts": [
    {
      "id": "concept_example",

      "name": "string",

      "explanation": "string",

      "relatedConceptIds": [],

      "sourceReferences": [
        {
          "timestampSeconds": 0,
          "label": "00:00"
        }
      ]
    }
  ],

  "definitions": [
    {
      "id": "definition_example",

      "term": "string",

      "definition": "string",

      "sourceReferences": [
        {
          "timestampSeconds": 0,
          "label": "00:00"
        }
      ]
    }
  ],

  "formulas": [
    {
      "id": "formula_example",

      "expression": "string",

      "name": "string",

      "explanation": "string",

      "variables": [
        {
          "symbol": "string",
          "meaning": "string",
          "unit": "string"
        }
      ],

      "sourceReferences": [
        {
          "timestampSeconds": 0,
          "label": "00:00"
        }
      ]
    }
  ],

  "examples": [
    {
      "id": "example_example",

      "title": "string",

      "description": "string",

      "relatedConceptIds": [],

      "sourceReferences": [
        {
          "timestampSeconds": 0,
          "label": "00:00"
        }
      ]
    }
  ],

  "visualInsights": [
    {
      "id": "visual_example",

      "type": "diagram",

      "description": "string",

      "educationalSignificance": "string",

      "relatedConceptIds": [],

      "sourceReferences": [
        {
          "timestampSeconds": 0,
          "label": "00:00"
        }
      ]
    }
  ],

  "timeline": [
    {
      "id": "timeline_example",

      "timestampSeconds": 0,

      "label": "string",

      "description": "string",

      "relatedTopicIds": [],

      "relatedConceptIds": []
    }
  ]
}


============================================================
STRICT STRUCTURAL RULES
============================================================

1. Return ONLY valid JSON.

2. Do NOT wrap the response in Markdown code fences.

3. Use empty arrays when a category has no supported items.

4. Do NOT invent:

- formulas
- definitions
- examples
- timestamps
- visual content
- concepts
- relationships

Only include information supported by the provided video.

5. Every referenced ID MUST exist in its corresponding array.

6. Every ID across:

- topics
- key points
- concepts
- definitions
- formulas
- examples
- visual insights
- timeline entries

MUST be globally unique.

7. Use descriptive lowercase snake_case IDs with the correct type prefix.

Examples:

topic_negative_feedback

concept_virtual_ground

definition_open_loop_gain

formula_closed_loop_gain

example_inverting_amplifier

visual_op_amp_diagram

timeline_negative_feedback_intro


8. Do NOT include null values.

If an optional scalar value is unknown, omit the property.

9. durationSeconds MUST be a number when included.

10. timestampSeconds MUST always contain numeric seconds.

Correct:

"timestampSeconds": 120

Incorrect:

"timestampSeconds": "120"

Incorrect:

"timestampSeconds": "02:00"


============================================================
SOURCE REFERENCES — CRITICAL
============================================================

11. EVERY property named "sourceReferences" MUST ALWAYS contain an ARRAY.

This rule applies without exception.


CORRECT:

"sourceReferences": []


CORRECT:

"sourceReferences": [
  {
    "timestampSeconds": 120,
    "label": "02:00"
  }
]


INCORRECT:

"sourceReferences": {
  "timestampSeconds": 120,
  "label": "02:00"
}


12. NEVER output a single object directly as "sourceReferences".

Even when there is exactly ONE source reference, it MUST still be wrapped inside an array.


13. The sourceReferences array rule applies to EVERY:

- topic
- concept
- definition
- formula
- example
- visualInsight


14. When no reliable source reference exists, return:

"sourceReferences": []

Do NOT fabricate timestamps simply to populate the array.


15. Each individual sourceReferences element must be an object.

Example:

{
  "timestampSeconds": 120,
  "label": "02:00"
}


============================================================
FINAL VALIDATION INSTRUCTION
============================================================

Before returning your response, internally verify that:

- the response is valid JSON
- every sourceReferences value is an array
- every referenced ID exists
- IDs are globally unique
- timestamps are numeric
- no unsupported information was invented
- no Markdown formatting exists
- no text exists outside the JSON object

If any sourceReferences property contains an object instead of an array,
correct it before returning the response.


============================================================
TASK
============================================================

Analyze the provided video and return the structured educational
KnowledgeExtraction JSON now.
`.trim();

}
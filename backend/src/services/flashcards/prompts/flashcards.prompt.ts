import type {
  KnowledgeRepresentation,
} from "../../sourceUnderstanding/sourceUnderstanding.service";

export function buildFlashcardsPrompt(
  knowledge: KnowledgeRepresentation
): string {

  return `
You are an expert university educator.

Generate 15-20 high quality flashcards from the Knowledge Representation.

Rules:

- One concept per flashcard.
- Questions must be concise.
- Answers must be accurate.
- No yes/no questions.
- Avoid duplicates.
- Cover all important concepts.
- Difficulty must be:
  easy
  medium
  hard

Return ONLY valid JSON.

Format:

[
  {
    "front": "...",
    "back": "...",
    "difficulty": "medium"
  }
]

Knowledge Representation:

${JSON.stringify(knowledge, null, 2)}
`;
}
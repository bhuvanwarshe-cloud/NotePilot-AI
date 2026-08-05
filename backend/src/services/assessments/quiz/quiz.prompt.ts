/**
 * ============================================================================
 * Quiz Prompt
 * ============================================================================
 *
 * Generates a high-quality assessment from the canonical
 * Knowledge Representation.
 *
 * The model MUST return ONLY valid JSON.
 * ============================================================================
 */

export const quizPrompt = `
Generate a comprehensive quiz from the supplied Knowledge Representation.

Requirements:

- Return ONLY valid JSON.
- Do NOT wrap the JSON inside markdown.
- Do NOT include explanations.
- Do NOT include additional text.

The quiz should:

- Cover all major concepts.
- Test understanding instead of memorization.
- Include conceptual questions.
- Include definition questions.
- Include application-based questions where appropriate.

Each question must contain:

- question
- options (exactly 4)
- correctAnswer (0-3)
- explanation

Return JSON matching the QuizSchema exactly.
`;
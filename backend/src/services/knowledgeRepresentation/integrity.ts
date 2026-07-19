/**
 * Knowledge Representation Semantic Integrity Validator
 *
 * Zod validates structural correctness.
 *
 * This module validates relationships BETWEEN entities:
 *
 * - IDs must be globally unique
 * - concept references must exist
 * - definition references must exist
 * - formula references must exist
 * - example references must exist
 * - visual references must exist
 * - topic references must exist
 *
 * This prevents structurally valid but semantically broken AI output
 * from entering NotePilot.
 */

import type {
  KnowledgeExtraction,
} from './extraction.schema';


// ─────────────────────────────────────────────────────────────────────────────
// Result Types
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeIntegrityIssue {
  path: string;

  message: string;

  referencedId?: string;
}


export interface KnowledgeIntegrityResult {
  valid: boolean;

  issues: KnowledgeIntegrityIssue[];
}


// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function validateKnowledgeIntegrity(
  knowledge: KnowledgeExtraction
): KnowledgeIntegrityResult {

  const issues: KnowledgeIntegrityIssue[] = [];


  // ───────────────────────────────────────────────────────────────────────────
  // Build ID sets
  // ───────────────────────────────────────────────────────────────────────────

  const topicIds =
    new Set(
      knowledge.topics.map(
        (item) => item.id
      )
    );


  const conceptIds =
    new Set(
      knowledge.concepts.map(
        (item) => item.id
      )
    );


  const definitionIds =
    new Set(
      knowledge.definitions.map(
        (item) => item.id
      )
    );


  const formulaIds =
    new Set(
      knowledge.formulas.map(
        (item) => item.id
      )
    );


  const exampleIds =
    new Set(
      knowledge.examples.map(
        (item) => item.id
      )
    );


  const visualInsightIds =
    new Set(
      knowledge.visualInsights.map(
        (item) => item.id
      )
    );


  // ───────────────────────────────────────────────────────────────────────────
  // 1. Global ID uniqueness
  //
  // IDs are intentionally globally unique rather than merely unique inside
  // their own arrays.
  //
  // This makes future graph/index/RAG operations safer.
  // ───────────────────────────────────────────────────────────────────────────

  const allIds: Array<{
    id: string;
    path: string;
  }> = [];


  knowledge.topics.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `topics[${index}].id`,
      });


      item.keyPoints.forEach(
        (point, pointIndex) => {

          allIds.push({
            id: point.id,
            path:
              `topics[${index}].keyPoints[${pointIndex}].id`,
          });

        }
      );

    }
  );


  knowledge.concepts.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `concepts[${index}].id`,
      });

    }
  );


  knowledge.definitions.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `definitions[${index}].id`,
      });

    }
  );


  knowledge.formulas.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `formulas[${index}].id`,
      });

    }
  );


  knowledge.examples.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `examples[${index}].id`,
      });

    }
  );


  knowledge.visualInsights.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `visualInsights[${index}].id`,
      });

    }
  );


  knowledge.timeline.forEach(
    (item, index) => {

      allIds.push({
        id: item.id,
        path: `timeline[${index}].id`,
      });

    }
  );


  const seenIds =
    new Map<string, string>();


  for (const entry of allIds) {

    const existingPath =
      seenIds.get(entry.id);


    if (existingPath) {

      issues.push({

        path:
          entry.path,

        referencedId:
          entry.id,

        message:
          `Duplicate ID "${entry.id}". ` +
          `First declared at ${existingPath}.`,

      });

    } else {

      seenIds.set(
        entry.id,
        entry.path
      );

    }

  }


  // ───────────────────────────────────────────────────────────────────────────
  // 2. Topic references
  // ───────────────────────────────────────────────────────────────────────────

  knowledge.topics.forEach(
    (topic, topicIndex) => {

      validateReferences(
        topic.conceptIds,
        conceptIds,
        `topics[${topicIndex}].conceptIds`,
        'concept',
        issues
      );


      validateReferences(
        topic.definitionIds,
        definitionIds,
        `topics[${topicIndex}].definitionIds`,
        'definition',
        issues
      );


      validateReferences(
        topic.formulaIds,
        formulaIds,
        `topics[${topicIndex}].formulaIds`,
        'formula',
        issues
      );


      validateReferences(
        topic.exampleIds,
        exampleIds,
        `topics[${topicIndex}].exampleIds`,
        'example',
        issues
      );


      validateReferences(
        topic.visualInsightIds,
        visualInsightIds,
        `topics[${topicIndex}].visualInsightIds`,
        'visual insight',
        issues
      );

    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 3. Concept → Concept relationships
  // ───────────────────────────────────────────────────────────────────────────

  knowledge.concepts.forEach(
    (concept, conceptIndex) => {

      validateReferences(
        concept.relatedConceptIds,
        conceptIds,
        `concepts[${conceptIndex}].relatedConceptIds`,
        'concept',
        issues
      );

    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 4. Example → Concept relationships
  // ───────────────────────────────────────────────────────────────────────────

  knowledge.examples.forEach(
    (example, exampleIndex) => {

      validateReferences(
        example.relatedConceptIds,
        conceptIds,
        `examples[${exampleIndex}].relatedConceptIds`,
        'concept',
        issues
      );

    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 5. Visual Insight → Concept relationships
  // ───────────────────────────────────────────────────────────────────────────

  knowledge.visualInsights.forEach(
    (visual, visualIndex) => {

      validateReferences(
        visual.relatedConceptIds,
        conceptIds,
        `visualInsights[${visualIndex}].relatedConceptIds`,
        'concept',
        issues
      );

    }
  );


  // ───────────────────────────────────────────────────────────────────────────
  // 6. Timeline relationships
  // ───────────────────────────────────────────────────────────────────────────

  knowledge.timeline.forEach(
    (entry, timelineIndex) => {

      validateReferences(
        entry.relatedTopicIds,
        topicIds,
        `timeline[${timelineIndex}].relatedTopicIds`,
        'topic',
        issues
      );


      validateReferences(
        entry.relatedConceptIds,
        conceptIds,
        `timeline[${timelineIndex}].relatedConceptIds`,
        'concept',
        issues
      );

    }
  );


  return {

    valid:
      issues.length === 0,

    issues,

  };

}


// ─────────────────────────────────────────────────────────────────────────────
// Throwing Validator
// ─────────────────────────────────────────────────────────────────────────────

export function assertKnowledgeIntegrity(
  knowledge: KnowledgeExtraction
): void {

  const result =
    validateKnowledgeIntegrity(
      knowledge
    );


  if (result.valid) {

    return;

  }


  const formattedIssues =
    result.issues
      .map(
        (issue, index) => {

          return (
            `${index + 1}. ${issue.path}: ` +
            `${issue.message}`
          );

        }
      )
      .join('\n');


  throw new Error(
    `Knowledge integrity validation failed:\n${formattedIssues}`
  );

}


// ─────────────────────────────────────────────────────────────────────────────
// Internal Helper
// ─────────────────────────────────────────────────────────────────────────────

function validateReferences(
  references: string[] | undefined,
  validIds: Set<string>,
  path: string,
  entityName: string,
  issues: KnowledgeIntegrityIssue[]
): void {

  if (!references) {

    return;

  }


  references.forEach(
    (referencedId, index) => {

      if (
        !validIds.has(
          referencedId
        )
      ) {

        issues.push({

          path:
            `${path}[${index}]`,

          referencedId,

          message:
            `Referenced ${entityName} ID ` +
            `"${referencedId}" does not exist.`,

        });

      }

    }
  );

}
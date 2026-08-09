/**
 * ============================================================================
 * Mind Map Prompt
 * ============================================================================
 *
 * Generates a structured visual knowledge graph from the canonical
 * Knowledge Representation.
 *
 * IMPORTANT:
 *
 * The source has already been understood and validated.
 * The model must NOT attempt to access the original source.
 *
 * Output MUST be valid JSON matching MindMapSchema.
 * ============================================================================
 */

export const mindMapPrompt = `
Generate a structured educational mind map from the supplied
Knowledge Representation.

The Knowledge Representation is already validated and contains the
understood information from the original source.

Your job is ONLY to transform that information into a visual
knowledge graph.

IMPORTANT RULES:

- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT include explanations outside the JSON.
- Do NOT invent information.
- Do NOT introduce concepts that are not supported by the supplied
  Knowledge Representation.
- Preserve important relationships between concepts.
- Build a meaningful hierarchy from general concepts to specific details.

The mind map should have:

1. ONE root node representing the lecture/topic.
2. Topic nodes for major sections.
3. Concept nodes for important ideas.
4. Definition nodes when definitions are important.
5. Formula nodes when formulas exist.
6. Example nodes when examples exist.
7. Process nodes when a process or sequence exists.
8. Detail nodes for useful supporting information.

Each node must contain:

- id
- label
- type
- description
- relatedConceptId
- metadata

Each relationship must be represented as an edge.

Each edge must contain:

- id
- source
- target
- relationship
- label

GRAPH RULES:

- Every non-root node should be connected to the knowledge hierarchy.
- Do not create isolated nodes.
- Avoid duplicate nodes representing the same concept.
- Prefer meaningful parent-child relationships.
- Keep labels concise.
- Descriptions should explain the educational meaning of the node.
- Use relationship labels such as:
  "contains"
  "explains"
  "defines"
  "includes"
  "causes"
  "leads to"
  "example of"
  "related to"
  when appropriate.

The result must match this conceptual structure:

{
  "title": "Lecture title",
  "nodes": [],
  "edges": []
}

Return ONLY the JSON object.
`;
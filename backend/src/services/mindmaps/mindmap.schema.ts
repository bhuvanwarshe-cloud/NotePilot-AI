import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Mind Map Node
// ─────────────────────────────────────────────────────────────────────────────

export const MindMapNodeTypeSchema = z.enum([
  "root",
  "topic",
  "concept",
  "definition",
  "formula",
  "example",
  "process",
  "detail",
]);

export const MindMapNodeSchema = z.object({
  id: z.string().min(1).max(100),

  label: z
    .string()
    .min(1)
    .max(200),

  type: MindMapNodeTypeSchema,

  description: z
    .string()
    .max(1000)
    .optional()
    .default(""),

  relatedConceptId: z
    .string()
    .max(200)
    .nullable()
    .optional(),

  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .default({}),
});

// ─────────────────────────────────────────────────────────────────────────────
// Mind Map Edge
// ─────────────────────────────────────────────────────────────────────────────

export const MindMapEdgeSchema = z.object({
  id: z.string().min(1).max(100),

  source: z.string().min(1).max(100),

  target: z.string().min(1).max(100),

  relationship: z
    .string()
    .max(200)
    .optional()
    .default("related"),

  label: z
    .string()
    .max(200)
    .optional()
    .default(""),
});

// ─────────────────────────────────────────────────────────────────────────────
// Mind Map
// ─────────────────────────────────────────────────────────────────────────────

export const MindMapSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200),

  nodes: z
    .array(MindMapNodeSchema)
    .min(2)
    .max(100),

  edges: z
    .array(MindMapEdgeSchema)
    .max(150),
});

export type MindMapDTO = z.infer<typeof MindMapSchema>;

export type MindMapNodeDTO =
  z.infer<typeof MindMapNodeSchema>;

export type MindMapEdgeDTO =
  z.infer<typeof MindMapEdgeSchema>;
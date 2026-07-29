import { z } from "zod";

export const FlashcardSchema = z.object({
  front: z
    .string()
    .min(5)
    .max(200),

  back: z
    .string()
    .min(5)
    .max(600),

  difficulty: z.enum([
    "easy",
    "medium",
    "hard",
  ]),
});

export const FlashcardsSchema = z.array(FlashcardSchema)
  .min(10)
  .max(25);

export type FlashcardDTO = z.infer<typeof FlashcardSchema>;
export type FlashcardsDTO = z.infer<typeof FlashcardsSchema>;
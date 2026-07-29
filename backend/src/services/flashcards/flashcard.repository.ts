import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardDTO } from "./flashcard.schema";

export interface FlashcardRow {
  id: string;

  lecture_id: string;

  front: string;

  back: string;

  difficulty: number;

  order_index: number;

  generated_by: string;

  status: string;

  created_at: string;

  updated_at: string;
}



export interface SaveFlashcardsInput {
    
  lectureId: string;

  generatedBy: string;

  flashcards: FlashcardDTO[];
}

export async function saveFlashcards(
  supabase: SupabaseClient,
  input: SaveFlashcardsInput
): Promise<FlashcardRow[]> {

  const { error: deleteError } =
  await supabase
    .from("flashcards")
    .delete()
    .eq("lecture_id", input.lectureId);

if (deleteError) {
  throw new Error(
    `Failed to delete existing flashcards: ${deleteError.message}`
  );
}

const now = new Date().toISOString();

const rows = input.flashcards.map((card, index) => ({
  lecture_id: input.lectureId,

  front: card.front,

  back: card.back,

  difficulty:
    card.difficulty === "easy"
      ? 1
      : card.difficulty === "medium"
      ? 2
      : 3,

  order_index: index + 1,

  generated_by: input.generatedBy,

  status: "completed",

  updated_at: now,
}));

const difficultyMap = {
  easy: 1,
  medium: 2,
  hard: 3,
} as const;


const { data, error } =
  await supabase
    .from("flashcards")
    .insert(rows)
    .select("*");

    if (error) {
  throw new Error(
    `Failed to save flashcards: ${error.message}`
  );
}

if (!data) {
  throw new Error(
    "Flashcard insert returned no rows."
  );
}



return data as FlashcardRow[];
}
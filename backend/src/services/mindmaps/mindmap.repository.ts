import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MindMapDTO,
} from "./mindmap.schema";

export interface SaveMindMapInput {
  lectureId: string;

  generatedBy: string;

  mindMap: MindMapDTO;
}

export async function saveMindMap(
  supabase: SupabaseClient,
  input: SaveMindMapInput,
): Promise<{
  mindMapId: string;
}> {

  // --------------------------------------------------------------------------
  // Remove previous generated mind map for this lecture
  // --------------------------------------------------------------------------

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("mind_maps")
    .select("id")
    .eq("lecture_id", input.lectureId);

  if (existingError) {
    throw new Error(
      `Failed to check existing mind map: ${existingError.message}`,
    );
  }

  if (existing?.length) {

    const ids = existing.map(
      (item) => item.id,
    );

    const {
      error: deleteError,
    } = await supabase
      .from("mind_maps")
      .delete()
      .in("id", ids);

    if (deleteError) {
      throw new Error(
        `Failed to delete previous mind map: ${deleteError.message}`,
      );
    }
  }

  // --------------------------------------------------------------------------
  // Insert new mind map
  // --------------------------------------------------------------------------

  const {
    data,
    error,
  } = await supabase
    .from("mind_maps")
    .insert({
      lecture_id:
        input.lectureId,

      data:
        input.mindMap,

      generated_by:
        input.generatedBy,

      status:
        "completed",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to save mind map: ${error?.message}`,
    );
  }

  return {
    mindMapId:
      data.id,
  };
}
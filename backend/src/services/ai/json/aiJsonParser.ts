import { ZodSchema } from "zod";

export class AIJsonParser {

  // ---------------------------------------------------------------------------
  // Parse AI Response
  //
  // Pipeline:
  //
  // Raw AI Response
  //        ↓
  // Remove Markdown
  //        ↓
  // Extract JSON
  //        ↓
  // JSON.parse()
  //        ↓
  // Zod Validation
  //        ↓
  // Typed Object
  // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
  // Parse AI Response
  // ---------------------------------------------------------------------------

  static parse<T>(

    rawResponse: string,

    schema: ZodSchema<T>,

  ): T {

    const cleaned =
      this.removeMarkdown(rawResponse);

    let parsed: unknown;

    try {

      parsed =
        JSON.parse(cleaned);

    }

    catch (error) {

      throw new Error(

        [
          "AIJsonParser failed to parse JSON.",
          "",
          `Reason: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`,
          "",
          "Cleaned AI Response:",
          cleaned,
        ].join("\n")

      );

    }


    try {

      return schema.parse(parsed);

    }

    catch (error) {

      throw new Error(

        [
          "AIJsonParser schema validation failed.",
          "",
          `Reason: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`,
          "",
          "Parsed JSON:",
          JSON.stringify(parsed, null, 2),
        ].join("\n")

      );

    }

  }

  private static removeMarkdown(

    text: string,

  ): string {

    let cleaned =
      text.trim();

    // -------------------------------------------------------------
    // Remove opening markdown fence
    // -------------------------------------------------------------

    cleaned =
      cleaned.replace(

        /^```(?:json)?\s*/i,

        "",

      );

    // -------------------------------------------------------------
    // Remove closing markdown fence
    // -------------------------------------------------------------

    cleaned =
      cleaned.replace(

        /```\s*$/,

        "",

      );

    return cleaned.trim();

  }

}
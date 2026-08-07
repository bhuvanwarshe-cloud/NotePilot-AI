/**
 * ============================================================================
 * Groq Provider
 * ============================================================================
 *
 * Production implementation of the Groq AI Provider.
 *
 * Responsibilities:
 *
 * • Generate AI content using Groq-hosted models
 * • Normalize responses into AIResponse
 * • Implement the unified AIProviderInterface
 * • Never expose API keys in logs
 *
 * ============================================================================
 */

import Groq from "groq-sdk";

import {
  AIProvider,
  AIProviderInterface,
  AIRequest,
  AIResponse,
} from "../types";

import {
  InvalidRequestError,
  ResponseParseError,
  UnknownProviderError,
} from "../errors";

export class GroqProvider
  implements AIProviderInterface {

  private readonly client: Groq;

  private readonly defaultModel: string;

  constructor(
    model: string = process.env.GROQ_MODEL ??
      "llama-3.3-70b-versatile"
  ) {

    const apiKey =
      process.env.GROQ_API_KEY;

    if (!apiKey) {

      throw new Error(
        "GROQ_API_KEY is not configured."
      );

    }

    this.client =
      new Groq({
        apiKey,
      });

    this.defaultModel =
      model;

  }

  public async generateContent(
    request: AIRequest
  ): Promise<AIResponse> {

    if (
      !request.prompt ||
      request.prompt.trim().length === 0
    ) {

      throw new InvalidRequestError(
        "Prompt cannot be empty."
      );

    }

    try {

      const response =
        await this.client.chat.completions.create({

          model:
            request.model ??
            this.defaultModel,

          temperature:
            request.temperature,

          max_tokens:
            request.maxOutputTokens,

          messages: [

            {
              role: "user",
              content: request.prompt,
            },

          ],

        });

      const text =
        response.choices?.[0]?.message?.content ??
        "";

      if (
        text.trim().length === 0
      ) {

        throw new ResponseParseError(
          "Groq returned an empty response."
        );

      }

      return {

        text,

      provider:
    AIProvider.GROQ,
        model:
          request.model ??
          this.defaultModel,

        keyIndex:
          0,

        usage: {

          inputTokens:
            response.usage?.prompt_tokens,

          outputTokens:
            response.usage?.completion_tokens,

          totalTokens:
            response.usage?.total_tokens,

        },

        metadata: {

          finishReason:
            response.choices?.[0]?.finish_reason,

        },

      };

    }

    catch (error) {

      if (error instanceof Error) {

        throw new UnknownProviderError(
          error.message
        );

      }

      throw error;

    }

  }

}
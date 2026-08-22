/**
 * SpecForge LLM provider — reuses the existing DeepSeek client (D:\IPAAL\src\ai-lessons\providers\deepseekClient.js)
 * rather than adding a new provider dependency. Kept isolated from aiProvider.js on purpose:
 * that file backs the live lesson-generation pipeline and SpecForge shouldn't risk it.
 *
 * Swap-in point for later: this is the one place SpecForge calls an LLM, so adding
 * Gemini/Anthropic/Hugging Face as alternates later means changing only this file.
 */
import { z } from "zod";
import { completeWithDeepSeek } from "../ai-lessons/providers/deepseekClient.js";

function stripCodeFence(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

/**
 * Ask the model for JSON matching `schema`, parse, and validate.
 * Retries once with the validation error fed back to the model if the first attempt fails.
 *
 * The schema is compiled to JSON Schema and put directly in the prompt — earlier this only said
 * "respond with JSON" and let the model guess field names/shape from context, which DeepSeek got
 * wrong in practice (e.g. dropping `product_name`/`target_users` on Stage 1, discovered the first
 * time this ran against a funded key). Telling it the exact shape up front is cheaper than a retry
 * and far more reliable than hoping the model infers it correctly.
 * `maxTokens` defaults to 4000 but is overridable per call — Stage 3's task breakdown in particular
 * can produce far more JSON than the other stages (one entry per task, each with several fields)
 * and needs a bigger budget or DeepSeek truncates mid-object, which fails JSON.parse in a way that
 * looks like a formatting bug rather than what it actually is: running out of room.
 * @param {{ system: string, user: string, schema: import('zod').ZodType, apiKey: string, maxTokens?: number }} opts
 */
export async function generateStructured({ system, user, schema, apiKey, maxTokens = 4000 }) {
  const jsonSchema = z.toJSONSchema(schema);
  const jsonInstruction =
    `\n\nRespond with ONLY a single valid JSON object matching this exact JSON Schema — every property it lists is required unless the schema says otherwise, and no extra top-level properties:\n${JSON.stringify(
      jsonSchema
    )}\n\nNo prose, no markdown code fence, no commentary before or after the JSON object.`;

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const retryNote =
      attempt === 0
        ? ""
        : `\n\nYour previous response failed validation with: ${lastError}. Return corrected JSON only, matching the schema exactly.`;

    const raw = await completeWithDeepSeek({
      system: system + jsonInstruction,
      user: user + retryNote,
      maxTokens,
      apiKey,
    });

    try {
      const parsed = JSON.parse(stripCodeFence(raw));
      return schema.parse(parsed);
    } catch (err) {
      lastError = err?.message ?? String(err);
    }
  }
  throw new Error(`SpecForge: model did not return schema-valid JSON after retry — ${lastError}`);
}

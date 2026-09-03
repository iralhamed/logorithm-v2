import { z } from "zod";
import {
  AIProviderConfigError,
  AIProviderResponseError,
  type AIProvider,
  type StructuredGenerationRequest,
} from "./ai-provider";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.1";
const DEFAULT_MAX_TOKENS = 8000;

interface JSONSchemaObject {
  type?: string | string[];
  properties?: Record<string, JSONSchemaObject>;
  required?: string[];
  items?: JSONSchemaObject;
  anyOf?: JSONSchemaObject[];
  oneOf?: JSONSchemaObject[];
  allOf?: JSONSchemaObject[];
  additionalProperties?: boolean | JSONSchemaObject;
  [key: string]: unknown;
}

/**
 * OpenAI's structured-output "strict" mode requires every object property to be
 * listed in `required` and `additionalProperties: false` on every object. Zod's
 * `.optional()` fields are represented as missing from `required` instead, so we
 * recursively rewrite the schema: optional properties become nullable and required,
 * matching the documented workaround for expressing optionality under strict mode.
 * This is done at the JSON Schema layer only — the Zod schemas themselves are untouched.
 */
function toStrictJsonSchema(node: JSONSchemaObject): JSONSchemaObject {
  if (node.properties) {
    const originalRequired = new Set(node.required ?? []);
    const properties: Record<string, JSONSchemaObject> = {};

    for (const [key, value] of Object.entries(node.properties)) {
      const strictValue = toStrictJsonSchema(value);
      properties[key] = originalRequired.has(key)
        ? strictValue
        : { anyOf: [strictValue, { type: "null" }] };
    }

    return {
      ...node,
      properties,
      required: Object.keys(node.properties),
      additionalProperties: false,
    };
  }

  if (node.items) {
    return { ...node, items: toStrictJsonSchema(node.items) };
  }

  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    const subSchemas = node[key];
    if (subSchemas) {
      return { ...node, [key]: subSchemas.map(toStrictJsonSchema) };
    }
  }

  return node;
}

/** Strips keys whose value is `null`, undoing the nullable-required workaround so the
 * result matches what the original (non-strict) Zod schema expects for optional fields. */
function pruneNulls(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(pruneNulls);
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === null) continue;
      result[key] = pruneNulls(v);
    }
    return result;
  }
  return value;
}

interface OpenAIOutputTextContent {
  type: "output_text";
  text: string;
}

interface OpenAIRefusalContent {
  type: "refusal";
  refusal: string;
}

interface OpenAIMessageOutputItem {
  type: "message";
  role: string;
  content: (OpenAIOutputTextContent | OpenAIRefusalContent)[];
}

interface OpenAIResponsesResponse {
  status?: string;
  incomplete_details?: { reason?: string };
  output?: OpenAIMessageOutputItem[];
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIProviderConfigError(
        "Missing environment variable OPENAI_API_KEY. Set it (e.g. in .env.local) before running the pipeline."
      );
    }
    this.apiKey = apiKey;
    this.model = options?.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  }

  async generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<T> {
    const jsonSchema = z.toJSONSchema(request.schema, { target: "draft-7" }) as JSONSchemaObject;
    delete jsonSchema.$schema;
    const strictSchema = toStrictJsonSchema(jsonSchema);

    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        instructions: request.system,
        input: request.prompt,
        max_output_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        text: {
          format: {
            type: "json_schema",
            name: request.schemaName,
            schema: strictSchema,
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AIProviderResponseError(
        `OpenAI API request failed (${response.status} ${response.statusText}) for "${request.schemaName}": ${body}`
      );
    }

    const data = (await response.json()) as OpenAIResponsesResponse;

    if (data.status === "incomplete") {
      throw new AIProviderResponseError(
        `OpenAI response for "${request.schemaName}" was incomplete: ${data.incomplete_details?.reason ?? "unknown reason"}`
      );
    }

    const message = data.output?.find((item) => item.type === "message");
    const refusal = message?.content.find(
      (block): block is OpenAIRefusalContent => block.type === "refusal"
    );
    if (refusal) {
      throw new AIProviderResponseError(
        `OpenAI refused to generate "${request.schemaName}": ${refusal.refusal}`
      );
    }

    const textBlock = message?.content.find(
      (block): block is OpenAIOutputTextContent => block.type === "output_text"
    );
    if (!textBlock) {
      throw new AIProviderResponseError(
        `OpenAI response for "${request.schemaName}" did not include an output_text block.`
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(textBlock.text);
    } catch {
      throw new AIProviderResponseError(
        `OpenAI response for "${request.schemaName}" was not valid JSON.`
      );
    }

    const parsed = request.schema.safeParse(pruneNulls(raw));
    if (!parsed.success) {
      throw new AIProviderResponseError(
        `OpenAI response for "${request.schemaName}" failed schema validation: ${parsed.error.message}`
      );
    }

    return parsed.data;
  }
}

import type { z } from "zod";

export interface StructuredGenerationRequest<T> {
  /** System-level instructions establishing the model's role and constraints. */
  system: string;
  /** The task-specific prompt, including all relevant context. */
  prompt: string;
  /** Schema the response must satisfy. Also used to build the provider's structured-output contract. */
  schema: z.ZodType<T>;
  /** Short, stable name identifying what is being generated (used as the tool/function name). */
  schemaName: string;
  maxTokens?: number;
}

export interface AIProvider {
  readonly name: string;
  generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<T>;
}

export class AIProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderConfigError";
  }
}

export class AIProviderResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderResponseError";
  }
}

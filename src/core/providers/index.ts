import { OpenAIProvider } from "./openai-provider";
import { OpenAIImageProvider } from "./openai-image-provider";
import type { AIProvider } from "./ai-provider";
import type { ImageProvider } from "./image-provider";

export * from "./ai-provider";
export * from "./openai-provider";
export * from "./image-provider";
export * from "./openai-image-provider";

/** Resolves the configured AI provider from environment variables. Throws if unconfigured. */
export function getAIProvider(): AIProvider {
  return new OpenAIProvider();
}

/** Resolves the configured image-generation provider from environment variables. Throws if unconfigured. */
export function getImageProvider(): ImageProvider {
  return new OpenAIImageProvider();
}

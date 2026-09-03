import {
  AIProviderConfigError,
  AIProviderResponseError,
} from "./ai-provider";
import type { ImageProvider, ImageGenerationRequest } from "./image-provider";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

/**
 * Cheap-by-default: exploration is meant to produce 3 rough directions to choose
 * between, not final artwork. A stronger model/quality is applied later, only to
 * the single selected concept, in the (not-yet-built) refinement stage.
 */
const DEFAULT_IMAGE_MODEL = "gpt-image-1-mini";
const DEFAULT_IMAGE_SIZE: NonNullable<ImageGenerationRequest["size"]> = "1024x1024";
const DEFAULT_IMAGE_QUALITY: NonNullable<ImageGenerationRequest["quality"]> = "medium";

interface OpenAIImagesResponse {
  data?: { b64_json?: string }[];
}

export class OpenAIImageProvider implements ImageProvider {
  readonly name = "openai";

  private readonly apiKey: string;
  private readonly model: string;
  private readonly size: NonNullable<ImageGenerationRequest["size"]>;
  private readonly quality: NonNullable<ImageGenerationRequest["quality"]>;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    size?: ImageGenerationRequest["size"];
    quality?: ImageGenerationRequest["quality"];
  }) {
    const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIProviderConfigError(
        "Missing environment variable OPENAI_API_KEY. Set it (e.g. in .env.local) before generating logo images."
      );
    }
    this.apiKey = apiKey;
    this.model = options?.model ?? process.env.OPENAI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL;
    this.size =
      options?.size ??
      (process.env.OPENAI_IMAGE_SIZE as ImageGenerationRequest["size"] | undefined) ??
      DEFAULT_IMAGE_SIZE;
    this.quality =
      options?.quality ??
      (process.env.OPENAI_IMAGE_QUALITY as ImageGenerationRequest["quality"] | undefined) ??
      DEFAULT_IMAGE_QUALITY;
  }

  async generateImage(request: ImageGenerationRequest): Promise<Buffer> {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: request.prompt,
        size: request.size ?? this.size,
        quality: request.quality ?? this.quality,
        background: "opaque",
        n: 1,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AIProviderResponseError(
        `OpenAI image API request failed (${response.status} ${response.statusText}): ${body}`
      );
    }

    const data = (await response.json()) as OpenAIImagesResponse;
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      throw new AIProviderResponseError("OpenAI image API response did not include image data.");
    }

    return Buffer.from(b64, "base64");
  }
}

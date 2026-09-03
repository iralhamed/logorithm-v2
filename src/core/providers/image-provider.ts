export interface ImageGenerationRequest {
  /** Full prompt describing the image to generate. */
  prompt: string;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "low" | "medium" | "high" | "auto";
}

export interface ImageProvider {
  readonly name: string;
  generateImage(request: ImageGenerationRequest): Promise<Buffer>;
}

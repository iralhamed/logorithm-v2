import type { AIProvider } from "@/core/providers/ai-provider";
import { BrandSystemSchema, type BrandSystem } from "@/core/schemas/brand-system.schema";
import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import { buildBrandSystemPrompt } from "@/core/prompts/brand-system.prompt";

export async function buildBrandSystem(
  intake: BrandIntake,
  strategy: BrandStrategy,
  creative: CreativeDirection,
  provider: AIProvider
): Promise<BrandSystem> {
  const { system, prompt } = buildBrandSystemPrompt(intake, strategy, creative);

  return provider.generateStructured({
    system,
    prompt,
    schema: BrandSystemSchema,
    schemaName: "BrandSystem",
  });
}

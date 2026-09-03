import type { AIProvider } from "@/core/providers/ai-provider";
import {
  CreativeDirectionSchema,
  type CreativeDirection,
} from "@/core/schemas/creative-direction.schema";
import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import { buildCreativeDirectionPrompt } from "@/core/prompts/creative-direction.prompt";

export async function buildCreativeDirection(
  intake: BrandIntake,
  strategy: BrandStrategy,
  provider: AIProvider
): Promise<CreativeDirection> {
  const { system, prompt } = buildCreativeDirectionPrompt(intake, strategy);

  return provider.generateStructured({
    system,
    prompt,
    schema: CreativeDirectionSchema,
    schemaName: "CreativeDirection",
  });
}

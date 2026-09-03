import type { AIProvider } from "@/core/providers/ai-provider";
import { BrandStrategySchema, type BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { IntakeEvaluation } from "@/core/schemas/intake-evaluation.schema";
import { buildBrandStrategyPrompt } from "@/core/prompts/brand-strategy.prompt";

export async function buildBrandStrategy(
  intake: BrandIntake,
  evaluation: IntakeEvaluation,
  provider: AIProvider
): Promise<BrandStrategy> {
  const { system, prompt } = buildBrandStrategyPrompt(intake, evaluation);

  return provider.generateStructured({
    system,
    prompt,
    schema: BrandStrategySchema,
    schemaName: "BrandStrategy",
  });
}

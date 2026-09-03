import type { AIProvider } from "@/core/providers/ai-provider";
import { LogoConceptSetSchema, type LogoConceptSet } from "@/core/schemas/logo-concept.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { BrandSystem } from "@/core/schemas/brand-system.schema";
import type { LogoResearch } from "@/core/schemas/logo-research.schema";
import { buildLogoConceptsPrompt } from "@/core/prompts/logo-concepts.prompt";

export async function generateLogoConcepts(
  strategy: BrandStrategy,
  creative: CreativeDirection,
  system: BrandSystem,
  research: LogoResearch,
  provider: AIProvider
): Promise<LogoConceptSet> {
  const { system: systemPrompt, prompt } = buildLogoConceptsPrompt(strategy, creative, system, research);

  const result = await provider.generateStructured({
    system: systemPrompt,
    prompt,
    schema: LogoConceptSetSchema,
    schemaName: "LogoConceptSet",
  });

  return {
    concepts: result.concepts.map((concept, index) => ({
      ...concept,
      id: `concept-${index + 1}`,
    })),
  };
}

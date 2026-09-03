import type { AIProvider } from "@/core/providers/ai-provider";
import { LogoResearchSchema, type LogoResearch } from "@/core/schemas/logo-research.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { BrandSystem } from "@/core/schemas/brand-system.schema";
import { buildLogoResearchPrompt } from "@/core/prompts/logo-research.prompt";

const ROUTE_ORDER = ["symbolic", "structural", "typographic"] as const;

/**
 * The research + simplification pass that runs BEFORE logo concepts and images.
 * Its output is fed into `generateLogoConcepts` so the concepts (and therefore
 * the standalone-symbol prompts) are grounded in deliberate motif extraction and
 * aggressive simplification rather than jumping straight from strategy to a render.
 */
export async function generateLogoResearch(
  strategy: BrandStrategy,
  creative: CreativeDirection,
  system: BrandSystem,
  provider: AIProvider
): Promise<LogoResearch> {
  const { system: systemPrompt, prompt } = buildLogoResearchPrompt(strategy, creative, system);

  const result = await provider.generateStructured({
    system: systemPrompt,
    prompt,
    schema: LogoResearchSchema,
    schemaName: "LogoResearch",
  });

  // Keep the three simplification plans in the canonical route order so downstream
  // code can pair plan[i] with concept[i].
  const plansByRoute = new Map(result.simplificationPlans.map((plan) => [plan.route, plan]));
  const orderedPlans = ROUTE_ORDER.map((route) => plansByRoute.get(route)).filter(
    (plan): plan is LogoResearch["simplificationPlans"][number] => plan !== undefined
  );

  return {
    ...result,
    simplificationPlans:
      orderedPlans.length === ROUTE_ORDER.length ? orderedPlans : result.simplificationPlans,
  };
}

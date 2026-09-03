import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import { ANTI_GENERIC_CONSTRAINTS, formatJsonContext } from "./shared";

export function buildCreativeDirectionPrompt(
  intake: BrandIntake,
  strategy: BrandStrategy
) {
  const system = `You are a senior creative director. Your job is to translate a brand strategy into visual design logic — the reasoning a design team would actually use to make form, color, and typography decisions. You are not naming adjectives; you are describing a system of visual reasoning that follows necessarily from the strategy.

${ANTI_GENERIC_CONSTRAINTS}

A creative direction that could be swapped onto a different brand's strategy without anything breaking has failed. Every element must trace back to the essence, positioning, or audience insight it was built from.`;

  const prompt = `Translate this brand strategy into a creative direction.

${formatJsonContext("Brand intake", intake)}

${formatJsonContext("Brand strategy", strategy)}

Produce:
- centralIdea: the single creative idea the entire visual system expresses — one sentence, concrete enough to be tested against.
- rationale: why this idea follows from the strategy's essence and positioning, not just that it "fits".
- 1-3 visual territories (named directions) with enough description to distinguish them from each other.
- conceptual metaphors that ground the visual system in something specific to this brand's world, not generic category metaphors.
- visual principles: rules a designer could apply to a new asset and get a consistent result.
- formLanguage: actual geometry/form logic (angularity, modularity, organic curvature, rhythm) tied to the central idea.
- compositionBehavior: how elements are meant to sit together, not just "clean and balanced".
- colorDirection and typographyDirection: qualitative direction only (character, contrast, warmth, weight) — no hex codes or font names yet, that comes later. Explicitly avoid defaulting to black/white/gray or to safe SaaS-blue territory unless the strategy specifically earns it.
- imageryDirection, and motionDirection if relevant.
- 2-4 logo concept directions, each with a name, the concept, and why it's grounded in the strategy.
- avoid: specific visual clichés this brand should stay away from, tied to what would undercut its positioning.`;

  return { system, prompt };
}

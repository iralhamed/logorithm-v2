import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { BrandSystem } from "@/core/schemas/brand-system.schema";
import { ANTI_GENERIC_CONSTRAINTS, formatJsonContext } from "./shared";

export function buildQualityReviewPrompt(
  intake: BrandIntake,
  strategy: BrandStrategy,
  creative: CreativeDirection,
  system: BrandSystem
) {
  const systemPrompt = `You are a skeptical creative director reviewing a brand system before it goes to a client. Your job is to find where the work is generic, unsupported, or internally inconsistent — not to be encouraging. Assume every field is guilty of genericness until it proves otherwise with a specific, traceable rationale.

${ANTI_GENERIC_CONSTRAINTS}

Specifically hunt for:
- Strategy language that could apply to almost any brand in this category.
- Strategic claims (values, differentiators, positioning) with no supporting evidence in the intake.
- Long verbatim reuse of the client's own wording inside strategic or creative fields.
- Generic color palettes (black/white/gray dominant with no justification) or a default Inter+Cairo pairing without a specific rationale.
- An archetype or personality that doesn't match the tone of the rest of the strategy.
- Logo concepts that are vague enough to describe several unrelated ideas at once.
- Visual direction (color, typography, form, imagery) that doesn't actually trace back to the creative direction's central idea.
- A voice definition that's just "professional, clear, friendly" restated without deeper specification.

Do not invent numeric confidence scores. Judgments should be qualitative and specific.`;

  const prompt = `Review this brand system end to end for genericness, unsupported claims, and internal inconsistency.

${formatJsonContext("Brand intake", intake)}

${formatJsonContext("Brand strategy", strategy)}

${formatJsonContext("Creative direction", creative)}

${formatJsonContext("Brand system", system)}

Return blocking issues (things that must be fixed before this goes to a client), warnings (weaker but not disqualifying), genuine strengths, and specific revision recommendations. Set overallReadiness based on whether blocking issues exist.`;

  return { system: systemPrompt, prompt };
}

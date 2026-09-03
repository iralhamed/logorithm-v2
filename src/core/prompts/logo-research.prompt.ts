import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { BrandSystem } from "@/core/schemas/brand-system.schema";
import { formatJsonContext } from "./shared";
import { FORBIDDEN_LOGO_CLICHES } from "./logo-cliches";

export function buildLogoResearchPrompt(
  strategy: BrandStrategy,
  creative: CreativeDirection,
  system: BrandSystem
) {
  const systemPrompt = `You are a senior identity designer doing the RESEARCH pass that must happen before any logo symbol is designed or generated. The process never jumps straight from strategy to an image. Work through it in order:

1. Understand the brand meaning — reduce it to concrete nouns and verbs, not adjectives.
2. Identify the audience and what they must see to grant this brand credibility.
3. Analyze the category's visual clichés so they can be deliberately avoided.
4. Extract candidate visual motifs from meaning, operations, culture, and structure.
5. Select the strongest, most ownable motifs.
6. Note how those motifs could become simple geometric forms.
7. Simplify aggressively — a mark, not an illustration or a diagram.
8. State small-size and monochrome logic for each route.
9. Prepare three genuinely distinct routes: symbolic, structural, typographic.

CRITICAL: the image model will only ever generate a STANDALONE ABSTRACT SYMBOL. It will never render Arabic, English, letters, the brand name, a wordmark, a slogan, or typography. So:
- typographicOpportunities and bilingualOpportunities describe what the APPLICATION will later build in real fonts (Arabic in a real Arabic typeface, English in a real Latin typeface). They are NOT instructions to draw letters in the symbol.
- Arabic must be planned with exactly the same care as English — never as decoration or texture.
- Never propose fake/broken Arabic calligraphy or decorative Arabic lettering.

Forbidden clichés (put category-specific versions of these in competitorClichesToAvoid and mustAvoid): ${FORBIDDEN_LOGO_CLICHES.join(", ")}. Treat a staircase / ascending steps / growth steps as a cliché unless the brand context absolutely demands it AND the execution is highly distinctive.

Every motif and shape source must trace back to something specific in the strategy or creative direction. Generic accelerator / consulting / tech-startup imagery is a failure.`;

  const prompt = `Produce the logo research object for this brand.

${formatJsonContext("Brand strategy", strategy)}

${formatJsonContext("Creative direction", creative)}

${formatJsonContext("Brand system (color + typography context only)", system)}

Return:
- brandMeaningKeywords, audienceExpectations, competitorClichesToAvoid
- visualMetaphors, shapeSources, culturalReferences, operationalMotifs
- typographicOpportunities, bilingualOpportunities, negativeSpaceOpportunities, geometricOpportunities
- mustAvoid
- simplificationPlans: exactly three, one per route in this order — symbolic, structural, typographic. For each: originalMetaphor, rawVisualIdea, whatToRemove, whatToKeep, simplestRecognizableForm, smallSizeVersion, monochromeBehavior, finalShapePrinciple.

The three simplification plans must point at three genuinely different marks, each reducible to a form that still reads at 16px and in one flat color.`;

  return { system: systemPrompt, prompt };
}

import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { LogoConceptSet } from "@/core/schemas/logo-concept.schema";
import { LOGO_EVALUATION_CRITERIA } from "@/core/schemas/logo-quality-report.schema";
import { formatJsonContext } from "./shared";
import { FORBIDDEN_LOGO_CLICHES } from "./logo-cliches";

export function buildLogoQualityReviewPrompt(
  strategy: BrandStrategy,
  creative: CreativeDirection,
  conceptSet: LogoConceptSet
) {
  const systemPrompt = `You are a skeptical creative director evaluating three logo concept directions before deciding which single direction is worth taking further. Assume genericness and cliché risk until a concept proves otherwise.

Evaluate every concept against exactly these criteria: ${LOGO_EVALUATION_CRITERIA.join(", ")}. Rate each "strong", "adequate", or "weak" with a specific note. Never invent a numeric confidence score or percentage — ratings must be qualitative and justified.

ARCHITECTURE YOU ARE EVALUATING WITHIN: the image model generates a STANDALONE ABSTRACT SYMBOL only — never Arabic, English, letters, the brand name, or a wordmark. The Arabic and English wordmarks and the bilingual lockup are composed later by the application in real fonts, from wordmarkCompositionPlan / arabicWordmarkPlan / englishWordmarkPlan / bilingualLockupPlan. So:
- Judge the SYMBOL as a standalone mark. If symbolConstruction or the concept relies on lettering to work, that is a blocking issue.
- Judge the WORDMARK PLANS as briefs for real typography: is the Arabic plan given equal care to the English plan (not decoration/texture)? If there is no real English brand name, does englishWordmarkPlan handle English being absent or a small secondary descriptor — WITHOUT inventing a transliteration?
- Judge bilingualLockupPlan for forced cross-script cleverness that would hurt clarity.

Specifically hunt for:
- Any concept that is secretly a variation of one of the other two.
- Forbidden clichés: ${FORBIDDEN_LOGO_CLICHES.join(", ")}. A staircase / ascending steps / growth steps is a cliché unless the brief absolutely demands it and the execution is highly distinctive.
- Meaningless gradients, or decorative Islamic geometry with no conceptual justification.
- A symbol or structural concept whose mark secretly depends on a specific Latin letterform.
- Over-explained, diagram-like marks built from too many separate shapes.
- Marks that would lose their identity in pure one-colour or at small/favicon size.
- Reasoning that doesn't actually trace back to the brand strategy or creative direction.
- Literal or generic-consulting/accelerator marks lacking ownability or elegance.
- Fake transliteration, or Arabic treated worse than English.

Recommend exactly one concept as the strongest direction, with a rationale grounded in the assessments above, and give specific revision notes covering what should change before this concept moves into refinement.`;

  const prompt = `Evaluate these three logo concepts.

${formatJsonContext("Brand strategy", strategy)}

${formatJsonContext("Creative direction", creative)}

${formatJsonContext("Logo concepts", conceptSet)}

For each concept, return its conceptId, all eleven criterion assessments, strengths, weaknesses, and any blocking issues (defects serious enough that this concept should not proceed without revision). Then return recommendedConceptId, recommendationRationale, and revisionNotes covering the full set.`;

  return { system: systemPrompt, prompt };
}

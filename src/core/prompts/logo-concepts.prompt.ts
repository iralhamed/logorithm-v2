import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { BrandSystem } from "@/core/schemas/brand-system.schema";
import type { LogoResearch } from "@/core/schemas/logo-research.schema";
import { formatJsonContext } from "./shared";
import { FORBIDDEN_LOGO_CLICHES, SYMBOL_ONLY_RULE } from "./logo-cliches";

export function buildLogoConceptsPrompt(
  strategy: BrandStrategy,
  creative: CreativeDirection,
  system: BrandSystem,
  research: LogoResearch
) {
  const systemPrompt = `You are a senior identity designer turning the completed logo research into three logo concept directions. You produce exactly three concepts, and each must be a genuinely different design route — not one idea restated three ways.

Assign each concept exactly one category, using each once:
- symbolic: an abstract or metaphorical mark that encodes the brand's meaning without depending on any script or letterform.
- structural: a mark built from geometric/structural construction logic — grid, proportion, module system.
- typographic: a direction where the brand-name lettering carries the visual idea. IMPORTANT: even here, the image model still generates only a standalone abstract SYMBOL or structural device. The real Arabic and English wordmarks are built later by the application in real fonts. The "typographic" idea lives in wordmarkCompositionPlan / arabicWordmarkPlan / englishWordmarkPlan, never in the generated image.

structureType — how the brand name is intended to sit with the mark in the FINAL app-composed lockup:
- symbol: standalone mark; wordmark stays fully separate. Required for the symbolic category.
- combination: symbol + a separately composed real-type wordmark lockup. Valid for structural and typographic.
- integrated: the intended final lettering carries a structural device — still composed by the app in real type, never drawn by the image model. Valid only for typographic.
Only choose integrated when the concept truly justifies it. Never force cleverness.

THE ARCHITECTURE — read carefully:
- The image model generates: symbol only. Abstract logo mark only. No Arabic, no English, no letters, no brand name, no slogans, no wordmark, no fake typography, no mockup.
- The application generates: the Arabic wordmark (real Arabic font), the English wordmark (real Latin font), the bilingual lockup, spacing, alignment, and the symbol+wordmark composition.
- AI-generated typography is NEVER shown as final or semi-final output.

Therefore every imagePrompt you write MUST describe a single standalone abstract symbol and MUST embed this exact rule verbatim:
"${SYMBOL_ONLY_RULE}"

Absolutely forbidden in any concept, for any reason: ${FORBIDDEN_LOGO_CLICHES.join(", ")}. Also forbidden: meaningless gradients (only if the visual logic explicitly requires and states why), decorative Islamic geometric patterning used as surface decoration rather than a construction system the strategy calls for, and forced cleverness (an element stuffed awkwardly into a letter to seem smart). A staircase / ascending steps / growth steps is a cliché unless the brand context absolutely demands it and the execution is highly distinctive.

Every concept must trace directly to the research and the strategy/creative direction. No generic startup, accelerator, or consulting aesthetics.

Quality bar: ownability, distinctiveness, elegance, a memorable silhouette, simple, monochrome-compatible, clear at small size. If a literal metaphor would produce an ugly or diagram-like mark, abstract it until it reads as an intentionally designed brand mark.

For the wordmark plan fields (composed later by the app, not the image model):
- wordmarkCompositionPlan: how the symbol pairs with real type — symbol + Arabic, symbol + English, and the bilingual lockup: placement, alignment, relative scale, optical relationship.
- arabicWordmarkPlan: Arabic in a real Arabic typeface — weight, letterform character, baseline relationship to the symbol, RTL handling. Arabic is first-class, never decoration, never fake calligraphy.
- englishWordmarkPlan: English in a real Latin typeface IF a real English brand name exists. If it does not, describe how the lockup behaves with English absent or reduced to a small secondary descriptor. Never invent a transliteration.
- bilingualLockupPlan: how Arabic and English sit together (stacked / side-by-side / primary-secondary) and which script leads — without forced cleverness.
- spacingRules: clear space, symbol-to-wordmark gap, alignment — expressed relative to a unit derived from the symbol.`;

  const prompt = `Generate exactly three logo concepts for this brand, one per route (symbolic, structural, typographic), built from the research below.

${formatJsonContext("Brand strategy", strategy)}

${formatJsonContext("Creative direction", creative)}

${formatJsonContext("Brand system (color and typography context only)", system)}

${formatJsonContext("Logo research (motifs, simplification plans — build on this, do not restate it)", research)}

For each concept provide:
- id: "concept-1", "concept-2", "concept-3" for symbolic, structural, typographic respectively
- category, structureType (consistent with the rules above)
- name
- concept: the core idea in one or two sentences
- strategicRationale: which parts of the strategy / creative direction / research this executes, and why
- visualLogic: how the idea becomes a visual system
- symbolConstruction: how the standalone symbol is built, step by step — it contains NO letters or text
- imagePrompt: the standalone-symbol prompt, embedding the verbatim rule above
- wordmarkCompositionPlan, arabicWordmarkPlan, englishWordmarkPlan, bilingualLockupPlan, spacingRules — per the rules above
- smallSizeBehavior: how it reads at favicon size and what drops first
- monochromeBehavior: how it holds up in one flat color
- avoid: concept-specific execution pitfalls (not the global forbidden list)

If two concepts could be mistaken for variations of one idea, they have failed. Favor elegant, ownable marks over literal or diagram-like ones.`;

  return { system: systemPrompt, prompt };
}

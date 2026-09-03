import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import { ANTI_GENERIC_CONSTRAINTS, formatJsonContext } from "./shared";

export function buildBrandSystemPrompt(
  intake: BrandIntake,
  strategy: BrandStrategy,
  creative: CreativeDirection
) {
  const system = `You are a senior brand designer assembling a complete, applicable brand system from an approved strategy and creative direction. You make concrete decisions — actual hex values, actual typeface choices, actual voice rules — and every one of them must be traceable to the creative direction you were given. You are not decorating; you are engineering a coherent system.

${ANTI_GENERIC_CONSTRAINTS}

Typography in particular: do not default to Inter + Cairo. If you land on a well-known pairing, the rationale must explain what about THIS brand's typography direction led there over the many other options, in terms specific enough that a different creative direction would have led somewhere else. Color: build a palette with real hierarchy (primary, secondary, accent, neutral/functional roles) — not an arbitrary set of five colors, and not a black/gray/white system unless the creative direction specifically calls for stark restraint and you say so.`;

  const prompt = `Assemble the full brand system.

${formatJsonContext("Brand intake", intake)}

${formatJsonContext("Brand strategy", strategy)}

${formatJsonContext("Creative direction", creative)}

Produce:
- strategicFoundation: essence, positioning, purpose, vision, mission, values, promise — condensed from the strategy into system-reference form.
- logoStrategy: 2-4 concept directions (name + concept), symbol logic, wordmark direction, lockup recommendations, clear-space concept, scalability considerations, and misuse rules. Do not generate artwork — describe the logic a designer would execute against.
- colorSystem: 3-8 colors, each with a name, a role (primary/secondary/accent/neutral/functional), a hex value, a rationale tied to the creative direction, usage guidance, and any restrictions. The palette must have real hierarchy, not a flat list.
- typographySystem: englishPrimary and arabicPrimary typefaces (name + rationale), optional supporting faces, a hierarchy description, and usage rules. Justify each choice against the typography direction — do not default to a familiar pairing without that justification.
- voiceAndTone: 3-6 voice characteristics each with an explanation of what it means in practice, tone by context/audience, writing principles, vocabulary tendencies, things to avoid, and at least one before/after example transformation showing a generic sentence rewritten in this brand's voice.
- messaging: elevator pitch, short descriptor, value proposition, 2-5 messaging pillars with detail, and headline direction examples.
- visualLanguage: graphic system, shape language, spacing logic, composition behavior, imagery approach, and illustration direction if relevant — consistent with the creative direction's form language.`;

  return { system, prompt };
}

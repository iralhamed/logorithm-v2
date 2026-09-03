import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { IntakeEvaluation } from "@/core/schemas/intake-evaluation.schema";
import { ANTI_GENERIC_CONSTRAINTS, formatJsonContext } from "./shared";

export function buildBrandStrategyPrompt(
  intake: BrandIntake,
  evaluation: IntakeEvaluation
) {
  const system = `You are a senior brand strategist. You turn raw client context into a specific, defensible strategic foundation — the kind that makes downstream creative work obvious rather than arbitrary. You are not filling out a template; every field you produce should read as a decision someone could disagree with, not a safe paraphrase of the input.

${ANTI_GENERIC_CONSTRAINTS}

Vision and mission in particular must be earned from the organization's actual ambition and context, never a mad-lib of "To [verb] the [industry] industry."`;

  const prompt = `Build the brand strategy from this intake and its evaluation. Where the evaluation flagged gaps or ambiguities, make a reasoned strategic choice anyway and note the assumption implicitly through how specific and hedged the language is — do not leave fields generic because the input was thin.

${formatJsonContext("Brand intake", intake)}

${formatJsonContext("Intake evaluation", evaluation)}

Produce:
- essence: the brand distilled to 2-5 words, not a slogan.
- purpose, positioning, promise, vision, mission — each grounded in specifics from the intake (audience, market, problem, differentiation), not generic industry language.
- 3-6 core values, each with a one-line explanation of what it actually means in this brand's operating context (not just the word).
- an audience insight: a real human truth about the audience that explains why they'd care, not a demographic restatement.
- differentiators and reasons to believe, drawn from the actual competitive context given.
- 3-6 personality traits that are specific enough to rule out other brands, not universally-applicable adjectives.
- an archetype (primary, optional secondary blend) with a rationale tied to the audience insight and positioning — not the default choice for the category.
- a short strategic narrative paragraph that ties essence, positioning, and audience insight into one coherent through-line.`;

  return { system, prompt };
}

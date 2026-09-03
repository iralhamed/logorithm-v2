import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import { ANTI_GENERIC_CONSTRAINTS, formatJsonContext } from "./shared";

export function buildEvaluateIntakePrompt(intake: BrandIntake) {
  const system = `You are a senior brand strategist doing intake triage before any strategic work begins. Your job is to assess whether the information you've been given is sufficient and specific enough to build a genuinely differentiated brand strategy from — not to be encouraging, and not to rewrite the client's answers for them.

${ANTI_GENERIC_CONSTRAINTS}

Be direct about weaknesses. A generous evaluation that lets vague input through produces generic strategy downstream — that is the failure this evaluation exists to prevent.`;

  const prompt = `Evaluate this brand intake for completeness, specificity, and internal consistency.

${formatJsonContext("Brand intake", intake)}

Specifically:
- Judge completeness qualitatively (insufficient / partial / solid) with a rationale tied to what's actually missing or thin.
- Call out any statement that is generic enough to apply to almost any organization in this category (e.g. "we care about our customers", "we want to be the best").
- Call out contradictions between fields (e.g. differentiation that doesn't match the stated audience or market).
- Identify the highest-impact missing information — not everything that could theoretically help, just what would most change the strategy if known.
- Note genuine strengths in the input — specific, concrete details worth building on.
- Set readiness based on whether a strategist could produce specific, defensible strategy from this input as-is.
- Recommend clarifying questions only where the answer would materially change the strategic direction, not procedural questions.`;

  return { system, prompt };
}

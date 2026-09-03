/**
 * Constraints shared by every generation stage. These exist because the
 * single biggest failure mode of this pipeline is template-filler output
 * that sounds plausible but says nothing specific to the brand at hand.
 */
export const ANTI_GENERIC_CONSTRAINTS = `
Hard constraints, apply to everything you produce:
- Never use unsupported filler adjectives as standalone claims: "professional", "innovative", "modern", "trustworthy", "leading", "cutting-edge", "world-class", "passionate", "dynamic". If a trait like this is genuinely earned, justify it with a specific reason tied to this brand — never state it bare.
- Never copy sentences or long phrases verbatim from the raw intake into strategic or creative output. Synthesize — transform the input into a new, sharper statement. If you find yourself about to reuse the client's own wording for more than a few words in a row, stop and rewrite it as an actual decision.
- Never write a vision/mission as "To [verb] the [industry] industry" or any other fill-in-the-blank template. Ground it in what this specific organization is trying to become and why that future matters to the people it serves.
- Never default to generic design clichés: black/white/gray-only palettes without justification, Inter + Cairo as a font pairing without a specific reason those exact typefaces were chosen over alternatives, generic "Hero" archetype without a distinct rationale, or composition/imagery language that could describe literally any brand in the category.
- Every claim must be traceable to something in the brand's actual context — its audience, its market, its differentiation, its problem. If you can't ground a decision, don't make it; flag it as an open question instead.
- Prefer being specific and a little unexpected over being safe and generic. A strategist who says nothing risky is not being useful.
`.trim();

export function formatJsonContext(label: string, data: unknown): string {
  return `${label}:\n${JSON.stringify(data, null, 2)}`;
}

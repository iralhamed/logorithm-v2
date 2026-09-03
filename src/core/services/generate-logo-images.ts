import type { ImageProvider } from "@/core/providers/image-provider";
import type { LogoConcept, LogoConceptSet } from "@/core/schemas/logo-concept.schema";
import { SYMBOL_ONLY_RULE } from "@/core/prompts/logo-cliches";

export { SYMBOL_ONLY_RULE };

/**
 * Style directive applied to every symbol render so the marks stay visually
 * consistent and don't drift into the known failure modes (charts / dashboards /
 * staircases / UI icons mistaken for logos).
 */
const RENDER_STYLE_DIRECTIVE = `
Render as a single clean logo symbol exploration:
- pure white background, symbol centered with generous margin
- rendered in solid black, or a very small number of flat brand colors — no gradients unless the concept's visual logic explicitly requires one
- minimal, high-contrast, geometric, vector-like flat shapes suitable for later vectorization
- one coherent mark, not a composition of several separate icons
- no words, letters, glyphs, numerals, or pseudo-text anywhere in the image
- no mockups, business cards, 3D, shadows, textures, scenes, devices, or UI chrome
- must NOT resemble: a staircase or ascending steps, a bar chart or progress bar, a dashboard, a spreadsheet or table, an app icon, a lightbulb, a rocket, an upward arrow, a brain or neural-network diagram, a generic hexagon tech badge, or a pile of random blocks
- must read as one intentionally designed, ownable brand mark
`.trim();

export interface GeneratedLogoImage {
  id: string;
  buffer: Buffer;
}

/**
 * Generates the standalone-symbol image for a single concept. Used by both the
 * full three-concept pass and single-concept regeneration so the two never drift
 * in prompt-building logic. No brand name / naming is passed in — the image never
 * contains text.
 */
export async function generateLogoImage(
  concept: LogoConcept,
  provider: ImageProvider
): Promise<Buffer> {
  const prompt = [concept.imagePrompt, SYMBOL_ONLY_RULE, RENDER_STYLE_DIRECTIVE].join("\n\n");
  return provider.generateImage({ prompt });
}

export async function generateLogoImages(
  conceptSet: LogoConceptSet,
  provider: ImageProvider
): Promise<GeneratedLogoImage[]> {
  const results: GeneratedLogoImage[] = [];

  for (const concept of conceptSet.concepts) {
    const buffer = await generateLogoImage(concept, provider);
    results.push({ id: concept.id, buffer });
  }

  return results;
}

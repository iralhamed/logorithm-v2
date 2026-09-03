/**
 * The hard rule attached to EVERY image prompt, for every route. The image model
 * designs a standalone abstract mark only — never typography, Arabic rendering,
 * or icon+wordmark composition. Shared here so prompts and the image service use
 * the exact same wording.
 */
export const SYMBOL_ONLY_RULE =
  "Generate only one standalone abstract logo symbol. No Arabic text. No English text. No Latin letters. No Arabic letters. No brand name. No wordmark. No slogan. No typography. No mockup.";

/**
 * Single source of truth for the forbidden logo clichés (spec Part 6). Used by
 * the logo prompts (as guardrail text) and by the deterministic heuristics /
 * critic (as match phrases). Keep this list and the heuristic matchers in sync.
 */
export const FORBIDDEN_LOGO_CLICHES: string[] = [
  "stairs",
  "ascending steps",
  "growth steps",
  "upward steps",
  "bar charts",
  "progress bars",
  "dashboards",
  "spreadsheets",
  "tables",
  "app UI icons",
  "lightbulbs",
  "rockets",
  "upward arrows",
  "generic neural network icons",
  "AI brain icons",
  "generic hexagon tech marks",
  "random blocks",
  "generic accelerator logos",
  "generic consulting logos",
  "fake Arabic calligraphy",
  "broken Arabic lettering",
  "decorative Arabic used as texture",
];

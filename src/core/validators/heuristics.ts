import type { QualityIssue } from "@/core/schemas/quality-report.schema";
import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { BrandSystem, ColorEntry, TypographySystem } from "@/core/schemas/brand-system.schema";

const GENERIC_WORDS = [
  "professional",
  "innovative",
  "innovation-driven",
  "trustworthy",
  "leading",
  "cutting-edge",
  "cutting edge",
  "world-class",
  "world class",
  "passionate",
  "dynamic",
  "state-of-the-art",
  "state of the art",
  "best-in-class",
  "best in class",
];

export function wordBoundaryRegex(phrase: string): RegExp {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z])${escaped}(?![a-z])`, "i");
}

/** Flags bare use of unsupported filler adjectives in strategic text fields. */
export function findGenericLanguage(
  fields: Array<{ label: string; text: string }>
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  for (const { label, text } of fields) {
    const matches = GENERIC_WORDS.filter((word) => wordBoundaryRegex(word).test(text));
    if (matches.length > 0) {
      issues.push({
        issue: `Generic filler language in "${label}"`,
        detail: `Found unsupported adjective(s): ${matches.join(", ")}. In: "${text}"`,
      });
    }
  }

  return issues;
}

function shingles(text: string, size = 6): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);

  const result = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) {
    result.add(words.slice(i, i + size).join(" "));
  }
  return result;
}

/** Flags verbatim reuse of 6+ word runs from the raw intake inside strategic output. */
export function findRawTextReuse(
  intake: BrandIntake,
  strategy: BrandStrategy
): QualityIssue[] {
  const sourceText = [intake.description, intake.offering, intake.problem, intake.differentiation]
    .filter(Boolean)
    .join(" ");
  const sourceShingles = shingles(sourceText);

  if (sourceShingles.size === 0) return [];

  const strategyFields: Array<[string, string]> = [
    ["essence", strategy.essence],
    ["purpose", strategy.purpose],
    ["positioning", strategy.positioning],
    ["promise", strategy.promise],
    ["vision", strategy.vision],
    ["mission", strategy.mission],
    ["strategicNarrative", strategy.strategicNarrative],
  ];

  const issues: QualityIssue[] = [];
  for (const [label, text] of strategyFields) {
    const fieldShingles = shingles(text);
    for (const shingle of fieldShingles) {
      if (sourceShingles.has(shingle)) {
        issues.push({
          issue: `Raw intake text reused verbatim in "${label}"`,
          detail: `Six-word phrase copied from the intake rather than synthesized: "${shingle}"`,
        });
        break;
      }
    }
  }

  return issues;
}

/** Flags the Inter + Cairo default pairing when used without distinguishing rationale. */
export function checkDefaultTypography(typography: TypographySystem): QualityIssue[] {
  const english = typography.englishPrimary.name.toLowerCase();
  const arabic = typography.arabicPrimary.name.toLowerCase();

  if (english.includes("inter") && arabic.includes("cairo")) {
    return [
      {
        issue: "Default Inter + Cairo typography pairing",
        detail:
          "This is the most common fallback pairing. Confirm the rationale explains what about this brand's typography direction specifically led here, not just familiarity.",
      },
    ];
  }

  return [];
}

function hexToSaturation(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const delta = max - min;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

/** Flags palettes that are entirely achromatic (black/gray/white) with no chromatic color. */
export function checkPaletteHierarchy(colorSystem: ColorEntry[]): QualityIssue[] {
  const issues: QualityIssue[] = [];

  const allAchromatic = colorSystem.every((color) => hexToSaturation(color.hex) < 0.08);
  if (allAchromatic) {
    issues.push({
      issue: "Palette has no chromatic color",
      detail:
        "Every color in the system is effectively black, white, or gray. Confirm this is a deliberate restrained direction called for by the creative direction, not an unexamined default.",
    });
  }

  const roles = new Set(colorSystem.map((c) => c.role.toLowerCase()));
  if (![...roles].some((role) => role.includes("primary"))) {
    issues.push({
      issue: "No clear primary color role",
      detail: "The color system does not designate a primary color, so it lacks a clear hierarchy.",
    });
  }

  return issues;
}

export interface HeuristicFindings {
  blockingIssues: QualityIssue[];
  warnings: QualityIssue[];
}

export function runHeuristics(
  intake: BrandIntake,
  strategy: BrandStrategy,
  system: BrandSystem
): HeuristicFindings {
  const genericLanguageFields = [
    { label: "strategy.positioning", text: strategy.positioning },
    { label: "strategy.promise", text: strategy.promise },
    { label: "strategy.vision", text: strategy.vision },
    { label: "strategy.mission", text: strategy.mission },
    ...strategy.personality.map((trait, i) => ({ label: `strategy.personality[${i}]`, text: trait })),
    { label: "voiceAndTone", text: system.voiceAndTone.characteristics.map((c) => c.trait).join(" ") },
  ];

  return {
    blockingIssues: [...findRawTextReuse(intake, strategy)],
    warnings: [
      ...findGenericLanguage(genericLanguageFields),
      ...checkDefaultTypography(system.typographySystem),
      ...checkPaletteHierarchy(system.colorSystem),
    ],
  };
}

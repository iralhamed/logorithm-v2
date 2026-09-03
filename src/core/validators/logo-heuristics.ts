import type { QualityIssue } from "@/core/schemas/quality-report.schema";
import type { LogoConcept, LogoConceptSet } from "@/core/schemas/logo-concept.schema";
import { wordBoundaryRegex } from "./heuristics";

/**
 * Deterministic cliché matchers. Phrasing mirrors `FORBIDDEN_LOGO_CLICHES` in
 * `@/core/prompts/logo-cliches` but is expanded into the word forms a concept is
 * likely to actually use (singular/plural, "staircase" vs "stairs", etc.).
 */
const BANNED_CLICHES: Array<{ phrase: string; label: string }> = [
  { phrase: "rocket", label: "rocket" },
  { phrase: "lightbulb", label: "lightbulb" },
  { phrase: "light bulb", label: "lightbulb" },
  { phrase: "hexagon", label: "generic hexagon tech mark" },
  { phrase: "ai brain", label: "AI brain icon" },
  { phrase: "brain icon", label: "AI brain icon" },
  { phrase: "neural network", label: "AI/neural network icon" },
  { phrase: "swoosh", label: "generic swoosh" },
  { phrase: "bar chart", label: "bar chart" },
  { phrase: "bar graph", label: "bar chart" },
  { phrase: "progress bar", label: "progress bar" },
  { phrase: "dashboard", label: "dashboard UI" },
  { phrase: "spreadsheet", label: "spreadsheet" },
  { phrase: "data table", label: "data table" },
  { phrase: "app icon", label: "generic app icon" },
  { phrase: "ui icon", label: "app UI icon" },
  { phrase: "stairs", label: "stairs / ascending steps" },
  { phrase: "staircase", label: "staircase / ascending steps" },
  { phrase: "ascending steps", label: "ascending steps" },
  { phrase: "upward steps", label: "upward steps" },
  { phrase: "growth steps", label: "growth steps" },
  { phrase: "step chart", label: "growth-steps cliché" },
  { phrase: "random blocks", label: "pile of random blocks" },
  { phrase: "generic accelerator", label: "generic accelerator logo" },
  { phrase: "generic consulting", label: "generic consulting logo" },
  { phrase: "fake arabic calligraphy", label: "fake Arabic calligraphy" },
  { phrase: "decorative arabic calligraphy", label: "decorative/fake Arabic calligraphy" },
  { phrase: "broken arabic", label: "broken Arabic lettering" },
];

const STEP_PATTERN = /\b(ascending|rising|climbing|upward|growth)\s+(steps?|stairs?)\b/i;
const ARROW_PATTERN = /\b(upward|rising|ascending)?\s*arrows?\b/i;
const ARROW_EXEMPT_CONTEXT = /timeline|process flow|data flow|progress path/i;

function textFields(concept: LogoConcept): Array<[string, string]> {
  return [
    ["name", concept.name],
    ["concept", concept.concept],
    ["visualLogic", concept.visualLogic],
    ["symbolConstruction", concept.symbolConstruction],
    ["imagePrompt", concept.imagePrompt],
  ];
}

/** Flags outright-forbidden startup clichés (rockets, staircases, bar charts, hexagon tech marks, etc.). */
export function findClicheRisk(concept: LogoConcept): QualityIssue[] {
  const issues: QualityIssue[] = [];

  for (const [label, text] of textFields(concept)) {
    for (const { phrase, label: clicheLabel } of BANNED_CLICHES) {
      if (wordBoundaryRegex(phrase).test(text)) {
        issues.push({
          issue: `Concept "${concept.name}" (${concept.id}) uses a banned cliché: ${clicheLabel}`,
          detail: `Found in ${label}: "${text}"`,
        });
      }
    }

    if (STEP_PATTERN.test(text)) {
      issues.push({
        issue: `Concept "${concept.name}" (${concept.id}) uses an ascending-steps / staircase motif`,
        detail: `Found in ${label}: "${text}". Steps/stairs are a category cliché unless the brief absolutely demands it.`,
      });
    }

    if (ARROW_PATTERN.test(text) && !ARROW_EXEMPT_CONTEXT.test(text)) {
      issues.push({
        issue: `Concept "${concept.name}" (${concept.id}) references an arrow motif`,
        detail: `Found in ${label}: "${text}". Confirm this isn't a generic directional / upward arrow icon.`,
      });
    }
  }

  return issues;
}

const JUSTIFICATION_PATTERN = /justif|conceptual|deliberate|earned|specific reason|because/i;

/** Flags decorative Islamic geometry or gradients mentioned without a stated justification. */
export function findUnjustifiedMotifs(concept: LogoConcept): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const combined = textFields(concept)
    .map(([, text]) => text)
    .join(" ");

  if (/islamic geometr(y|ic)/i.test(combined) && !JUSTIFICATION_PATTERN.test(combined)) {
    issues.push({
      issue: `Concept "${concept.name}" (${concept.id}) references Islamic geometric patterning without stated justification`,
      detail: "Islamic geometric motifs must be conceptually justified by the strategy, not a decorative default.",
    });
  }

  if (/\bgradient/i.test(combined) && !JUSTIFICATION_PATTERN.test(combined)) {
    issues.push({
      issue: `Concept "${concept.name}" (${concept.id}) references a gradient without stated justification`,
      detail: "Gradients are disallowed unless the concept's visual logic explicitly justifies one.",
    });
  }

  return issues;
}

/** Flags a non-integrated concept's symbol described as a Latin letterform, initial, or monogram. */
export function findLatinDependencySignal(concept: LogoConcept): QualityIssue[] {
  if (concept.structureType === "integrated") return [];

  const combined = [concept.symbolConstruction, concept.visualLogic].join(" ");
  if (/\b(letterform|monogram|initial letter)\b/i.test(combined)) {
    return [
      {
        issue: `Concept "${concept.name}" (${concept.id}) may depend on a Latin letterform despite not being an Integrated / Typographic mark`,
        detail: `Only structureType "integrated" is allowed to build its mark from letterforms. Found in reasoning: "${combined}"`,
      },
    ];
  }

  return [];
}

const TEXT_LEAK_PATTERN =
  /\b(wordmark|lettering|letterform|brand name|typography|arabic (text|script|letters)|latin (text|letters)|glyph)\b/i;

/**
 * Flags a concept whose OWN symbol-construction description references text or
 * lettering. `imagePrompt` is intentionally excluded — it legitimately contains
 * the negated SYMBOL_ONLY_RULE ("No wordmark. No typography. ...").
 */
export function findSymbolMarkTextLeak(concept: LogoConcept): QualityIssue[] {
  const combined = concept.symbolConstruction;
  if (TEXT_LEAK_PATTERN.test(combined)) {
    return [
      {
        issue: `Concept "${concept.name}" (${concept.id}) describes text/lettering inside the standalone symbol`,
        detail:
          "The generated symbol must contain no letters, glyphs, or wordmark of any kind — typography is composed later by the app.",
      },
    ];
  }

  return [];
}

export interface LogoHeuristicFindings {
  blockingIssues: QualityIssue[];
  warnings: QualityIssue[];
}

export function runLogoHeuristics(conceptSet: LogoConceptSet): LogoHeuristicFindings {
  const blockingIssues: QualityIssue[] = [];
  const warnings: QualityIssue[] = [];

  for (const concept of conceptSet.concepts) {
    blockingIssues.push(...findClicheRisk(concept));
    blockingIssues.push(...findSymbolMarkTextLeak(concept));
    warnings.push(...findUnjustifiedMotifs(concept));
    warnings.push(...findLatinDependencySignal(concept));
  }

  return { blockingIssues, warnings };
}

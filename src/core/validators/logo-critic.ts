import type { LogoConcept, LogoConceptSet } from "@/core/schemas/logo-concept.schema";
import type { LogoCriticFinding, LogoCriticReport } from "@/core/schemas/logo-critic.schema";
import { runLogoHeuristics } from "./logo-heuristics";

/**
 * The auto-critic layer (spec Part 7). Deterministic — no AI, no paid call — so
 * it is always safe to run before logo directions are shown. It evaluates
 * concept DATA (and can later fold in generated-symbol metadata). Its output is
 * stored in the project for internal review only; its wording must never be put
 * in front of a client.
 *
 * MVP behaviour: it flags and records. It does NOT auto-regenerate.
 */

const SHAPE_WORDS =
  /\b(circle|square|triangle|hexagon|pentagon|octagon|diamond|arc|ring|dot|line|bar|square|rectangle|polygon|star|crescent|node|module|segment|stripe|band|chevron|shard|facet)s?\b/gi;

function countDistinctShapeWords(text: string): number {
  const found = new Set<string>();
  for (const m of text.matchAll(SHAPE_WORDS)) found.add(m[0].toLowerCase().replace(/s$/, ""));
  return found.size;
}

const TRANSLITERATION_HINT =
  /\btranslit|romani[sz]|phoneticall?y|sound(s|ed)?\s+out|latini[sz]|as it sounds\b/i;

const FORCED_CLEVERNESS_HINT =
  /\b(clever|cleverly|witty|pun|double meaning|merge the letters|letters? (form|become|hide)|hidden letter|swap a letter)\b/i;

const WEAK_LANGUAGE = /\b(unclear|not sure|might not|may not|hard to|struggles?|could fail|risky at)\b/i;

function findingsForConcept(concept: LogoConcept): LogoCriticFinding[] {
  const out: LogoCriticFinding[] = [];
  const add = (severity: LogoCriticFinding["severity"], category: string, message: string) =>
    out.push({ conceptId: concept.id, severity, category, message });

  // Too many shapes / over-explained diagram-like mark.
  const shapeCount = countDistinctShapeWords(concept.symbolConstruction);
  if (shapeCount >= 5) {
    add(
      "reject",
      "too-many-shapes",
      `symbolConstruction combines ~${shapeCount} distinct shape primitives — likely to read as a diagram, not one ownable mark.`
    );
  } else if (shapeCount === 4) {
    add("warn", "too-many-shapes", "symbolConstruction uses four shape primitives — pressure-test whether it simplifies.");
  }

  if (concept.symbolConstruction.length > 900) {
    add(
      "warn",
      "over-explained",
      "symbolConstruction is very long — an over-described mark is usually an under-designed one."
    );
  }

  // Small-size and monochrome logic must be real, not a token sentence.
  if (concept.smallSizeBehavior.trim().length < 40 || WEAK_LANGUAGE.test(concept.smallSizeBehavior)) {
    add("warn", "small-size", "smallSizeBehavior is thin or hedged — the mark's favicon-scale behaviour isn't convincingly resolved.");
  }
  if (concept.monochromeBehavior.trim().length < 40 || WEAK_LANGUAGE.test(concept.monochromeBehavior)) {
    add("warn", "monochrome", "monochromeBehavior is thin or hedged — one-colour behaviour isn't convincingly resolved.");
  }

  // Symbol must not depend on typography.
  if (/\b(wordmark|lettering|letterform|the name|typography)\b/i.test(concept.symbolConstruction)) {
    add("reject", "symbol-depends-on-type", "The standalone symbol's construction depends on lettering / the wordmark.");
  }

  // Arabic must not be treated worse than English.
  const ar = concept.arabicWordmarkPlan.trim();
  const en = concept.englishWordmarkPlan.trim();
  if (ar.length + 24 < en.length * 0.5) {
    add(
      "warn",
      "arabic-underweighted",
      "arabicWordmarkPlan is far thinner than englishWordmarkPlan — Arabic looks like an afterthought."
    );
  }
  if (/\b(decorat|ornament|texture|pattern fill|backdrop)\w*/i.test(ar)) {
    add("reject", "arabic-as-decoration", "arabicWordmarkPlan treats Arabic as decoration/texture rather than a first-class wordmark.");
  }

  // No invented transliteration.
  if (TRANSLITERATION_HINT.test(concept.englishWordmarkPlan) || TRANSLITERATION_HINT.test(concept.bilingualLockupPlan)) {
    add("reject", "fake-transliteration", "The English/bilingual plan proposes transliterating the Arabic name rather than using a real English name or descriptor.");
  }

  // Forced bilingual cleverness.
  if (FORCED_CLEVERNESS_HINT.test(concept.bilingualLockupPlan)) {
    add("warn", "forced-bilingual-cleverness", "bilingualLockupPlan leans on cross-script cleverness — confirm it doesn't hurt clarity.");
  }

  return out;
}

export function runLogoCritic(conceptSet: LogoConceptSet): LogoCriticReport {
  const heuristics = runLogoHeuristics(conceptSet);

  const heuristicFindings: LogoCriticFinding[] = [
    ...heuristics.blockingIssues.map((issue) => ({
      conceptId: conceptIdFrom(issue.issue),
      severity: "reject" as const,
      category: "cliche",
      message: `${issue.issue} — ${issue.detail}`,
    })),
    ...heuristics.warnings.map((issue) => ({
      conceptId: conceptIdFrom(issue.issue),
      severity: "warn" as const,
      category: "heuristic",
      message: `${issue.issue} — ${issue.detail}`,
    })),
  ];

  const conceptFindings = conceptSet.concepts.flatMap(findingsForConcept);
  const findings = [...heuristicFindings, ...conceptFindings];

  const conceptsNeedingRegeneration = [
    ...new Set(findings.filter((f) => f.severity === "reject").map((f) => f.conceptId)),
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    findings,
    conceptsNeedingRegeneration,
  };
}

/** Heuristic issue strings embed the concept id as "(concept-N)". */
function conceptIdFrom(issue: string): string {
  const m = issue.match(/\((concept-\d+)\)/);
  return m ? m[1] : "";
}

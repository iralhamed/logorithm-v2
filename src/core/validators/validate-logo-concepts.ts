import type { AIProvider } from "@/core/providers/ai-provider";
import {
  LogoQualityReportSchema,
  type LogoQualityReport,
} from "@/core/schemas/logo-quality-report.schema";
import type { LogoConceptSet } from "@/core/schemas/logo-concept.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import { buildLogoQualityReviewPrompt } from "@/core/prompts/logo-quality-review.prompt";
import { runLogoHeuristics } from "./logo-heuristics";

/**
 * Combines deterministic cliché/heuristic checks with an AI creative-director
 * review into a single LogoQualityReport. Heuristics catch mechanical failure
 * modes (banned clichés, unjustified motifs); the AI review catches judgment
 * calls heuristics can't (distinctiveness, recognizability, strategic fit).
 */
export async function validateLogoConcepts(
  strategy: BrandStrategy,
  creative: CreativeDirection,
  conceptSet: LogoConceptSet,
  provider: AIProvider
): Promise<LogoQualityReport> {
  const heuristics = runLogoHeuristics(conceptSet);

  const { system, prompt } = buildLogoQualityReviewPrompt(strategy, creative, conceptSet);

  const aiReport = await provider.generateStructured({
    system,
    prompt,
    schema: LogoQualityReportSchema,
    schemaName: "LogoQualityReport",
  });

  const evaluations = aiReport.evaluations.map((evaluation) => {
    const conceptBlockingIssues = heuristics.blockingIssues.filter((issue) =>
      issue.issue.includes(`(${evaluation.conceptId})`)
    );
    return {
      ...evaluation,
      blockingIssues: [...conceptBlockingIssues, ...evaluation.blockingIssues],
    };
  });

  const heuristicNotes = heuristics.warnings.map((warning) => `${warning.issue}: ${warning.detail}`);

  return {
    ...aiReport,
    evaluations,
    revisionNotes: [...heuristicNotes, ...aiReport.revisionNotes],
  };
}

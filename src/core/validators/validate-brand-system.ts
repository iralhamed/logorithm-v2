import type { AIProvider } from "@/core/providers/ai-provider";
import { QualityReportSchema, type QualityReport } from "@/core/schemas/quality-report.schema";
import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import type { BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import type { CreativeDirection } from "@/core/schemas/creative-direction.schema";
import type { BrandSystem } from "@/core/schemas/brand-system.schema";
import { buildQualityReviewPrompt } from "@/core/prompts/quality-review.prompt";
import { runHeuristics } from "./heuristics";

/**
 * Combines deterministic heuristic checks with an AI creative-director review
 * into a single QualityReport. Heuristics catch mechanical failure modes
 * (verbatim reuse, default typography, achromatic palettes); the AI review
 * catches judgment calls heuristics can't (genericness of reasoning,
 * internal consistency, weak logo concepts).
 */
export async function validateBrandSystem(
  intake: BrandIntake,
  strategy: BrandStrategy,
  creative: CreativeDirection,
  system: BrandSystem,
  provider: AIProvider
): Promise<QualityReport> {
  const heuristics = runHeuristics(intake, strategy, system);

  const { system: reviewSystem, prompt } = buildQualityReviewPrompt(
    intake,
    strategy,
    creative,
    system
  );

  const aiReport = await provider.generateStructured({
    system: reviewSystem,
    prompt,
    schema: QualityReportSchema,
    schemaName: "QualityReport",
  });

  const blockingIssues = [...heuristics.blockingIssues, ...aiReport.blockingIssues];
  const warnings = [...heuristics.warnings, ...aiReport.warnings];

  const overallReadiness: QualityReport["overallReadiness"] =
    blockingIssues.length > 0
      ? "blocked"
      : warnings.length > 0
        ? "needs_revision"
        : aiReport.overallReadiness;

  return {
    blockingIssues,
    warnings,
    strengths: aiReport.strengths,
    revisionRecommendations: aiReport.revisionRecommendations,
    overallReadiness,
  };
}

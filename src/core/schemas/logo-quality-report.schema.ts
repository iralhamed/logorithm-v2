import { z } from "zod";
import { QualityIssueSchema } from "./quality-report.schema";

export const LOGO_EVALUATION_CRITERIA = [
  "simplicity",
  "distinctiveness",
  "recognizability",
  "scalability",
  "monochromeSuitability",
  "geometricConsistency",
  "smallSizeClarity",
  "relevanceToBrandMeaning",
  "competitorDifferentiation",
  "clicheRisk",
  "bilingualReadiness",
] as const;

export const LogoCriterionSchema = z.enum(LOGO_EVALUATION_CRITERIA);

export const LogoCriterionAssessmentSchema = z.object({
  criterion: LogoCriterionSchema,
  rating: z.enum(["strong", "adequate", "weak"]),
  notes: z.string().min(1),
});

export const LogoConceptEvaluationSchema = z
  .object({
    conceptId: z.string().min(1),
    assessments: z.array(LogoCriterionAssessmentSchema).length(LOGO_EVALUATION_CRITERIA.length),
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    blockingIssues: z.array(QualityIssueSchema),
  })
  .refine(
    (data) => new Set(data.assessments.map((a) => a.criterion)).size === LOGO_EVALUATION_CRITERIA.length,
    { message: "Assessments must cover each evaluation criterion exactly once." }
  );

export const LogoQualityReportSchema = z.object({
  evaluations: z.array(LogoConceptEvaluationSchema).length(3),
  recommendedConceptId: z.string().min(1),
  recommendationRationale: z.string().min(1),
  revisionNotes: z.array(z.string()),
});

export type LogoCriterion = z.infer<typeof LogoCriterionSchema>;
export type LogoCriterionAssessment = z.infer<typeof LogoCriterionAssessmentSchema>;
export type LogoConceptEvaluation = z.infer<typeof LogoConceptEvaluationSchema>;
export type LogoQualityReport = z.infer<typeof LogoQualityReportSchema>;

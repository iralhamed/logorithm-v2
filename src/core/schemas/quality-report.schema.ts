import { z } from "zod";

export const QualityIssueSchema = z.object({
  issue: z.string().min(1),
  detail: z.string().min(1),
});

export const QualityReportSchema = z.object({
  blockingIssues: z.array(QualityIssueSchema),
  warnings: z.array(QualityIssueSchema),
  strengths: z.array(z.string()),
  revisionRecommendations: z.array(z.string()),
  overallReadiness: z.enum(["blocked", "needs_revision", "ready"]),
});

export type QualityIssue = z.infer<typeof QualityIssueSchema>;
export type QualityReport = z.infer<typeof QualityReportSchema>;

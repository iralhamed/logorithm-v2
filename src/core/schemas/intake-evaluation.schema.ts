import { z } from "zod";

export const IntakeEvaluationSchema = z.object({
  completeness: z.object({
    level: z.enum(["insufficient", "partial", "solid"]),
    rationale: z.string().min(1),
  }),
  ambiguities: z.array(z.string()),
  contradictions: z.array(z.string()),
  genericStatements: z
    .array(z.string())
    .describe("Vague or filler statements found in the raw intake"),
  missingHighImpactInfo: z.array(z.string()),
  strengths: z.array(z.string()),
  readiness: z.enum(["not_ready", "ready_with_gaps", "ready"]),
  recommendedClarifyingQuestions: z.array(z.string()),
});

export type IntakeEvaluation = z.infer<typeof IntakeEvaluationSchema>;

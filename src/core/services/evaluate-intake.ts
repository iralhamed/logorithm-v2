import type { AIProvider } from "@/core/providers/ai-provider";
import { IntakeEvaluationSchema, type IntakeEvaluation } from "@/core/schemas/intake-evaluation.schema";
import type { BrandIntake } from "@/core/schemas/brand-intake.schema";
import { buildEvaluateIntakePrompt } from "@/core/prompts/evaluate-intake.prompt";

export async function evaluateIntake(
  intake: BrandIntake,
  provider: AIProvider
): Promise<IntakeEvaluation> {
  const { system, prompt } = buildEvaluateIntakePrompt(intake);

  return provider.generateStructured({
    system,
    prompt,
    schema: IntakeEvaluationSchema,
    schemaName: "IntakeEvaluation",
  });
}

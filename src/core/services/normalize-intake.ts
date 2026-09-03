import { BrandIntakeSchema, type BrandIntake } from "@/core/schemas/brand-intake.schema";

function cleanString(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cleanStringArray(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const cleaned = cleanString(raw);
    if (!cleaned || seen.has(cleaned.toLowerCase())) continue;
    seen.add(cleaned.toLowerCase());
    result.push(cleaned);
  }
  return result;
}

/**
 * Validates raw intake against the schema and normalizes whitespace/duplicates.
 * Performs no synthesis — this stage never talks to an AI provider.
 */
export function normalizeIntake(raw: unknown): BrandIntake {
  const parsed = BrandIntakeSchema.parse(raw);

  return {
    ...parsed,
    brandName: cleanString(parsed.brandName),
    englishName: parsed.englishName ? cleanString(parsed.englishName) : undefined,
    englishDescriptor: parsed.englishDescriptor ? cleanString(parsed.englishDescriptor) : undefined,
    description: cleanString(parsed.description),
    offering: cleanString(parsed.offering),
    problem: cleanString(parsed.problem),
    audience: cleanString(parsed.audience),
    market: cleanString(parsed.market),
    competitors: cleanStringArray(parsed.competitors),
    differentiation: cleanString(parsed.differentiation),
    desiredPerception: cleanString(parsed.desiredPerception),
    existingIdentity: parsed.existingIdentity
      ? cleanString(parsed.existingIdentity)
      : undefined,
    visualPreferences: cleanString(parsed.visualPreferences),
    visualDislikes: cleanString(parsed.visualDislikes),
    languageRequirements: cleanStringArray(parsed.languageRequirements),
    additionalContext: parsed.additionalContext
      ? cleanString(parsed.additionalContext)
      : undefined,
  };
}

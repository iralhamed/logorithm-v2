import type { IntakeValues } from "@/types/intake";

function joinNonEmpty(parts: Array<string | undefined>, sep = "\n\n"): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(sep);
}

/**
 * Maps the intake wizard's UI field values onto the `BrandIntake` schema shape.
 * A few UI questions intentionally combine into one schema field (see
 * `intake-steps.ts`) so the interview can ask a natural set of questions
 * without requiring changes to the core schema.
 */
export function mapIntakeFormToBrandIntake(v: IntakeValues): unknown {
  const languageRequirements =
    v.brandLanguage === "English & Arabic"
      ? ["English", "Arabic"]
      : v.brandLanguage
        ? [v.brandLanguage]
        : [];

  return {
    brandName: v.brandName?.trim() ?? "",
    englishName: v.officialEnglishName?.trim() || undefined,
    englishDescriptor: v.englishDescriptor?.trim() || undefined,
    description: joinNonEmpty([v.shortDescription, v.whatCompanyDoes]),
    offering: joinNonEmpty([v.coreOffering, v.businessModel]),
    problem: v.coreProblem?.trim() ?? "",
    audience: joinNonEmpty([
      v.primaryAudience,
      v.secondaryAudience ? `Secondary audience: ${v.secondaryAudience}` : undefined,
      v.audienceValues ? `What they value: ${v.audienceValues}` : undefined,
    ]),
    market: v.market?.trim() ?? "",
    competitors: (v.competitors ?? "")
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean),
    differentiation: v.differentiation?.trim() ?? "",
    desiredPerception: joinNonEmpty([
      v.desiredPerception,
      v.brandTraits ? `Brand traits: ${v.brandTraits}` : undefined,
    ]),
    existingIdentity:
      v.brandStatus === "Existing brand" ? v.existingIdentityNotes?.trim() || undefined : undefined,
    visualPreferences: v.visualPreferences?.trim() ?? "",
    visualDislikes: joinNonEmpty([
      v.visualDislikes,
      v.categoryCliches ? `Category clichés to avoid: ${v.categoryCliches}` : undefined,
    ]),
    languageRequirements,
    additionalContext: undefined,
  };
}

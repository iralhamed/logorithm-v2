import { z } from "zod";

export const LogoConceptCategorySchema = z.enum(["symbolic", "structural", "typographic"]);

/**
 * The three professional logo structures Logorithm supports. Distinct from `category`
 * (the design route): this describes how the brand name is intended to sit with the
 * mark in the FINAL, app-composed lockup — never how the image model renders it.
 * The image model only ever produces a standalone symbol; the wordmark is always
 * rebuilt in real type by the application.
 */
export const LogoStructureTypeSchema = z.enum(["symbol", "combination", "integrated"]);

export const LogoConceptSchema = z.object({
  id: z.string().min(1),
  category: LogoConceptCategorySchema,
  structureType: LogoStructureTypeSchema.describe(
    "symbol = standalone mark, wordmark stays separate. combination = symbol + a separately composed wordmark lockup. integrated = the intended final lettering carries a structural device (still composed by the app in real type, never drawn by the image model)."
  ),
  name: z.string().min(1),
  concept: z.string().min(1).describe("The core idea, in one or two sentences"),
  strategicRationale: z
    .string()
    .min(1)
    .describe("Which specific parts of the brand strategy and creative direction this concept executes, and why"),
  visualLogic: z
    .string()
    .min(1)
    .describe("How the idea becomes a visual system — the reasoning, not a render description"),
  symbolConstruction: z
    .string()
    .min(1)
    .describe(
      "How the standalone symbol is built, step by step, precisely enough to brief a designer. The symbol contains NO letters or text of any kind."
    ),
  imagePrompt: z
    .string()
    .min(1)
    .describe(
      "Prompt for generating the STANDALONE SYMBOL ONLY. Never asks for Arabic text, English text, letters, the brand name, a wordmark, a slogan, typography, or a mockup."
    ),
  wordmarkCompositionPlan: z
    .string()
    .min(1)
    .describe(
      "How the APPLICATION should compose the symbol with a real-type wordmark: symbol + Arabic, symbol + English, and the bilingual lockup. Placement, alignment, relative scale, optical relationship."
    ),
  arabicWordmarkPlan: z
    .string()
    .min(1)
    .describe("How the Arabic wordmark is treated in real type: weight, case/letterform character, baseline relationship to the symbol, RTL considerations. Arabic is a first-class wordmark, never decoration."),
  englishWordmarkPlan: z
    .string()
    .min(1)
    .describe(
      "How the English/Latin wordmark is treated in real type — OR, when there is no real English brand name, how the lockup behaves with English absent or reduced to a small secondary descriptor. Never invent a transliteration."
    ),
  bilingualLockupPlan: z
    .string()
    .min(1)
    .describe("How Arabic and English sit together (stacked, side-by-side, primary/secondary) without forced cleverness, and which script leads."),
  spacingRules: z
    .string()
    .min(1)
    .describe("Clear space around the lockup, gap between symbol and wordmark, and internal alignment rules, expressed relative to a unit derived from the symbol."),
  smallSizeBehavior: z.string().min(1).describe("How the mark and lockup read at favicon / small size, and what is dropped first"),
  monochromeBehavior: z.string().min(1).describe("How the mark holds up in pure one-color / black-and-white"),
  avoid: z
    .array(z.string())
    .min(1)
    .describe("Concept-specific execution pitfalls to avoid, not the global forbidden-cliché list"),
});

const ALLOWED_STRUCTURES_BY_CATEGORY: Record<
  z.infer<typeof LogoConceptCategorySchema>,
  z.infer<typeof LogoStructureTypeSchema>[]
> = {
  symbolic: ["symbol"],
  structural: ["symbol", "combination"],
  typographic: ["combination", "integrated"],
};

export const LogoConceptSetSchema = z
  .object({
    concepts: z.array(LogoConceptSchema).length(3),
  })
  .superRefine((data, ctx) => {
    const categories = data.concepts.map((c) => c.category);
    if (new Set(categories).size !== 3) {
      ctx.addIssue({
        code: "custom",
        message: "The three concepts must each use a distinct category: symbolic, structural, typographic.",
        path: ["concepts"],
      });
    }

    data.concepts.forEach((concept, index) => {
      const allowed = ALLOWED_STRUCTURES_BY_CATEGORY[concept.category];
      if (!allowed.includes(concept.structureType)) {
        ctx.addIssue({
          code: "custom",
          message: `Category "${concept.category}" cannot use structureType "${concept.structureType}". Allowed: ${allowed.join(", ")}.`,
          path: ["concepts", index, "structureType"],
        });
      }
    });
  });

export type LogoConceptCategory = z.infer<typeof LogoConceptCategorySchema>;
export type LogoStructureType = z.infer<typeof LogoStructureTypeSchema>;
export type LogoConcept = z.infer<typeof LogoConceptSchema>;
export type LogoConceptSet = z.infer<typeof LogoConceptSetSchema>;

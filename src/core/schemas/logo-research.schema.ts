import { z } from "zod";
import { LogoConceptCategorySchema } from "./logo-concept.schema";

/**
 * The pre-generation research pass. The logo process must not jump straight from
 * strategy to an image prompt — this object captures the understanding,
 * motif-extraction and simplification thinking that produces a stronger
 * standalone symbol before anything is sent to the image model.
 */
export const LogoResearchSchema = z.object({
  brandMeaningKeywords: z.array(z.string().min(1)).min(3).describe("The brand's meaning distilled to concrete nouns/verbs, not adjectives"),
  audienceExpectations: z.array(z.string().min(1)).min(2).describe("What the audience needs to see to grant credibility"),
  competitorClichesToAvoid: z.array(z.string().min(1)).min(2).describe("Visual clichés already worn out in this specific category"),
  visualMetaphors: z.array(z.string().min(1)).min(2),
  shapeSources: z.array(z.string().min(1)).min(2).describe("Real-world structures/forms the geometry can be derived from"),
  culturalReferences: z.array(z.string().min(1)),
  operationalMotifs: z.array(z.string().min(1)).describe("Motifs drawn from how the organization actually operates"),
  typographicOpportunities: z.array(z.string().min(1)).describe("Opportunities for the real-type wordmark, NOT instructions to draw type in the image"),
  bilingualOpportunities: z.array(z.string().min(1)).describe("Structural ideas that let Arabic and English lockups share logic with equal care"),
  negativeSpaceOpportunities: z.array(z.string().min(1)),
  geometricOpportunities: z.array(z.string().min(1)),
  mustAvoid: z.array(z.string().min(1)).min(3),
  simplificationPlans: z
    .array(
      z.object({
        route: LogoConceptCategorySchema,
        originalMetaphor: z.string().min(1),
        rawVisualIdea: z.string().min(1),
        whatToRemove: z.array(z.string().min(1)).min(1),
        whatToKeep: z.array(z.string().min(1)).min(1),
        simplestRecognizableForm: z.string().min(1),
        smallSizeVersion: z.string().min(1),
        monochromeBehavior: z.string().min(1),
        finalShapePrinciple: z.string().min(1),
      })
    )
    .length(3)
    .describe("One simplification plan per route, in order: symbolic, structural, typographic"),
});

export type LogoResearch = z.infer<typeof LogoResearchSchema>;
export type LogoSimplificationPlan = LogoResearch["simplificationPlans"][number];

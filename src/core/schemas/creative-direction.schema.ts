import { z } from "zod";

export const CreativeDirectionSchema = z.object({
  centralIdea: z
    .string()
    .min(1)
    .describe("The single creative idea the entire visual system expresses"),
  rationale: z
    .string()
    .min(1)
    .describe("Why this idea follows from the brand strategy"),
  visualTerritories: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(1)
    .max(3),
  conceptualMetaphors: z.array(z.string()).min(1),
  visualPrinciples: z.array(z.string()).min(1),
  formLanguage: z
    .string()
    .min(1)
    .describe("Geometry and form logic, e.g. angularity, modularity, organic curvature"),
  compositionBehavior: z.string().min(1),
  colorDirection: z
    .string()
    .min(1)
    .describe("Qualitative direction for color, not final hex values"),
  typographyDirection: z
    .string()
    .min(1)
    .describe("Qualitative direction for type character, not final font picks"),
  imageryDirection: z.string().min(1),
  motionDirection: z.string().optional(),
  logoConceptDirections: z
    .array(
      z.object({
        name: z.string().min(1),
        concept: z.string().min(1),
        rationale: z.string().min(1),
      })
    )
    .min(2)
    .max(4),
  avoid: z.array(z.string()).min(1),
});

export type CreativeDirection = z.infer<typeof CreativeDirectionSchema>;

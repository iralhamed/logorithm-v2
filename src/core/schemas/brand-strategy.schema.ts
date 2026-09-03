import { z } from "zod";

export const BrandStrategySchema = z.object({
  essence: z.string().min(1).describe("The brand distilled to its core, 2-5 words"),
  purpose: z.string().min(1),
  positioning: z.string().min(1),
  promise: z.string().min(1),
  vision: z.string().min(1),
  mission: z.string().min(1),
  coreValues: z
    .array(
      z.object({
        value: z.string().min(1),
        explanation: z.string().min(1),
      })
    )
    .min(3)
    .max(6),
  audienceInsight: z
    .string()
    .min(1)
    .describe("The human insight about the audience that the strategy is built on"),
  differentiators: z.array(z.string()).min(1),
  reasonsToBelieve: z.array(z.string()).min(1),
  personality: z.array(z.string()).min(3).max(6),
  archetype: z.object({
    primary: z.string().min(1),
    secondary: z.string().optional(),
    blendRationale: z.string().min(1),
  }),
  strategicNarrative: z
    .string()
    .min(1)
    .describe("A short paragraph tying essence, positioning, and audience insight together"),
});

export type BrandStrategy = z.infer<typeof BrandStrategySchema>;

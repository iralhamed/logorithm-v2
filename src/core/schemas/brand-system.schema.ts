import { z } from "zod";

export const StrategicFoundationSchema = z.object({
  essence: z.string().min(1),
  positioning: z.string().min(1),
  purpose: z.string().min(1),
  vision: z.string().min(1),
  mission: z.string().min(1),
  values: z.array(z.string()).min(3).max(6),
  promise: z.string().min(1),
});

export const LogoStrategySchema = z.object({
  conceptDirections: z
    .array(
      z.object({
        name: z.string().min(1),
        concept: z.string().min(1),
      })
    )
    .min(2)
    .max(4),
  symbolLogic: z.string().min(1),
  wordmarkDirection: z.string().min(1),
  lockupRecommendations: z.string().min(1),
  clearSpaceConcept: z.string().min(1),
  scalabilityConsiderations: z.string().min(1),
  misuseRules: z.array(z.string()).min(1),
});

export const ColorEntrySchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1).describe("e.g. primary, secondary, accent, neutral, functional"),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  rationale: z.string().min(1),
  usage: z.string().min(1),
  restrictions: z.string().optional(),
});

export const ColorSystemSchema = z.array(ColorEntrySchema).min(3).max(8);

export const TypefaceSchema = z.object({
  name: z.string().min(1),
  rationale: z.string().min(1),
});

export const TypographySystemSchema = z.object({
  englishPrimary: TypefaceSchema,
  arabicPrimary: TypefaceSchema,
  supporting: z.array(TypefaceSchema).optional(),
  hierarchy: z.string().min(1),
  usageRules: z.array(z.string()).min(1),
});

export const VoiceAndToneSchema = z.object({
  characteristics: z
    .array(
      z.object({
        trait: z.string().min(1),
        explanation: z.string().min(1),
      })
    )
    .min(3)
    .max(6),
  toneByContext: z
    .array(
      z.object({
        context: z.string().min(1),
        tone: z.string().min(1),
      })
    )
    .min(1),
  writingPrinciples: z.array(z.string()).min(1),
  vocabularyTendencies: z.array(z.string()).min(1),
  avoid: z.array(z.string()).min(1),
  exampleTransformations: z
    .array(
      z.object({
        before: z.string().min(1),
        after: z.string().min(1),
      })
    )
    .min(1),
});

export const MessagingSchema = z.object({
  elevatorPitch: z.string().min(1),
  shortDescriptor: z.string().min(1),
  valueProposition: z.string().min(1),
  pillars: z
    .array(
      z.object({
        pillar: z.string().min(1),
        detail: z.string().min(1),
      })
    )
    .min(2)
    .max(5),
  headlineDirections: z.array(z.string()).min(2),
});

export const VisualLanguageSchema = z.object({
  graphicSystem: z.string().min(1),
  shapes: z.string().min(1),
  spacing: z.string().min(1),
  composition: z.string().min(1),
  imagery: z.string().min(1),
  illustrationDirection: z.string().optional(),
});

export const BrandSystemSchema = z.object({
  strategicFoundation: StrategicFoundationSchema,
  logoStrategy: LogoStrategySchema,
  colorSystem: ColorSystemSchema,
  typographySystem: TypographySystemSchema,
  voiceAndTone: VoiceAndToneSchema,
  messaging: MessagingSchema,
  visualLanguage: VisualLanguageSchema,
});

export type StrategicFoundation = z.infer<typeof StrategicFoundationSchema>;
export type LogoStrategy = z.infer<typeof LogoStrategySchema>;
export type ColorEntry = z.infer<typeof ColorEntrySchema>;
export type TypographySystem = z.infer<typeof TypographySystemSchema>;
export type VoiceAndTone = z.infer<typeof VoiceAndToneSchema>;
export type Messaging = z.infer<typeof MessagingSchema>;
export type VisualLanguage = z.infer<typeof VisualLanguageSchema>;
export type BrandSystem = z.infer<typeof BrandSystemSchema>;

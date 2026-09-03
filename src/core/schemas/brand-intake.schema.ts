import { z } from "zod";

export const BrandIntakeSchema = z.object({
  brandName: z.string().min(1),
  englishName: z
    .string()
    .optional()
    .describe(
      "An official English/Latin brand name, ONLY if the client actually has one. Never a machine transliteration of an Arabic name."
    ),
  englishDescriptor: z
    .string()
    .optional()
    .describe(
      "A plain English descriptor of what the organization is (e.g. 'University Innovation Incubator'). Used as secondary lockup text — never treated as the brand name."
    ),
  description: z
    .string()
    .min(1)
    .describe("What the organization does, in the client's own words"),
  offering: z
    .string()
    .min(1)
    .describe("Business model / core offering"),
  problem: z.string().min(1).describe("The core problem being solved"),
  audience: z.string().min(1),
  market: z.string().min(1).describe("Geography / market scope"),
  competitors: z
    .array(z.string().min(1))
    .min(1)
    .describe("Named direct or aspirational competitors"),
  differentiation: z
    .string()
    .min(1)
    .describe("Why this brand should be chosen instead"),
  desiredPerception: z.string().min(1),
  existingIdentity: z
    .string()
    .optional()
    .describe("Description of the current identity, if one exists"),
  visualPreferences: z.string().min(1),
  visualDislikes: z.string().min(1),
  languageRequirements: z
    .array(z.string().min(1))
    .min(1)
    .describe('e.g. ["Arabic", "English"]'),
  additionalContext: z
    .string()
    .optional()
    .describe("Any other context relevant to the brand"),
});

export type BrandIntake = z.infer<typeof BrandIntakeSchema>;

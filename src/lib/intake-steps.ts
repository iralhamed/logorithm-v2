import type { IntakeStep } from "@/types/intake";

/**
 * Fields are grouped for a good interview flow, then remapped onto the
 * `BrandIntake` schema fields in `intake-mapping.ts` — some UI fields combine
 * into a single schema field (e.g. two "what/how" questions both feed
 * `description`) so the schema itself never needs to change for UI reasons.
 *
 * Helper text is deliberately instructive: the intake collects FACTS and
 * CONSTRAINTS, not adjectives. The system infers brand personality — the client
 * should not have to become the designer.
 */
export const intakeSteps: IntakeStep[] = [
  {
    id: "brand",
    number: 1,
    title: "Brand",
    description: "The basics of who we're building for.",
    fields: [
      {
        id: "brandName",
        label: "Brand or company name",
        type: "text",
        placeholder: "e.g. حاضنة ابتكار  ·  Northfield & Co.",
        helper:
          "Write it exactly as it should appear, in its real script. For an Arabic brand, write the Arabic — don't romanise it.",
        required: true,
      },
      {
        id: "brandLanguage",
        label: "Brand language",
        type: "choice",
        options: ["English", "Arabic", "English & Arabic"],
        helper: "Which script(s) the finished identity must work in. Be honest here — it drives the whole lockup system.",
        required: true,
      },
      {
        id: "officialEnglishName",
        label: "Official English name (only if one really exists)",
        type: "text",
        placeholder: "Leave blank if there isn't a real one",
        helper:
          "Only fill this in if the organisation actually uses an English name. We will not invent a transliteration — a blank here keeps the Arabic name as the primary wordmark.",
      },
      {
        id: "englishDescriptor",
        label: "English descriptor (optional)",
        type: "text",
        placeholder: "e.g. University Innovation Incubator",
        helper:
          "A plain English description of what the organisation is. Used only as small secondary text in bilingual lockups — never as the brand name.",
      },
      {
        id: "brandStatus",
        label: "Is this a new or existing brand?",
        type: "choice",
        options: ["New brand", "Existing brand"],
        required: true,
      },
      {
        id: "existingIdentityNotes",
        label: "Briefly describe the current identity",
        type: "textarea",
        placeholder: "What exists today, and why it needs to change",
        helper: "Facts, not judgement: colours, logo type, where it's used, what's forcing the change.",
        showWhen: { fieldId: "brandStatus", equals: "Existing brand" },
      },
      {
        id: "shortDescription",
        label: "Short description",
        type: "textarea",
        placeholder: "One or two sentences — the elevator version",
        helper: "Plain sentences describing what the organisation does. Don't paste a brochure or a mission statement.",
      },
    ],
  },
  {
    id: "business",
    number: 2,
    title: "Business",
    description: "What the organization actually does.",
    fields: [
      {
        id: "whatCompanyDoes",
        label: "What does the organization do?",
        type: "textarea",
        placeholder: "In plain terms: what it makes, runs, or delivers, and for whom",
        helper: "Describe the actual activity. Avoid adjective lists like “modern, strong, innovative” — give us the facts.",
        required: true,
      },
      {
        id: "coreOffering",
        label: "Core offering",
        type: "textarea",
        placeholder: "The single product, service, or program that matters most",
        helper: "If you had to point to one thing the brand delivers, what is it? Concrete, not aspirational.",
        required: true,
      },
      {
        id: "coreProblem",
        label: "Core problem solved",
        type: "textarea",
        placeholder: "The problem this brand exists to solve",
        helper: "What goes wrong for people without this organisation? State the problem, not the solution.",
        required: true,
      },
      {
        id: "businessModel",
        label: "Business / program model",
        type: "textarea",
        placeholder: "How it actually runs — funding, structure, delivery model",
        helper: "How money and value move: who pays, who's funded, how it's structured and delivered.",
      },
    ],
  },
  {
    id: "audience",
    number: 3,
    title: "Audience",
    description: "Who this brand needs to speak to.",
    fields: [
      {
        id: "primaryAudience",
        label: "Primary audience",
        type: "textarea",
        placeholder: "Who buys, uses, or decides",
        helper: "Who they are, and what they need, fear, or value when they choose. Not just a demographic.",
        required: true,
      },
      {
        id: "secondaryAudience",
        label: "Secondary audience",
        type: "text",
        placeholder: "If relevant",
      },
      {
        id: "market",
        label: "Geography / market",
        type: "text",
        placeholder: "e.g. GCC, local, global",
        required: true,
      },
      {
        id: "audienceValues",
        label: "What does the audience value?",
        type: "textarea",
        placeholder: "What matters most to them when choosing",
        helper: "What earns their trust, and what makes them walk away. Specifics beat generalities.",
      },
    ],
  },
  {
    id: "competition",
    number: 4,
    title: "Competition",
    description: "Where this brand stands in the market.",
    fields: [
      {
        id: "competitors",
        label: "Main competitors / alternatives",
        type: "textarea",
        placeholder: "One per line — direct or aspirational",
        helper: "Just names, one per line — not full write-ups. Include the “do nothing” alternative if that's the real rival.",
        required: true,
      },
      {
        id: "differentiation",
        label: "Why should this brand be chosen instead?",
        type: "textarea",
        placeholder: "The honest reason, not the marketing line",
        helper: "The concrete reason someone picks this over the list above. Avoid “we're more innovative”.",
        required: true,
      },
      {
        id: "categoryCliches",
        label: "Category clichés to avoid",
        type: "textarea",
        placeholder: "Visuals or ideas every competitor already uses",
        helper:
          "Name the tired visuals in this category — e.g. lightbulbs, rockets, upward steps, hexagon tech marks, generic accelerator logos, decorative Arabic used as texture.",
      },
    ],
  },
  {
    id: "character",
    number: 5,
    title: "Character",
    description: "Constraints and instincts — not final creative decisions.",
    fields: [
      {
        id: "desiredPerception",
        label: "Desired perception",
        type: "textarea",
        placeholder: "How should people see this brand?",
        helper: "How you want the brand read by the audience above. A few honest phrases; the system infers the rest.",
        required: true,
      },
      {
        id: "brandTraits",
        label: "Brand traits",
        type: "text",
        placeholder: "e.g. precise, warm, confident",
        helper: "Optional. Treat as instincts, not a brief — back them with a fact wherever you can.",
      },
      {
        id: "visualPreferences",
        label: "Visual preferences",
        type: "textarea",
        placeholder: "References, materials, structures, or constraints to build from",
        helper: "Constraints and references, framed as instincts. Real examples help more than adjectives.",
        required: true,
      },
      {
        id: "visualDislikes",
        label: "Visual dislikes",
        type: "textarea",
        placeholder: "Tone, visuals, or comparisons to stay away from",
        helper: "Anything that would feel wrong, and any visual clichés this brand must not resemble.",
        required: true,
      },
    ],
  },
];

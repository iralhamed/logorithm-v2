import { z } from "zod";

/**
 * The auto-critic layer that runs before logo directions are shown to a client.
 * It is deterministic (no AI/paid call) and evaluates concept DATA — and, where
 * available, generated-symbol metadata. Its language is internal-only and must
 * never be surfaced verbatim in the client-facing UI.
 */
export const LogoCriticSeveritySchema = z.enum(["warn", "reject"]);

export const LogoCriticFindingSchema = z.object({
  conceptId: z.string().min(1),
  severity: LogoCriticSeveritySchema,
  category: z.string().min(1),
  message: z.string().min(1),
});

export const LogoCriticReportSchema = z.object({
  generatedAt: z.string().min(1),
  findings: z.array(LogoCriticFindingSchema),
  /** Concepts with at least one "reject" finding — flagged for regeneration, not auto-regenerated. */
  conceptsNeedingRegeneration: z.array(z.string()),
});

export type LogoCriticSeverity = z.infer<typeof LogoCriticSeveritySchema>;
export type LogoCriticFinding = z.infer<typeof LogoCriticFindingSchema>;
export type LogoCriticReport = z.infer<typeof LogoCriticReportSchema>;

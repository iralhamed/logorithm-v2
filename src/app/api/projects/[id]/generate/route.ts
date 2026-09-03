import type { NextRequest } from "next/server";
import {
  requireProjectMeta,
  getIntake,
  getEvaluation,
  saveEvaluation,
  getStrategy,
  saveStrategy,
  getCreativeDirection,
  saveCreativeDirection,
  getBrandSystem,
  saveBrandSystem,
  getLogoResearch,
  saveLogoResearch,
  getLogoConceptSet,
  saveLogoConceptSet,
  getLogoCriticReport,
  saveLogoCriticReport,
  getLogoQualityReport,
  saveLogoQualityReport,
  getLogoImageVersion,
  saveLogoImage,
} from "@/core/persistence";
import {
  evaluateIntake,
  buildBrandStrategy,
  buildCreativeDirection,
  buildBrandSystem,
  generateLogoResearch,
  generateLogoConcepts,
  generateLogoImage,
} from "@/core/services";
import { validateLogoConcepts, runLogoCritic } from "@/core/validators";
import { getAIProvider, getImageProvider, AIProviderConfigError } from "@/core/providers";
import type { LogoConcept } from "@/core/schemas";

interface ProgressEvent {
  stage: string;
  label: string;
  status: "start" | "done" | "skipped" | "error";
  message?: string;
}

/**
 * Runs the brand + logo pipeline for a project, streaming NDJSON progress lines.
 * Every stage checks for a valid saved output first and skips the AI call
 * entirely unless `force` is set — this is the cost-protection contract:
 * loading/refreshing/navigating never triggers AI, and neither does re-running
 * this route once outputs already exist.
 *
 * Request body:
 * - `{ scope: "logos" }` regenerates ONLY the logo pipeline (research, concepts,
 *   images, critic, quality review) from existing strategy/creative/brand-system,
 *   which are loaded as-is and never regenerated.
 * - `{ force: true }` regenerates the full brand system, replacing every stage.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let force = false;
  let scope: "all" | "logos" = "all";
  try {
    const body = await request.json();
    force = Boolean((body as { force?: unknown } | null)?.force);
    if ((body as { scope?: unknown } | null)?.scope === "logos") scope = "logos";
  } catch {
    // no/invalid JSON body — defaults: force=false, scope="all"
  }

  // logos-only: never (re)run intake evaluation / strategy / creative direction /
  // brand system. Load those as-is and regenerate ONLY the logo pipeline
  // (research -> concepts -> images -> critic -> quality review).
  const logosOnly = scope === "logos";
  const loadUpstream = logosOnly || !force;
  const forceLogos = force || logosOnly;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ProgressEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        await requireProjectMeta(id);

        const intake = await getIntake(id);
        if (!intake) {
          emit({
            stage: "intake",
            label: "Understanding your brand",
            status: "error",
            message: "No intake found for this project yet.",
          });
          return;
        }

        let provider;
        let imageProvider;
        try {
          provider = getAIProvider();
          imageProvider = getImageProvider();
        } catch (error) {
          emit({
            stage: "config",
            label: "Understanding your brand",
            status: "error",
            message: error instanceof AIProviderConfigError ? error.message : "AI provider is not configured.",
          });
          return;
        }

        // In logos-only mode these four upstream stages are never generated — they
        // are loaded as-is, and a missing/invalid one is a hard error.
        const upstreamMissing = (stage: string, label: string) => {
          emit({
            stage,
            label,
            status: "error",
            message:
              "This project's strategy, creative direction, or brand system is missing or invalid. Generate the full brand system before generating logo directions.",
          });
        };

        // 1. Understanding your brand (intake evaluation)
        emit({ stage: "evaluate", label: "Understanding your brand", status: "start" });
        let evaluation = loadUpstream ? await getEvaluation(id) : null;
        if (evaluation) {
          emit({ stage: "evaluate", label: "Understanding your brand", status: "skipped" });
        } else if (logosOnly) {
          // Evaluation isn't consumed by the logo pipeline — its absence is not fatal here.
          emit({ stage: "evaluate", label: "Understanding your brand", status: "skipped" });
        } else {
          evaluation = await evaluateIntake(intake, provider);
          await saveEvaluation(id, evaluation);
          emit({ stage: "evaluate", label: "Understanding your brand", status: "done" });
        }

        // 2. Building strategy
        emit({ stage: "strategy", label: "Building strategy", status: "start" });
        let strategy = loadUpstream ? await getStrategy(id) : null;
        if (strategy) {
          emit({ stage: "strategy", label: "Building strategy", status: "skipped" });
        } else if (logosOnly) {
          upstreamMissing("strategy", "Building strategy");
          return;
        } else {
          // Only reachable in a full run, where stage 1 always produced an evaluation.
          if (!evaluation) throw new Error("Intake evaluation is unavailable.");
          strategy = await buildBrandStrategy(intake, evaluation, provider);
          await saveStrategy(id, strategy);
          emit({ stage: "strategy", label: "Building strategy", status: "done" });
        }

        // 3. Creating creative direction
        emit({ stage: "creative", label: "Creating creative direction", status: "start" });
        let creative = loadUpstream ? await getCreativeDirection(id) : null;
        if (creative) {
          emit({ stage: "creative", label: "Creating creative direction", status: "skipped" });
        } else if (logosOnly) {
          upstreamMissing("creative", "Creating creative direction");
          return;
        } else {
          creative = await buildCreativeDirection(intake, strategy, provider);
          await saveCreativeDirection(id, creative);
          emit({ stage: "creative", label: "Creating creative direction", status: "done" });
        }

        // 4. Building brand system
        emit({ stage: "brandSystem", label: "Building brand system", status: "start" });
        let brandSystem = loadUpstream ? await getBrandSystem(id) : null;
        if (brandSystem) {
          emit({ stage: "brandSystem", label: "Building brand system", status: "skipped" });
        } else if (logosOnly) {
          upstreamMissing("brandSystem", "Building brand system");
          return;
        } else {
          brandSystem = await buildBrandSystem(intake, strategy, creative, provider);
          await saveBrandSystem(id, brandSystem);
          emit({ stage: "brandSystem", label: "Building brand system", status: "done" });
        }

        // 5. Designing three logo routes.
        //    research (motifs + simplification) -> concepts -> only-missing standalone
        //    symbol images -> deterministic auto-critic -> AI quality review.
        emit({ stage: "logos", label: "Designing three logo routes", status: "start" });

        let research = forceLogos ? null : await getLogoResearch(id);
        if (!research) {
          research = await generateLogoResearch(strategy, creative, brandSystem, provider);
          await saveLogoResearch(id, research);
        }

        let conceptSet = forceLogos ? null : await getLogoConceptSet(id);
        const conceptsAlreadyExisted = Boolean(conceptSet);
        if (!conceptSet) {
          conceptSet = await generateLogoConcepts(strategy, creative, brandSystem, research, provider);
          await saveLogoConceptSet(id, conceptSet);
        }

        const missingImageConcepts: LogoConcept[] = forceLogos
          ? conceptSet.concepts
          : (
              await Promise.all(
                conceptSet.concepts.map(async (concept) =>
                  (await getLogoImageVersion(id, concept.id)) === null ? concept : null
                )
              )
            ).filter((c): c is LogoConcept => c !== null);

        for (const concept of missingImageConcepts) {
          const buffer = await generateLogoImage(concept, imageProvider);
          await saveLogoImage(id, concept.id, buffer);
        }

        // Auto-critic: deterministic, no paid call. Always refreshed when concepts change.
        let criticReport = forceLogos ? null : await getLogoCriticReport(id);
        if (!criticReport || !conceptsAlreadyExisted) {
          criticReport = runLogoCritic(conceptSet);
          await saveLogoCriticReport(id, criticReport);
        }

        let qualityReport = forceLogos ? null : await getLogoQualityReport(id);
        const reportAlreadyExisted = Boolean(qualityReport);
        if (!qualityReport) {
          qualityReport = await validateLogoConcepts(strategy, creative, conceptSet, provider);
          await saveLogoQualityReport(id, qualityReport);
        }

        const logosSkipped = conceptsAlreadyExisted && missingImageConcepts.length === 0 && reportAlreadyExisted;
        emit({ stage: "logos", label: "Designing three logo routes", status: logosSkipped ? "skipped" : "done" });

        emit({ stage: "complete", label: "Brand generated", status: "done" });
      } catch (error) {
        emit({
          stage: "error",
          label: "Generation failed",
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

import Link from "next/link";
import {
  getIntake,
  getEvaluation,
  getStrategy,
  getCreativeDirection,
  getBrandSystem,
  getLogoConceptSet,
  getLogoQualityReport,
  getProjectStatus,
} from "@/core/persistence";
import GenerateRunner from "@/components/generate/GenerateRunner";

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const intake = await getIntake(id);

  if (!intake) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Generate</h1>
        <p className="text-base text-muted">
          This project doesn&apos;t have intake information yet.
        </p>
        <Link href={`/project/${id}/intake`} className="text-sm text-accent underline underline-offset-4">
          Go to Intake
        </Link>
      </div>
    );
  }

  const [evaluation, strategy, creative, brandSystem, conceptSet, qualityReport, status] =
    await Promise.all([
      getEvaluation(id),
      getStrategy(id),
      getCreativeDirection(id),
      getBrandSystem(id),
      getLogoConceptSet(id),
      getLogoQualityReport(id),
      getProjectStatus(id),
    ]);

  // Logos count as "done" only when the concept set and quality report parse
  // against the CURRENT schema (getters return null on invalid data) and all
  // three symbol images exist on disk.
  const logosReady = Boolean(conceptSet) && status.hasLogoImages && Boolean(qualityReport);

  const initialDone: Record<string, boolean> = {
    evaluate: Boolean(evaluation),
    strategy: Boolean(strategy),
    creative: Boolean(creative),
    brandSystem: Boolean(brandSystem),
    logos: logosReady,
  };

  return (
    <div className="flex flex-1 flex-col gap-12">
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Generate</h1>
        <p className="max-w-lg text-base leading-relaxed text-muted">
          This runs strategy, creative direction, the brand system, and three logo
          directions from your intake. It only starts when you click below —
          nothing here happens automatically.
        </p>
      </div>

      <GenerateRunner projectId={id} initialDone={initialDone} />
    </div>
  );
}

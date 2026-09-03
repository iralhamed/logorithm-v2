import Link from "next/link";
import {
  getLogoConceptSet,
  getProjectMeta,
  getLogoImageVersion,
  getBrandSystem,
  getIntake,
} from "@/core/persistence";
import { resolveBrandNaming } from "@/core/services";
import { resolveBrandFonts } from "@/lib/brand-fonts";
import { planLockups } from "@/lib/logo-lockup";
import { regenerateLogoImageAction, selectLogoAction } from "../actions";
import LogoConceptCard from "@/components/logos/LogoConceptCard";

export default async function LogosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [conceptSet, meta, system, intake] = await Promise.all([
    getLogoConceptSet(id),
    getProjectMeta(id),
    getBrandSystem(id),
    getIntake(id),
  ]);

  if (!conceptSet) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Logos</h1>
        <p className="text-base text-muted">Logo concepts haven&apos;t been generated for this project yet.</p>
        <Link href={`/project/${id}/generate`} className="text-sm text-accent underline underline-offset-4">
          Go to Generate
        </Link>
      </div>
    );
  }

  const naming = intake
    ? resolveBrandNaming({
        brandName: intake.brandName,
        englishName: intake.englishName,
        englishDescriptor: intake.englishDescriptor,
      })
    : resolveBrandNaming(meta?.name ?? "Brand");

  const fonts = resolveBrandFonts(
    system?.typographySystem.englishPrimary.name,
    system?.typographySystem.arabicPrimary.name
  );

  const lockups = planLockups(naming);

  const cards = await Promise.all(
    conceptSet.concepts.map(async (concept) => {
      const version = await getLogoImageVersion(id, concept.id);
      return {
        concept,
        imageSrc: `/api/projects/${id}/logos/${concept.id}${version ? `?v=${version}` : ""}`,
      };
    })
  );

  return (
    <div className="flex flex-1 flex-col gap-12">
      <div className="flex flex-col gap-3">
        <span className="text-sm text-muted-2">Logos</span>
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Three identity directions
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Choose the visual route that best represents the brand. These are early design
          directions and will be refined into a final identity system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {cards.map(({ concept, imageSrc }) => (
          <LogoConceptCard
            key={concept.id}
            concept={concept}
            imageSrc={imageSrc}
            lockups={lockups}
            fonts={fonts}
            isSelected={meta?.selectedLogoConceptId === concept.id}
            selectAction={selectLogoAction.bind(null, id, concept.id)}
            regenerateAction={regenerateLogoImageAction.bind(null, id, concept.id)}
          />
        ))}
      </div>
    </div>
  );
}

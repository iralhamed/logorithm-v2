import Link from "next/link";
import {
  getStrategy,
  getBrandSystem,
  getLogoConceptSet,
  getProjectMeta,
  getLogoImageVersion,
} from "@/core/persistence";
import { resolveBrandFonts } from "@/lib/brand-fonts";
import { hexToRgbString } from "@/lib/color";
import GuidelineSection from "@/components/guidelines/GuidelineSection";
import Button from "@/components/ui/Button";

export default async function GuidelinesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [strategy, system, conceptSet, meta] = await Promise.all([
    getStrategy(id),
    getBrandSystem(id),
    getLogoConceptSet(id),
    getProjectMeta(id),
  ]);

  if (!system) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Guidelines</h1>
        <p className="text-base text-muted">The brand system hasn&apos;t been generated yet.</p>
        <Link href={`/project/${id}/generate`} className="text-sm text-accent underline underline-offset-4">
          Go to Generate
        </Link>
      </div>
    );
  }

  const concept = conceptSet?.concepts.find((c) => c.id === meta?.selectedLogoConceptId);
  if (!concept) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Guidelines</h1>
        <p className="text-base text-muted">Choose a logo direction before viewing the brand guidelines.</p>
        <Link href={`/project/${id}/logos`} className="text-sm text-accent underline underline-offset-4">
          Choose a logo direction
        </Link>
      </div>
    );
  }

  const version = await getLogoImageVersion(id, concept.id);
  const logoSrc = `/api/projects/${id}/logos/${concept.id}${version ? `?v=${version}` : ""}`;
  const fonts = resolveBrandFonts(
    system.typographySystem.englishPrimary.name,
    system.typographySystem.arabicPrimary.name
  );

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-end gap-4 pb-8">
        <a
          href={`/api/projects/${id}/pdf`}
          className="border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          Export PDF
        </a>
        <Button href={`/project/${id}/brand`} variant="ghost">
          Back to Brand
        </Button>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {/* 1. Cover */}
        <section className="flex flex-col items-center gap-6 border-b border-border py-24 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-2">Brand Guidelines</span>
          <h1 className="font-serif text-6xl italic tracking-tight text-foreground">{meta?.name}</h1>
          <p className="max-w-md text-base leading-relaxed text-muted">{system.messaging.shortDescriptor}</p>
        </section>

        {/* 2. About the Brand */}
        <GuidelineSection index={2} title="About the Brand">
          <p className="text-lg leading-relaxed text-foreground">
            {strategy?.strategicNarrative ?? system.messaging.elevatorPitch}
          </p>
        </GuidelineSection>

        {/* 3. Vision / Mission */}
        <GuidelineSection index={3} title="Vision / Mission">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-2">Vision</span>
              <p className="text-base leading-relaxed text-foreground">{system.strategicFoundation.vision}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-2">Mission</span>
              <p className="text-base leading-relaxed text-foreground">{system.strategicFoundation.mission}</p>
            </div>
          </div>
        </GuidelineSection>

        {/* 4. Brand Essence */}
        <GuidelineSection index={4} title="Brand Essence">
          <p className="font-serif text-3xl italic tracking-tight text-foreground">
            {system.strategicFoundation.essence}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">{system.strategicFoundation.promise}</p>
        </GuidelineSection>

        {/* 5. Logo Concept */}
        <GuidelineSection index={5} title="Logo Concept">
          <div className="flex flex-col gap-4">
            <span className="text-lg text-foreground">{concept.name}</span>
            <p className="text-base leading-relaxed text-muted">{concept.concept}</p>
            <p className="text-sm leading-relaxed text-muted-2">{concept.strategicRationale}</p>
          </div>
        </GuidelineSection>

        {/* 6. Primary Logo */}
        <GuidelineSection index={6} title="Primary Logo">
          <div className="flex aspect-[4/3] w-full items-center justify-center border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route */}
            <img src={logoSrc} alt={`${concept.name} primary logo`} className="h-full w-full object-contain p-12" />
          </div>
        </GuidelineSection>

        {/* 7. Logo Variations */}
        <GuidelineSection index={7} title="Logo Variations">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex aspect-square items-center justify-center border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route */}
              <img src={logoSrc} alt={`${concept.name}, full color`} className="h-full w-full object-contain p-8" />
            </div>
            <div className="flex aspect-square items-center justify-center border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route */}
              <img
                src={logoSrc}
                alt={`${concept.name}, black and white`}
                className="h-full w-full object-contain p-8 grayscale"
              />
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">{concept.wordmarkCompositionPlan}</p>
        </GuidelineSection>

        {/* 8. Clear Space */}
        <GuidelineSection index={8} title="Clear Space">
          <p className="text-base leading-relaxed text-muted">{system.logoStrategy.clearSpaceConcept}</p>
        </GuidelineSection>

        {/* 9. Minimum Size */}
        <GuidelineSection index={9} title="Minimum Size">
          <p className="text-base leading-relaxed text-muted">{concept.smallSizeBehavior}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-2">{system.logoStrategy.scalabilityConsiderations}</p>
        </GuidelineSection>

        {/* 10. Incorrect Usage */}
        <GuidelineSection index={10} title="Incorrect Usage">
          <ul className="flex flex-col gap-2">
            {[...system.logoStrategy.misuseRules, ...concept.avoid].map((rule) => (
              <li key={rule} className="text-sm leading-relaxed text-muted">
                · {rule}
              </li>
            ))}
          </ul>
        </GuidelineSection>

        {/* 11. Color Palette */}
        <GuidelineSection index={11} title="Color Palette">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {system.colorSystem.map((color) => (
              <div key={color.name} className="flex flex-col gap-3">
                <div className="aspect-square w-full border border-border" style={{ backgroundColor: color.hex }} />
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{color.name}</span>
                  <span className="text-xs text-muted-2">{color.role}</span>
                  <span className="font-mono text-xs text-muted-2">{color.hex.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </GuidelineSection>

        {/* 12. Color Usage */}
        <GuidelineSection index={12} title="Color Usage">
          <ul className="flex flex-col gap-4">
            {system.colorSystem.map((color) => (
              <li key={color.name} className="flex flex-col gap-1">
                <span className="text-sm text-foreground">
                  {color.name} <span className="font-mono text-xs text-muted-2">rgb({hexToRgbString(color.hex)})</span>
                </span>
                <span className="text-sm text-muted">{color.usage}</span>
                {color.restrictions && <span className="text-xs text-muted-2">{color.restrictions}</span>}
              </li>
            ))}
          </ul>
        </GuidelineSection>

        {/* 13. Typography */}
        <GuidelineSection index={13} title="Typography">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-2">English — {system.typographySystem.englishPrimary.name}</span>
              <span className={`${fonts.englishClassName} text-5xl text-foreground`} style={{ fontFamily: fonts.englishFamily }}>
                Aa
              </span>
              <p className="text-sm leading-relaxed text-muted">{system.typographySystem.englishPrimary.rationale}</p>
            </div>
            <div className="flex flex-col gap-2" dir="rtl">
              <span className="text-xs text-muted-2" dir="ltr">
                Arabic — {system.typographySystem.arabicPrimary.name}
              </span>
              <span className={`${fonts.arabicClassName} text-5xl text-foreground`} style={{ fontFamily: fonts.arabicFamily }}>
                أب
              </span>
              <p className="text-sm leading-relaxed text-muted">{system.typographySystem.arabicPrimary.rationale}</p>
            </div>
          </div>
        </GuidelineSection>

        {/* 14. Typography Hierarchy */}
        <GuidelineSection index={14} title="Typography Hierarchy">
          <p className="text-base leading-relaxed text-muted">{system.typographySystem.hierarchy}</p>
          <ul className="mt-4 flex flex-col gap-1">
            {system.typographySystem.usageRules.map((rule) => (
              <li key={rule} className="text-sm leading-relaxed text-muted">
                · {rule}
              </li>
            ))}
          </ul>
        </GuidelineSection>

        {/* 15. Voice & Tone */}
        <GuidelineSection index={15} title="Voice & Tone">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              {system.voiceAndTone.characteristics.map((c) => (
                <span key={c.trait} className="border border-border px-3 py-1 text-sm text-foreground">
                  {c.trait}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-foreground">Do</span>
                <ul className="flex flex-col gap-1">
                  {system.voiceAndTone.writingPrinciples.map((p) => (
                    <li key={p} className="text-sm leading-relaxed text-muted">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-foreground">Don&apos;t</span>
                <ul className="flex flex-col gap-1">
                  {system.voiceAndTone.avoid.map((a) => (
                    <li key={a} className="text-sm leading-relaxed text-muted">
                      · {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </GuidelineSection>

        {/* 16. Messaging */}
        <GuidelineSection index={16} title="Messaging">
          <div className="flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-foreground">{system.messaging.elevatorPitch}</p>
            <div className="flex flex-col gap-3">
              {system.messaging.pillars.map((p) => (
                <div key={p.pillar} className="flex flex-col gap-0.5">
                  <span className="text-sm text-foreground">{p.pillar}</span>
                  <span className="text-sm text-muted">{p.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </GuidelineSection>

        {/* 17. Visual Language */}
        <GuidelineSection index={17} title="Visual Language">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Graphic system</span>
              <p className="text-sm leading-relaxed text-muted">{system.visualLanguage.graphicSystem}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Shapes</span>
              <p className="text-sm leading-relaxed text-muted">{system.visualLanguage.shapes}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Composition</span>
              <p className="text-sm leading-relaxed text-muted">{system.visualLanguage.composition}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Imagery</span>
              <p className="text-sm leading-relaxed text-muted">{system.visualLanguage.imagery}</p>
            </div>
          </div>
        </GuidelineSection>
      </div>
    </div>
  );
}

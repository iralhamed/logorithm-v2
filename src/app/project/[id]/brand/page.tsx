import Link from "next/link";
import {
  getBrandSystem,
  getProjectMeta,
  getLogoConceptSet,
  getLogoImageVersion,
} from "@/core/persistence";
import { resolveBrandFonts } from "@/lib/brand-fonts";
import { hexToRgbString } from "@/lib/color";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [system, meta, conceptSet] = await Promise.all([
    getBrandSystem(id),
    getProjectMeta(id),
    getLogoConceptSet(id),
  ]);

  if (!system) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Brand</h1>
        <p className="text-base text-muted">The brand system hasn&apos;t been generated yet.</p>
        <Link href={`/project/${id}/generate`} className="text-sm text-accent underline underline-offset-4">
          Go to Generate
        </Link>
      </div>
    );
  }

  const selectedConcept = conceptSet?.concepts.find((c) => c.id === meta?.selectedLogoConceptId);
  const version = selectedConcept ? await getLogoImageVersion(id, selectedConcept.id) : null;
  const logoSrc = selectedConcept
    ? `/api/projects/${id}/logos/${selectedConcept.id}${version ? `?v=${version}` : ""}`
    : null;

  const fonts = resolveBrandFonts(
    system.typographySystem.englishPrimary.name,
    system.typographySystem.arabicPrimary.name
  );

  return (
    <div className="flex w-full max-w-3xl flex-col gap-16">
      <div className="flex flex-col gap-3">
        <span className="text-sm text-muted-2">Brand</span>
        <h1 className="font-serif text-5xl italic tracking-tight text-foreground">
          {system.strategicFoundation.essence}
        </h1>
      </div>

      <div className="flex flex-col gap-8">
        <Section label="Brand Foundation">
          <div className="flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-foreground">{system.strategicFoundation.essence}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-foreground">Positioning</span>
                <p className="text-sm leading-relaxed text-muted">{system.strategicFoundation.positioning}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-foreground">Vision</span>
                <p className="text-sm leading-relaxed text-muted">{system.strategicFoundation.vision}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-foreground">Mission</span>
                <p className="text-sm leading-relaxed text-muted">{system.strategicFoundation.mission}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-foreground">Values</span>
                <p className="text-sm leading-relaxed text-muted">
                  {system.strategicFoundation.values.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section label="Selected Logo">
          {selectedConcept && logoSrc ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-muted-2">Primary</span>
                  <div className="flex aspect-square items-center justify-center border border-border bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route */}
                    <img src={logoSrc} alt={`${selectedConcept.name} logo`} className="h-full w-full object-contain p-8" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-muted-2">Black &amp; white preview</span>
                  <div className="flex aspect-square items-center justify-center border border-border bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route */}
                    <img
                      src={logoSrc}
                      alt={`${selectedConcept.name} logo, black and white preview`}
                      className="h-full w-full object-contain p-8 grayscale"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base text-foreground">{selectedConcept.name}</span>
                <p className="text-sm leading-relaxed text-muted">{selectedConcept.concept}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted">No logo direction has been selected yet.</p>
              <Link href={`/project/${id}/logos`} className="text-sm text-accent underline underline-offset-4">
                Choose a logo direction
              </Link>
            </div>
          )}
        </Section>

        <Section label="Colors">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {system.colorSystem.map((color) => (
              <div key={color.name} className="flex gap-4">
                <div
                  className="h-16 w-16 shrink-0 border border-border"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-foreground">
                    {color.name} <span className="text-muted-2">— {color.role}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-2">
                    {color.hex.toUpperCase()} · rgb({hexToRgbString(color.hex)})
                  </span>
                  <p className="text-xs leading-relaxed text-muted">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Typography">
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-2">English — {system.typographySystem.englishPrimary.name}</span>
                <span className={`${fonts.englishClassName} text-4xl text-foreground`} style={{ fontFamily: fonts.englishFamily }}>
                  Aa Bb Cc
                </span>
                <p className="text-sm leading-relaxed text-muted">{system.typographySystem.englishPrimary.rationale}</p>
              </div>
              <div className="flex flex-col gap-2" dir="rtl">
                <span className="text-xs text-muted-2" dir="ltr">
                  Arabic — {system.typographySystem.arabicPrimary.name}
                </span>
                <span className={`${fonts.arabicClassName} text-4xl text-foreground`} style={{ fontFamily: fonts.arabicFamily }}>
                  أ ب ت ث
                </span>
                <p className="text-sm leading-relaxed text-muted">{system.typographySystem.arabicPrimary.rationale}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Hierarchy</span>
              <p className="text-sm leading-relaxed text-muted">{system.typographySystem.hierarchy}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Usage rules</span>
              <ul className="flex flex-col gap-1">
                {system.typographySystem.usageRules.map((rule) => (
                  <li key={rule} className="text-sm leading-relaxed text-muted">
                    · {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section label="Voice & Tone">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-3">
              {system.voiceAndTone.characteristics.map((c) => (
                <span key={c.trait} className="border border-border px-3 py-1 text-sm text-foreground" title={c.explanation}>
                  {c.trait}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
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
            {system.voiceAndTone.exampleTransformations.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="text-sm text-foreground">Example messaging</span>
                {system.voiceAndTone.exampleTransformations.map((ex) => (
                  <div key={ex.before} className="flex flex-col gap-1 border-l-2 border-border pl-4">
                    <span className="text-sm text-muted-2 line-through">{ex.before}</span>
                    <span className="text-sm text-foreground">{ex.after}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section label="Messaging">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Short descriptor</span>
              <p className="text-base leading-relaxed text-muted">{system.messaging.shortDescriptor}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Value proposition</span>
              <p className="text-base leading-relaxed text-muted">{system.messaging.valueProposition}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-foreground">Elevator pitch</span>
              <p className="text-base leading-relaxed text-muted">{system.messaging.elevatorPitch}</p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-foreground">Pillars</span>
              <ul className="flex flex-col gap-3">
                {system.messaging.pillars.map((p) => (
                  <li key={p.pillar} className="flex flex-col gap-0.5">
                    <span className="text-sm text-foreground">{p.pillar}</span>
                    <span className="text-sm text-muted">{p.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-8">
        <Link href={`/project/${id}/logos`} className="text-sm text-muted transition-colors hover:text-foreground">
          Back to Logos
        </Link>
        <Button href={`/project/${id}/guidelines`} variant="primary">
          View Guidelines
        </Button>
      </div>
    </div>
  );
}

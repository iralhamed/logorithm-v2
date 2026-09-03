import Link from "next/link";
import { getStrategy } from "@/core/persistence";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";

export default async function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const strategy = await getStrategy(id);

  if (!strategy) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Strategy</h1>
        <p className="text-base text-muted">Strategy hasn&apos;t been generated for this project yet.</p>
        <Link href={`/project/${id}/generate`} className="text-sm text-accent underline underline-offset-4">
          Go to Generate
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-16">
      <div className="flex flex-col gap-3">
        <span className="text-sm text-muted-2">Strategy</span>
        <h1 className="font-serif text-5xl italic tracking-tight text-foreground">{strategy.essence}</h1>
      </div>

      <div className="flex flex-col gap-8">
        <Section label="About">
          <p className="text-lg leading-relaxed text-foreground">{strategy.strategicNarrative}</p>
        </Section>

        <Section label="Positioning">
          <p className="text-base leading-relaxed text-muted">{strategy.positioning}</p>
        </Section>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Section label="Purpose">
            <p className="text-base leading-relaxed text-muted">{strategy.purpose}</p>
          </Section>
          <Section label="Promise">
            <p className="text-base leading-relaxed text-muted">{strategy.promise}</p>
          </Section>
          <Section label="Vision">
            <p className="text-base leading-relaxed text-muted">{strategy.vision}</p>
          </Section>
          <Section label="Mission">
            <p className="text-base leading-relaxed text-muted">{strategy.mission}</p>
          </Section>
        </div>

        <Section label="Values">
          <ul className="flex flex-col gap-4">
            {strategy.coreValues.map((v) => (
              <li key={v.value} className="flex flex-col gap-1">
                <span className="text-base text-foreground">{v.value}</span>
                <span className="text-sm text-muted">{v.explanation}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section label="Audience Insight">
          <p className="text-base leading-relaxed text-muted">{strategy.audienceInsight}</p>
        </Section>

        <Section label="Personality">
          <div className="flex flex-wrap gap-3">
            {strategy.personality.map((trait) => (
              <span key={trait} className="border border-border px-3 py-1 text-sm text-foreground">
                {trait}
              </span>
            ))}
          </div>
        </Section>

        <Section label="Archetype">
          <div className="flex flex-col gap-2">
            <span className="text-lg text-foreground">
              {strategy.archetype.primary}
              {strategy.archetype.secondary ? ` + ${strategy.archetype.secondary}` : ""}
            </span>
            <p className="text-sm leading-relaxed text-muted">{strategy.archetype.blendRationale}</p>
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-8">
        <Link href={`/project/${id}/intake`} className="text-sm text-muted transition-colors hover:text-foreground">
          Back to Intake
        </Link>
        <Button href={`/project/${id}/logos`} variant="primary">
          Continue
        </Button>
      </div>
    </div>
  );
}

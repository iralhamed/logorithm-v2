"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LockupPreview from "@/components/logos/LockupPreview";
import type { LogoConcept } from "@/core/schemas";
import type { ResolvedBrandFonts } from "@/lib/brand-fonts";
import type { LockupPlan } from "@/lib/logo-lockup";

const CATEGORY_LABEL: Record<LogoConcept["category"], string> = {
  symbolic: "Symbolic",
  structural: "Structural",
  typographic: "Typographic",
};

export default function LogoConceptCard({
  concept,
  imageSrc,
  lockups,
  fonts,
  isSelected,
  selectAction,
  regenerateAction,
}: {
  concept: LogoConcept;
  imageSrc: string;
  lockups: LockupPlan[];
  fonts: ResolvedBrandFonts;
  isSelected: boolean;
  selectAction: () => Promise<void>;
  regenerateAction: () => Promise<void>;
}) {
  const router = useRouter();
  const [isRegenerating, startRegenerate] = useTransition();
  const [isSelecting, startSelect] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRegenerate() {
    setError(null);
    startRegenerate(async () => {
      try {
        await regenerateAction();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not regenerate this direction.");
      }
    });
  }

  function handleSelect() {
    setError(null);
    startSelect(async () => {
      try {
        await selectAction();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not select this direction.");
      }
    });
  }

  return (
    <div
      className={`flex flex-col gap-6 border p-6 transition-colors ${
        isSelected ? "border-accent" : "border-border"
      }`}
    >
      {/* The generated image is the MARK only. The wordmark previews below are
          rendered by the app in real fonts, never AI-generated lettering. */}
      <div className="flex aspect-square w-full items-center justify-center border border-border bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route, not a static asset */}
        <img
          src={imageSrc}
          alt={`${concept.name} logo symbol`}
          className="h-full w-full object-contain p-6"
        />
      </div>

      <div className="flex flex-col gap-3">
        {lockups.map((plan) => (
          <LockupPreview
            key={plan.mode}
            plan={plan}
            symbolSrc={imageSrc}
            symbolAlt={`${concept.name} symbol`}
            fonts={fonts}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-2">
          <span>{CATEGORY_LABEL[concept.category]}</span>
        </div>
        <h3 className="font-serif text-2xl tracking-tight text-foreground">{concept.name}</h3>
        <p className="text-sm leading-relaxed text-muted">{concept.concept}</p>
        <p className="text-sm leading-relaxed text-muted-2">{concept.strategicRationale}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
        <Button variant={isSelected ? "secondary" : "primary"} disabled={isSelecting} onClick={handleSelect}>
          {isSelected ? "Selected" : isSelecting ? "Selecting…" : "Select this direction"}
        </Button>
        <Button variant="ghost" disabled={isRegenerating} onClick={handleRegenerate}>
          {isRegenerating ? "Regenerating…" : "Regenerate this direction"}
        </Button>
      </div>
    </div>
  );
}

import type { ResolvedBrandFonts } from "@/lib/brand-fonts";
import type { LockupPlan, LockupText } from "@/lib/logo-lockup";

/**
 * The Wordmark Composer's render surface. It pairs the GENERATED SYMBOL IMAGE
 * (the mark only) with brand-name text rendered by the application in real
 * fonts — never AI-generated lettering. Arabic keeps `dir="rtl"` and its real
 * Arabic typeface; English uses the real Latin typeface. Descriptors are shown
 * as clearly-secondary text, never as the brand name.
 */
function WordmarkText({
  value,
  fonts,
  size,
}: {
  value: LockupText;
  fonts: ResolvedBrandFonts;
  size: "primary" | "secondary";
}) {
  const isArabic = value.dir === "rtl";
  const fontClass = isArabic ? fonts.arabicClassName : fonts.englishClassName;
  const fontFamily = isArabic ? fonts.arabicFamily : fonts.englishFamily;

  return (
    <span
      dir={value.dir}
      className={`${fontClass} ${
        size === "primary"
          ? "text-xl leading-none text-foreground"
          : "text-xs uppercase tracking-wide text-muted-2"
      }`}
      style={{ fontFamily }}
    >
      {value.text}
    </span>
  );
}

export default function LockupPreview({
  plan,
  symbolSrc,
  symbolAlt,
  fonts,
}: {
  plan: LockupPlan;
  symbolSrc: string;
  symbolAlt: string;
  fonts: ResolvedBrandFonts;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.7rem] uppercase tracking-wide text-muted-2">{plan.label}</span>
      <div className="flex min-h-16 items-center gap-4 border border-border bg-surface px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic API route, not a static asset */}
        <img src={symbolSrc} alt={symbolAlt} className="h-10 w-10 shrink-0 object-contain" />
        {plan.mode !== "symbol" && plan.primary && (
          <span className="flex min-w-0 flex-col gap-1">
            <WordmarkText value={plan.primary} fonts={fonts} size="primary" />
            {plan.secondary && <WordmarkText value={plan.secondary} fonts={fonts} size="secondary" />}
          </span>
        )}
        {plan.mode === "symbol" && (
          <span className="text-xs text-muted-2">Mark only — no wordmark</span>
        )}
      </div>
    </div>
  );
}

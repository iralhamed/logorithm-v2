import type { BrandNaming } from "@/core/services/resolve-brand-naming";

export type LockupMode = "symbol" | "arabic" | "english" | "bilingual";

export interface LockupText {
  /** The brand-name text, in real characters. Empty for the symbol-only lockup. */
  text: string;
  /** True when this string is only a descriptor, not the brand name itself. */
  isDescriptor: boolean;
  dir: "rtl" | "ltr";
}

export interface LockupPlan {
  mode: LockupMode;
  label: string;
  primary?: LockupText;
  secondary?: LockupText;
}

/**
 * Decides which real-type lockups the Wordmark Composer should render for a
 * brand, from the resolved naming. Never fabricates an English name: if there is
 * no real English brand name, English is shown only when a descriptor exists,
 * and always as clearly-secondary text.
 */
export function planLockups(naming: BrandNaming): LockupPlan[] {
  const plans: LockupPlan[] = [{ mode: "symbol", label: "Symbol" }];

  const arabic: LockupText | undefined = naming.arabic
    ? { text: naming.arabic, isDescriptor: false, dir: "rtl" }
    : undefined;

  const english: LockupText | undefined = naming.hasRealEnglishName && naming.english
    ? { text: naming.english, isDescriptor: false, dir: "ltr" }
    : naming.englishDescriptor
      ? { text: naming.englishDescriptor, isDescriptor: true, dir: "ltr" }
      : undefined;

  if (arabic) {
    plans.push({ mode: "arabic", label: "Arabic lockup", primary: arabic });
  }

  // A real English brand name gets its own lockup; a bare descriptor does not.
  if (english && !english.isDescriptor) {
    plans.push({ mode: "english", label: "English lockup", primary: english });
  }

  // Bilingual only makes sense when there is a real second script to pair.
  if (arabic && english) {
    const arabicLeads = naming.primaryScript === "arabic";
    plans.push({
      mode: "bilingual",
      label: english.isDescriptor ? "Bilingual lockup (English descriptor)" : "Bilingual lockup",
      primary: arabicLeads ? arabic : english,
      secondary: arabicLeads ? english : arabic,
    });
  }

  return plans;
}

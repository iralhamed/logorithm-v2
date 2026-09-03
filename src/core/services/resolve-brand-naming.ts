export interface BrandNaming {
  raw: string;
  /** Present only when the brand name (or part of it) contains Arabic script. */
  arabic?: string;
  /**
   * A REAL Latin/English brand name — supplied by the client, either as an
   * explicit English name or as the parenthetical in an "Arabic (English)"
   * brand name. Never a machine transliteration.
   */
  english?: string;
  /** A plain English descriptor of the organization. Secondary lockup text only — never the brand name. */
  englishDescriptor?: string;
  /** Which script the primary wordmark should be built from. */
  primaryScript: "arabic" | "english";
  /** Always safe to render as a heading: english ?? arabic ?? raw. */
  displayName: string;
  /** True only when `english` came from real client input, not a guess. */
  hasRealEnglishName: boolean;
}

const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const LATIN_RANGE = /[A-Za-z]/;

export interface BrandNamingInput {
  brandName: string;
  englishName?: string;
  englishDescriptor?: string;
}

/**
 * Resolves the Arabic and English forms of a brand name WITHOUT ever inventing a
 * transliteration. Rules (see Part 4 of the logo-engine spec):
 *   1. If the client provided an explicit English name, use it.
 *   2. Else, if the brand name is written "Arabic (English)" / "English (Arabic)",
 *      treat the Latin parenthetical as a real English name.
 *   3. Otherwise keep the Arabic name as the primary brand name and expose only
 *      an optional English descriptor as separate secondary text.
 */
export function resolveBrandNaming(input: string | BrandNamingInput): BrandNaming {
  const { brandName, englishName, englishDescriptor }: BrandNamingInput =
    typeof input === "string" ? { brandName: input } : input;

  const raw = brandName.trim();
  const explicitEnglish = englishName?.trim() || undefined;
  const descriptor = englishDescriptor?.trim() || undefined;

  let arabic: string | undefined;
  let parentheticalEnglish: string | undefined;
  let bareName = raw;

  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    const [, first, second] = match;
    const firstIsArabic = ARABIC_RANGE.test(first);
    const secondIsArabic = ARABIC_RANGE.test(second);
    if (firstIsArabic && !secondIsArabic) {
      arabic = first.trim();
      parentheticalEnglish = LATIN_RANGE.test(second) ? second.trim() : undefined;
      bareName = arabic;
    } else if (secondIsArabic && !firstIsArabic) {
      arabic = second.trim();
      parentheticalEnglish = LATIN_RANGE.test(first) ? first.trim() : undefined;
      bareName = arabic;
    }
  }

  if (!arabic && ARABIC_RANGE.test(raw)) {
    arabic = raw;
  }

  // A real English name: explicit input wins, then a Latin parenthetical.
  const english = explicitEnglish ?? parentheticalEnglish;
  const hasRealEnglishName = Boolean(english);

  // If the whole bare name is Latin and we have no Arabic, that Latin name IS the English name.
  const latinOnly = !arabic && LATIN_RANGE.test(bareName);
  const resolvedEnglish = english ?? (latinOnly ? bareName : undefined);

  const primaryScript: BrandNaming["primaryScript"] = arabic ? "arabic" : "english";
  const displayName = resolvedEnglish ?? arabic ?? raw;

  return {
    raw,
    arabic,
    english: resolvedEnglish,
    englishDescriptor: descriptor,
    primaryScript,
    displayName,
    hasRealEnglishName: hasRealEnglishName || latinOnly,
  };
}

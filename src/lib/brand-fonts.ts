import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  Noto_Sans,
  Noto_Sans_Arabic,
  Cairo,
  Tajawal,
} from "next/font/google";

/**
 * The AI names a typeface in free text (e.g. "IBM Plex Sans"), but next/font/google
 * requires statically-known imports at build time — it can't load an arbitrary font
 * name chosen at runtime. So we preload a small set of real, professional,
 * Arabic-capable Google Font families and match the AI's chosen name against them,
 * falling back to a solid default pair. This guarantees the web UI always renders
 * real fonts (never AI-generated lettering) for both scripts.
 */
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-en-plex",
});
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-ar-plex",
});
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-en-noto",
});
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-ar-noto",
});
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-cairo",
});
const tajawal = Tajawal({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-brand-tajawal",
});

export interface ResolvedBrandFonts {
  englishClassName: string;
  englishFamily: string;
  arabicClassName: string;
  arabicFamily: string;
}

function matchLatin(name: string | undefined) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("noto")) return notoSans;
  if (n.includes("cairo")) return cairo;
  if (n.includes("tajawal")) return tajawal;
  return ibmPlexSans;
}

function matchArabic(name: string | undefined) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("noto")) return notoSansArabic;
  if (n.includes("cairo")) return cairo;
  if (n.includes("tajawal")) return tajawal;
  return ibmPlexSansArabic;
}

/** Resolves the brand's chosen typeface names to a real, loadable font pair. */
export function resolveBrandFonts(englishName?: string, arabicName?: string): ResolvedBrandFonts {
  const latin = matchLatin(englishName);
  const arabic = matchArabic(arabicName ?? englishName);

  return {
    englishClassName: latin.className,
    englishFamily: latin.style.fontFamily,
    arabicClassName: arabic.className,
    arabicFamily: arabic.style.fontFamily,
  };
}

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { Font } from "@react-pdf/renderer";

/**
 * @react-pdf/renderer needs real font files (TTF), not a CSS/webfont reference.
 * Google's CSS2 endpoint serves WOFF2 by default (content-negotiated by
 * User-Agent) and only serves TTF to older browsers — this is the standard
 * trick to get a direct TTF URL out of it. Fonts are cached to a temp file so
 * repeat PDF exports in the same server process don't re-fetch.
 */
const LEGACY_UA =
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

const FONT_CACHE_DIR = path.join(os.tmpdir(), "logorithm-pdf-fonts");

async function fetchGoogleFontTtfUrl(family: string, weight: string): Promise<string> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const res = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS for "${family}" (${res.status})`);
  }
  const css = await res.text();
  const match = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
  if (!match) {
    throw new Error(`No TTF URL found in Google Fonts CSS for "${family}"`);
  }
  return match[1];
}

async function ensureFontFile(family: string, weight: string): Promise<string> {
  const safeName = `${family}-${weight}`.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  const filePath = path.join(FONT_CACHE_DIR, `${safeName}.ttf`);

  try {
    await access(filePath);
    return filePath;
  } catch {
    // not cached yet
  }

  const ttfUrl = await fetchGoogleFontTtfUrl(family, weight);
  const fontRes = await fetch(ttfUrl);
  if (!fontRes.ok) {
    throw new Error(`Failed to download font file for "${family}"`);
  }
  const buffer = Buffer.from(await fontRes.arrayBuffer());

  await mkdir(FONT_CACHE_DIR, { recursive: true });
  await writeFile(filePath, buffer);
  return filePath;
}

function matchGoogleFamily(name: string | undefined, kind: "latin" | "arabic"): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("noto")) return kind === "arabic" ? "Noto Sans Arabic" : "Noto Sans";
  if (n.includes("cairo")) return "Cairo";
  if (n.includes("tajawal")) return "Tajawal";
  return kind === "arabic" ? "IBM Plex Sans Arabic" : "IBM Plex Sans";
}

const PDF_ENGLISH_FONT_FAMILY = "BrandEnglish";
const PDF_ARABIC_FONT_FAMILY = "BrandArabic";

/** react-pdf's 14 built-in standard fonts need no registration — used as a fallback. */
const FALLBACK_LATIN_FAMILY = "Helvetica";
const FALLBACK_ARABIC_FAMILY = "Helvetica";

export interface PdfFontFamilies {
  englishFamily: string;
  englishBold: boolean;
  arabicFamily: string;
}

let hyphenationDisabled = false;

/**
 * Registers real, downloaded Google Fonts for the given brand typeface names
 * under fixed family names the returned value tells the document to use.
 * Falls back to the built-in Helvetica if fonts can't be fetched (e.g. no
 * network) so PDF export never hard-fails — Arabic glyphs won't render
 * correctly in that fallback case, since Helvetica has no Arabic glyphs.
 */
export async function registerBrandFontsForPdf(
  englishName?: string,
  arabicName?: string
): Promise<PdfFontFamilies> {
  if (!hyphenationDisabled) {
    // Default hyphenation inserts breaks mid-word; wrong for both scripts here.
    Font.registerHyphenationCallback((word) => [word]);
    hyphenationDisabled = true;
  }

  const englishFamily = matchGoogleFamily(englishName, "latin");
  const arabicFamily = matchGoogleFamily(arabicName ?? englishName, "arabic");

  let englishOk = true;
  try {
    const [regular, bold] = await Promise.all([
      ensureFontFile(englishFamily, "400"),
      ensureFontFile(englishFamily, "700"),
    ]);
    Font.register({
      family: PDF_ENGLISH_FONT_FAMILY,
      fonts: [
        { src: regular, fontWeight: 400 },
        { src: bold, fontWeight: 700 },
      ],
    });
  } catch {
    englishOk = false;
  }

  let arabicOk = true;
  try {
    const arabicPath = await ensureFontFile(arabicFamily, "400");
    Font.register({ family: PDF_ARABIC_FONT_FAMILY, src: arabicPath });
  } catch {
    arabicOk = false;
  }

  return {
    englishFamily: englishOk ? PDF_ENGLISH_FONT_FAMILY : FALLBACK_LATIN_FAMILY,
    englishBold: englishOk,
    arabicFamily: arabicOk ? PDF_ARABIC_FONT_FAMILY : FALLBACK_ARABIC_FAMILY,
  };
}

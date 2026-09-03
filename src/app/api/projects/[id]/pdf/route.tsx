import { readFile } from "node:fs/promises";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  getStrategy,
  getBrandSystem,
  getLogoConceptSet,
  getProjectMeta,
  getLogoImagePath,
} from "@/core/persistence";
import { registerBrandFontsForPdf } from "@/core/pdf/google-fonts";
import GuidelinesDocument from "@/components/pdf/GuidelinesDocument";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [meta, strategy, system, conceptSet] = await Promise.all([
    getProjectMeta(id),
    getStrategy(id),
    getBrandSystem(id),
    getLogoConceptSet(id),
  ]);

  if (!meta || !system) {
    return new Response("This project doesn't have a generated brand system yet.", { status: 400 });
  }

  const concept = conceptSet?.concepts.find((c) => c.id === meta.selectedLogoConceptId);
  if (!concept) {
    return new Response("Choose a logo direction before exporting guidelines.", { status: 400 });
  }

  const imagePath = await getLogoImagePath(id, concept.id);
  if (!imagePath) {
    return new Response("The selected logo's image file is missing.", { status: 400 });
  }
  const logoImageBuffer = await readFile(imagePath);

  const fonts = await registerBrandFontsForPdf(
    system.typographySystem.englishPrimary.name,
    system.typographySystem.arabicPrimary.name
  );

  const pdfBuffer = await renderToBuffer(
    <GuidelinesDocument
      brandName={meta.name}
      strategy={strategy}
      system={system}
      concept={concept}
      logoImageBuffer={logoImageBuffer}
      fonts={fonts}
    />
  );

  const safeName = meta.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${safeName || "brand"}-guidelines.pdf"`,
      "cache-control": "no-store",
    },
  });
}

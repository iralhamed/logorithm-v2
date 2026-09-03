import { readFile } from "node:fs/promises";
import { getLogoImagePath } from "@/core/persistence";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; conceptId: string }> }
) {
  const { id, conceptId } = await params;

  const filePath = await getLogoImagePath(id, conceptId);
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readFile(filePath);
  return new Response(buffer, {
    headers: {
      "content-type": "image/png",
      "cache-control": "no-store",
    },
  });
}

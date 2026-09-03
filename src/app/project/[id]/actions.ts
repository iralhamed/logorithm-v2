"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BrandIntakeSchema } from "@/core/schemas";
import { normalizeIntake, generateLogoImage } from "@/core/services";
import { getImageProvider } from "@/core/providers";
import {
  saveIntake,
  requireProjectMeta,
  updateProjectMeta,
  getLogoConceptSet,
  saveLogoImage,
  saveLogoCriticReport,
} from "@/core/persistence";
import { runLogoCritic } from "@/core/validators";
import { mapIntakeFormToBrandIntake } from "@/lib/intake-mapping";
import type { IntakeValues } from "@/types/intake";

/** Bind with `.bind(null, id)` on a `<form action={...}>`. */
export async function saveIntakeAction(id: string, formData: FormData): Promise<void> {
  const values: IntakeValues = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }

  const mapped = mapIntakeFormToBrandIntake(values);
  const parsed = BrandIntakeSchema.parse(mapped);
  const intake = normalizeIntake(parsed);

  await saveIntake(id, intake);
  const meta = await requireProjectMeta(id);
  if (intake.brandName && intake.brandName !== meta.name) {
    await updateProjectMeta(id, { name: intake.brandName });
  }

  redirect(`/project/${id}/generate`);
}

/** Bind with `.bind(null, id, conceptId)`. Regenerates ONE concept's exploration
 * image only — no text-model call, no touching the other two images. */
export async function regenerateLogoImageAction(id: string, conceptId: string): Promise<void> {
  const conceptSet = await getLogoConceptSet(id);
  if (!conceptSet) throw new Error("This project has no saved logo concepts yet.");

  const concept = conceptSet.concepts.find((c) => c.id === conceptId);
  if (!concept) throw new Error(`Unknown concept id "${conceptId}".`);

  const imageProvider = getImageProvider();
  const buffer = await generateLogoImage(concept, imageProvider);
  await saveLogoImage(id, conceptId, buffer);

  // Concept data is unchanged by an image re-render, but keep the stored critic
  // report fresh so it never drifts from what's on disk.
  await saveLogoCriticReport(id, runLogoCritic(conceptSet));

  revalidatePath(`/project/${id}/logos`);
}

/** Bind with `.bind(null, id, conceptId)`. */
export async function selectLogoAction(id: string, conceptId: string): Promise<void> {
  const conceptSet = await getLogoConceptSet(id);
  if (!conceptSet?.concepts.some((c) => c.id === conceptId)) {
    throw new Error(`Unknown concept id "${conceptId}".`);
  }

  await updateProjectMeta(id, { selectedLogoConceptId: conceptId });
  redirect(`/project/${id}/brand`);
}

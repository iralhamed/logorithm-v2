"use server";

import { redirect } from "next/navigation";
import { createProject } from "@/core/persistence";

/** Creates a new, empty brand project and sends the user straight into intake. */
export async function createProjectAction(): Promise<void> {
  const project = await createProject();
  redirect(`/project/${project.id}/intake`);
}

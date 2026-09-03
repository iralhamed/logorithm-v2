import { mkdir, readFile, writeFile, readdir, access, stat } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { z } from "zod";
import {
  BrandIntakeSchema,
  type BrandIntake,
  IntakeEvaluationSchema,
  type IntakeEvaluation,
  BrandStrategySchema,
  type BrandStrategy,
  CreativeDirectionSchema,
  type CreativeDirection,
  BrandSystemSchema,
  type BrandSystem,
  LogoConceptSetSchema,
  type LogoConceptSet,
  LogoResearchSchema,
  type LogoResearch,
  LogoCriticReportSchema,
  type LogoCriticReport,
  LogoQualityReportSchema,
  type LogoQualityReport,
} from "@/core/schemas";

const DATA_ROOT = path.join(process.cwd(), "data", "projects");

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  selectedLogoConceptId?: string;
}

export interface ProjectStatus {
  hasIntake: boolean;
  hasStrategy: boolean;
  hasCreativeDirection: boolean;
  hasBrandSystem: boolean;
  hasLogoConcepts: boolean;
  hasLogoImages: boolean;
  hasLogoQualityReport: boolean;
  hasSelectedLogo: boolean;
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project "${id}" does not exist.`);
    this.name = "ProjectNotFoundError";
  }
}

/** Guards against path traversal from a URL-supplied id — ids are always our own slugs. */
function assertValidId(id: string): void {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,60})$/i.test(id)) {
    throw new Error(`Invalid project id: "${id}"`);
  }
}

function projectDir(id: string): string {
  assertValidId(id);
  return path.join(DATA_ROOT, id);
}

function logosDir(id: string): string {
  return path.join(projectDir(id), "logos");
}

function metaPath(id: string): string {
  return path.join(projectDir(id), "meta.json");
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJsonRaw<T>(filePath: string): Promise<T | null> {
  if (!(await pathExists(filePath))) return null;
  return JSON.parse(await readFile(filePath, "utf-8")) as T;
}

async function readZod<T>(filePath: string, schema: z.ZodType<T>): Promise<T | null> {
  if (!(await pathExists(filePath))) return null;
  const raw = JSON.parse(await readFile(filePath, "utf-8"));
  const parsed = schema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// ---------------------------------------------------------------------------
// Project lifecycle
// ---------------------------------------------------------------------------

export async function createProject(name = "Untitled Brand"): Promise<ProjectMeta> {
  const base = slugify(name) || "brand";
  const id = `${base}-${crypto.randomBytes(3).toString("hex")}`;
  const now = new Date().toISOString();
  const meta: ProjectMeta = { id, name, createdAt: now, updatedAt: now };
  await writeJson(metaPath(id), meta);
  return meta;
}

export async function getProjectMeta(id: string): Promise<ProjectMeta | null> {
  return readJsonRaw<ProjectMeta>(metaPath(id));
}

export async function requireProjectMeta(id: string): Promise<ProjectMeta> {
  const meta = await getProjectMeta(id);
  if (!meta) throw new ProjectNotFoundError(id);
  return meta;
}

export async function updateProjectMeta(
  id: string,
  patch: Partial<Omit<ProjectMeta, "id" | "createdAt">>
): Promise<ProjectMeta> {
  const current = await requireProjectMeta(id);
  const next: ProjectMeta = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(metaPath(id), next);
  return next;
}

export async function listProjects(): Promise<ProjectMeta[]> {
  let entries: string[];
  try {
    entries = await readdir(DATA_ROOT);
  } catch {
    return [];
  }

  const metas = await Promise.all(
    entries.map(async (id) => {
      try {
        return await getProjectMeta(id);
      } catch {
        return null;
      }
    })
  );

  return metas
    .filter((m): m is ProjectMeta => m !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ---------------------------------------------------------------------------
// Pipeline artifacts
// ---------------------------------------------------------------------------

export async function saveIntake(id: string, intake: BrandIntake): Promise<void> {
  await writeJson(path.join(projectDir(id), "intake.json"), intake);
}
export async function getIntake(id: string): Promise<BrandIntake | null> {
  return readZod(path.join(projectDir(id), "intake.json"), BrandIntakeSchema);
}

export async function saveEvaluation(id: string, evaluation: IntakeEvaluation): Promise<void> {
  await writeJson(path.join(projectDir(id), "evaluation.json"), evaluation);
}
export async function getEvaluation(id: string): Promise<IntakeEvaluation | null> {
  return readZod(path.join(projectDir(id), "evaluation.json"), IntakeEvaluationSchema);
}

export async function saveStrategy(id: string, strategy: BrandStrategy): Promise<void> {
  await writeJson(path.join(projectDir(id), "strategy.json"), strategy);
}
export async function getStrategy(id: string): Promise<BrandStrategy | null> {
  return readZod(path.join(projectDir(id), "strategy.json"), BrandStrategySchema);
}

export async function saveCreativeDirection(id: string, creative: CreativeDirection): Promise<void> {
  await writeJson(path.join(projectDir(id), "creative-direction.json"), creative);
}
export async function getCreativeDirection(id: string): Promise<CreativeDirection | null> {
  return readZod(path.join(projectDir(id), "creative-direction.json"), CreativeDirectionSchema);
}

export async function saveBrandSystem(id: string, system: BrandSystem): Promise<void> {
  await writeJson(path.join(projectDir(id), "brand-system.json"), system);
}
export async function getBrandSystem(id: string): Promise<BrandSystem | null> {
  return readZod(path.join(projectDir(id), "brand-system.json"), BrandSystemSchema);
}

export async function saveLogoResearch(id: string, research: LogoResearch): Promise<void> {
  await writeJson(path.join(logosDir(id), "research.json"), research);
}
export async function getLogoResearch(id: string): Promise<LogoResearch | null> {
  return readZod(path.join(logosDir(id), "research.json"), LogoResearchSchema);
}

export async function saveLogoConceptSet(id: string, conceptSet: LogoConceptSet): Promise<void> {
  await writeJson(path.join(logosDir(id), "concepts.json"), conceptSet);
}
export async function getLogoConceptSet(id: string): Promise<LogoConceptSet | null> {
  return readZod(path.join(logosDir(id), "concepts.json"), LogoConceptSetSchema);
}

export async function saveLogoCriticReport(id: string, report: LogoCriticReport): Promise<void> {
  await writeJson(path.join(logosDir(id), "critic-report.json"), report);
}
export async function getLogoCriticReport(id: string): Promise<LogoCriticReport | null> {
  return readZod(path.join(logosDir(id), "critic-report.json"), LogoCriticReportSchema);
}

export async function saveLogoQualityReport(id: string, report: LogoQualityReport): Promise<void> {
  await writeJson(path.join(logosDir(id), "quality-report.json"), report);
}
export async function getLogoQualityReport(id: string): Promise<LogoQualityReport | null> {
  return readZod(path.join(logosDir(id), "quality-report.json"), LogoQualityReportSchema);
}

// ---------------------------------------------------------------------------
// Logo images
// ---------------------------------------------------------------------------

function logoImagePath(id: string, conceptId: string): string {
  if (!/^[a-z0-9-]+$/i.test(conceptId)) {
    throw new Error(`Invalid concept id: "${conceptId}"`);
  }
  return path.join(logosDir(id), `${conceptId}.png`);
}

export async function saveLogoImage(id: string, conceptId: string, buffer: Buffer): Promise<void> {
  const filePath = logoImagePath(id, conceptId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}

export async function getLogoImagePath(id: string, conceptId: string): Promise<string | null> {
  const filePath = logoImagePath(id, conceptId);
  return (await pathExists(filePath)) ? filePath : null;
}

/** File mtime in ms, used purely as a cache-busting query value after regeneration. */
export async function getLogoImageVersion(id: string, conceptId: string): Promise<number | null> {
  const filePath = await getLogoImagePath(id, conceptId);
  if (!filePath) return null;
  const info = await stat(filePath);
  return info.mtimeMs;
}

// ---------------------------------------------------------------------------
// Aggregate status (drives Studio + stage nav + cost-protection skip logic)
// ---------------------------------------------------------------------------

export async function getProjectStatus(id: string): Promise<ProjectStatus> {
  const dir = projectDir(id);
  const logos = logosDir(id);
  const meta = await getProjectMeta(id);

  const [hasIntake, hasStrategy, hasCreativeDirection, hasBrandSystem, hasLogoConcepts, hasLogoQualityReport] =
    await Promise.all([
      pathExists(path.join(dir, "intake.json")),
      pathExists(path.join(dir, "strategy.json")),
      pathExists(path.join(dir, "creative-direction.json")),
      pathExists(path.join(dir, "brand-system.json")),
      pathExists(path.join(logos, "concepts.json")),
      pathExists(path.join(logos, "quality-report.json")),
    ]);

  const hasLogoImages =
    hasLogoConcepts &&
    (await Promise.all(
      ["concept-1", "concept-2", "concept-3"].map((c) => pathExists(path.join(logos, `${c}.png`)))
    )).every(Boolean);

  return {
    hasIntake,
    hasStrategy,
    hasCreativeDirection,
    hasBrandSystem,
    hasLogoConcepts,
    hasLogoImages,
    hasLogoQualityReport,
    hasSelectedLogo: Boolean(meta?.selectedLogoConceptId),
  };
}

/** Human-facing "where this project currently is," used by the Studio list. */
export function describeStage(status: ProjectStatus): string {
  if (status.hasSelectedLogo) return "Brand system ready";
  if (status.hasLogoImages && status.hasLogoQualityReport) return "Choosing a logo";
  if (status.hasBrandSystem) return "Generating logos";
  if (status.hasIntake) return "Ready to generate";
  return "Intake";
}

/** Where the "Open" button in Studio should land the user. */
export function defaultRouteFor(id: string, status: ProjectStatus): string {
  if (status.hasSelectedLogo) return `/project/${id}/brand`;
  if (status.hasLogoConcepts) return `/project/${id}/logos`;
  if (status.hasIntake) return `/project/${id}/generate`;
  return `/project/${id}/intake`;
}

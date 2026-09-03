import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { BrandIntakeSchema, type BrandIntake } from "@/core/schemas/brand-intake.schema";
import { BrandStrategySchema, type BrandStrategy } from "@/core/schemas/brand-strategy.schema";
import { CreativeDirectionSchema, type CreativeDirection } from "@/core/schemas/creative-direction.schema";
import { BrandSystemSchema, type BrandSystem } from "@/core/schemas/brand-system.schema";
import { LogoConceptSetSchema } from "@/core/schemas/logo-concept.schema";
import {
  generateLogoResearch,
  generateLogoConcepts,
  generateLogoImages,
  generateLogoImage,
  resolveBrandNaming,
} from "@/core/services";
import { validateLogoConcepts, runLogoCritic } from "@/core/validators";
import { getAIProvider, getImageProvider, AIProviderConfigError } from "@/core/providers";

const FIXTURE_PATH = path.resolve(process.cwd(), "fixtures/ibtikar-intake.json");
const OUTPUT_DIR = path.resolve(process.cwd(), "outputs/ibtikar");
const LOGO_DIR = path.join(OUTPUT_DIR, "logos");
const CONCEPTS_PATH = path.join(LOGO_DIR, "logo-concepts.json");

interface CliArgs {
  concept?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--concept") {
      args.concept = argv[i + 1];
      i++;
    } else if (arg.startsWith("--concept=")) {
      args.concept = arg.slice("--concept=".length);
    }
  }
  return args;
}

async function requireFile(filePath: string, hint: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new Error(
      `Missing required source file: ${path.relative(process.cwd(), filePath)}. ${hint}`
    );
  }
}

async function loadSource<T>(
  label: string,
  filename: string,
  schema: z.ZodType<T>
): Promise<T> {
  const filePath = path.join(OUTPUT_DIR, filename);
  await requireFile(filePath, 'Run "npm run test:brand" first to generate it.');

  const raw = JSON.parse(await readFile(filePath, "utf-8"));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Source file ${path.relative(process.cwd(), filePath)} did not match the expected ${label} schema: ${parsed.error.message}`
    );
  }
  return parsed.data;
}

async function loadIntake(): Promise<BrandIntake> {
  await requireFile(
    FIXTURE_PATH,
    "Run this from the project root with the Ibtikar fixture present at fixtures/ibtikar-intake.json."
  );
  const raw = JSON.parse(await readFile(FIXTURE_PATH, "utf-8"));
  const parsed = BrandIntakeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Fixture fixtures/ibtikar-intake.json did not match the expected BrandIntake schema: ${parsed.error.message}`
    );
  }
  return parsed.data;
}

/**
 * Cheap path: regenerate the exploration image for exactly one already-generated
 * concept. Does NOT call the text model and does NOT touch the other two images
 * or the quality report — this only exists so a bad single-concept render can be
 * fixed without re-spending on the whole set.
 */
async function runSingleConceptImage(conceptId: string): Promise<void> {
  console.log(`Logorithm Logo Engine — single-concept image regeneration (${conceptId})\n`);

  let imageProvider;
  try {
    imageProvider = getImageProvider();
  } catch (error) {
    if (error instanceof AIProviderConfigError) {
      console.error(`✗ ${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  console.log(`Image provider: ${imageProvider.name}`);

  await requireFile(
    CONCEPTS_PATH,
    'Run "npm run test:logo" (no --concept flag) first to generate logo-concepts.json.'
  );
  const conceptsRaw = JSON.parse(await readFile(CONCEPTS_PATH, "utf-8"));
  const conceptsParsed = LogoConceptSetSchema.safeParse(conceptsRaw);
  if (!conceptsParsed.success) {
    throw new Error(
      `${path.relative(process.cwd(), CONCEPTS_PATH)} did not match the expected LogoConceptSet schema: ${conceptsParsed.error.message}`
    );
  }

  const concept = conceptsParsed.data.concepts.find((c) => c.id === conceptId);
  if (!concept) {
    const available = conceptsParsed.data.concepts.map((c) => c.id).join(", ");
    throw new Error(`No concept with id "${conceptId}" found. Available concepts: ${available}`);
  }

  console.log(`Regenerating image only: ${concept.id} (${concept.category} / ${concept.structureType}) — ${concept.name}`);

  const buffer = await generateLogoImage(concept, imageProvider);
  const filePath = path.join(LOGO_DIR, `${concept.id}.png`);
  await writeFile(filePath, buffer);
  console.log(`\nWrote ${path.relative(process.cwd(), filePath)}`);
  console.log(
    "logo-concepts.json and logo-quality-report.json were left untouched. Re-run without --concept once you're happy with the image to refresh the evaluation."
  );
}

async function runFullPipeline(): Promise<void> {
  console.log("Logorithm Logo Engine — terminal pipeline test\n");

  let provider;
  let imageProvider;
  try {
    provider = getAIProvider();
    imageProvider = getImageProvider();
  } catch (error) {
    if (error instanceof AIProviderConfigError) {
      console.error(`✗ ${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  console.log(`Text provider: ${provider.name}`);
  console.log(`Image provider: ${imageProvider.name}`);

  const intake = await loadIntake();
  const naming = resolveBrandNaming({
    brandName: intake.brandName,
    englishName: intake.englishName,
    englishDescriptor: intake.englishDescriptor,
  });
  console.log(`Fixture: ${intake.brandName}`);
  console.log(
    `Resolved naming — primary: ${naming.primaryScript}, display: "${naming.displayName}"` +
      `${naming.arabic ? `, Arabic: "${naming.arabic}"` : ""}` +
      `${naming.hasRealEnglishName && naming.english ? `, English: "${naming.english}"` : ", English: (none — Arabic stays primary)"}`
  );

  const strategy: BrandStrategy = await loadSource("BrandStrategy", "brand-strategy.json", BrandStrategySchema);
  const creative: CreativeDirection = await loadSource(
    "CreativeDirection",
    "creative-direction.json",
    CreativeDirectionSchema
  );
  const system: BrandSystem = await loadSource("BrandSystem", "brand-system.json", BrandSystemSchema);
  console.log(`Loaded strategy, creative direction, and brand system from ${path.relative(process.cwd(), OUTPUT_DIR)}/`);

  await mkdir(LOGO_DIR, { recursive: true });

  console.log("\n[1/4] generateLogoResearch (motifs + simplification)");
  const research = await generateLogoResearch(strategy, creative, system, provider);
  await writeFile(
    path.join(LOGO_DIR, "logo-research.json"),
    JSON.stringify(research, null, 2) + "\n",
    "utf-8"
  );

  console.log("\n[2/4] generateLogoConcepts");
  const conceptSet = await generateLogoConcepts(strategy, creative, system, research, provider);
  for (const concept of conceptSet.concepts) {
    console.log(`      ${concept.id} (${concept.category} / ${concept.structureType}): ${concept.name}`);
  }
  await writeFile(CONCEPTS_PATH, JSON.stringify(conceptSet, null, 2) + "\n", "utf-8");

  console.log("\n[3/4] generateLogoImages (standalone symbols only)");
  const images = await generateLogoImages(conceptSet, imageProvider);
  for (const image of images) {
    const filePath = path.join(LOGO_DIR, `${image.id}.png`);
    await writeFile(filePath, image.buffer);
    console.log(`      wrote ${path.relative(process.cwd(), filePath)}`);
  }

  const criticReport = runLogoCritic(conceptSet);
  await writeFile(
    path.join(LOGO_DIR, "logo-critic-report.json"),
    JSON.stringify(criticReport, null, 2) + "\n",
    "utf-8"
  );
  console.log(
    `      auto-critic: ${criticReport.findings.length} finding(s), ${criticReport.conceptsNeedingRegeneration.length} concept(s) flagged for regeneration`
  );

  console.log("\n[4/4] validateLogoConcepts");
  const qualityReport = await validateLogoConcepts(strategy, creative, conceptSet, provider);
  await writeFile(
    path.join(LOGO_DIR, "logo-quality-report.json"),
    JSON.stringify(qualityReport, null, 2) + "\n",
    "utf-8"
  );
  console.log(`      recommended: ${qualityReport.recommendedConceptId}`);
  console.log(
    `      blocking issues: ${qualityReport.evaluations.reduce((n, e) => n + e.blockingIssues.length, 0)}`
  );

  console.log(`\nOutput written to ${path.relative(process.cwd(), LOGO_DIR)}/`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.concept) {
    await runSingleConceptImage(args.concept);
    return;
  }

  await runFullPipeline();
}

main().catch((error) => {
  console.error("\n✗ Logo Engine failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

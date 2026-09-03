import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  normalizeIntake,
  evaluateIntake,
  buildBrandStrategy,
  buildCreativeDirection,
  buildBrandSystem,
} from "@/core/services";
import { validateBrandSystem } from "@/core/validators";
import { getAIProvider, AIProviderConfigError } from "@/core/providers";

const FIXTURE_PATH = path.resolve(process.cwd(), "fixtures/ibtikar-intake.json");
const OUTPUT_DIR = path.resolve(process.cwd(), "outputs/ibtikar");

async function writeStageOutput(filename: string, data: unknown): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUTPUT_DIR, filename),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
}

async function main(): Promise<void> {
  console.log("Logorithm Core Engine — terminal pipeline test\n");

  let provider;
  try {
    provider = getAIProvider();
  } catch (error) {
    if (error instanceof AIProviderConfigError) {
      console.error(`✗ ${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  console.log(`Provider: ${provider.name}`);

  console.log(`Loading fixture: ${path.relative(process.cwd(), FIXTURE_PATH)}`);
  const raw = JSON.parse(await readFile(FIXTURE_PATH, "utf-8"));

  console.log("\n[1/6] normalizeIntake");
  const intake = normalizeIntake(raw);
  console.log(`      ${intake.brandName}`);

  console.log("[2/6] evaluateIntake");
  const evaluation = await evaluateIntake(intake, provider);
  await writeStageOutput("evaluation.json", evaluation);
  console.log(`      readiness: ${evaluation.readiness} (${evaluation.completeness.level})`);

  console.log("[3/6] buildBrandStrategy");
  const strategy = await buildBrandStrategy(intake, evaluation, provider);
  await writeStageOutput("brand-strategy.json", strategy);
  console.log(`      essence: "${strategy.essence}"`);

  console.log("[4/6] buildCreativeDirection");
  const creative = await buildCreativeDirection(intake, strategy, provider);
  await writeStageOutput("creative-direction.json", creative);
  console.log(`      central idea: "${creative.centralIdea}"`);

  console.log("[5/6] buildBrandSystem");
  const system = await buildBrandSystem(intake, strategy, creative, provider);
  await writeStageOutput("brand-system.json", system);
  console.log(`      colors: ${system.colorSystem.length}, logo directions: ${system.logoStrategy.conceptDirections.length}`);

  console.log("[6/6] validateBrandSystem");
  const qualityReport = await validateBrandSystem(intake, strategy, creative, system, provider);
  await writeStageOutput("quality-report.json", qualityReport);

  console.log(`\nOverall readiness: ${qualityReport.overallReadiness}`);
  console.log(
    `Blocking issues: ${qualityReport.blockingIssues.length} — Warnings: ${qualityReport.warnings.length}`
  );
  console.log(`\nOutput written to ${path.relative(process.cwd(), OUTPUT_DIR)}/`);
}

main().catch((error) => {
  console.error("\n✗ Pipeline failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

#!/usr/bin/env node

/**
 * IFC → GLB + JSON converter CLI
 *
 * Usage:
 *   pnpm --filter @pf-dev/ifc-converter convert -- input.ifc --output ./out/
 *   pnpm --filter @pf-dev/ifc-converter convert -- input.ifc --output ./out/ --disciplines arc,mep --draco
 */

import fs from "node:fs";
import path from "node:path";
import { loadIFC, closeModel } from "./parser.js";
import { extractGeometry, countTriangles } from "./geometry-extractor.js";
import { extractMetadata, type IFCMetadata } from "./metadata-extractor.js";
import { exportToGLB } from "./glb-exporter.js";
import { ALL_DISCIPLINES, type Discipline } from "./classifier.js";

// --- Argument parsing (minimal, no deps) ---

interface CliArgs {
  inputFile: string;
  outputDir: string;
  disciplines: Discipline[];
  draco: boolean;
  meta: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  // Strip node executable + script path
  const args = argv.slice(2);

  let inputFile = "";
  let outputDir = "./output";
  let disciplines: Discipline[] = [...ALL_DISCIPLINES];
  let draco = false;
  let meta = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "--output" || arg === "-o") {
      outputDir = args[++i] ?? outputDir;
    } else if (arg === "--disciplines" || arg === "-d") {
      const val = args[++i] ?? "";
      disciplines = val
        .split(",")
        .filter((d): d is Discipline => ALL_DISCIPLINES.includes(d as Discipline));
    } else if (arg === "--draco") {
      draco = true;
    } else if (arg === "--no-meta") {
      meta = false;
    } else if (!arg.startsWith("-")) {
      inputFile = arg;
    }
  }

  if (!inputFile) {
    console.error(
      "Usage: ifc-convert <input.ifc> [--output dir] [--disciplines arc,mep,str] [--draco] [--no-meta]"
    );
    process.exit(1);
  }

  return { inputFile, outputDir, disciplines, draco, meta };
}

// --- Main ---

async function main() {
  const startTime = performance.now();
  const args = parseArgs(process.argv);

  const baseName = path.basename(args.inputFile, path.extname(args.inputFile));

  console.log(`\n🏗️  IFC Converter`);
  console.log(`   Input:       ${args.inputFile}`);
  console.log(`   Output:      ${args.outputDir}`);
  console.log(`   Disciplines: ${args.disciplines.join(", ")}`);
  console.log(`   Draco:       ${args.draco ? "yes" : "no"}`);
  console.log(`   Metadata:    ${args.meta ? "yes" : "no"}`);
  console.log();

  // 1. Parse IFC
  console.log("1/4  Parsing IFC file...");
  const parsed = await loadIFC(args.inputFile);
  console.log(`     Model loaded (ID: ${parsed.modelID})`);

  // 2. Extract geometry
  console.log("2/4  Extracting geometry...");
  const disciplineSet = new Set(args.disciplines);
  const geometryGroups = extractGeometry(parsed.ifcApi, parsed.modelID, disciplineSet);

  const triangleCounts = countTriangles(geometryGroups);
  for (const [disc, count] of Object.entries(triangleCounts)) {
    const meshCount = geometryGroups.get(disc as Discipline)?.length ?? 0;
    console.log(`     ${disc.toUpperCase()}: ${meshCount} meshes, ${count} triangles`);
  }

  // 3. Extract metadata
  let metadata: IFCMetadata | null = null;
  if (args.meta) {
    console.log("3/4  Extracting metadata...");
    // Collect all expressIDs from extracted geometry
    const allExpressIDs = new Set<number>();
    for (const meshes of geometryGroups.values()) {
      for (const m of meshes) allExpressIDs.add(m.expressID);
    }
    metadata = extractMetadata(parsed.ifcApi, parsed.modelID, allExpressIDs);
    console.log(`     Project: ${metadata.project.name || "(unnamed)"}`);
    console.log(`     Elements: ${Object.keys(metadata.elements).length}`);
  } else {
    console.log("3/4  Skipping metadata extraction");
  }

  // 4. Export GLB files
  console.log("4/4  Exporting GLB files...");
  fs.mkdirSync(args.outputDir, { recursive: true });

  for (const disc of args.disciplines) {
    const meshes = geometryGroups.get(disc);
    if (!meshes || meshes.length === 0) {
      console.log(`     ${disc.toUpperCase()}: skipped (no geometry)`);
      continue;
    }

    const glbPath = path.join(args.outputDir, `${baseName}-${disc}.glb`);
    const result = await exportToGLB(meshes, glbPath, { useDraco: args.draco });
    const fileSize = fs.statSync(glbPath).size;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    console.log(
      `     ${disc.toUpperCase()}: ${glbPath} (${sizeMB} MB, ${result.vertexCount} verts, ${result.nodeCount} nodes)`
    );
  }

  // 5. Write metadata JSON
  if (metadata) {
    const metaPath = path.join(args.outputDir, `${baseName}-meta.json`);
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
    const metaSize = fs.statSync(metaPath).size;
    console.log(`     META: ${metaPath} (${(metaSize / 1024).toFixed(1)} KB)`);
  }

  // Cleanup
  closeModel(parsed);

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅  Done in ${elapsed}s\n`);
}

main().catch((err) => {
  console.error("\n❌  Conversion failed:", err);
  process.exit(1);
});

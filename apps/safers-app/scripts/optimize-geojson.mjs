/**
 * GeoJSON 최적화 스크립트
 * - mapshaper로 폴리곤 단순화 (Douglas-Peucker)
 * - 좌표 정밀도 축소 (15자리 → 4자리)
 * - 불필요한 속성 제거
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import mapshaper from "mapshaper";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRECISION = 4; // 소수점 4자리 (~10m 정확도, 대시보드용 충분)
const SIMPLIFY_PERCENT = "5%"; // 포인트 5%만 유지 (94,000 → ~4,700)

const inputPath = join(__dirname, "../public/geojson/sido_no_islands_ver20260201.geojson");
const outputPath = join(__dirname, "../public/geojson/sido_optimized.geojson");

async function optimize() {
  console.log("📖 Reading GeoJSON...");
  const originalSize = readFileSync(inputPath).length;

  console.log(`🔧 Simplifying polygons (keeping ${SIMPLIFY_PERCENT})...`);

  // mapshaper로 단순화
  const result = await mapshaper.applyCommands(
    `-i ${inputPath} -simplify ${SIMPLIFY_PERCENT} keep-shapes -o format=geojson`
  );

  const simplified = JSON.parse(result["output.json"]);

  // 좌표 정밀도 축소
  console.log("🔧 Reducing coordinate precision...");
  function roundCoord(coord) {
    if (Array.isArray(coord[0])) {
      return coord.map(roundCoord);
    }
    return coord.map((n) => Math.round(n * 10 ** PRECISION) / 10 ** PRECISION);
  }

  simplified.features = simplified.features.map((feature) => ({
    type: "Feature",
    properties: {
      sido: feature.properties.sido,
      sidonm: feature.properties.sidonm,
    },
    geometry: {
      type: feature.geometry.type,
      coordinates: roundCoord(feature.geometry.coordinates),
    },
  }));

  console.log("💾 Writing optimized GeoJSON...");
  const output = JSON.stringify(simplified);
  writeFileSync(outputPath, output);

  const optimizedSize = output.length;
  const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

  console.log(`\n✅ Optimization complete!`);
  console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Optimized: ${(optimizedSize / 1024).toFixed(0)} KB`);
  console.log(`   Reduction: ${reduction}%`);
}

optimize().catch(console.error);

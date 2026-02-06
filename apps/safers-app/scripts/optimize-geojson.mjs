/**
 * GeoJSON 최적화 스크립트
 * - 좌표 정밀도 축소 (15자리 → 5자리)
 * - 불필요한 속성 제거
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRECISION = 5; // 소수점 5자리 (~1m 정확도)

const inputPath = join(__dirname, "../public/geojson/sido_no_islands_ver20260201.geojson");
const outputPath = join(__dirname, "../public/geojson/sido_optimized.geojson");

console.log("📖 Reading GeoJSON...");
const geojson = JSON.parse(readFileSync(inputPath, "utf-8"));

// 좌표 정밀도 축소 함수
function roundCoord(coord) {
  if (Array.isArray(coord[0])) {
    return coord.map(roundCoord);
  }
  return coord.map((n) => Math.round(n * 10 ** PRECISION) / 10 ** PRECISION);
}

// 각 feature 처리
console.log("🔧 Optimizing coordinates...");
geojson.features = geojson.features.map((feature) => ({
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

// CRS 제거 (D3에서 불필요)
delete geojson.crs;
delete geojson.name;

console.log("💾 Writing optimized GeoJSON...");
const output = JSON.stringify(geojson);
writeFileSync(outputPath, output);

const originalSize = readFileSync(inputPath).length;
const optimizedSize = output.length;
const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

console.log(`\n✅ Optimization complete!`);
console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Reduction: ${reduction}%`);

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

// dist 하위 폴더에서 cesium 폴더를 찾아서 dist/cesium으로 이동
// 예: dist/model-gps-tool/cesium -> dist/cesium

function findNestedCesium(dir) {
  if (!fs.existsSync(dir)) return null;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== "cesium") {
      const nestedCesiumPath = path.join(dir, entry.name, "cesium");
      if (fs.existsSync(nestedCesiumPath)) {
        return { cesiumPath: nestedCesiumPath, parentDir: path.join(dir, entry.name) };
      }
    }
  }

  return null;
}

const nested = findNestedCesium(distDir);
const targetCesiumPath = path.join(distDir, "cesium");

if (nested) {
  console.log(`Moving cesium from ${path.relative(distDir, nested.cesiumPath)} to dist/cesium...`);

  // dist/cesium이 이미 있으면 삭제
  if (fs.existsSync(targetCesiumPath)) {
    fs.rmSync(targetCesiumPath, { recursive: true, force: true });
  }

  // cesium 폴더 이동
  fs.renameSync(nested.cesiumPath, targetCesiumPath);

  // 빈 폴더 정리
  if (fs.existsSync(nested.parentDir)) {
    const contents = fs.readdirSync(nested.parentDir);
    if (contents.length === 0) {
      fs.rmdirSync(nested.parentDir);
      console.log(`Removed empty folder: ${path.relative(distDir, nested.parentDir)}`);
    }
  }

  console.log("Cesium moved successfully!");
} else {
  console.log("No nested cesium folder found, skipping...");
}

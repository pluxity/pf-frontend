import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

// dist 하위 폴더에서 cesium 폴더를 찾아서 dist/cesium으로 이동
// 예: dist/yongin-platform-app/cesium -> dist/cesium

function findNestedCesium(currentDir) {
  if (!fs.existsSync(currentDir)) return null;

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "cesium") {
        // dist/cesium은 대상이 아니므로 중첩된 경우만 반환
        if (path.resolve(entryPath) !== path.resolve(distDir, "cesium")) {
          return { cesiumPath: entryPath, parentDir: currentDir };
        }
      } else {
        const result = findNestedCesium(entryPath);
        if (result) {
          return result;
        }
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

  // 빈 폴더 재귀적 정리
  if (fs.existsSync(nested.parentDir)) {
    let currentDir = nested.parentDir;
    while (
      fs.existsSync(currentDir) &&
      path.resolve(currentDir) !== path.resolve(distDir) &&
      fs.readdirSync(currentDir).length === 0
    ) {
      fs.rmdirSync(currentDir);
      console.log(`Removed empty folder: ${path.relative(distDir, currentDir)}`);
      currentDir = path.dirname(currentDir);
    }
  }

  console.log("Cesium moved successfully!");
} else {
  console.log("No nested cesium folder found, skipping...");
}

import { Viewer, CesiumTerrainProvider, createWorldTerrainAsync } from "cesium";
import type { TerrainConfig } from "../types.ts";

export async function setupTerrain(viewer: Viewer, config: TerrainConfig): Promise<void> {
  if (!config.enabled) {
    // Terrain 비활성화 - 기본 EllipsoidTerrainProvider 사용
    return;
  }

  // Ion Terrain 사용
  if (config.assetId) {
    const terrainProvider = await CesiumTerrainProvider.fromIonAssetId(config.assetId);
    viewer.terrainProvider = terrainProvider;
  } else {
    // 기본 World Terrain
    const terrainProvider = await createWorldTerrainAsync();
    viewer.terrainProvider = terrainProvider;
  }
}

import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { BuildingConfig } from "../types";

/**
 * Add interior PointLights per building floor for ambient illumination.
 */
export function addBuildingLights(
  scene: Scene,
  building: BuildingConfig,
  parent: TransformNode
): void {
  const { width, depth, id } = building;
  const floors = building.floors ?? 1;
  const floorHeight = building.floorHeight ?? building.wallHeight / Math.max(floors, 1);

  // Determine light grid: 2x2 for large buildings, 2x1 for small
  const cols = width >= 40 ? 2 : 1;
  const rows = depth >= 30 ? 2 : 1;
  const intensity = 0.25;

  for (let f = 0; f < floors; f++) {
    const lightY = f * floorHeight + floorHeight * 0.85;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lx = ((c + 0.5) / cols - 0.5) * width * 0.6;
        const lz = ((r + 0.5) / rows - 0.5) * depth * 0.6;

        const light = new PointLight(
          `${id}-light-f${f}-${r}-${c}`,
          new Vector3(lx, lightY, lz),
          scene
        );
        light.intensity = intensity;
        light.diffuse = new Color3(1, 0.97, 0.9);
        light.range = Math.max(width, depth) * 0.8;
        light.parent = parent;
      }
    }
  }
}

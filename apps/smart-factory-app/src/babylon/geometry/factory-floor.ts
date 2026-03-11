import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, BuildingConfig } from "../types";

export function buildFactoryFloor(
  ctx: SceneContext,
  building: BuildingConfig,
  parent: TransformNode
): void {
  const { scene } = ctx;
  const { width, depth, zones, id } = building;
  const floors = building.floors ?? 1;
  const floorHeight = building.floorHeight ?? building.wallHeight / Math.max(floors, 1);

  // --- Floor material (shared) ---
  const floorMat = new StandardMaterial(`${id}-floor-mat`, scene);
  floorMat.diffuseColor = Color3.FromHexString("#2A2A32");
  floorMat.specularColor = new Color3(0.05, 0.05, 0.05);

  // --- 1F ground floor (slightly elevated) ---
  const factoryFloor = MeshBuilder.CreateGround(`${id}-floor`, { width, height: depth }, scene);
  factoryFloor.position.y = 0.02;
  factoryFloor.receiveShadows = true;
  factoryFloor.parent = parent;
  factoryFloor.material = floorMat;

  // --- 2F slab (also serves as 1F ceiling) ---
  if (floors >= 2) {
    const SLAB_THICKNESS = 0.25;
    const slab = MeshBuilder.CreateBox(
      `${id}-floor-2f`,
      { width, height: SLAB_THICKNESS, depth },
      scene
    );
    slab.position.y = floorHeight;
    slab.receiveShadows = true;
    slab.parent = parent;

    const slabMat = new StandardMaterial(`${id}-floor-2f-mat`, scene);
    slabMat.diffuseColor = Color3.FromHexString("#3A3A44");
    slabMat.specularColor = new Color3(0.08, 0.08, 0.08);
    slab.material = slabMat;
  }

  // --- Zone patches (with floor-based Y offset) ---
  for (const zone of zones) {
    const zoneFloor = zone.floor ?? 0;
    const zoneBaseY = zoneFloor * floorHeight;

    const patch = MeshBuilder.CreateGround(
      `${id}-zone-${zone.name}`,
      { width: zone.w, height: zone.d },
      scene
    );
    patch.position.set(zone.x, zoneBaseY + 0.04, zone.z);
    patch.receiveShadows = true;
    patch.parent = parent;

    const patchMat = new StandardMaterial(`${id}-zone-mat-${zone.name}`, scene);
    patchMat.diffuseColor = Color3.FromHexString(zone.color);
    patchMat.specularColor = Color3.Black();
    patchMat.alpha = 0.8;
    patch.material = patchMat;

    // Zone boundary lines
    const hw = zone.w / 2;
    const hd = zone.d / 2;
    const y = zoneBaseY + 0.05;
    const border = MeshBuilder.CreateLines(
      `${id}-zone-border-${zone.name}`,
      {
        points: [
          new Vector3(-hw, y, -hd),
          new Vector3(hw, y, -hd),
          new Vector3(hw, y, hd),
          new Vector3(-hw, y, hd),
          new Vector3(-hw, y, -hd),
        ],
      },
      scene
    );
    border.position.set(zone.x, 0, zone.z);
    border.color = Color3.FromHexString("#3A3A44");
    border.parent = parent;
  }
}

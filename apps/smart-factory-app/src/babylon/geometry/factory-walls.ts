import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, BuildingConfig } from "../types";

const WALL_ALPHA = 0.55;
const ROOF_HEIGHT = 0.2;
const PILLAR_RADIUS = 0.3;
const WALL_THICKNESS = 0.3;

export function buildFactoryWalls(
  ctx: SceneContext,
  building: BuildingConfig,
  parent: TransformNode
): void {
  const { scene, shadowGenerator } = ctx;
  const { width, depth, wallHeight, id } = building;
  const hw = width / 2;
  const hd = depth / 2;
  const floors = building.floors ?? 1;
  const floorHeight = building.floorHeight ?? building.wallHeight / Math.max(floors, 1);

  // --- Wall material (semi-transparent) ---
  const wallMat = new StandardMaterial(`${id}-wall-mat`, scene);
  wallMat.diffuseColor = Color3.FromHexString("#3A4A5A");
  wallMat.specularColor = new Color3(0.1, 0.1, 0.12);
  wallMat.alpha = WALL_ALPHA;

  // --- 4 Walls ---
  const walls: Mesh[] = [];

  const front = MeshBuilder.CreateBox(
    `${id}-wall-front`,
    { width, height: wallHeight, depth: WALL_THICKNESS },
    scene
  );
  front.position.set(0, wallHeight / 2, -hd);
  walls.push(front);

  const back = MeshBuilder.CreateBox(
    `${id}-wall-back`,
    { width, height: wallHeight, depth: WALL_THICKNESS },
    scene
  );
  back.position.set(0, wallHeight / 2, hd);
  walls.push(back);

  const left = MeshBuilder.CreateBox(
    `${id}-wall-left`,
    { width: WALL_THICKNESS, height: wallHeight, depth },
    scene
  );
  left.position.set(-hw, wallHeight / 2, 0);
  walls.push(left);

  const right = MeshBuilder.CreateBox(
    `${id}-wall-right`,
    { width: WALL_THICKNESS, height: wallHeight, depth },
    scene
  );
  right.position.set(hw, wallHeight / 2, 0);
  walls.push(right);

  for (const wall of walls) {
    wall.material = wallMat;
    wall.receiveShadows = true;
    wall.parent = parent;
  }

  // --- Floor separation bands (for multi-story buildings) ---
  if (floors >= 2) {
    const bandMat = new StandardMaterial(`${id}-band-mat`, scene);
    bandMat.diffuseColor = Color3.FromHexString("#4A5A6A");
    bandMat.specularColor = new Color3(0.1, 0.1, 0.12);
    bandMat.alpha = 0.6;

    // Front & back bands
    for (const [name, z] of [
      ["front", -hd],
      ["back", hd],
    ] as const) {
      const band = MeshBuilder.CreateBox(
        `${id}-band-${name}`,
        { width, height: 0.15, depth: WALL_THICKNESS + 0.02 },
        scene
      );
      band.position.set(0, floorHeight, z);
      band.material = bandMat;
      band.parent = parent;
    }

    // Left & right bands
    for (const [name, x] of [
      ["left", -hw],
      ["right", hw],
    ] as const) {
      const band = MeshBuilder.CreateBox(
        `${id}-band-${name}`,
        { width: WALL_THICKNESS + 0.02, height: 0.15, depth },
        scene
      );
      band.position.set(x, floorHeight, 0);
      band.material = bandMat;
      band.parent = parent;
    }
  }

  // --- Roof ---
  const roof = MeshBuilder.CreateBox(`${id}-roof`, { width, height: ROOF_HEIGHT, depth }, scene);
  roof.position.y = wallHeight + ROOF_HEIGHT / 2;
  const roofMat = new StandardMaterial(`${id}-roof-mat`, scene);
  roofMat.diffuseColor = Color3.FromHexString("#2A3040");
  roofMat.specularColor = Color3.Black();
  roofMat.alpha = 0.45;
  roof.material = roofMat;
  roof.parent = parent;

  // --- Pillars ---
  const pillarCountX = Math.max(2, Math.floor(width / 15));
  const pillarCountZ = Math.max(2, Math.floor(depth / 15));

  const pillarMat = new StandardMaterial(`${id}-pillar-mat`, scene);
  pillarMat.diffuseColor = Color3.FromHexString("#5A5A64");
  pillarMat.specularColor = new Color3(0.2, 0.2, 0.2);

  for (let ix = 0; ix < pillarCountX; ix++) {
    for (let iz = 0; iz < pillarCountZ; iz++) {
      const px = -hw + (width / (pillarCountX + 1)) * (ix + 1);
      const pz = -hd + (depth / (pillarCountZ + 1)) * (iz + 1);

      const pillar = MeshBuilder.CreateCylinder(
        `${id}-pillar-${ix}-${iz}`,
        { diameter: PILLAR_RADIUS * 2, height: wallHeight, tessellation: 12 },
        scene
      );
      pillar.position.set(px, wallHeight / 2, pz);
      pillar.material = pillarMat;
      pillar.receiveShadows = true;
      pillar.parent = parent;
      shadowGenerator.addShadowCaster(pillar);
    }
  }
}

import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import type { ExternalPowerConfig } from "../../types";

/**
 * Build external power source (KEPCO substation) + HV cable to campus transformer.
 */
export function buildExternalPower(
  scene: Scene,
  shadowGenerator: ShadowGenerator,
  config: ExternalPowerConfig
): TransformNode {
  const root = new TransformNode(`external-power-${config.id}`, scene);
  root.position.set(config.position.x, 0, config.position.z);
  root.metadata = { type: "external-power", id: config.id };

  // --- Concrete base pad ---
  const baseMat = new StandardMaterial(`ext-base-${config.id}`, scene);
  baseMat.diffuseColor = Color3.FromHexString("#5A5A64");
  baseMat.specularColor = Color3.Black();

  const base = MeshBuilder.CreateBox(
    `ext-base-mesh-${config.id}`,
    { width: 8, height: 0.3, depth: 6 },
    scene
  );
  base.position.y = 0.15;
  base.material = baseMat;
  base.receiveShadows = true;
  base.parent = root;

  // --- Circuit breaker (main box) ---
  const breakerMat = new StandardMaterial(`ext-breaker-${config.id}`, scene);
  breakerMat.diffuseColor = Color3.FromHexString("#3A4A5A");
  breakerMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const breaker = MeshBuilder.CreateBox(
    `ext-breaker-mesh-${config.id}`,
    { width: 3, height: 2.5, depth: 2 },
    scene
  );
  breaker.position.set(-1, 1.55, 0);
  breaker.material = breakerMat;
  breaker.receiveShadows = true;
  breaker.parent = root;
  shadowGenerator.addShadowCaster(breaker);

  // --- Transmission tower (two pylons + cross arm) ---
  const pylonMat = new StandardMaterial(`ext-pylon-${config.id}`, scene);
  pylonMat.diffuseColor = Color3.FromHexString("#6A7080");
  pylonMat.specularColor = new Color3(0.3, 0.3, 0.3);

  // Left pylon
  const pylonL = MeshBuilder.CreateCylinder(
    `ext-pylon-L-${config.id}`,
    { diameter: 0.3, height: 10, tessellation: 8 },
    scene
  );
  pylonL.position.set(2.5, 5, -1);
  pylonL.material = pylonMat;
  pylonL.parent = root;
  shadowGenerator.addShadowCaster(pylonL);

  // Right pylon
  const pylonR = MeshBuilder.CreateCylinder(
    `ext-pylon-R-${config.id}`,
    { diameter: 0.3, height: 10, tessellation: 8 },
    scene
  );
  pylonR.position.set(2.5, 5, 1);
  pylonR.material = pylonMat;
  pylonR.parent = root;
  shadowGenerator.addShadowCaster(pylonR);

  // Cross arm
  const crossArm = MeshBuilder.CreateBox(
    `ext-cross-${config.id}`,
    { width: 0.2, height: 0.2, depth: 4 },
    scene
  );
  crossArm.position.set(2.5, 9, 0);
  crossArm.material = pylonMat;
  crossArm.parent = root;

  // Insulators on cross arm
  const insulatorMat = new StandardMaterial(`ext-insulator-${config.id}`, scene);
  insulatorMat.diffuseColor = Color3.FromHexString("#8A6A5A");

  for (let i = -1; i <= 1; i++) {
    const insulator = MeshBuilder.CreateCylinder(
      `ext-insulator-${config.id}-${i}`,
      { diameter: 0.15, height: 0.6, tessellation: 8 },
      scene
    );
    insulator.position.set(2.5, 9.4, i * 1.2);
    insulator.material = insulatorMat;
    insulator.parent = root;
  }

  // --- HV Cable (from substation to campus transformer) ---
  if (config.hvCableWaypoints.length >= 2) {
    const path = config.hvCableWaypoints.map((wp) => new Vector3(wp.x, wp.y, wp.z));
    const hvCable = MeshBuilder.CreateTube(
      `ext-hv-cable-${config.id}`,
      { path, radius: 0.15, tessellation: 8, updatable: false },
      scene
    );

    const hvMat = new StandardMaterial(`ext-hv-mat-${config.id}`, scene);
    hvMat.diffuseColor = Color3.FromHexString("#CC3333");
    hvMat.specularColor = new Color3(0.3, 0.3, 0.3);
    hvMat.alpha = 0.9;
    hvCable.material = hvMat;
    hvCable.metadata = { type: "external-hv-cable", id: config.id };
  }

  return root;
}

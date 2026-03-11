import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import type { TransformerConfig } from "../../types";

/**
 * Build a transformer mesh: tank (cylinder) + cooling fins + HV bushings.
 */
export function buildTransformer(
  scene: Scene,
  shadowGenerator: ShadowGenerator,
  config: TransformerConfig
): TransformNode {
  const root = new TransformNode(`transformer-${config.id}`, scene);
  root.position.set(config.position.x, 0, config.position.z);
  root.metadata = { transformerId: config.id };

  // --- Tank (main cylinder) ---
  const tankMat = new StandardMaterial(`tr-tank-${config.id}`, scene);
  tankMat.diffuseColor = Color3.FromHexString("#5A6A7A");
  tankMat.specularColor = new Color3(0.3, 0.3, 0.3);

  const tank = MeshBuilder.CreateCylinder(
    `tr-tank-mesh-${config.id}`,
    { diameter: 2.5, height: 2.8, tessellation: 16 },
    scene
  );
  tank.position.y = 1.4;
  tank.material = tankMat;
  tank.receiveShadows = true;
  tank.parent = root;
  shadowGenerator.addShadowCaster(tank);

  // --- Cooling fins (4 thin boxes around tank) ---
  const finMat = new StandardMaterial(`tr-fin-${config.id}`, scene);
  finMat.diffuseColor = Color3.FromHexString("#6A7A8A");
  finMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const finCount = 4;
  for (let i = 0; i < finCount; i++) {
    const angle = (i / finCount) * Math.PI * 2;
    const fx = Math.cos(angle) * 1.4;
    const fz = Math.sin(angle) * 1.4;

    const fin = MeshBuilder.CreateBox(
      `tr-fin-${config.id}-${i}`,
      { width: 0.1, height: 2.0, depth: 0.8 },
      scene
    );
    fin.position.set(fx, 1.2, fz);
    fin.rotation.y = angle;
    fin.material = finMat;
    fin.parent = root;
    shadowGenerator.addShadowCaster(fin);
  }

  // --- HV Bushings (3 cylindrical insulators on top) ---
  const bushingMat = new StandardMaterial(`tr-bushing-${config.id}`, scene);
  bushingMat.diffuseColor = Color3.FromHexString("#8A6A5A");
  bushingMat.specularColor = new Color3(0.1, 0.1, 0.1);

  for (let i = -1; i <= 1; i++) {
    const bushing = MeshBuilder.CreateCylinder(
      `tr-bushing-${config.id}-${i}`,
      { diameter: 0.18, height: 0.8, tessellation: 8 },
      scene
    );
    bushing.position.set(i * 0.5, 3.2, 0);
    bushing.material = bushingMat;
    bushing.parent = root;
  }

  // --- Base pad ---
  const baseMat = new StandardMaterial(`tr-base-${config.id}`, scene);
  baseMat.diffuseColor = Color3.FromHexString("#3A3A44");
  baseMat.specularColor = Color3.Black();

  const base = MeshBuilder.CreateBox(
    `tr-base-mesh-${config.id}`,
    { width: 3.0, height: 0.2, depth: 3.0 },
    scene
  );
  base.position.y = 0.1;
  base.material = baseMat;
  base.receiveShadows = true;
  base.parent = root;

  return root;
}

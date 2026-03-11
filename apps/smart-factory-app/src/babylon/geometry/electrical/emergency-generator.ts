import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import type { EmergencyGeneratorConfig, GeneratorStatus } from "../../types";

const STATUS_COLORS: Record<GeneratorStatus, string> = {
  standby: "#6A6A7A",
  starting: "#FFA26B",
  running: "#00C48C",
};

/**
 * Build emergency diesel generator geometry.
 */
export function buildEmergencyGenerator(
  scene: Scene,
  shadowGenerator: ShadowGenerator,
  config: EmergencyGeneratorConfig
): TransformNode {
  const root = new TransformNode(`generator-${config.id}`, scene);
  root.position.set(config.position.x, 0, config.position.z);
  root.metadata = { type: "emergency-generator", id: config.id };

  // --- Base pad ---
  const baseMat = new StandardMaterial(`gen-base-${config.id}`, scene);
  baseMat.diffuseColor = Color3.FromHexString("#3A3A44");
  baseMat.specularColor = Color3.Black();

  const base = MeshBuilder.CreateBox(
    `gen-base-mesh-${config.id}`,
    { width: 4, height: 0.2, depth: 2.5 },
    scene
  );
  base.position.y = 0.1;
  base.material = baseMat;
  base.receiveShadows = true;
  base.parent = root;

  // --- Engine block ---
  const engineMat = new StandardMaterial(`gen-engine-${config.id}`, scene);
  engineMat.diffuseColor = Color3.FromHexString("#4A5A6A");
  engineMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const engineBlock = MeshBuilder.CreateBox(
    `gen-engine-mesh-${config.id}`,
    { width: 2.5, height: 1.5, depth: 1.8 },
    scene
  );
  engineBlock.position.set(-0.3, 0.95, 0);
  engineBlock.material = engineMat;
  engineBlock.receiveShadows = true;
  engineBlock.parent = root;
  shadowGenerator.addShadowCaster(engineBlock);

  // --- Radiator (thin box on one side) ---
  const radiatorMat = new StandardMaterial(`gen-radiator-${config.id}`, scene);
  radiatorMat.diffuseColor = Color3.FromHexString("#5A6A7A");
  radiatorMat.specularColor = new Color3(0.3, 0.3, 0.3);

  const radiator = MeshBuilder.CreateBox(
    `gen-radiator-mesh-${config.id}`,
    { width: 0.15, height: 1.2, depth: 1.6 },
    scene
  );
  radiator.position.set(1.5, 0.8, 0);
  radiator.material = radiatorMat;
  radiator.parent = root;
  shadowGenerator.addShadowCaster(radiator);

  // --- Exhaust muffler (cylinder on top) ---
  const mufflerMat = new StandardMaterial(`gen-muffler-${config.id}`, scene);
  mufflerMat.diffuseColor = Color3.FromHexString("#3A3A44");
  mufflerMat.specularColor = new Color3(0.1, 0.1, 0.1);

  const muffler = MeshBuilder.CreateCylinder(
    `gen-muffler-mesh-${config.id}`,
    { diameter: 0.25, height: 1.2, tessellation: 8 },
    scene
  );
  muffler.position.set(-1, 2.3, 0.5);
  muffler.material = mufflerMat;
  muffler.parent = root;

  // --- Status indicator lights (3 spheres) ---
  const indicators: Mesh[] = [];
  const labels: GeneratorStatus[] = ["standby", "starting", "running"];

  for (let i = 0; i < 3; i++) {
    const indicatorMat = new StandardMaterial(`gen-indicator-${config.id}-${i}`, scene);
    indicatorMat.diffuseColor = Color3.FromHexString("#3A3A44");
    indicatorMat.emissiveColor = Color3.Black();

    const indicator = MeshBuilder.CreateSphere(
      `gen-indicator-mesh-${config.id}-${i}`,
      { diameter: 0.2, segments: 8 },
      scene
    );
    indicator.position.set(-0.3 + i * 0.4, 1.85, -0.95);
    indicator.material = indicatorMat;
    indicator.parent = root;
    indicator.metadata = { indicatorIndex: i, statusLabel: labels[i] };
    indicators.push(indicator);
  }

  root.metadata.indicators = indicators;

  return root;
}

/**
 * Update generator visual status (indicator lights).
 */
export function setGeneratorStatus(node: TransformNode, status: GeneratorStatus): void {
  const indicators = node.metadata?.indicators as Mesh[] | undefined;
  if (!indicators) return;

  const labels: GeneratorStatus[] = ["standby", "starting", "running"];

  for (let i = 0; i < indicators.length; i++) {
    const indicator = indicators[i]!;
    const mat = indicator.material as StandardMaterial;
    const isActive = labels[i] === status;

    if (isActive) {
      const color = Color3.FromHexString(STATUS_COLORS[status]);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.6);
    } else {
      mat.diffuseColor = Color3.FromHexString("#3A3A44");
      mat.emissiveColor = Color3.Black();
    }
  }
}

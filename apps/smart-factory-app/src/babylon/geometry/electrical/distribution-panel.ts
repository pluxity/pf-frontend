import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import type { DistributionPanelConfig } from "../../types";

/** Panel sizes by type */
const PANEL_SIZE: Record<string, { w: number; h: number; d: number }> = {
  MSB: { w: 2.0, h: 2.2, d: 0.8 },
  DP: { w: 1.5, h: 1.8, d: 0.6 },
  SP: { w: 1.0, h: 1.4, d: 0.5 },
};

/**
 * Build a distribution panel box mesh.
 */
export function buildDistributionPanel(
  scene: Scene,
  shadowGenerator: ShadowGenerator,
  config: DistributionPanelConfig
): TransformNode {
  const root = new TransformNode(`panel-${config.id}`, scene);
  root.position.set(config.position.x, 0, config.position.z);
  root.metadata = { panelId: config.id, buildingId: config.buildingId };

  const size = PANEL_SIZE[config.type] ?? PANEL_SIZE["SP"]!;

  // Cabinet body
  const bodyMat = new StandardMaterial(`panel-body-${config.id}`, scene);
  bodyMat.diffuseColor = Color3.FromHexString("#4A5060");
  bodyMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const body = MeshBuilder.CreateBox(
    `panel-body-mesh-${config.id}`,
    { width: size.w, height: size.h, depth: size.d },
    scene
  );
  body.position.y = size.h / 2;
  body.material = bodyMat;
  body.receiveShadows = true;
  body.parent = root;
  shadowGenerator.addShadowCaster(body);

  // Door detail (thin box on front face)
  const doorMat = new StandardMaterial(`panel-door-${config.id}`, scene);
  doorMat.diffuseColor = Color3.FromHexString("#5A6070");
  doorMat.specularColor = new Color3(0.3, 0.3, 0.3);

  const door = MeshBuilder.CreateBox(
    `panel-door-mesh-${config.id}`,
    { width: size.w * 0.85, height: size.h * 0.85, depth: 0.02 },
    scene
  );
  door.position.set(0, size.h / 2, -size.d / 2 - 0.01);
  door.material = doorMat;
  door.parent = root;

  // Label indicator (small colored strip on top)
  const indicatorMat = new StandardMaterial(`panel-indicator-${config.id}`, scene);
  indicatorMat.diffuseColor =
    config.type === "MSB"
      ? Color3.FromHexString("#DE4545")
      : config.type === "DP"
        ? Color3.FromHexString("#FFA26B")
        : Color3.FromHexString("#4D7EFF");
  indicatorMat.emissiveColor = indicatorMat.diffuseColor.scale(0.3);

  const indicator = MeshBuilder.CreateBox(
    `panel-indicator-mesh-${config.id}`,
    { width: size.w * 0.6, height: 0.05, depth: size.d * 0.3 },
    scene
  );
  indicator.position.set(0, size.h + 0.03, 0);
  indicator.material = indicatorMat;
  indicator.parent = root;

  return root;
}

import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext } from "../types";
import type { EquipmentType } from "../types";
import { STATUS_COLORS } from "@/config/factory-layout.config";

/**
 * Create a machine mesh group for the given equipment type.
 * Returns the root TransformNode whose children can be color-tinted.
 */
export function buildMachine(
  ctx: SceneContext,
  id: string,
  type: EquipmentType,
  position: { x: number; z: number },
  rotation: number = 0,
  floor: number = 0,
  floorHeight: number = 0
): TransformNode {
  const { scene, shadowGenerator } = ctx;
  const root = new TransformNode(`eq-${id}`, scene);
  root.position.set(position.x, floor * floorHeight, position.z);
  root.rotation.y = rotation;

  // Tag for picking
  root.metadata = { equipmentId: id };

  const builders: Record<EquipmentType, () => void> = {
    cnc: () => buildCNC(scene, root, shadowGenerator),
    press: () => buildPress(scene, root, shadowGenerator),
    "robot-arm": () => buildRobotArm(scene, root, shadowGenerator),
    assembly: () => buildAssemblyTable(scene, root, shadowGenerator),
    inspector: () => buildInspector(scene, root, shadowGenerator),
  };

  builders[type]();

  return root;
}

/** Set the diffuse color of all child meshes */
export function tintMachine(root: TransformNode, status: string): void {
  const hex = STATUS_COLORS[status] ?? STATUS_COLORS["idle"]!;
  const color = Color3.FromHexString(hex);

  for (const child of root.getChildMeshes()) {
    const mat = child.material as StandardMaterial | null;
    if (!mat) continue;
    // Blend: 60% original base + 40% status tint
    const base = mat.metadata?.baseColor as Color3 | undefined;
    if (base) {
      mat.diffuseColor = Color3.Lerp(base, color, 0.4);
    }
  }
}

// --- Machine builders ---

function makeMat(
  scene: import("@babylonjs/core/scene").Scene,
  name: string,
  hex: string
): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  const c = Color3.FromHexString(hex);
  mat.diffuseColor = c;
  mat.specularColor = new Color3(0.15, 0.15, 0.15);
  mat.metadata = { baseColor: c.clone() };
  return mat;
}

function buildCNC(
  scene: import("@babylonjs/core/scene").Scene,
  root: TransformNode,
  shadow: import("@babylonjs/core/Lights/Shadows/shadowGenerator").ShadowGenerator
): void {
  const bodyMat = makeMat(scene, `${root.name}-body`, "#4A5568");
  const accentMat = makeMat(scene, `${root.name}-accent`, "#6B7B8D");

  // Main body
  const body = MeshBuilder.CreateBox(
    `${root.name}-body`,
    { width: 3, height: 2.5, depth: 2.5 },
    scene
  );
  body.position.y = 1.25;
  body.material = bodyMat;
  body.parent = root;
  body.receiveShadows = true;
  shadow.addShadowCaster(body);

  // Spindle head (top)
  const head = MeshBuilder.CreateBox(
    `${root.name}-head`,
    { width: 1.2, height: 0.8, depth: 1.2 },
    scene
  );
  head.position.set(0, 3, 0);
  head.material = accentMat;
  head.parent = root;
  shadow.addShadowCaster(head);

  // Control panel
  const panel = MeshBuilder.CreateBox(
    `${root.name}-panel`,
    { width: 0.8, height: 1.2, depth: 0.15 },
    scene
  );
  panel.position.set(1.6, 1.5, 0);
  panel.material = makeMat(scene, `${root.name}-panel-mat`, "#2D3748");
  panel.parent = root;
}

function buildPress(
  scene: import("@babylonjs/core/scene").Scene,
  root: TransformNode,
  shadow: import("@babylonjs/core/Lights/Shadows/shadowGenerator").ShadowGenerator
): void {
  const frameMat = makeMat(scene, `${root.name}-frame`, "#5A6A7A");

  // Base plate
  const base = MeshBuilder.CreateBox(
    `${root.name}-base`,
    { width: 3.5, height: 0.4, depth: 2.5 },
    scene
  );
  base.position.y = 0.2;
  base.material = frameMat;
  base.parent = root;
  base.receiveShadows = true;
  shadow.addShadowCaster(base);

  // Left pillar
  const lp = MeshBuilder.CreateCylinder(
    `${root.name}-lp`,
    { diameter: 0.4, height: 4, tessellation: 12 },
    scene
  );
  lp.position.set(-1.2, 2.4, 0);
  lp.material = frameMat;
  lp.parent = root;
  shadow.addShadowCaster(lp);

  // Right pillar
  const rp = MeshBuilder.CreateCylinder(
    `${root.name}-rp`,
    { diameter: 0.4, height: 4, tessellation: 12 },
    scene
  );
  rp.position.set(1.2, 2.4, 0);
  rp.material = frameMat;
  rp.parent = root;
  shadow.addShadowCaster(rp);

  // Top beam
  const beam = MeshBuilder.CreateBox(
    `${root.name}-beam`,
    { width: 3.5, height: 0.5, depth: 2.5 },
    scene
  );
  beam.position.y = 4.65;
  beam.material = frameMat;
  beam.parent = root;
  shadow.addShadowCaster(beam);

  // Ram
  const ram = MeshBuilder.CreateCylinder(
    `${root.name}-ram`,
    { diameter: 0.8, height: 1.5, tessellation: 16 },
    scene
  );
  ram.position.set(0, 3.4, 0);
  ram.material = makeMat(scene, `${root.name}-ram-mat`, "#7A8A9A");
  ram.parent = root;
  shadow.addShadowCaster(ram);
}

function buildRobotArm(
  scene: import("@babylonjs/core/scene").Scene,
  root: TransformNode,
  shadow: import("@babylonjs/core/Lights/Shadows/shadowGenerator").ShadowGenerator
): void {
  const armMat = makeMat(scene, `${root.name}-arm`, "#E8A838");
  const jointMat = makeMat(scene, `${root.name}-joint`, "#5A5A64");

  // Base pedestal
  const base = MeshBuilder.CreateCylinder(
    `${root.name}-base`,
    { diameter: 1.6, height: 0.5, tessellation: 16 },
    scene
  );
  base.position.y = 0.25;
  base.material = jointMat;
  base.parent = root;
  base.receiveShadows = true;
  shadow.addShadowCaster(base);

  // Turret
  const turret = MeshBuilder.CreateCylinder(
    `${root.name}-turret`,
    { diameter: 1.0, height: 0.8, tessellation: 16 },
    scene
  );
  turret.position.y = 0.9;
  turret.material = armMat;
  turret.parent = root;
  shadow.addShadowCaster(turret);

  // Lower arm
  const lowerArm = MeshBuilder.CreateBox(
    `${root.name}-lower`,
    { width: 0.4, height: 2.2, depth: 0.4 },
    scene
  );
  lowerArm.position.set(0, 2.4, 0);
  lowerArm.material = armMat;
  lowerArm.parent = root;
  shadow.addShadowCaster(lowerArm);

  // Elbow joint
  const elbow = MeshBuilder.CreateSphere(
    `${root.name}-elbow`,
    { diameter: 0.5, segments: 8 },
    scene
  );
  elbow.position.set(0, 3.5, 0);
  elbow.material = jointMat;
  elbow.parent = root;

  // Upper arm (angled)
  const upperArm = MeshBuilder.CreateBox(
    `${root.name}-upper`,
    { width: 0.35, height: 1.8, depth: 0.35 },
    scene
  );
  upperArm.position.set(0.6, 4.2, 0);
  upperArm.rotation.z = -0.4;
  upperArm.material = armMat;
  upperArm.parent = root;
  shadow.addShadowCaster(upperArm);

  // End effector
  const effector = MeshBuilder.CreateBox(
    `${root.name}-effector`,
    { width: 0.6, height: 0.15, depth: 0.3 },
    scene
  );
  effector.position.set(1.2, 4.8, 0);
  effector.material = jointMat;
  effector.parent = root;
}

function buildAssemblyTable(
  scene: import("@babylonjs/core/scene").Scene,
  root: TransformNode,
  shadow: import("@babylonjs/core/Lights/Shadows/shadowGenerator").ShadowGenerator
): void {
  const tableMat = makeMat(scene, `${root.name}-table`, "#4A5A6A");
  const legMat = makeMat(scene, `${root.name}-leg`, "#3A3A44");

  // Table top
  const top = MeshBuilder.CreateBox(
    `${root.name}-top`,
    { width: 3, height: 0.15, depth: 2 },
    scene
  );
  top.position.y = 1.0;
  top.material = tableMat;
  top.parent = root;
  top.receiveShadows = true;
  shadow.addShadowCaster(top);

  // 4 Legs
  for (const [lx, lz] of [
    [-1.3, -0.8],
    [1.3, -0.8],
    [-1.3, 0.8],
    [1.3, 0.8],
  ] as const) {
    const leg = MeshBuilder.CreateCylinder(
      `${root.name}-leg-${lx}-${lz}`,
      { diameter: 0.12, height: 1, tessellation: 8 },
      scene
    );
    leg.position.set(lx, 0.5, lz);
    leg.material = legMat;
    leg.parent = root;
    shadow.addShadowCaster(leg);
  }

  // Clamp/jig
  const jig = MeshBuilder.CreateBox(
    `${root.name}-jig`,
    { width: 0.8, height: 0.3, depth: 0.8 },
    scene
  );
  jig.position.set(0, 1.25, 0);
  jig.material = makeMat(scene, `${root.name}-jig-mat`, "#6A7A8A");
  jig.parent = root;
}

function buildInspector(
  scene: import("@babylonjs/core/scene").Scene,
  root: TransformNode,
  shadow: import("@babylonjs/core/Lights/Shadows/shadowGenerator").ShadowGenerator
): void {
  const bodyMat = makeMat(scene, `${root.name}-body`, "#3A4A5A");

  // Main cabinet
  const cabinet = MeshBuilder.CreateBox(
    `${root.name}-cab`,
    { width: 2, height: 2, depth: 1.5 },
    scene
  );
  cabinet.position.y = 1.0;
  cabinet.material = bodyMat;
  cabinet.parent = root;
  cabinet.receiveShadows = true;
  shadow.addShadowCaster(cabinet);

  // Screen
  const screen = MeshBuilder.CreateBox(
    `${root.name}-screen`,
    { width: 1.2, height: 0.8, depth: 0.05 },
    scene
  );
  screen.position.set(0, 2.5, -0.78);
  screen.material = makeMat(scene, `${root.name}-screen-mat`, "#1A2A3A");
  screen.parent = root;

  // Camera/sensor on top
  const sensor = MeshBuilder.CreateCylinder(
    `${root.name}-sensor`,
    { diameter: 0.3, height: 0.5, tessellation: 8 },
    scene
  );
  sensor.position.set(0, 2.35, 0);
  sensor.material = makeMat(scene, `${root.name}-sensor-mat`, "#8A8A94");
  sensor.parent = root;
  shadow.addShadowCaster(sensor);
}

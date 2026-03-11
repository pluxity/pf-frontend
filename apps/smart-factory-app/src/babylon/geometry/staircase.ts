import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, BuildingConfig } from "../types";

/**
 * Build a U-turn staircase inside a building.
 * Structure: lower flight → mid-landing → upper flight (rotated 180°).
 */
export function buildStaircase(
  ctx: SceneContext,
  building: BuildingConfig,
  parent: TransformNode
): void {
  const { scene, shadowGenerator } = ctx;
  const stairConfig = building.staircase;
  if (!stairConfig) return;

  const { id } = building;
  const floors = building.floors ?? 1;
  const floorHeight = building.floorHeight ?? building.wallHeight / Math.max(floors, 1);

  const stairWidth = stairConfig.width;
  const stairDepth = stairConfig.depth;
  const halfFlightSteps = 8; // steps per half-flight
  const totalSteps = halfFlightSteps * 2;
  const stepHeight = floorHeight / totalSteps;
  const stepDepth = (stairDepth * 0.45) / halfFlightSteps; // each half uses ~45% of depth
  const halfWidth = stairWidth / 2;
  const gap = 0.2; // gap between the two flights

  // Root transform for the staircase
  const root = new TransformNode(`${id}-staircase`, scene);
  root.position.set(stairConfig.position.x, 0, stairConfig.position.z);
  root.rotation.y = stairConfig.rotation;
  root.parent = parent;

  // Materials
  const stepMat = new StandardMaterial(`${id}-stair-step-mat`, scene);
  stepMat.diffuseColor = Color3.FromHexString("#5A6068");
  stepMat.specularColor = new Color3(0.1, 0.1, 0.1);

  const railMat = new StandardMaterial(`${id}-stair-rail-mat`, scene);
  railMat.diffuseColor = Color3.FromHexString("#7A8A9A");
  railMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const landingMat = new StandardMaterial(`${id}-stair-landing-mat`, scene);
  landingMat.diffuseColor = Color3.FromHexString("#4A5058");
  landingMat.specularColor = new Color3(0.08, 0.08, 0.08);

  // --- Lower flight (goes from ground to mid-landing) ---
  const flightWidth = (stairWidth - gap) / 2;

  for (let i = 0; i < halfFlightSteps; i++) {
    const y = (i + 0.5) * stepHeight;
    const z = -stairDepth * 0.45 + i * stepDepth + stepDepth / 2;

    const step = MeshBuilder.CreateBox(
      `${id}-stair-step-${i}`,
      { width: flightWidth, height: stepHeight, depth: stepDepth },
      scene
    );
    step.position.set(-halfWidth + flightWidth / 2, y, z);
    step.material = stepMat;
    step.receiveShadows = true;
    step.parent = root;
    shadowGenerator.addShadowCaster(step);
  }

  // --- Mid-landing ---
  const landingY = floorHeight / 2;
  const landingDepthSize = stairDepth * 0.1;
  const landing = MeshBuilder.CreateBox(
    `${id}-stair-landing`,
    { width: stairWidth, height: stepHeight, depth: landingDepthSize },
    scene
  );
  landing.position.set(0, landingY, stairDepth * 0.45 + landingDepthSize / 2);
  landing.material = landingMat;
  landing.receiveShadows = true;
  landing.parent = root;
  shadowGenerator.addShadowCaster(landing);

  // --- Upper flight (goes from mid-landing to 2F, reversed direction) ---
  for (let i = 0; i < halfFlightSteps; i++) {
    const y = landingY + (i + 0.5) * stepHeight;
    // Reversed: z goes from high to low
    const z = stairDepth * 0.45 - i * stepDepth - stepDepth / 2;

    const step = MeshBuilder.CreateBox(
      `${id}-stair-step-${halfFlightSteps + i}`,
      { width: flightWidth, height: stepHeight, depth: stepDepth },
      scene
    );
    step.position.set(halfWidth - flightWidth / 2, y, z);
    step.material = stepMat;
    step.receiveShadows = true;
    step.parent = root;
    shadowGenerator.addShadowCaster(step);
  }

  // --- Rails (thin vertical planes along outer edges) ---
  const railHeight = 1.0;
  const railThickness = 0.06;

  // Left outer rail (lower flight)
  const railLeft = MeshBuilder.CreateBox(
    `${id}-stair-rail-left`,
    { width: railThickness, height: railHeight, depth: stairDepth },
    scene
  );
  railLeft.position.set(-halfWidth, floorHeight / 2 + railHeight / 2, 0);
  railLeft.material = railMat;
  railLeft.parent = root;

  // Right outer rail (upper flight)
  const railRight = MeshBuilder.CreateBox(
    `${id}-stair-rail-right`,
    { width: railThickness, height: railHeight, depth: stairDepth },
    scene
  );
  railRight.position.set(halfWidth, floorHeight / 2 + railHeight / 2, 0);
  railRight.material = railMat;
  railRight.parent = root;

  // Center divider rail
  const railCenter = MeshBuilder.CreateBox(
    `${id}-stair-rail-center`,
    { width: railThickness, height: railHeight, depth: stairDepth * 0.9 },
    scene
  );
  railCenter.position.set(0, floorHeight / 2 + railHeight / 2, 0);
  railCenter.material = railMat;
  railCenter.parent = root;

  // --- Underside cover (semi-transparent) ---
  const coverMat = new StandardMaterial(`${id}-stair-cover-mat`, scene);
  coverMat.diffuseColor = Color3.FromHexString("#3A4048");
  coverMat.specularColor = Color3.Black();
  coverMat.alpha = 0.4;

  const cover = MeshBuilder.CreateBox(
    `${id}-stair-cover`,
    { width: stairWidth, height: 0.08, depth: stairDepth },
    scene
  );
  cover.position.set(0, 0.04, 0);
  cover.material = coverMat;
  cover.parent = root;
}

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, BuildingConfig } from "../types";
import { buildFactoryFloor } from "./factory-floor";
import { buildFactoryWalls } from "./factory-walls";
import { buildConveyorBelt } from "./conveyor-belt";
import { buildStorageRacks } from "./storage-rack";
import { buildStaircase } from "./staircase";

/**
 * Build a complete building: floor + walls + conveyor + racks + staircase.
 * Returns the root TransformNode positioned in world space.
 */
export function buildBuilding(ctx: SceneContext, config: BuildingConfig): TransformNode {
  const { scene } = ctx;

  const root = new TransformNode(`building-${config.id}`, scene);
  root.position.set(config.position.x, 0, config.position.z);
  if (config.rotation) {
    root.rotation.y = config.rotation;
  }
  root.metadata = { buildingId: config.id };

  // Floor + zones (includes 2F slab for multi-story)
  buildFactoryFloor(ctx, config, root);

  // Walls + roof + pillars + floor separation bands
  buildFactoryWalls(ctx, config, root);

  // Conveyor belt (optional)
  if (config.conveyor) {
    buildConveyorBelt(ctx, config.conveyor, root, config.id);
  }

  // Storage racks (optional)
  if (config.storageRacks && config.storageRacks.length > 0) {
    buildStorageRacks(ctx, config.storageRacks, root, config.id);
  }

  // Staircase (optional, for 2+ floor buildings)
  if (config.staircase && (config.floors ?? 1) >= 2) {
    buildStaircase(ctx, config, root);
  }

  return root;
}

import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { BuildingId } from "../types";

type ClickHandler = (equipmentId: string | null) => void;
type BuildingClickHandler = (buildingId: BuildingId | null) => void;

export function createInteractionManager(scene: Scene) {
  let equipmentHandler: ClickHandler | null = null;
  let buildingHandler: BuildingClickHandler | null = null;

  scene.onPointerDown = (_evt, pickResult) => {
    if (pickResult?.hit && pickResult.pickedMesh) {
      const eqId = findEquipmentId(pickResult.pickedMesh);
      if (equipmentHandler) {
        equipmentHandler(eqId);
      }

      const bId = findBuildingId(pickResult.pickedMesh);
      if (buildingHandler && bId) {
        buildingHandler(bId);
      }
    } else {
      if (equipmentHandler) equipmentHandler(null);
    }
  };

  function onEquipmentClick(cb: ClickHandler): void {
    equipmentHandler = cb;
  }

  function onBuildingClick(cb: BuildingClickHandler): void {
    buildingHandler = cb;
  }

  function dispose(): void {
    equipmentHandler = null;
    buildingHandler = null;
    scene.onPointerDown = undefined;
  }

  return { onEquipmentClick, onBuildingClick, dispose };
}

/** Walk up the parent chain to find the equipment TransformNode */
function findEquipmentId(mesh: AbstractMesh): string | null {
  let node: import("@babylonjs/core/node").Node | null = mesh;
  while (node) {
    if (node.metadata?.equipmentId) {
      return node.metadata.equipmentId as string;
    }
    node = node.parent;
  }
  return null;
}

/** Walk up the parent chain to find the building TransformNode */
function findBuildingId(mesh: AbstractMesh): BuildingId | null {
  let node: import("@babylonjs/core/node").Node | null = mesh;
  while (node) {
    if (node.metadata?.buildingId) {
      return node.metadata.buildingId as BuildingId;
    }
    node = node.parent;
  }
  return null;
}

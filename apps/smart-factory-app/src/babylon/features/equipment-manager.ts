import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { SceneContext, EquipmentDefinition, EquipmentStatus } from "../types";
import { buildMachine, tintMachine } from "../geometry/machine";
import { BUILDINGS } from "@/config/campus-layout.config";

export interface EquipmentEntry {
  id: string;
  root: TransformNode;
  status: EquipmentStatus;
}

export function createEquipmentManager(ctx: SceneContext) {
  const equipment = new Map<string, EquipmentEntry>();

  function addEquipment(def: EquipmentDefinition): void {
    if (equipment.has(def.id)) return;

    const floor = def.floor ?? 0;
    const building = BUILDINGS.find((b) => b.id === def.buildingId);
    const floors = building?.floors ?? 1;
    const floorHeight = building?.floorHeight ?? (building?.wallHeight ?? 0) / Math.max(floors, 1);

    const root = buildMachine(
      ctx,
      def.id,
      def.type,
      def.position,
      def.rotation,
      floor,
      floorHeight
    );
    tintMachine(root, def.status);

    equipment.set(def.id, { id: def.id, root, status: def.status });
  }

  function removeEquipment(id: string): void {
    const entry = equipment.get(id);
    if (!entry) return;
    entry.root.dispose(false, true);
    equipment.delete(id);
  }

  function updateStatus(id: string, status: EquipmentStatus): void {
    const entry = equipment.get(id);
    if (!entry) return;
    entry.status = status;
    tintMachine(entry.root, status);
  }

  function getMesh(id: string): AbstractMesh | null {
    const entry = equipment.get(id);
    if (!entry) return null;
    const children = entry.root.getChildMeshes();
    return children[0] ?? null;
  }

  function getRoot(id: string): TransformNode | null {
    return equipment.get(id)?.root ?? null;
  }

  function getAllRoots(): TransformNode[] {
    return [...equipment.values()].map((e) => e.root);
  }

  function dispose(): void {
    for (const entry of equipment.values()) {
      entry.root.dispose(false, true);
    }
    equipment.clear();
  }

  return {
    addEquipment,
    removeEquipment,
    updateStatus,
    getMesh,
    getRoot,
    getAllRoots,
    dispose,
  };
}

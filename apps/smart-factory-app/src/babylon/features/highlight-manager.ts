import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { SceneContext } from "../types";
import type { createEquipmentManager } from "./equipment-manager";

export function createHighlightManager(
  ctx: SceneContext,
  equipmentManager: ReturnType<typeof createEquipmentManager>
) {
  const { glowLayer } = ctx;
  let currentId: string | null = null;
  const glowColor = new Color4(1, 0.84, 0, 1); // #FFD700

  function highlight(id: string): void {
    // Clear previous
    if (currentId) clearHighlight();

    const root = equipmentManager.getRoot(id);
    if (!root) return;

    currentId = id;
    const meshes = root.getChildMeshes();
    for (const mesh of meshes) {
      if (mesh instanceof Mesh) {
        glowLayer.addIncludedOnlyMesh(mesh);
      }
    }
    glowLayer.customEmissiveColorSelector = (_mesh, _subMesh, _material, result) => {
      if (meshes.includes(_mesh)) {
        result.set(glowColor.r, glowColor.g, glowColor.b, glowColor.a);
      } else {
        result.set(0, 0, 0, 0);
      }
    };
  }

  function clearHighlight(): void {
    if (!currentId) return;
    const root = equipmentManager.getRoot(currentId);
    if (root) {
      for (const mesh of root.getChildMeshes()) {
        if (mesh instanceof Mesh) {
          glowLayer.removeIncludedOnlyMesh(mesh);
        }
      }
    }
    // Reset to no-op selector (Babylon expects function, not undefined)
    glowLayer.customEmissiveColorSelector = (_mesh, _subMesh, _material, result) => {
      result.set(0, 0, 0, 0);
    };
    currentId = null;
  }

  function dispose(): void {
    clearHighlight();
  }

  return { highlight, clearHighlight, dispose };
}

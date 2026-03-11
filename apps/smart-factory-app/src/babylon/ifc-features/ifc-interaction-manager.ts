import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { IFCModelResult } from "../loaders/ifc-model-loader";
import type { ElementMeta } from "../types";

type SelectCallback = (element: ElementMeta | null, mesh: AbstractMesh | null) => void;

/**
 * Click interaction manager for IFC elements.
 * Picks mesh on click, resolves expressID, and calls registered callback.
 */
export function createIFCInteractionManager(scene: Scene, models: IFCModelResult[]) {
  let selectCallback: SelectCallback | null = null;

  scene.onPointerDown = (_evt, pickResult) => {
    if (!selectCallback) return;

    if (pickResult?.hit && pickResult.pickedMesh) {
      const mesh = pickResult.pickedMesh;
      const element = resolveElement(mesh);
      selectCallback(element, mesh);
    } else {
      selectCallback(null, null);
    }
  };

  function resolveElement(mesh: AbstractMesh): ElementMeta | null {
    for (const model of models) {
      const ids = model.getMeshExpressIDs(mesh);
      if (ids.length > 0 && ids[0] != null) {
        return model.getElementByExpressID(ids[0]) ?? null;
      }
    }
    return null;
  }

  function onSelect(callback: SelectCallback): void {
    selectCallback = callback;
  }

  function dispose(): void {
    selectCallback = null;
    scene.onPointerDown = undefined;
  }

  return { onSelect, dispose };
}

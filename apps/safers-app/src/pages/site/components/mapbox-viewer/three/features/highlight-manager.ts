import type * as THREE from "three";
import type { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import type { FeatureEntry } from "../core/types";
import { COLOR_SUCCESS } from "../../../../config/assets.config";

export function createHighlightManager(
  outlinePass: OutlinePass,
  features: Map<string, FeatureEntry>,
  requestRepaint: () => void
) {
  const state = { highlightedFeatureId: null as string | null };

  function highlightFeature(id: string, color?: number) {
    state.highlightedFeatureId = id;

    const entry = features.get(id);
    if (entry) {
      const targets = entry.group.children.filter((c) => !c.userData.isFOV && !c.userData.isMarker);
      outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
    }

    const c = color ?? COLOR_SUCCESS;
    outlinePass.visibleEdgeColor.set(c);
    outlinePass.hiddenEdgeColor.set(c);

    requestRepaint();
  }

  function clearHighlight() {
    if (!state.highlightedFeatureId) return;
    state.highlightedFeatureId = null;
    outlinePass.selectedObjects = [];
    outlinePass.visibleEdgeColor.set(COLOR_SUCCESS);
    outlinePass.hiddenEdgeColor.set(COLOR_SUCCESS);
    requestRepaint();
  }

  function highlightFeatures(ids: string[], color?: number) {
    const objects: THREE.Object3D[] = [];
    for (const id of ids) {
      const entry = features.get(id);
      if (!entry) continue;
      const targets = entry.group.children.filter((c) => !c.userData.isFOV && !c.userData.isMarker);
      if (targets.length > 0) {
        objects.push(...targets);
      } else {
        objects.push(entry.group);
      }
    }
    outlinePass.selectedObjects = objects;
    const c = color ?? COLOR_SUCCESS;
    outlinePass.visibleEdgeColor.set(c);
    outlinePass.hiddenEdgeColor.set(c);
    state.highlightedFeatureId = ids[0] ?? null;
    requestRepaint();
  }

  return { highlightFeature, clearHighlight, highlightFeatures, state };
}

import * as THREE from "three";
import type { FeaturePosition } from "../../types";
import type { SceneContext } from "../core/types";
import { gpsToScenePosition } from "../core/geo-utils";

export function createFeatureManager(ctx: SceneContext) {
  function addFeature(id: string, assetId: string, position: FeaturePosition) {
    if (ctx.features.has(id)) return;

    const pos = gpsToScenePosition(position, ctx.getTransform());
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.x = Math.PI / 2;

    const asset = ctx.assets.get(assetId);
    group.scale.setScalar(asset?.scale ?? 1);

    ctx.scene.add(group);
    ctx.features.set(id, { assetId, group, mixer: null, position });
    ctx.initialPositions.set(id, { ...position });

    ctx.requestRepaint();
  }

  function removeFeature(
    id: string,
    highlightedFeatureId: { highlightedFeatureId: string | null }
  ) {
    const entry = ctx.features.get(id);
    if (!entry) return;

    if (entry.mixer) entry.mixer.stopAllAction();
    entry.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) mat.dispose();
      }
    });
    ctx.scene.remove(entry.group);
    ctx.features.delete(id);
    ctx.initialPositions.delete(id);

    if (highlightedFeatureId.highlightedFeatureId === id) {
      ctx.outlinePass.selectedObjects = [];
      highlightedFeatureId.highlightedFeatureId = null;
    }

    ctx.requestRepaint();
  }

  function updateFeaturePosition(id: string, position: FeaturePosition) {
    const entry = ctx.features.get(id);
    if (!entry) return;

    const pos = gpsToScenePosition(position, ctx.getTransform());
    entry.group.position.copy(pos);
    entry.position = position;
    ctx.requestRepaint();
  }

  function getFeaturePosition(id: string): FeaturePosition | null {
    const entry = ctx.features.get(id);
    return entry?.position ?? null;
  }

  function getInitialPosition(id: string): FeaturePosition | null {
    return ctx.initialPositions.get(id) ?? null;
  }

  function setFeatureHeading(id: string, radians: number) {
    const entry = ctx.features.get(id);
    if (!entry) return;
    entry.group.rotation.y = radians;
    ctx.requestRepaint();
  }

  function findFeatureId(object: THREE.Object3D): string | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      for (const [id, entry] of ctx.features) {
        if (entry.group === current) return id;
      }
      current = current.parent;
    }
    return null;
  }

  function swapFeatureAsset(
    id: string,
    newAssetId: string,
    applyAssetToFeature: (featureId: string) => void,
    highlightedFeatureId: { highlightedFeatureId: string | null }
  ) {
    const entry = ctx.features.get(id);
    if (!entry) return;

    if (entry.mixer) {
      entry.mixer.stopAllAction();
      entry.mixer = null;
    }
    const toRemove = entry.group.children.filter((c) => !c.userData.isFOV && !c.userData.isMarker);
    for (const child of toRemove) {
      entry.group.remove(child);
    }

    entry.assetId = newAssetId;
    applyAssetToFeature(id);

    if (highlightedFeatureId.highlightedFeatureId === id) {
      const targets = entry.group.children.filter((c) => !c.userData.isFOV && !c.userData.isMarker);
      ctx.outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
    }

    ctx.requestRepaint();
  }

  return {
    addFeature,
    removeFeature,
    updateFeaturePosition,
    getFeaturePosition,
    getInitialPosition,
    setFeatureHeading,
    findFeatureId,
    swapFeatureAsset,
  };
}

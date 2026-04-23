import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import type { AssetOptions } from "../../types";
import type { AssetEntry, FeatureEntry } from "../core/types";

export function createAssetRegistry(
  assets: Map<string, AssetEntry>,
  assetLoadPromises: Map<string, Promise<void>>,
  features: Map<string, FeatureEntry>,
  requestRepaint: () => void
) {
  function applyAssetToFeature(featureId: string) {
    const entry = features.get(featureId);
    if (!entry) return;

    const asset = assets.get(entry.assetId);
    if (!asset) return;

    const hasModel = entry.group.children.some((c) => !c.userData.isFOV && !c.userData.isMarker);
    if (hasModel) return;

    entry.group.scale.setScalar(asset.scale);

    const clone = SkeletonUtils.clone(asset.scene);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m: THREE.Material) => m.clone());
        } else {
          child.material = child.material.clone();
        }
        child.castShadow = true;
      }
    });

    entry.group.add(clone);

    if (asset.autoPlay && asset.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(clone);
      for (const clip of asset.animations) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.play();
      }
      entry.mixer = mixer;
    }

    requestRepaint();
  }

  function registerAsset(assetId: string, url: string, opts?: AssetOptions): Promise<void> {
    if (assets.has(assetId)) return Promise.resolve();

    const existing = assetLoadPromises.get(assetId);
    if (existing) return existing;

    const promise = new GLTFLoader()
      .loadAsync(url)
      .then((gltf) => {
        assets.set(assetId, {
          scene: gltf.scene,
          animations: gltf.animations,
          scale: opts?.scale ?? 1,
          autoPlay: opts?.autoPlay ?? true,
        });

        for (const [id, entry] of features) {
          if (entry.assetId === assetId) {
            applyAssetToFeature(id);
          }
        }

        requestRepaint();
      })
      .catch(() => {
        assetLoadPromises.delete(assetId);
      });

    assetLoadPromises.set(assetId, promise);
    return promise;
  }

  return { registerAsset, applyAssetToFeature };
}

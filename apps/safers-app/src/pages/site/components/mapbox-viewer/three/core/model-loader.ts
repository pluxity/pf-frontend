import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { MaterialRule } from "../../types";
import { applyPreset, GROUND_CLIP_PLANE } from "../materials";

export function loadBuildingModel(
  url: string,
  scene: THREE.Scene,
  materialPresets?: MaterialRule[],
  onReady?: () => void
): Promise<void> {
  const loader = new GLTFLoader();
  return loader.loadAsync(url).then((gltf) => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) =>
            applyPreset(m, GROUND_CLIP_PLANE, materialPresets)
          );
        } else {
          child.material = applyPreset(child.material, GROUND_CLIP_PLANE, materialPresets);
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(gltf.scene);
    onReady?.();
  });
}

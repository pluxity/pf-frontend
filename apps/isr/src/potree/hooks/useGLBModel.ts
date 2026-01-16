import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLBModelConfig } from "../types";
import { gisToLocal, applyPotreeCompatibleMaterials } from "../utils";
import { OUTLINE } from "../constants";

interface UseGLBModelOptions {
  config: GLBModelConfig | null;
  offset: THREE.Vector3;
  addToScene: (object: THREE.Object3D) => void;
  onError?: (error: Error) => void;
}

export function useGLBModel({ config, offset, addToScene, onError }: UseGLBModelOptions) {
  const modelRef = useRef<THREE.Group | null>(null);
  const loaderRef = useRef<GLTFLoader>(new GLTFLoader());

  useEffect(() => {
    if (!config || offset.length() === 0) return;

    loaderRef.current.load(
      config.url,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        const outlineColor = config.outlineColor ?? OUTLINE.CCTV_COLOR;
        applyPotreeCompatibleMaterials(model, outlineColor);

        if (config.position) {
          const localPos = gisToLocal(config.position, offset);
          model.position.copy(localPos);
        }

        if (config.rotation) {
          model.rotation.set(
            THREE.MathUtils.degToRad(config.rotation.x),
            THREE.MathUtils.degToRad(config.rotation.y),
            THREE.MathUtils.degToRad(config.rotation.z)
          );
        }

        if (config.scale) {
          if (typeof config.scale === "number") {
            model.scale.setScalar(config.scale);
          } else {
            model.scale.set(config.scale.x, config.scale.y, config.scale.z);
          }
        }

        addToScene(model);
      },
      undefined,
      (error) => {
        const err = error instanceof Error ? error : new Error("Failed to load GLB model");
        onError?.(err);
      }
    );

    return () => {
      const model = modelRef.current;
      if (model) {
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material?.dispose();
            }
          }
        });
        modelRef.current = null;
      }
    };
  }, [config, offset, addToScene, onError]);
}

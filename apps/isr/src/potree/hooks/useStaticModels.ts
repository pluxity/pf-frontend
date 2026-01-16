import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { CCTVConfig, GISCoordinate } from "../types";
import { gisToLocal, applyPotreeCompatibleMaterials } from "../utils";
import { OUTLINE, DEFAULT_CCTV_CONFIG_URL } from "../constants";

interface UseStaticModelsOptions {
  configUrl?: string;
  offset: THREE.Vector3;
  addToScene: (object: THREE.Object3D) => void;
  onError?: (error: Error) => void;
}

export function useStaticModels({
  configUrl = DEFAULT_CCTV_CONFIG_URL,
  offset,
  addToScene,
  onError,
}: UseStaticModelsOptions) {
  const modelsRef = useRef<Map<string, THREE.Group>>(new Map());
  const loaderRef = useRef<GLTFLoader>(new GLTFLoader());

  const loadCCTVModels = useCallback(async () => {
    if (offset.length() === 0) return;

    try {
      const response = await fetch(configUrl);
      const config: CCTVConfig = await response.json();

      const { model, cctvList } = config;

      for (const cctv of cctvList) {
        if (modelsRef.current.has(cctv.id)) continue;

        loaderRef.current.load(
          model.path,
          (gltf) => {
            const cctvModel = gltf.scene;
            modelsRef.current.set(cctv.id, cctvModel);

            applyPotreeCompatibleMaterials(cctvModel, OUTLINE.CCTV_COLOR);

            const gisPos: GISCoordinate = {
              x: cctv.position[0],
              y: cctv.position[1],
              z: cctv.position[2],
            };
            const localPos = gisToLocal(gisPos, offset);
            cctvModel.position.copy(localPos);

            if (model.scale) {
              cctvModel.scale.setScalar(model.scale);
            }

            cctvModel.rotation.y = THREE.MathUtils.degToRad(cctv.direction);

            addToScene(cctvModel);
          },
          undefined,
          (error) => {
            const err = error instanceof Error ? error : new Error("Failed to load CCTV model");
            onError?.(err);
          }
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to load CCTV config");
      onError?.(err);
    }
  }, [configUrl, offset, addToScene, onError]);

  useEffect(() => {
    loadCCTVModels();

    const models = modelsRef.current;
    return () => {
      models.forEach((model) => {
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
      });
      models.clear();
    };
  }, [loadCCTVModels]);
}

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { TrackingObject } from "../types";
import { gisToLocal, applyPotreeCompatibleMaterials } from "../utils";
import { TRACKING_MODELS } from "../constants";

interface ModelCache {
  model: THREE.Group;
  type: TrackingObject["type"];
}

interface UseTrackingObjectsOptions {
  objects: TrackingObject[];
  offset: THREE.Vector3;
  addToScene: (object: THREE.Object3D) => void;
  onError?: (error: Error) => void;
}

export function useTrackingObjects({
  objects,
  offset,
  addToScene,
  onError,
}: UseTrackingObjectsOptions) {
  const modelsRef = useRef<Map<string, ModelCache>>(new Map());
  const loaderRef = useRef<GLTFLoader>(new GLTFLoader());
  const loadingRef = useRef<Set<string>>(new Set());

  const loadModel = useCallback(
    (obj: TrackingObject) => {
      if (offset.length() === 0) return;
      if (loadingRef.current.has(obj.id)) return;

      const config = TRACKING_MODELS[obj.type];
      loadingRef.current.add(obj.id);

      loaderRef.current.load(
        config.url,
        (gltf) => {
          loadingRef.current.delete(obj.id);
          const model = gltf.scene;

          applyPotreeCompatibleMaterials(model, config.outlineColor);

          if (config.scale) {
            model.scale.setScalar(config.scale);
          }

          const localPos = gisToLocal(obj.position, offset);
          model.position.copy(localPos);

          if (obj.rotation !== undefined) {
            model.rotation.y = THREE.MathUtils.degToRad(obj.rotation);
          }

          modelsRef.current.set(obj.id, { model, type: obj.type });
          addToScene(model);
        },
        undefined,
        (error) => {
          loadingRef.current.delete(obj.id);
          const err =
            error instanceof Error ? error : new Error(`Failed to load model for ${obj.id}`);
          onError?.(err);
        }
      );
    },
    [offset, addToScene, onError]
  );

  const updateModel = useCallback(
    (obj: TrackingObject) => {
      const cached = modelsRef.current.get(obj.id);
      if (!cached || offset.length() === 0) return;

      const localPos = gisToLocal(obj.position, offset);
      cached.model.position.copy(localPos);

      if (obj.rotation !== undefined) {
        cached.model.rotation.y = THREE.MathUtils.degToRad(obj.rotation);
      }
    },
    [offset]
  );

  useEffect(() => {
    if (offset.length() === 0) return;

    objects.forEach((obj) => {
      const cached = modelsRef.current.get(obj.id);
      if (!cached) {
        loadModel(obj);
      } else {
        updateModel(obj);
      }
    });
  }, [objects, offset, loadModel, updateModel]);

  useEffect(() => {
    const models = modelsRef.current;
    return () => {
      models.forEach((cached) => {
        cached.model.traverse((child) => {
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
  }, []);

  return { updateModel };
}

import * as THREE from "three";
import type { FeaturePosition } from "../../types";
import type { SceneContext } from "../core/types";
import { gpsToScenePosition, checkOcclusionAt } from "../core/geo-utils";
import { GROUND_CLIP_PLANE } from "../materials";

export function createBuildingEffects(ctx: SceneContext) {
  let ceilingClipPlane: THREE.Plane | null = null;
  const savedMaterialStates = new Map<
    THREE.Material,
    { opacity: number; transparent: boolean; depthWrite: boolean }
  >();

  function setBuildingOpacity(opacity: number) {
    if (!ctx.modelGroup) return;
    ctx.modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          mat.transparent = opacity < 1;
          mat.opacity = opacity;
          mat.needsUpdate = true;
        }
      }
    });
    ctx.requestRepaint();
  }

  function setBuildingClipAltitude(altitude: number | null, workerPosition?: FeaturePosition) {
    if (!ctx.modelGroup) return;

    if (altitude === null) {
      ceilingClipPlane = null;
      ctx.modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.receiveShadow = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            mat.clippingPlanes = [GROUND_CLIP_PLANE];
            mat.needsUpdate = true;
          }
        }
      });
    } else {
      const t = ctx.getTransform();

      const deg = Math.PI / 180;
      ctx.modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
      ctx.modelGroup.scale.setScalar(t.scale);
      ctx.scene.updateMatrixWorld(true);

      const clipZ = gpsToScenePosition({ lng: t.lng, lat: t.lat, altitude }, t).z;
      ceilingClipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ);

      const workerScene = workerPosition ? gpsToScenePosition(workerPosition, t) : null;
      const box = new THREE.Box3();
      const XY_MARGIN = 2;

      ctx.modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];

          let shouldClip = !workerScene;
          if (workerScene) {
            box.setFromObject(child);
            shouldClip =
              workerScene.x >= box.min.x - XY_MARGIN &&
              workerScene.x <= box.max.x + XY_MARGIN &&
              workerScene.y >= box.min.y - XY_MARGIN &&
              workerScene.y <= box.max.y + XY_MARGIN;
          }

          if (shouldClip) child.receiveShadow = false;

          for (const mat of mats) {
            mat.clippingPlanes = shouldClip
              ? [GROUND_CLIP_PLANE, ceilingClipPlane!]
              : [GROUND_CLIP_PLANE];
            mat.needsUpdate = true;
          }
        }
      });
    }
    ctx.requestRepaint();
  }

  function setBuildingFloorTransparency(
    altitude: number | null,
    opacity = 0.08,
    workerPosition?: FeaturePosition
  ) {
    if (!ctx.modelGroup) return;

    if (altitude === null) {
      ctx.modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            const saved = savedMaterialStates.get(mat);
            if (saved) {
              mat.opacity = saved.opacity;
              mat.transparent = saved.transparent;
              mat.depthWrite = saved.depthWrite;
              mat.needsUpdate = true;
            }
          }
        }
      });
      savedMaterialStates.clear();
    } else {
      const t = ctx.getTransform();
      const clipZ = gpsToScenePosition({ lng: t.lng, lat: t.lat, altitude }, t).z;

      const workerScene = workerPosition ? gpsToScenePosition(workerPosition, t) : null;
      const box = new THREE.Box3();
      const XY_MARGIN = 2;

      ctx.modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          let nearWorker = !workerScene;
          if (workerScene) {
            box.setFromObject(child);
            nearWorker =
              workerScene.x >= box.min.x - XY_MARGIN &&
              workerScene.x <= box.max.x + XY_MARGIN &&
              workerScene.y >= box.min.y - XY_MARGIN &&
              workerScene.y <= box.max.y + XY_MARGIN;
          }

          if (!nearWorker) return;

          box.setFromObject(child);
          const meshAboveWorker = box.max.z > clipZ;

          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            if (!savedMaterialStates.has(mat)) {
              savedMaterialStates.set(mat, {
                opacity: mat.opacity,
                transparent: mat.transparent,
                depthWrite: mat.depthWrite,
              });
            }

            if (meshAboveWorker) {
              mat.transparent = true;
              mat.opacity = opacity;
              mat.depthWrite = false;
              mat.needsUpdate = true;
            }
          }
        }
      });
    }
    ctx.requestRepaint();
  }

  function checkOcclusion(featureId: string): boolean {
    const entry = ctx.features.get(featureId);
    if (!entry || !ctx.modelGroup) return false;

    ctx.scene.updateMatrixWorld(true);
    return checkOcclusionAt(entry.group.position.clone(), ctx.modelGroup, ctx.raycaster);
  }

  function dispose() {
    ceilingClipPlane = null;
    savedMaterialStates.clear();
  }

  return {
    setBuildingOpacity,
    setBuildingClipAltitude,
    setBuildingFloorTransparency,
    checkOcclusion,
    dispose,
  };
}

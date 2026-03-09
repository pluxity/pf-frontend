import { MercatorCoordinate } from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type {
  ModelTransform,
  RaycastHit,
  FeaturePosition,
  AssetOptions,
  ScreenPosition,
  MaterialRule,
} from "../types";
import type { GeoPosition } from "@/services/types/worker.types";
import { applyPreset, GROUND_CLIP_PLANE } from "./materials";

// Core
import { createSceneSetup } from "./core/scene-setup";
import type { SceneContext, AssetEntry, FeatureEntry } from "./core/types";
import { gpsToScenePosition, checkOcclusionAt } from "./core/geo-utils";

// Features
import { createAssetRegistry } from "./features/asset-registry";
import { createFeatureManager } from "./features/feature-manager";
import { createTweenEngine } from "./features/tween-engine";
import { createBuildingEffects } from "./features/building-effects";
import { createFOVBuilder } from "./features/fov-builder";
import { createHighlightManager } from "./features/highlight-manager";
import { createMarkerManager } from "./features/marker-manager";
import { createDangerZoneRenderer } from "./features/danger-zone-renderer";
import { createProjection } from "./features/projection";

export type { SceneContext, AssetEntry, FeatureEntry };
export { gpsToScenePosition, checkOcclusionAt };

export interface ThreeSceneApi {
  render: (matrix: number[]) => boolean;
  setSize: (width: number, height: number) => void;
  dispose: () => void;

  registerAsset: (assetId: string, url: string, options?: AssetOptions) => Promise<void>;
  addFeature: (id: string, assetId: string, position: FeaturePosition) => void;
  removeFeature: (id: string) => void;
  updateFeaturePosition: (id: string, position: FeaturePosition) => void;
  moveFeatureTo: (
    id: string,
    target: FeaturePosition,
    durationMs: number,
    onComplete?: () => void
  ) => void;

  swapFeatureAsset: (id: string, newAssetId: string) => void;

  highlightFeature: (id: string, color?: number) => void;
  clearHighlight: () => void;

  raycast: (screenX: number, screenY: number, width: number, height: number) => RaycastHit | null;

  projectFeatureToScreen: (id: string, width: number, height: number) => ScreenPosition | null;
  getFeaturePosition: (id: string) => FeaturePosition | null;
  getInitialPosition: (id: string) => FeaturePosition | null;

  setBuildingOpacity: (opacity: number) => void;
  setBuildingClipAltitude: (altitude: number | null, workerPosition?: FeaturePosition) => void;
  setBuildingFloorTransparency: (
    altitude: number | null,
    opacity?: number,
    workerPosition?: FeaturePosition
  ) => void;
  checkOcclusion: (featureId: string) => boolean;

  setFeatureHeading: (id: string, radians: number) => void;
  setFeatureFrustum: (
    id: string,
    corners: [GeoPosition, GeoPosition, GeoPosition, GeoPosition]
  ) => void;
  setFeatureFOVVisible: (id: string, visible: boolean) => void;
  setFOVColor: (id: string, color: number) => void;

  getAllFeatureScreenPositions: (width: number, height: number) => Map<string, ScreenPosition>;
  highlightFeatures: (ids: string[], color?: number) => void;

  moveFeatureAlongPath: (
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void
  ) => void;

  pushLivePosition: (id: string, position: FeaturePosition, lerpMs?: number) => void;

  addFeatureMarker: (id: string, color?: number, radius?: number) => void;
  removeFeatureMarker: (id: string) => void;
  clearAllMarkers: () => void;

  setDangerZones: (zones: { id: string; name: string; coordinates: [number, number][] }[]) => void;

  startPatrol: (id: string, path: FeaturePosition[], durationMs: number) => void;
  stopPatrol: (id: string) => void;

  probeAltitude: (lng: number, lat: number) => number | null;

  modelReady: Promise<void>;
}

export interface CreateThreeSceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  getTransform: () => ModelTransform;
  requestRepaint: () => void;
  materialPresets?: MaterialRule[];
}

export function createThreeScene(options: CreateThreeSceneOptions): ThreeSceneApi {
  const { canvas, modelUrl, getTransform, requestRepaint, materialPresets } = options;

  // --- Core setup ---
  const { renderer, scene, camera, composer, outlinePass } = createSceneSetup(canvas);
  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();

  // --- Shared state ---
  const assets = new Map<string, AssetEntry>();
  const assetLoadPromises = new Map<string, Promise<void>>();
  const features = new Map<string, FeatureEntry>();
  const initialPositions = new Map<string, FeaturePosition>();

  const ctx: SceneContext = {
    renderer,
    scene,
    camera,
    composer,
    outlinePass,
    raycaster,
    clock,
    modelGroup: null,
    assets,
    assetLoadPromises,
    features,
    initialPositions,
    lastModelTransformMat: null,
    lastCombinedMatrix: null,
    getTransform,
    requestRepaint,
  };

  // --- Feature modules ---
  const assetRegistry = createAssetRegistry(assets, assetLoadPromises, features, requestRepaint);
  const featureMgr = createFeatureManager(ctx);
  const highlight = createHighlightManager(outlinePass, features, requestRepaint);
  const tweens = createTweenEngine(ctx);
  const building = createBuildingEffects(ctx);
  const fov = createFOVBuilder(ctx);
  const markers = createMarkerManager(features, requestRepaint);
  const dangerZones = createDangerZoneRenderer(ctx);
  const projection = createProjection(ctx);

  // --- Live position handling ---
  const liveIdleTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const liveWalkingIds = new Set<string>();
  const LIVE_IDLE_TIMEOUT = 3000;

  // --- Render loop reusable objects (avoid per-frame allocation) ---
  const _modelTransform = new THREE.Matrix4();
  const _combined = new THREE.Matrix4();
  const _scaleVec = new THREE.Vector3();

  // --- Load building model ---
  const loader = new GLTFLoader();
  const modelReady = loader
    .loadAsync(modelUrl)
    .then((gltf) => {
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
      ctx.modelGroup = gltf.scene;
      scene.add(ctx.modelGroup);

      // 모델 transform 적용 후 BoundingBox 인덱스 빌드
      const t = getTransform();
      const deg = Math.PI / 180;
      ctx.modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
      ctx.modelGroup.scale.setScalar(t.scale);
      ctx.modelGroup.updateMatrixWorld(true);

      requestRepaint();
    })
    .catch(() => {
      // 빌딩 모델 로드 실패 — UI에서 별도 처리
    });

  return {
    render(matrix: number[]): boolean {
      const t = getTransform();

      if (ctx.modelGroup) {
        const deg = Math.PI / 180;
        ctx.modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
        ctx.modelGroup.scale.setScalar(t.scale);
      }

      const origin = MercatorCoordinate.fromLngLat([t.lng, t.lat], t.altitude);
      const s = origin.meterInMercatorCoordinateUnits();
      _modelTransform
        .makeTranslation(origin.x, origin.y, origin.z ?? 0)
        .scale(_scaleVec.set(s, -s, s));

      ctx.lastModelTransformMat = _modelTransform;
      _combined.fromArray(matrix).multiply(_modelTransform);
      ctx.lastCombinedMatrix = _combined;

      camera.projectionMatrix.copy(_combined);
      camera.projectionMatrixInverse.copy(_combined).invert();

      const delta = clock.getDelta();
      for (const feature of features.values()) {
        if (feature.mixer) feature.mixer.update(delta);
      }

      const now = performance.now();
      tweens.update(now);
      markers.updateAnimation(clock.elapsedTime);

      renderer.clear(true, true, true);
      composer.render(delta);

      let hasAnimation = tweens.hasActiveTweens() || markers.hasMarkers();
      if (!hasAnimation) {
        for (const feature of features.values()) {
          if (feature.mixer) {
            hasAnimation = true;
            break;
          }
        }
      }
      return hasAnimation;
    },

    setSize(width: number, height: number) {
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      outlinePass.resolution.set(width, height);
    },

    dispose() {
      for (const timer of liveIdleTimers.values()) clearTimeout(timer);
      liveIdleTimers.clear();
      liveWalkingIds.clear();

      for (const feature of features.values()) {
        if (feature.mixer) feature.mixer.stopAllAction();
      }

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            if (
              mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshBasicMaterial
            ) {
              mat.map?.dispose();
            }
            mat.dispose();
          }
        }
      });

      features.clear();
      initialPositions.clear();
      assets.clear();
      assetLoadPromises.clear();
      tweens.dispose();
      fov.dispose();
      building.dispose();
      dangerZones.dispose();
      composer.dispose();
      renderer.dispose();
    },

    registerAsset: assetRegistry.registerAsset,

    addFeature(id: string, assetId: string, position: FeaturePosition) {
      featureMgr.addFeature(id, assetId, position);
      assetRegistry.applyAssetToFeature(id);
    },

    removeFeature(id: string) {
      featureMgr.removeFeature(id, highlight.state);
      fov.fovGroups.delete(id);
      fov.frustumConfigs.delete(id);
    },

    updateFeaturePosition: featureMgr.updateFeaturePosition,
    moveFeatureTo: tweens.moveFeatureTo,
    moveFeatureAlongPath: tweens.moveFeatureAlongPath,

    swapFeatureAsset(id: string, newAssetId: string) {
      featureMgr.swapFeatureAsset(
        id,
        newAssetId,
        assetRegistry.applyAssetToFeature,
        highlight.state
      );
    },

    highlightFeature: highlight.highlightFeature,
    clearHighlight: highlight.clearHighlight,
    highlightFeatures: highlight.highlightFeatures,

    raycast(screenX: number, screenY: number, width: number, height: number) {
      return projection.raycast(screenX, screenY, width, height, featureMgr.findFeatureId);
    },

    projectFeatureToScreen: projection.projectFeatureToScreen,
    getAllFeatureScreenPositions: projection.getAllFeatureScreenPositions,
    getFeaturePosition: featureMgr.getFeaturePosition,
    getInitialPosition: featureMgr.getInitialPosition,

    setBuildingOpacity: building.setBuildingOpacity,
    setBuildingClipAltitude: building.setBuildingClipAltitude,
    setBuildingFloorTransparency: building.setBuildingFloorTransparency,
    checkOcclusion: building.checkOcclusion,

    setFeatureHeading: featureMgr.setFeatureHeading,
    setFeatureFrustum: fov.setFeatureFrustum,
    setFeatureFOVVisible: fov.setFeatureFOVVisible,
    setFOVColor: fov.setFOVColor,

    pushLivePosition(id: string, position: FeaturePosition, lerpMs = 1000) {
      const entry = features.get(id);
      if (!entry) return;

      const prev = entry.position;
      const dLng = position.lng - prev.lng;
      const dLat = position.lat - prev.lat;
      const dAlt = position.altitude - prev.altitude;
      if (dLng * dLng + dLat * dLat + dAlt * dAlt < 1e-16) return;

      if (!liveWalkingIds.has(id) && entry.assetId !== "worker-walk") {
        liveWalkingIds.add(id);
        if (entry.mixer) {
          entry.mixer.stopAllAction();
          entry.mixer = null;
        }
        const toRemove = entry.group.children.filter(
          (c) => !c.userData.isFOV && !c.userData.isMarker
        );
        for (const child of toRemove) entry.group.remove(child);
        entry.assetId = "worker-walk";
        assetRegistry.applyAssetToFeature(id);
        if (highlight.state.highlightedFeatureId === id) {
          const targets = entry.group.children.filter(
            (c) => !c.userData.isFOV && !c.userData.isMarker
          );
          outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
        }
      }

      tweens.cancelTweensForFeature(id);

      tweens.activeTweens.push({
        featureId: id,
        from: { ...entry.position },
        to: position,
        startTime: performance.now(),
        durationMs: lerpMs,
        autoHeading: true,
      });

      const existingTimer = liveIdleTimers.get(id);
      if (existingTimer) clearTimeout(existingTimer);

      liveIdleTimers.set(
        id,
        setTimeout(() => {
          liveIdleTimers.delete(id);
          if (!liveWalkingIds.has(id)) return;
          liveWalkingIds.delete(id);

          const e = features.get(id);
          if (!e) return;
          if (e.mixer) {
            e.mixer.stopAllAction();
            e.mixer = null;
          }
          const rem = e.group.children.filter((c) => !c.userData.isFOV && !c.userData.isMarker);
          for (const child of rem) e.group.remove(child);
          e.assetId = "worker";
          assetRegistry.applyAssetToFeature(id);
          if (highlight.state.highlightedFeatureId === id) {
            const targets = e.group.children.filter(
              (c) => !c.userData.isFOV && !c.userData.isMarker
            );
            outlinePass.selectedObjects = targets.length > 0 ? targets : [e.group];
          }
          requestRepaint();
        }, LIVE_IDLE_TIMEOUT)
      );

      requestRepaint();
    },

    addFeatureMarker: markers.addFeatureMarker,
    removeFeatureMarker: markers.removeFeatureMarker,
    clearAllMarkers: markers.clearAllMarkers,
    setDangerZones: dangerZones.setDangerZones,
    startPatrol: tweens.startPatrol,
    stopPatrol: tweens.stopPatrol,
    probeAltitude: projection.probeAltitude,

    modelReady,
  };
}

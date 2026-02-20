import { MercatorCoordinate } from "mapbox-gl";
import { easeCubicInOut } from "d3-ease";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import type {
  ModelTransform,
  RaycastHit,
  FeaturePosition,
  AssetOptions,
  ScreenPosition,
  MaterialRule,
} from "../types";
import { applyPreset, GROUND_CLIP_PLANE } from "./materials";
import { COLOR_SUCCESS, FOV_DEFAULTS, POPUP_HEAD_OFFSET } from "../constants";

interface AssetEntry {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  scale: number;
}

interface FeatureEntry {
  assetId: string;
  group: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  position: FeaturePosition;
}

export function gpsToScenePosition(
  position: FeaturePosition,
  transform: ModelTransform
): THREE.Vector3 {
  const featureMerc = MercatorCoordinate.fromLngLat(
    [position.lng, position.lat],
    position.altitude
  );
  const originMerc = MercatorCoordinate.fromLngLat(
    [transform.lng, transform.lat],
    transform.altitude
  );
  const s = originMerc.meterInMercatorCoordinateUnits();

  return new THREE.Vector3(
    (featureMerc.x - originMerc.x) / s,
    (originMerc.y - featureMerc.y) / s,
    ((featureMerc.z ?? 0) - (originMerc.z ?? 0)) / s
  );
}

const OCCLUSION_DIRECTIONS = [
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
];

export function checkOcclusionAt(
  position: THREE.Vector3,
  target: THREE.Object3D,
  raycaster: THREE.Raycaster,
  maxDistance = 8
): boolean {
  const prevFar = raycaster.far;
  let blocked = 0;

  for (const dir of OCCLUSION_DIRECTIONS) {
    raycaster.set(position, dir);
    raycaster.far = maxDistance;
    const hits = raycaster.intersectObject(target, true);
    if (hits.length > 0) blocked++;
  }

  raycaster.far = prevFar;
  return blocked >= 4;
}

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
  checkOcclusion: (featureId: string) => boolean;

  setFeatureHeading: (id: string, radians: number) => void;
  setFeatureFOV: (id: string, fovDeg: number, range: number, pitchDeg?: number) => void;
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

  /** 지정 lng/lat 위치에서 건물 표면까지의 고도(m)를 반환. 건물이 없으면 null */
  probeAltitude: (lng: number, lat: number) => number | null;

  /** 건물 모델 로드 완료 시 resolve 되는 Promise */
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

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.autoClear = false;

  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  scene.add(new THREE.AmbientLight(0xffffff, 3.0));

  const sunLight = new THREE.DirectionalLight(0xfff4e5, 8.0);
  sunLight.position.set(-200, -400, 300);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(4096, 4096);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 800;
  sunLight.shadow.camera.left = -200;
  sunLight.shadow.camera.right = 200;
  sunLight.shadow.camera.top = 200;
  sunLight.shadow.camera.bottom = -200;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.radius = 10;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xc4d4f0, 2.5);
  fillLight.position.set(-100, 50, -100);
  scene.add(fillLight);

  const pointLight = new THREE.PointLight(0xffffff, 4.0, 300);
  pointLight.position.set(0, 0, 80);
  scene.add(pointLight);

  const size = new THREE.Vector2(canvas.clientWidth || 1, canvas.clientHeight || 1);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);

  const renderPass = new RenderPass(scene, camera);
  renderPass.clear = true;
  renderPass.clearDepth = true;
  composer.addPass(renderPass);

  const outlinePass = new OutlinePass(size, scene, camera);
  outlinePass.edgeStrength = 3;
  outlinePass.edgeGlow = 0.5;
  outlinePass.edgeThickness = 1;
  outlinePass.visibleEdgeColor.set(COLOR_SUCCESS);
  outlinePass.hiddenEdgeColor.set(COLOR_SUCCESS);
  outlinePass.pulsePeriod = 0;
  composer.addPass(outlinePass);

  composer.addPass(new OutputPass());

  let modelGroup: THREE.Group | null = null;
  let ceilingClipPlane: THREE.Plane | null = null;

  let lastModelTransformMat: THREE.Matrix4 | null = null;
  let lastCombinedMatrix: THREE.Matrix4 | null = null;
  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();

  const assets = new Map<string, AssetEntry>();
  const assetLoadPromises = new Map<string, Promise<void>>();
  const features = new Map<string, FeatureEntry>();
  const initialPositions = new Map<string, FeaturePosition>();
  const fovMeshes = new Map<string, THREE.Mesh>();

  interface MarkerEntry {
    featureId: string;
    core: THREE.Mesh;
    pulses: THREE.Mesh[];
    maxRadius: number;
    offsets: number[];
  }
  const markerEntries = new Map<string, MarkerEntry>();
  const PULSE_CYCLE = 2.0;
  const PULSE_COUNT = 2;

  const dangerZoneGroups = new Map<string, THREE.Group>();

  const patrolStates = new Map<string, { active: boolean }>();

  interface FOVConfig {
    fovDeg: number;
    range: number;
    pitchDeg: number;
  }

  const fovConfigs = new Map<string, FOVConfig>();

  function buildFOVMesh(id: string) {
    const entry = features.get(id);
    const config = fovConfigs.get(id);
    if (!entry || !config) return;

    const existing = fovMeshes.get(id);
    const wasVisible = existing?.visible ?? false;
    if (existing) {
      existing.geometry.dispose();
      (existing.material as THREE.Material).dispose();
      entry.group.remove(existing);
      fovMeshes.delete(id);
    }

    const { fovDeg, range, pitchDeg } = config;
    const aspect = 16 / 9;
    const hHalf = (fovDeg / 2) * (Math.PI / 180);
    const vHalf = Math.atan(Math.tan(hHalf) / aspect);
    const pitchRad = -(pitchDeg * Math.PI) / 180;

    if (modelGroup) {
      const t = getTransform();
      const deg = Math.PI / 180;
      modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
      modelGroup.scale.setScalar(t.scale);
    }

    scene.updateMatrixWorld(true);
    const groupWorld = entry.group.matrixWorld;
    const groupWorldInverse = groupWorld.clone().invert();
    const origin = new THREE.Vector3().setFromMatrixPosition(groupWorld);

    const targets: THREE.Object3D[] = [];
    if (modelGroup) targets.push(modelGroup);
    for (const [fId, f] of features) {
      if (fId !== id) targets.push(f.group);
    }

    const COLS = FOV_DEFAULTS.GRID_COLS;
    const ROWS = FOV_DEFAULTS.GRID_ROWS;
    const localVertices: THREE.Vector3[] = [];
    const prevFar = raycaster.far;

    for (let row = 0; row <= ROWS; row++) {
      for (let col = 0; col <= COLS; col++) {
        const u = col / COLS;
        const v = row / ROWS;

        const hAngle = -hHalf + u * 2 * hHalf;
        const vAngle = -vHalf + v * 2 * vHalf;

        const localDir = new THREE.Vector3(Math.tan(hAngle), Math.tan(vAngle), 1).normalize();

        const cosP = Math.cos(pitchRad);
        const sinP = Math.sin(pitchRad);
        const y2 = localDir.y * cosP - localDir.z * sinP;
        const z2 = localDir.y * sinP + localDir.z * cosP;
        localDir.y = y2;
        localDir.z = z2;
        localDir.normalize();

        const worldDir = localDir.clone().transformDirection(groupWorld);

        raycaster.set(origin, worldDir);
        raycaster.far = range;
        const hits = raycaster.intersectObjects(targets, true);
        const validHit = hits.find((h) => !h.object.userData.isFOV);
        const dist = validHit ? validHit.distance : range;

        const hitWorld = origin.clone().addScaledVector(worldDir, dist);
        localVertices.push(hitWorld.applyMatrix4(groupWorldInverse));
      }
    }

    raycaster.far = prevFar;

    const positions: number[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i00 = row * (COLS + 1) + col;
        const i10 = i00 + 1;
        const i01 = i00 + (COLS + 1);
        const i11 = i01 + 1;

        const v00 = localVertices[i00]!;
        const v10 = localVertices[i10]!;
        const v11 = localVertices[i11]!;
        const v01 = localVertices[i01]!;

        positions.push(v00.x, v00.y, v00.z, v10.x, v10.y, v10.z, v11.x, v11.y, v11.z);
        positions.push(v00.x, v00.y, v00.z, v11.x, v11.y, v11.z, v01.x, v01.y, v01.z);
      }
    }

    for (let col = 0; col < COLS; col++) {
      const t0 = localVertices[col]!;
      const t1 = localVertices[col + 1]!;
      positions.push(0, 0, 0, t0.x, t0.y, t0.z, t1.x, t1.y, t1.z);
      const b0 = localVertices[ROWS * (COLS + 1) + col]!;
      const b1 = localVertices[ROWS * (COLS + 1) + col + 1]!;
      positions.push(0, 0, 0, b1.x, b1.y, b1.z, b0.x, b0.y, b0.z);
    }
    for (let row = 0; row < ROWS; row++) {
      const l0 = localVertices[row * (COLS + 1)]!;
      const l1 = localVertices[(row + 1) * (COLS + 1)]!;
      positions.push(0, 0, 0, l1.x, l1.y, l1.z, l0.x, l0.y, l0.z);
      const r0 = localVertices[row * (COLS + 1) + COLS]!;
      const r1 = localVertices[(row + 1) * (COLS + 1) + COLS]!;
      positions.push(0, 0, 0, r0.x, r0.y, r0.z, r1.x, r1.y, r1.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: COLOR_SUCCESS,
      transparent: true,
      opacity: FOV_DEFAULTS.OPACITY,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      clippingPlanes: [GROUND_CLIP_PLANE],
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isFOV = true;
    mesh.visible = wasVisible;

    entry.group.add(mesh);
    fovMeshes.set(id, mesh);
    requestRepaint();
  }

  function rebuildAllFOVs() {
    for (const id of fovConfigs.keys()) {
      if (features.has(id)) buildFOVMesh(id);
    }
  }

  let highlightedFeatureId: string | null = null;

  interface PositionTween {
    featureId: string;
    from: FeaturePosition;
    to: FeaturePosition;
    startTime: number;
    durationMs: number;
    autoHeading?: boolean;
    onComplete?: () => void;
  }

  interface PathTween {
    featureId: string;
    path: FeaturePosition[];
    cumulativeRatios: number[];
    startTime: number;
    durationMs: number;
    linear?: boolean;
    onComplete?: () => void;
  }

  const activeTweens: PositionTween[] = [];
  const activePathTweens: PathTween[] = [];

  const liveIdleTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const liveWalkingIds = new Set<string>();
  const LIVE_IDLE_TIMEOUT = 3000;

  function findFeatureId(object: THREE.Object3D): string | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      for (const [id, entry] of features) {
        if (entry.group === current) return id;
      }
      current = current.parent;
    }
    return null;
  }

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

    if (asset.animations.length > 0) {
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

  const loader = new GLTFLoader();
  const modelReady = loader.loadAsync(modelUrl).then((gltf) => {
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
    modelGroup = gltf.scene;
    scene.add(modelGroup);

    rebuildAllFOVs();

    requestRepaint();
  });

  function doMoveAlongPath(
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void,
    linear?: boolean
  ) {
    if (path.length < 2) return;
    const entry = features.get(id);
    if (!entry) return;

    for (let i = activeTweens.length - 1; i >= 0; i--) {
      if (activeTweens[i]!.featureId === id) activeTweens.splice(i, 1);
    }
    for (let i = activePathTweens.length - 1; i >= 0; i--) {
      if (activePathTweens[i]!.featureId === id) activePathTweens.splice(i, 1);
    }

    const distances: number[] = [];
    let totalDist = 0;
    for (let s = 0; s < path.length - 1; s++) {
      const a = path[s]!;
      const b = path[s + 1]!;
      const dlng = (b.lng - a.lng) * 111320 * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
      const dlat = (b.lat - a.lat) * 111320;
      const dalt = b.altitude - a.altitude;
      const dist = Math.sqrt(dlng * dlng + dlat * dlat + dalt * dalt);
      distances.push(dist);
      totalDist += dist;
    }

    const cumulativeRatios: number[] = [];
    let cumDist = 0;
    for (const d of distances) {
      cumDist += d;
      cumulativeRatios.push(totalDist > 0 ? cumDist / totalDist : 1);
    }

    activePathTweens.push({
      featureId: id,
      path,
      cumulativeRatios,
      startTime: performance.now(),
      durationMs,
      linear,
      onComplete,
    });

    requestRepaint();
  }

  return {
    render(matrix: number[]): boolean {
      const t = getTransform();

      if (modelGroup) {
        const deg = Math.PI / 180;
        modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
        modelGroup.scale.setScalar(t.scale);
      }

      const origin = MercatorCoordinate.fromLngLat([t.lng, t.lat], t.altitude);
      const s = origin.meterInMercatorCoordinateUnits();
      const modelTransform = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z ?? 0)
        .scale(new THREE.Vector3(s, -s, s));

      lastModelTransformMat = modelTransform;
      const combined = new THREE.Matrix4().fromArray(matrix).multiply(modelTransform);
      lastCombinedMatrix = combined;

      camera.projectionMatrix.copy(combined);
      camera.projectionMatrixInverse.copy(combined).invert();

      const delta = clock.getDelta();
      for (const feature of features.values()) {
        if (feature.mixer) feature.mixer.update(delta);
      }

      const now = performance.now();
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        const tw = activeTweens[i]!;
        const elapsed = now - tw.startTime;
        const progress = Math.min(elapsed / tw.durationMs, 1);
        const t = easeCubicInOut(progress);

        const lerpPos: FeaturePosition = {
          lng: tw.from.lng + (tw.to.lng - tw.from.lng) * t,
          lat: tw.from.lat + (tw.to.lat - tw.from.lat) * t,
          altitude: tw.from.altitude + (tw.to.altitude - tw.from.altitude) * t,
        };

        const entry = features.get(tw.featureId);
        if (entry) {
          const pos = gpsToScenePosition(lerpPos, getTransform());

          if (tw.autoHeading) {
            const fromScene = gpsToScenePosition(tw.from, getTransform());
            const toScene = gpsToScenePosition(tw.to, getTransform());
            const dx = toScene.x - fromScene.x;
            const dy = toScene.y - fromScene.y;
            if (dx * dx + dy * dy > 1e-10) {
              entry.group.rotation.y = Math.atan2(dx, -dy);
            }
          }

          entry.group.position.copy(pos);
          entry.position = lerpPos;
        }

        if (progress >= 1) {
          activeTweens.splice(i, 1);
          tw.onComplete?.();
        }
      }

      for (let i = activePathTweens.length - 1; i >= 0; i--) {
        const pt = activePathTweens[i]!;
        const elapsed = now - pt.startTime;
        const progress = Math.min(elapsed / pt.durationMs, 1);
        const t = pt.linear ? progress : easeCubicInOut(progress);

        let segIdx = 0;
        for (let s = 0; s < pt.cumulativeRatios.length; s++) {
          if (t <= pt.cumulativeRatios[s]!) break;
          segIdx = s + 1;
        }
        segIdx = Math.min(segIdx, pt.path.length - 2);

        const segStart = segIdx === 0 ? 0 : pt.cumulativeRatios[segIdx - 1]!;
        const segEnd = pt.cumulativeRatios[segIdx]!;
        const segLen = segEnd - segStart;
        const localT = segLen > 0 ? (t - segStart) / segLen : 1;

        const from = pt.path[segIdx]!;
        const to = pt.path[segIdx + 1]!;

        const lerpPos: FeaturePosition = {
          lng: from.lng + (to.lng - from.lng) * localT,
          lat: from.lat + (to.lat - from.lat) * localT,
          altitude: from.altitude + (to.altitude - from.altitude) * localT,
        };

        const entry = features.get(pt.featureId);
        if (entry) {
          const pos = gpsToScenePosition(lerpPos, getTransform());

          const fromScene = gpsToScenePosition(from, getTransform());
          const toScene = gpsToScenePosition(to, getTransform());
          const dx = toScene.x - fromScene.x;
          const dy = toScene.y - fromScene.y;
          if (dx * dx + dy * dy > 1e-10) {
            entry.group.rotation.y = Math.atan2(dx, -dy);
          }

          entry.group.position.copy(pos);
          entry.position = lerpPos;
        }

        if (progress >= 1) {
          activePathTweens.splice(i, 1);
          pt.onComplete?.();
        }
      }

      const elapsed = clock.elapsedTime;
      for (const marker of markerEntries.values()) {
        for (let i = 0; i < marker.pulses.length; i++) {
          const pulse = marker.pulses[i]!;
          const offset = marker.offsets[i]!;
          const t = (elapsed / PULSE_CYCLE + offset) % 1;
          const scale = t * marker.maxRadius;
          pulse.scale.setScalar(Math.max(scale, 0.01));
          (pulse.material as THREE.MeshBasicMaterial).opacity = 0.2 * (1 - t);
        }
      }

      renderer.clear(true, true, true);
      composer.render(delta);

      let hasAnimation =
        activeTweens.length > 0 || activePathTweens.length > 0 || markerEntries.size > 0;
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
      for (const feature of features.values()) {
        if (feature.mixer) feature.mixer.stopAllAction();
      }
      features.clear();
      initialPositions.clear();
      fovMeshes.clear();
      fovConfigs.clear();
      assets.clear();
      assetLoadPromises.clear();
      ceilingClipPlane = null;
      for (const state of patrolStates.values()) state.active = false;
      patrolStates.clear();
      for (const group of dangerZoneGroups.values()) {
        scene.remove(group);
        group.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
            child.geometry.dispose();
            const mat = child.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else (mat as THREE.Material).dispose();
          }
          if (child instanceof THREE.Sprite) {
            const mat = child.material as THREE.SpriteMaterial;
            mat.map?.dispose();
            mat.dispose();
          }
        });
      }
      dangerZoneGroups.clear();
      composer.dispose();
      renderer.dispose();
    },

    async registerAsset(assetId: string, url: string, opts?: AssetOptions) {
      if (assets.has(assetId)) return;

      const existing = assetLoadPromises.get(assetId);
      if (existing) return existing;

      const promise = new Promise<void>((resolve) => {
        const assetLoader = new GLTFLoader();
        assetLoader.load(url, (gltf) => {
          assets.set(assetId, {
            scene: gltf.scene,
            animations: gltf.animations,
            scale: opts?.scale ?? 1,
          });

          for (const [id, entry] of features) {
            if (entry.assetId === assetId) {
              applyAssetToFeature(id);
            }
          }

          requestRepaint();
          resolve();
        });
      });

      assetLoadPromises.set(assetId, promise);
      return promise;
    },

    addFeature(id: string, assetId: string, position: FeaturePosition) {
      if (features.has(id)) return;

      const pos = gpsToScenePosition(position, getTransform());
      const group = new THREE.Group();
      group.position.copy(pos);
      group.rotation.x = Math.PI / 2;

      const asset = assets.get(assetId);
      group.scale.setScalar(asset?.scale ?? 1);

      scene.add(group);
      features.set(id, { assetId, group, mixer: null, position });
      initialPositions.set(id, { ...position });

      if (asset) {
        applyAssetToFeature(id);
      }

      requestRepaint();
    },

    removeFeature(id: string) {
      const entry = features.get(id);
      if (!entry) return;

      if (entry.mixer) entry.mixer.stopAllAction();
      scene.remove(entry.group);
      features.delete(id);
      initialPositions.delete(id);
      fovMeshes.delete(id);
      fovConfigs.delete(id);

      if (highlightedFeatureId === id) {
        outlinePass.selectedObjects = [];
        highlightedFeatureId = null;
      }

      requestRepaint();
    },

    updateFeaturePosition(id: string, position: FeaturePosition) {
      const entry = features.get(id);
      if (!entry) return;

      const pos = gpsToScenePosition(position, getTransform());
      entry.group.position.copy(pos);
      entry.position = position;
      requestRepaint();
    },

    moveFeatureTo(
      id: string,
      target: FeaturePosition,
      durationMs: number,
      onComplete?: () => void
    ) {
      const entry = features.get(id);
      if (!entry) return;

      for (let i = activeTweens.length - 1; i >= 0; i--) {
        if (activeTweens[i]!.featureId === id) activeTweens.splice(i, 1);
      }
      for (let i = activePathTweens.length - 1; i >= 0; i--) {
        if (activePathTweens[i]!.featureId === id) activePathTweens.splice(i, 1);
      }

      activeTweens.push({
        featureId: id,
        from: { ...entry.position },
        to: target,
        startTime: performance.now(),
        durationMs,
        autoHeading: true,
        onComplete,
      });

      requestRepaint();
    },

    moveFeatureAlongPath(
      id: string,
      path: FeaturePosition[],
      durationMs: number,
      onComplete?: () => void
    ) {
      doMoveAlongPath(id, path, durationMs, onComplete);
    },

    swapFeatureAsset(id: string, newAssetId: string) {
      const entry = features.get(id);
      if (!entry) return;

      if (entry.mixer) {
        entry.mixer.stopAllAction();
        entry.mixer = null;
      }
      const toRemove = entry.group.children.filter(
        (c) => !c.userData.isFOV && !c.userData.isMarker
      );
      for (const child of toRemove) {
        entry.group.remove(child);
      }

      entry.assetId = newAssetId;
      applyAssetToFeature(id);

      if (highlightedFeatureId === id) {
        const targets = entry.group.children.filter(
          (c) => !c.userData.isFOV && !c.userData.isMarker
        );
        outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
      }

      requestRepaint();
    },

    highlightFeature(id: string, color?: number) {
      highlightedFeatureId = id;

      const entry = features.get(id);
      if (entry) {
        const targets = entry.group.children.filter(
          (c) => !c.userData.isFOV && !c.userData.isMarker
        );
        outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
      }

      const c = color ?? COLOR_SUCCESS;
      outlinePass.visibleEdgeColor.set(c);
      outlinePass.hiddenEdgeColor.set(c);

      requestRepaint();
    },

    clearHighlight() {
      if (!highlightedFeatureId) return;
      highlightedFeatureId = null;
      outlinePass.selectedObjects = [];
      outlinePass.visibleEdgeColor.set(COLOR_SUCCESS);
      outlinePass.hiddenEdgeColor.set(COLOR_SUCCESS);
      requestRepaint();
    },

    raycast(screenX: number, screenY: number, width: number, height: number): RaycastHit | null {
      if (!modelGroup || !lastCombinedMatrix || !lastModelTransformMat) return null;

      scene.updateMatrixWorld(true);

      const ndcX = (screenX / width) * 2 - 1;
      const ndcY = -(screenY / height) * 2 + 1;

      const inverse = lastCombinedMatrix.clone().invert();
      const near = new THREE.Vector3(ndcX, ndcY, -1).applyMatrix4(inverse);
      const far = new THREE.Vector3(ndcX, ndcY, 1).applyMatrix4(inverse);
      const direction = far.sub(near).normalize();

      raycaster.set(near, direction);
      const targets: THREE.Object3D[] = [modelGroup];
      for (const feature of features.values()) {
        targets.push(feature.group);
      }
      const intersects = raycaster.intersectObjects(targets, true);
      const hit = intersects[0];
      if (!hit) return null;

      const hitPoint = hit.point;
      const mercatorPoint = hitPoint.clone().applyMatrix4(lastModelTransformMat);
      const mc = new MercatorCoordinate(mercatorPoint.x, mercatorPoint.y, mercatorPoint.z);
      const lngLat = mc.toLngLat();

      return {
        lng: lngLat.lng,
        lat: lngLat.lat,
        altitude: mc.toAltitude(),
        meshName: hit.object.name || "unknown",
        featureId: findFeatureId(hit.object) ?? undefined,
      };
    },

    projectFeatureToScreen(id: string, width: number, height: number): ScreenPosition | null {
      const entry = features.get(id);
      if (!entry || !lastCombinedMatrix) return null;

      const pos = entry.group.position.clone();
      pos.z += POPUP_HEAD_OFFSET;

      const p = new THREE.Vector4(pos.x, pos.y, pos.z, 1).applyMatrix4(lastCombinedMatrix);
      if (p.w <= 0) return null;

      return {
        x: ((p.x / p.w) * 0.5 + 0.5) * width,
        y: (-(p.y / p.w) * 0.5 + 0.5) * height,
      };
    },

    getFeaturePosition(id: string): FeaturePosition | null {
      const entry = features.get(id);
      return entry?.position ?? null;
    },

    setBuildingOpacity(opacity: number) {
      if (!modelGroup) return;
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) {
            mat.transparent = opacity < 1;
            mat.opacity = opacity;
            mat.needsUpdate = true;
          }
        }
      });
      requestRepaint();
    },

    setBuildingClipAltitude(altitude: number | null, workerPosition?: FeaturePosition) {
      if (!modelGroup) return;

      if (altitude === null) {
        ceilingClipPlane = null;
        modelGroup.traverse((child) => {
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
        const t = getTransform();

        // 모델 회전 적용 후 matrixWorld 갱신
        const deg = Math.PI / 180;
        modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
        modelGroup.scale.setScalar(t.scale);
        scene.updateMatrixWorld(true);

        // altitude → scene Z (model Y → world Z는 1:1 매핑)
        const clipZ = gpsToScenePosition({ lng: t.lng, lat: t.lat, altitude }, t).z;
        ceilingClipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ);

        const workerScene = workerPosition ? gpsToScenePosition(workerPosition, t) : null;
        const box = new THREE.Box3();
        const XY_MARGIN = 2;

        modelGroup.traverse((child) => {
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
      requestRepaint();
    },

    checkOcclusion(featureId: string): boolean {
      const entry = features.get(featureId);
      if (!entry || !modelGroup) return false;

      scene.updateMatrixWorld(true);
      return checkOcclusionAt(entry.group.position.clone(), modelGroup, raycaster);
    },

    getInitialPosition(id: string): FeaturePosition | null {
      return initialPositions.get(id) ?? null;
    },

    setFeatureHeading(id: string, radians: number) {
      const entry = features.get(id);
      if (!entry) return;
      entry.group.rotation.y = radians;
      requestRepaint();
    },

    setFeatureFOV(id: string, fovDeg: number, range: number, pitchDeg = 0) {
      fovConfigs.set(id, { fovDeg, range, pitchDeg });
      buildFOVMesh(id);
    },

    setFeatureFOVVisible(id: string, visible: boolean) {
      const mesh = fovMeshes.get(id);
      if (!mesh) return;
      mesh.visible = visible;
      requestRepaint();
    },

    setFOVColor(id: string, color: number) {
      const mesh = fovMeshes.get(id);
      if (!mesh) return;
      (mesh.material as THREE.MeshBasicMaterial).color.set(color);
      requestRepaint();
    },

    getAllFeatureScreenPositions(width: number, height: number): Map<string, ScreenPosition> {
      const result = new Map<string, ScreenPosition>();
      if (!lastCombinedMatrix) return result;

      for (const [id, entry] of features) {
        const pos = entry.group.position.clone();
        pos.z += POPUP_HEAD_OFFSET;
        const p = new THREE.Vector4(pos.x, pos.y, pos.z, 1).applyMatrix4(lastCombinedMatrix);
        if (p.w <= 0) continue;
        result.set(id, {
          x: ((p.x / p.w) * 0.5 + 0.5) * width,
          y: (-(p.y / p.w) * 0.5 + 0.5) * height,
        });
      }
      return result;
    },

    highlightFeatures(ids: string[], color?: number) {
      const objects: THREE.Object3D[] = [];
      for (const id of ids) {
        const entry = features.get(id);
        if (!entry) continue;
        const targets = entry.group.children.filter(
          (c) => !c.userData.isFOV && !c.userData.isMarker
        );
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
      highlightedFeatureId = ids[0] ?? null;
      requestRepaint();
    },

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
        applyAssetToFeature(id);
        if (highlightedFeatureId === id) {
          const targets = entry.group.children.filter(
            (c) => !c.userData.isFOV && !c.userData.isMarker
          );
          outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
        }
      }

      for (let i = activeTweens.length - 1; i >= 0; i--) {
        if (activeTweens[i]!.featureId === id) activeTweens.splice(i, 1);
      }
      for (let i = activePathTweens.length - 1; i >= 0; i--) {
        if (activePathTweens[i]!.featureId === id) activePathTweens.splice(i, 1);
      }

      activeTweens.push({
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
          applyAssetToFeature(id);
          if (highlightedFeatureId === id) {
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

    addFeatureMarker(id: string, color = 0x00c48c, radius = 6) {
      const entry = features.get(id);
      if (!entry || markerEntries.has(id)) return;

      const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.userData.isMarker = true;
      entry.group.add(core);

      const pulses: THREE.Mesh[] = [];
      const offsets: number[] = [];

      for (let i = 0; i < PULSE_COUNT; i++) {
        const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
        const sphereMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          wireframe: true,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.userData.isMarker = true;
        sphere.scale.setScalar(0.01);
        entry.group.add(sphere);
        pulses.push(sphere);
        offsets.push(i / PULSE_COUNT);
      }

      markerEntries.set(id, { featureId: id, core, pulses, maxRadius: radius, offsets });
      requestRepaint();
    },

    removeFeatureMarker(id: string) {
      const marker = markerEntries.get(id);
      if (!marker) return;

      const entry = features.get(id);
      if (entry) {
        entry.group.remove(marker.core);
        marker.core.geometry.dispose();
        (marker.core.material as THREE.Material).dispose();
        for (const p of marker.pulses) {
          entry.group.remove(p);
          p.geometry.dispose();
          (p.material as THREE.Material).dispose();
        }
      }
      markerEntries.delete(id);
      requestRepaint();
    },

    clearAllMarkers() {
      for (const [id, marker] of markerEntries) {
        const entry = features.get(id);
        if (entry) {
          entry.group.remove(marker.core);
          marker.core.geometry.dispose();
          (marker.core.material as THREE.Material).dispose();
          for (const p of marker.pulses) {
            entry.group.remove(p);
            p.geometry.dispose();
            (p.material as THREE.Material).dispose();
          }
        }
      }
      markerEntries.clear();
      requestRepaint();
    },

    startPatrol(id: string, path: FeaturePosition[], durationMs: number) {
      const existing = patrolStates.get(id);
      if (existing) existing.active = false;

      const state = { active: true };
      patrolStates.set(id, state);

      const doLoop = () => {
        if (!state.active) return;
        doMoveAlongPath(id, path, durationMs, doLoop, true);
      };
      doLoop();
    },

    stopPatrol(id: string) {
      const state = patrolStates.get(id);
      if (state) state.active = false;
      patrolStates.delete(id);

      for (let i = activePathTweens.length - 1; i >= 0; i--) {
        if (activePathTweens[i]!.featureId === id) activePathTweens.splice(i, 1);
      }
    },

    setDangerZones(zones) {
      for (const group of dangerZoneGroups.values()) {
        scene.remove(group);
        group.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
            child.geometry.dispose();
            const mat = child.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else (mat as THREE.Material).dispose();
          }
          if (child instanceof THREE.Sprite) {
            const mat = child.material as THREE.SpriteMaterial;
            mat.map?.dispose();
            mat.dispose();
          }
        });
      }
      dangerZoneGroups.clear();

      const t = getTransform();

      for (const zone of zones) {
        const coords = zone.coordinates;
        if (coords.length < 3) continue;

        const scenePoints = coords.map((c) =>
          gpsToScenePosition({ lng: c[0], lat: c[1], altitude: 0.15 }, t)
        );

        const group = new THREE.Group();
        group.userData.isDangerZone = true;

        const shape = new THREE.Shape();
        shape.moveTo(scenePoints[0]!.x, scenePoints[0]!.y);
        for (let i = 1; i < scenePoints.length; i++) {
          shape.lineTo(scenePoints[i]!.x, scenePoints[i]!.y);
        }
        shape.closePath();

        const fillGeo = new THREE.ShapeGeometry(shape);
        const fillMat = new THREE.MeshBasicMaterial({
          color: 0xde4545,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const fillMesh = new THREE.Mesh(fillGeo, fillMat);
        fillMesh.position.z = scenePoints[0]!.z;
        fillMesh.raycast = () => {};
        group.add(fillMesh);

        const linePoints = [...scenePoints, scenePoints[0]!];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xde4545,
          linewidth: 2,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.raycast = () => {};
        group.add(line);

        scene.add(group);
        dangerZoneGroups.set(zone.id, group);
      }

      requestRepaint();
    },

    probeAltitude(lng: number, lat: number): number | null {
      if (!modelGroup) return null;
      const transform = getTransform();

      // altitude 0과 1 두 지점으로 scene Z ↔ meter 스케일 산출
      const ref0 = gpsToScenePosition({ lng, lat, altitude: 0 }, transform);
      const ref1 = gpsToScenePosition({ lng, lat, altitude: 1 }, transform);
      const metersPerUnit = 1 / (ref1.z - ref0.z);

      // 충분히 높은 곳에서 아래로 레이캐스트
      const origin = gpsToScenePosition({ lng, lat, altitude: 300 }, transform);
      const dir = new THREE.Vector3(0, 0, -1);

      const prevFar = raycaster.far;
      raycaster.set(origin, dir);
      raycaster.far = 600 / metersPerUnit;
      const hits = raycaster.intersectObject(modelGroup, true);
      raycaster.far = prevFar;

      if (hits.length === 0) return null;

      const hitZ = hits[0]!.point.z;
      return Math.round((hitZ - ref0.z) * metersPerUnit * 100) / 100;
    },

    modelReady,
  };
}

import { MercatorCoordinate } from "mapbox-gl";
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
} from "./types";
import { applyPreset, GROUND_CLIP_PLANE } from "./materials";
import { COLOR_SUCCESS, FOV_DEFAULTS, POPUP_HEAD_OFFSET } from "./constants";

// ── Asset / Feature 내부 타입 ──

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

// ── GPS → 씬 좌표 변환 (순수 함수, 패키지 추출 시 재사용 가능) ──

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

// ── 5방향 레이캐스트 오클루전 감지 (순수 함수) ──

const OCCLUSION_DIRECTIONS = [
  new THREE.Vector3(0, 0, 1), // 위 (천장)
  new THREE.Vector3(1, 0, 0), // +x
  new THREE.Vector3(-1, 0, 0), // -x
  new THREE.Vector3(0, 1, 0), // +y
  new THREE.Vector3(0, -1, 0), // -y
];

/**
 * 5방향 레이캐스트 오클루전 테스트.
 * 4개 이상 차단 시 실내(true) 판정.
 */
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

// ── ThreeSceneApi ──

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
  checkOcclusion: (featureId: string) => boolean;

  setFeatureHeading: (id: string, radians: number) => void;
  setFeatureFOV: (id: string, fovDeg: number, range: number, pitchDeg?: number) => void;
  setFeatureFOVVisible: (id: string, visible: boolean) => void;
  setFOVColor: (id: string, color: number) => void;
}

// ── 팩토리 옵션 ──

export interface CreateThreeSceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  getTransform: () => ModelTransform;
  requestRepaint: () => void;
  materialPresets?: MaterialRule[];
}

export function createThreeScene(options: CreateThreeSceneOptions): ThreeSceneApi {
  const { canvas, modelUrl, getTransform, requestRepaint, materialPresets } = options;

  // ── Renderer (독립 WebGL 컨텍스트) ──

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

  // ── Scene & Camera ──

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  // ── 조명 ──

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

  // ── EffectComposer (포스트 프로세싱) ──

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

  // ── 모델 상태 ──

  let modelGroup: THREE.Group | null = null;

  // 레이캐스트용
  let lastModelTransformMat: THREE.Matrix4 | null = null;
  let lastCombinedMatrix: THREE.Matrix4 | null = null;
  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();

  // Asset / Feature 관리
  const assets = new Map<string, AssetEntry>();
  const assetLoadPromises = new Map<string, Promise<void>>();
  const features = new Map<string, FeatureEntry>();
  const initialPositions = new Map<string, FeaturePosition>();
  const fovMeshes = new Map<string, THREE.Mesh>();

  // ── FOV 레이캐스트 그리드 ──

  interface FOVConfig {
    fovDeg: number;
    range: number;
    pitchDeg: number;
  }

  const fovConfigs = new Map<string, FOVConfig>();

  /**
   * 레이캐스트 기반 FOV 메시 빌드.
   * CCTV 원점에서 FOV 내 그리드 방향으로 레이를 쏴서
   * 건물/객체에 막히는 지점까지만 메시를 생성한다.
   */
  function buildFOVMesh(id: string) {
    const entry = features.get(id);
    const config = fovConfigs.get(id);
    if (!entry || !config) return;

    // 기존 FOV 메시 제거 (visibility 상태 보존)
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

    // render() 전에 호출될 수 있으므로 모델 변환 먼저 적용
    if (modelGroup) {
      const t = getTransform();
      const deg = Math.PI / 180;
      modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
      modelGroup.scale.setScalar(t.scale);
    }

    // 월드 좌표계 준비
    scene.updateMatrixWorld(true);
    const groupWorld = entry.group.matrixWorld;
    const groupWorldInverse = groupWorld.clone().invert();
    const origin = new THREE.Vector3().setFromMatrixPosition(groupWorld);

    // 레이캐스트 타겟: 씬의 모든 3D 객체 (자기 자신 제외)
    const targets: THREE.Object3D[] = [];
    if (modelGroup) targets.push(modelGroup);
    for (const [fId, f] of features) {
      if (fId !== id) targets.push(f.group);
    }

    // 그리드 레이캐스트 — 각 방향에서 건물/객체 히트 거리 수집
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

        // 로컬 방향 (+Z = forward)
        const localDir = new THREE.Vector3(Math.tan(hAngle), Math.tan(vAngle), 1).normalize();

        // pitch 적용 (로컬 X축 회전)
        const cosP = Math.cos(pitchRad);
        const sinP = Math.sin(pitchRad);
        const y2 = localDir.y * cosP - localDir.z * sinP;
        const z2 = localDir.y * sinP + localDir.z * cosP;
        localDir.y = y2;
        localDir.z = z2;
        localDir.normalize();

        // 월드 방향으로 변환
        const worldDir = localDir.clone().transformDirection(groupWorld);

        // 레이캐스트
        raycaster.set(origin, worldDir);
        raycaster.far = range;
        const hits = raycaster.intersectObjects(targets, true);
        const validHit = hits.find((h) => !h.object.userData.isFOV);
        const dist = validHit ? validHit.distance : range;

        // 히트 포인트 → 그룹 로컬 좌표
        const hitWorld = origin.clone().addScaledVector(worldDir, dist);
        localVertices.push(hitWorld.applyMatrix4(groupWorldInverse));
      }
    }

    raycaster.far = prevFar;

    // ── 지오메트리 빌드 ──

    const positions: number[] = [];

    // 1. Cap surface (투영면 — 그리드 셀마다 삼각형 2개)
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

    // 2. Side faces (원점 → 가장자리 꼭짓점)
    for (let col = 0; col < COLS; col++) {
      // Top edge
      const t0 = localVertices[col]!;
      const t1 = localVertices[col + 1]!;
      positions.push(0, 0, 0, t0.x, t0.y, t0.z, t1.x, t1.y, t1.z);
      // Bottom edge
      const b0 = localVertices[ROWS * (COLS + 1) + col]!;
      const b1 = localVertices[ROWS * (COLS + 1) + col + 1]!;
      positions.push(0, 0, 0, b1.x, b1.y, b1.z, b0.x, b0.y, b0.z);
    }
    for (let row = 0; row < ROWS; row++) {
      // Left edge
      const l0 = localVertices[row * (COLS + 1)]!;
      const l1 = localVertices[(row + 1) * (COLS + 1)]!;
      positions.push(0, 0, 0, l1.x, l1.y, l1.z, l0.x, l0.y, l0.z);
      // Right edge
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

  // 하이라이트 상태
  let highlightedFeatureId: string | null = null;

  // Feature 이동 애니메이션 상태
  interface PositionTween {
    featureId: string;
    from: FeaturePosition;
    to: FeaturePosition;
    startTime: number;
    durationMs: number;
    onComplete?: () => void;
  }
  const activeTweens: PositionTween[] = [];

  // ── 유틸리티 함수 ──

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

    const hasModel = entry.group.children.some((c) => !c.userData.isFOV);
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

  // ── 건물 모델 로드 ──

  const loader = new GLTFLoader();
  loader.load(modelUrl, (gltf) => {
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

    // 건물 모델 로드 완료 → FOV 메시 재빌드 (차폐 반영)
    rebuildAllFOVs();

    requestRepaint();
  });

  // ── API ──

  return {
    render(matrix: number[]): boolean {
      const t = getTransform();

      if (modelGroup) {
        const deg = Math.PI / 180;
        modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
        modelGroup.scale.setScalar(t.scale);
      }

      // 매 프레임 위치 재계산
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

      // Feature 애니메이션 업데이트
      const delta = clock.getDelta();
      for (const feature of features.values()) {
        if (feature.mixer) feature.mixer.update(delta);
      }

      // Position tween 업데이트
      const now = performance.now();
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        const tw = activeTweens[i]!;
        const elapsed = now - tw.startTime;
        const progress = Math.min(elapsed / tw.durationMs, 1);
        // ease-in-out
        const t = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const lerpPos: FeaturePosition = {
          lng: tw.from.lng + (tw.to.lng - tw.from.lng) * t,
          lat: tw.from.lat + (tw.to.lat - tw.from.lat) * t,
          altitude: tw.from.altitude + (tw.to.altitude - tw.from.altitude) * t,
        };

        const entry = features.get(tw.featureId);
        if (entry) {
          const pos = gpsToScenePosition(lerpPos, getTransform());
          entry.group.position.copy(pos);
          entry.position = lerpPos;
        }

        if (progress >= 1) {
          activeTweens.splice(i, 1);
          tw.onComplete?.();
        }
      }

      // EffectComposer 렌더
      renderer.clear(true, true, true);
      composer.render(delta);

      // 애니메이션 여부 반환
      let hasAnimation = activeTweens.length > 0;
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
      composer.dispose();
      renderer.dispose();
    },

    // ── Asset 관리 ──

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

    // ── Feature 관리 ──

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

      // 기존 같은 feature의 tween 제거
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        if (activeTweens[i]!.featureId === id) activeTweens.splice(i, 1);
      }

      activeTweens.push({
        featureId: id,
        from: { ...entry.position },
        to: target,
        startTime: performance.now(),
        durationMs,
        onComplete,
      });

      requestRepaint();
    },

    // ── 에셋 교체 ──

    swapFeatureAsset(id: string, newAssetId: string) {
      const entry = features.get(id);
      if (!entry) return;

      // 기존 정리
      if (entry.mixer) {
        entry.mixer.stopAllAction();
        entry.mixer = null;
      }
      const toRemove = entry.group.children.filter((c) => !c.userData.isFOV);
      for (const child of toRemove) {
        entry.group.remove(child);
      }

      // 새 에셋 적용
      entry.assetId = newAssetId;
      applyAssetToFeature(id);

      // 하이라이트 유지 (FOV 메시 제외)
      if (highlightedFeatureId === id) {
        const targets = entry.group.children.filter((c) => !c.userData.isFOV);
        outlinePass.selectedObjects = targets.length > 0 ? targets : [entry.group];
      }

      requestRepaint();
    },

    // ── 하이라이트 (OutlinePass) ──

    highlightFeature(id: string, color?: number) {
      highlightedFeatureId = id;

      const entry = features.get(id);
      if (entry) {
        // FOV 메시 제외 — OutlinePass는 clippingPlane을 무시하므로
        const targets = entry.group.children.filter((c) => !c.userData.isFOV);
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

    // ── 레이캐스트 ──

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

    // ── 3D → 2D 스크린 좌표 투영 ──

    projectFeatureToScreen(id: string, width: number, height: number): ScreenPosition | null {
      const entry = features.get(id);
      if (!entry || !lastCombinedMatrix) return null;

      const pos = entry.group.position.clone();
      pos.z += POPUP_HEAD_OFFSET;

      const p = new THREE.Vector4(pos.x, pos.y, pos.z, 1).applyMatrix4(lastCombinedMatrix);
      if (p.w <= 0) return null; // 카메라 뒤

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
  };
}

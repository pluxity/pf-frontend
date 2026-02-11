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
} from "./types";
import { applyPreset, GROUND_CLIP_PLANE } from "./materials";

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

// ── GPS → 씬 좌표 변환 ──

function gpsToScenePosition(position: FeaturePosition, transform: ModelTransform): THREE.Vector3 {
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

// ── ThreeSceneApi ──

export interface ThreeSceneApi {
  render: (matrix: number[]) => boolean;
  setSize: (width: number, height: number) => void;
  dispose: () => void;

  registerAsset: (assetId: string, url: string, options?: AssetOptions) => Promise<void>;
  addFeature: (id: string, assetId: string, position: FeaturePosition) => void;
  removeFeature: (id: string) => void;
  updateFeaturePosition: (id: string, position: FeaturePosition) => void;

  swapFeatureAsset: (id: string, newAssetId: string) => void;

  highlightFeature: (id: string, color?: number) => void;
  clearHighlight: () => void;

  raycast: (screenX: number, screenY: number, width: number, height: number) => RaycastHit | null;

  projectFeatureToScreen: (id: string, width: number, height: number) => ScreenPosition | null;

  setBuildingOpacity: (opacity: number) => void;
  checkOcclusion: (featureId: string) => boolean;
}

export function createThreeScene(
  canvas: HTMLCanvasElement,
  modelUrl: string,
  transformRef: React.RefObject<ModelTransform>,
  requestRepaint: () => void
): ThreeSceneApi {
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
  outlinePass.visibleEdgeColor.set(0x00c48c);
  outlinePass.hiddenEdgeColor.set(0x00c48c);
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

  // 하이라이트 상태
  let highlightedFeatureId: string | null = null;

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

    if (entry.group.children.length > 0) return;

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
          child.material = child.material.map((m) => applyPreset(m, GROUND_CLIP_PLANE));
        } else {
          child.material = applyPreset(child.material, GROUND_CLIP_PLANE);
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    modelGroup = gltf.scene;
    scene.add(modelGroup);

    requestRepaint();
  });

  // ── API ──

  return {
    render(matrix: number[]): boolean {
      if (modelGroup && transformRef.current) {
        const t = transformRef.current;
        const deg = Math.PI / 180;
        modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
        modelGroup.scale.setScalar(t.scale);
      }

      // 매 프레임 위치 재계산
      const t = transformRef.current;
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

      // EffectComposer 렌더
      renderer.clear(true, true, true);
      composer.render(delta);

      // 애니메이션 여부 반환
      let hasAnimation = false;
      for (const feature of features.values()) {
        if (feature.mixer) {
          hasAnimation = true;
          break;
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
      assets.clear();
      assetLoadPromises.clear();
      composer.dispose();
      renderer.dispose();
    },

    // ── Asset 관리 ──

    async registerAsset(assetId: string, url: string, options?: AssetOptions) {
      if (assets.has(assetId)) return;

      const existing = assetLoadPromises.get(assetId);
      if (existing) return existing;

      const promise = new Promise<void>((resolve) => {
        const assetLoader = new GLTFLoader();
        assetLoader.load(url, (gltf) => {
          assets.set(assetId, {
            scene: gltf.scene,
            animations: gltf.animations,
            scale: options?.scale ?? 1,
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

      const pos = gpsToScenePosition(position, transformRef.current);
      const group = new THREE.Group();
      group.position.copy(pos);
      group.rotation.x = Math.PI / 2;

      const asset = assets.get(assetId);
      group.scale.setScalar(asset?.scale ?? 1);

      scene.add(group);
      features.set(id, { assetId, group, mixer: null, position });

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

      if (highlightedFeatureId === id) {
        outlinePass.selectedObjects = [];
        highlightedFeatureId = null;
      }

      requestRepaint();
    },

    updateFeaturePosition(id: string, position: FeaturePosition) {
      const entry = features.get(id);
      if (!entry) return;

      const pos = gpsToScenePosition(position, transformRef.current);
      entry.group.position.copy(pos);
      entry.position = position;
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
      while (entry.group.children.length > 0) {
        entry.group.remove(entry.group.children[0]!);
      }

      // 새 에셋 적용
      entry.assetId = newAssetId;
      applyAssetToFeature(id);

      // 하이라이트 유지
      if (highlightedFeatureId === id) {
        outlinePass.selectedObjects = [entry.group];
      }

      requestRepaint();
    },

    // ── 하이라이트 (OutlinePass) ──

    highlightFeature(id: string, color?: number) {
      highlightedFeatureId = id;

      const entry = features.get(id);
      if (entry) {
        outlinePass.selectedObjects = [entry.group];
      }

      // 색상 지정 시 아웃라인 색상 변경, 없으면 기본 초록색 (정상)
      const c = color ?? 0x00c48c;
      outlinePass.visibleEdgeColor.set(c);
      outlinePass.hiddenEdgeColor.set(c);

      requestRepaint();
    },

    clearHighlight() {
      if (!highlightedFeatureId) return;
      highlightedFeatureId = null;
      outlinePass.selectedObjects = [];
      // 기본 색상 복원 (정상 — 초록)
      outlinePass.visibleEdgeColor.set(0x00c48c);
      outlinePass.hiddenEdgeColor.set(0x00c48c);
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
      pos.z += 2; // 머리 위 2m 오프셋

      const p = new THREE.Vector4(pos.x, pos.y, pos.z, 1).applyMatrix4(lastCombinedMatrix);
      if (p.w <= 0) return null; // 카메라 뒤

      return {
        x: ((p.x / p.w) * 0.5 + 0.5) * width,
        y: (-(p.y / p.w) * 0.5 + 0.5) * height,
      };
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

      const workerPos = entry.group.position.clone();

      // 5방향 레이캐스트 — 위(천장) + 수평 4방향(벽)
      // 다층 건물에서 상층 슬래브만 있는 개방 층은 실외로 판정
      const directions = [
        new THREE.Vector3(0, 0, 1), // 위 (천장)
        new THREE.Vector3(1, 0, 0), // +x
        new THREE.Vector3(-1, 0, 0), // -x
        new THREE.Vector3(0, 1, 0), // +y
        new THREE.Vector3(0, -1, 0), // -y
      ];

      const MAX_DIST = 8; // 8m 이내 장애물 감지
      let blocked = 0;
      const prevFar = raycaster.far;

      for (const dir of directions) {
        raycaster.set(workerPos, dir);
        raycaster.far = MAX_DIST;
        const hits = raycaster.intersectObject(modelGroup, true);
        if (hits.length > 0) blocked++;
      }

      raycaster.far = prevFar;

      // 5방향 중 4개 이상 차단 → 실내 (천장 + 벽 3면 이상)
      return blocked >= 4;
    },
  };
}

import { Map as MapboxMap, MercatorCoordinate } from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import type { ModelTransform, RaycastHit, FeaturePosition, AssetOptions } from "./types";
import { applyPreset, GROUND_CLIP_PLANE } from "./materials";
import { createRippleRings, updateRippleAnimation } from "./ripple";

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

// ── 하이라이트 설정 ──

const HIGHLIGHT_COLOR = new THREE.Color(0x00aaff);
const HIGHLIGHT_INTENSITY = 0.6;

// ── GPS → 씬 좌표 변환 ──

/** GPS 좌표 → Three.js 씬 공간 좌표 변환 (ENU: X=east, Y=north, Z=up) */
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

// ── ThreeLayerApi ──

export interface ThreeLayerApi {
  id: string;
  type: "custom";
  renderingMode: "3d";
  onAdd: (map: MapboxMap, gl: WebGL2RenderingContext) => void;
  render: (gl: WebGL2RenderingContext, matrix: number[]) => void;
  raycast: (screenX: number, screenY: number, width: number, height: number) => RaycastHit | null;

  /** 에셋 등록 (GLB 1회 로드, 이후 clone으로 재사용) */
  registerAsset: (assetId: string, url: string, options?: AssetOptions) => Promise<void>;
  /** 에셋 인스턴스를 GPS 좌표에 배치 */
  addFeature: (id: string, assetId: string, position: FeaturePosition) => void;
  /** 인스턴스 제거 */
  removeFeature: (id: string) => void;
  /** 인스턴스 GPS 좌표 업데이트 */
  updateFeaturePosition: (id: string, position: FeaturePosition) => void;
  /** Feature 하이라이트 (emissive 글로우) */
  highlightFeature: (id: string) => void;
  /** 하이라이트 해제 */
  clearHighlight: () => void;
}

export function createThreeLayer(
  modelUrl: string,
  transformRef: React.RefObject<ModelTransform>
): ThreeLayerApi {
  let camera: THREE.Camera;
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let mapInstance: MapboxMap;
  let modelGroup: THREE.Group | null = null;
  let rippleGroup: THREE.Group | null = null;
  let rippleRings: THREE.Mesh[] = [];
  let rippleMaxRadius = 1;

  // 레이캐스트용 저장 변수
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

  /** hit mesh → 소속 feature ID 역추적 */
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

  /** feature의 모든 mesh에 emissive 적용/해제 */
  function setFeatureEmissive(featureId: string, color: THREE.Color, intensity: number) {
    const entry = features.get(featureId);
    if (!entry) return;

    entry.group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          if ("emissive" in mat) {
            (mat as THREE.MeshStandardMaterial).emissive.copy(color);
            (mat as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
          }
        }
      }
    });

    mapInstance.triggerRepaint();
  }

  /** 캐시된 에셋을 feature에 적용 (clone + 머티리얼 독립화 + 애니메이션) */
  function applyAssetToFeature(featureId: string) {
    const entry = features.get(featureId);
    if (!entry) return;

    const asset = assets.get(entry.assetId);
    if (!asset) return;

    // 이미 모델이 붙어있으면 스킵
    if (entry.group.children.length > 0) return;

    // 에셋 기본 스케일 적용
    entry.group.scale.setScalar(asset.scale);

    const clone = SkeletonUtils.clone(asset.scene);

    // 머티리얼 독립화 (하이라이트 시 다른 인스턴스에 영향 방지)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m: THREE.Material) => m.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });

    entry.group.add(clone);

    // 애니메이션 재생
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

    mapInstance.triggerRepaint();
  }

  return {
    id: "3d-model",
    type: "custom" as const,
    renderingMode: "3d" as const,

    onAdd(map: MapboxMap, gl: WebGL2RenderingContext) {
      mapInstance = map;
      camera = new THREE.Camera();
      scene = new THREE.Scene();

      // 조명
      scene.add(new THREE.AmbientLight(0xffffff, 3.0));

      const sunLight = new THREE.DirectionalLight(0xfff4e5, 8.0);
      sunLight.position.set(200, 400, 300);
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0xc4d4f0, 2.5);
      fillLight.position.set(-100, 50, -100);
      scene.add(fillLight);

      const pointLight = new THREE.PointLight(0xffffff, 4.0, 300);
      pointLight.position.set(0, 0, 80);
      scene.add(pointLight);

      // 건물 모델 로드
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material = child.material.map((m) => applyPreset(m, GROUND_CLIP_PLANE));
            } else {
              child.material = applyPreset(child.material, GROUND_CLIP_PLANE);
            }
          }
        });
        modelGroup = gltf.scene;
        scene.add(modelGroup);

        // 리플 이펙트
        const box = new THREE.Box3().setFromObject(modelGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        rippleMaxRadius = Math.max(size.x, size.y) * 1.8;
        const ripple = createRippleRings();
        rippleGroup = ripple.group;
        rippleRings = ripple.rings;
        scene.add(rippleGroup);

        mapInstance.triggerRepaint();
      });

      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.autoClear = false;
      renderer.localClippingEnabled = true;
    },

    render(_gl: WebGL2RenderingContext, matrix: number[]) {
      if (modelGroup && transformRef.current) {
        const t = transformRef.current;
        const deg = Math.PI / 180;
        modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
        modelGroup.scale.setScalar(t.scale);

        // 리플 애니메이션
        if (rippleGroup && rippleRings.length > 0) {
          rippleGroup.rotation.copy(modelGroup.rotation);
          rippleGroup.scale.copy(modelGroup.scale);
          updateRippleAnimation(rippleRings, rippleMaxRadius);
        }
      }

      // 매 프레임 위치 재계산
      const t = transformRef.current;
      const origin = MercatorCoordinate.fromLngLat([t.lng, t.lat], t.altitude);
      const s = origin.meterInMercatorCoordinateUnits();
      const modelTransform = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z ?? 0)
        .scale(new THREE.Vector3(s, -s, s));

      // 레이캐스트용 매트릭스 저장
      lastModelTransformMat = modelTransform;
      lastCombinedMatrix = new THREE.Matrix4().fromArray(matrix).multiply(modelTransform);

      camera.projectionMatrix = lastCombinedMatrix.clone();

      // Feature 애니메이션 업데이트
      const delta = clock.getDelta();
      for (const feature of features.values()) {
        if (feature.mixer) feature.mixer.update(delta);
      }

      renderer.resetState();
      const gl = renderer.getContext();
      gl.clear(gl.DEPTH_BUFFER_BIT);
      renderer.render(scene, camera);

      // 애니메이션이 있는 feature가 있으면 연속 repaint, 없으면 중단
      let hasAnimation = rippleRings.length > 0;
      if (!hasAnimation) {
        for (const feature of features.values()) {
          if (feature.mixer) {
            hasAnimation = true;
            break;
          }
        }
      }
      if (hasAnimation) mapInstance.triggerRepaint();
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
      if (intersects.length === 0) return null;

      const hitPoint = intersects[0].point;
      const mercatorPoint = hitPoint.clone().applyMatrix4(lastModelTransformMat);
      const mc = new MercatorCoordinate(mercatorPoint.x, mercatorPoint.y, mercatorPoint.z);
      const lngLat = mc.toLngLat();

      return {
        lng: lngLat.lng,
        lat: lngLat.lat,
        altitude: mc.toAltitude(),
        meshName: intersects[0].object.name || "unknown",
        featureId: findFeatureId(intersects[0].object) ?? undefined,
      };
    },

    // ── Asset 관리 ──

    async registerAsset(assetId: string, url: string, options?: AssetOptions) {
      if (assets.has(assetId)) return;

      const existing = assetLoadPromises.get(assetId);
      if (existing) return existing;

      const promise = new Promise<void>((resolve) => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
          assets.set(assetId, {
            scene: gltf.scene,
            animations: gltf.animations,
            scale: options?.scale ?? 1,
          });

          // 이 에셋을 기다리던 feature들에 모델 적용
          for (const [id, entry] of features) {
            if (entry.assetId === assetId) {
              applyAssetToFeature(id);
            }
          }

          mapInstance.triggerRepaint();
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
      group.rotation.x = Math.PI / 2; // GLB Y-up → 씬 Z-up (ENU)

      // 에셋 기본 스케일 적용
      const asset = assets.get(assetId);
      group.scale.setScalar(asset?.scale ?? 1);

      scene.add(group);
      features.set(id, { assetId, group, mixer: null, position });

      // 에셋이 이미 로드되었으면 즉시 적용, 아니면 로드 완료 시 자동 적용
      if (asset) {
        applyAssetToFeature(id);
      }

      mapInstance.triggerRepaint();
    },

    removeFeature(id: string) {
      const entry = features.get(id);
      if (!entry) return;

      if (entry.mixer) entry.mixer.stopAllAction();
      scene.remove(entry.group);
      features.delete(id);
      mapInstance.triggerRepaint();
    },

    updateFeaturePosition(id: string, position: FeaturePosition) {
      const entry = features.get(id);
      if (!entry) return;

      const pos = gpsToScenePosition(position, transformRef.current);
      entry.group.position.copy(pos);
      entry.position = position;
      mapInstance.triggerRepaint();
    },

    // ── 하이라이트 ──

    highlightFeature(id: string) {
      if (highlightedFeatureId === id) return;

      // 이전 하이라이트 해제
      if (highlightedFeatureId) {
        setFeatureEmissive(highlightedFeatureId, new THREE.Color(0x000000), 0);
      }

      highlightedFeatureId = id;
      setFeatureEmissive(id, HIGHLIGHT_COLOR, HIGHLIGHT_INTENSITY);
    },

    clearHighlight() {
      if (!highlightedFeatureId) return;

      setFeatureEmissive(highlightedFeatureId, new THREE.Color(0x000000), 0);
      highlightedFeatureId = null;
      mapInstance.triggerRepaint();
    },
  };
}

import { Map as MapboxMap, MercatorCoordinate } from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { ModelTransform } from "./types";
import { applyPreset, GROUND_CLIP_PLANE } from "./materials";
import { createRippleRings, updateRippleAnimation } from "./ripple";

export function createThreeLayer(modelUrl: string, transformRef: React.RefObject<ModelTransform>) {
  let camera: THREE.Camera;
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let mapInstance: MapboxMap;
  let modelGroup: THREE.Group | null = null;
  let rippleGroup: THREE.Group | null = null;
  let rippleRings: THREE.Mesh[] = [];
  let rippleMaxRadius = 1;

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

      // 모델 로드
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

      const projMatrix = new THREE.Matrix4().fromArray(matrix).multiply(modelTransform);
      camera.projectionMatrix = projMatrix;

      renderer.resetState();
      const gl = renderer.getContext();
      gl.clear(gl.DEPTH_BUFFER_BIT);
      renderer.render(scene, camera);
      mapInstance.triggerRepaint();
    },
  };
}

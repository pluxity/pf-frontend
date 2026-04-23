import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { COLOR_SUCCESS } from "../../../../config/assets.config";

export interface SceneSetupResult {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  composer: EffectComposer;
  outlinePass: OutlinePass;
}

export function createSceneSetup(canvas: HTMLCanvasElement): SceneSetupResult {
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

  return { renderer, scene, camera, composer, outlinePass };
}

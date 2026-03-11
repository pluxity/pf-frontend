import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import type { SceneContext } from "../types";

// Side-effect imports for Babylon.js features
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Layers/glowLayer";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Animations/animatable";

export function createEngineSetup(canvas: HTMLCanvasElement): SceneContext {
  // --- Engine ---
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true,
  });

  // --- Scene ---
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.12, 0.13, 0.15, 1);

  // --- Camera (campus overview) ---
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 4, // alpha
    Math.PI / 4, // beta (45°)
    150, // radius (campus overview)
    new Vector3(0, 0, 5),
    scene
  );
  camera.lowerBetaLimit = 0.1;
  camera.upperBetaLimit = Math.PI / 2.2;
  camera.lowerRadiusLimit = 15;
  camera.upperRadiusLimit = 250;
  camera.wheelDeltaPercentage = 0.01;
  camera.panningSensibility = 50;
  camera.attachControl(canvas, true);

  // --- FPS Camera (walkthrough, initially detached) ---
  const fpsCamera = new UniversalCamera("fpsCamera", new Vector3(0, 2, 0), scene);
  fpsCamera.speed = 0.5;
  fpsCamera.angularSensibility = 2000;
  fpsCamera.ellipsoid = new Vector3(0.5, 1, 0.5);
  fpsCamera.checkCollisions = true;
  fpsCamera.minZ = 0.1;
  fpsCamera.keysUp = [87]; // W
  fpsCamera.keysDown = [83]; // S
  fpsCamera.keysLeft = [65]; // A
  fpsCamera.keysRight = [68]; // D

  // --- Ambient Light (brighter for campus) ---
  const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.7;
  ambient.diffuse = new Color3(0.9, 0.9, 1.0);
  ambient.groundColor = new Color3(0.2, 0.2, 0.25);

  // --- Directional Light (sun, stronger) ---
  const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1.5), scene);
  sun.position = new Vector3(60, 80, 60);
  sun.intensity = 1.2;
  sun.diffuse = new Color3(1, 0.98, 0.92);

  // --- Shadow Generator ---
  const shadowGenerator = new ShadowGenerator(2048, sun);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  shadowGenerator.darkness = 0.4;

  // --- Glow Layer (equipment highlights) ---
  const glowLayer = new GlowLayer("glow", scene, {
    mainTextureSamples: 4,
    blurKernelSize: 32,
  });
  glowLayer.intensity = 0.6;

  // --- Overload Glow Layer (building overload pulse) ---
  const overloadGlowLayer = new GlowLayer("overloadGlow", scene, {
    mainTextureSamples: 4,
    blurKernelSize: 64,
  });
  overloadGlowLayer.intensity = 0;

  // --- Render Loop ---
  engine.runRenderLoop(() => {
    scene.render();
  });

  // --- Resize ---
  const handleResize = () => engine.resize();
  window.addEventListener("resize", handleResize);

  scene.onDisposeObservable.addOnce(() => {
    window.removeEventListener("resize", handleResize);
  });

  return { engine, scene, camera, fpsCamera, shadowGenerator, glowLayer, overloadGlowLayer };
}

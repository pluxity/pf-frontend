import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Animation } from "@babylonjs/core/Animations/animation";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { IFCIndices, IFCCameraMode } from "../types";

const FLY_DURATION_MS = 800;
const FLY_FRAMES = 60;
const WALL_ANIM_MS = 300;

/** IFC types whose meshes should become transparent in interior mode */
const TRANSPARENT_TYPES = ["IfcWall", "IfcWallStandardCase", "IfcSlab", "IfcRoof"];

interface CameraPreset {
  target: Vector3;
  alpha: number;
  beta: number;
  radius: number;
}

/**
 * IFC camera manager with 3 modes:
 * - Orbit: Full building overview (ArcRotateCamera)
 * - Interior: Close-up with upper walls/slabs transparent
 * - FPS: First-person walkthrough (UniversalCamera, WASD)
 */
export function createIFCCameraManager(
  scene: Scene,
  camera: ArcRotateCamera,
  fpsCamera: UniversalCamera,
  indices: IFCIndices
) {
  let currentMode: IFCCameraMode = "orbit";
  let transparentMeshes: AbstractMesh[] = [];
  const canvas = scene.getEngine().getRenderingCanvas()!;
  const origLowerRadius = camera.lowerRadiusLimit ?? 1;
  const origUpperRadius = camera.upperRadiusLimit ?? 500;

  // Calculate building bounds from all meshes
  function getBuildingBounds(): { center: Vector3; extent: Vector3; minY: number; maxY: number } {
    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const meshes of indices.storeyMeshes.values()) {
      for (const mesh of meshes) {
        if (!mesh.isEnabled()) continue;
        const bounds = mesh.getBoundingInfo().boundingBox;
        const wMin = bounds.minimumWorld;
        const wMax = bounds.maximumWorld;
        minX = Math.min(minX, wMin.x);
        minY = Math.min(minY, wMin.y);
        minZ = Math.min(minZ, wMin.z);
        maxX = Math.max(maxX, wMax.x);
        maxY = Math.max(maxY, wMax.y);
        maxZ = Math.max(maxZ, wMax.z);
      }
    }

    if (minX === Infinity) {
      return { center: Vector3.Zero(), extent: new Vector3(10, 10, 10), minY: 0, maxY: 10 };
    }

    return {
      center: new Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2),
      extent: new Vector3(maxX - minX, maxY - minY, maxZ - minZ),
      minY,
      maxY,
    };
  }

  function getOrbitPreset(): CameraPreset {
    const { center, extent } = getBuildingBounds();
    return {
      target: center,
      alpha: -Math.PI / 4,
      beta: Math.PI / 3,
      radius: extent.length() * 0.7,
    };
  }

  function getInteriorPreset(): CameraPreset {
    const { center, extent } = getBuildingBounds();
    return {
      target: center,
      alpha: -Math.PI / 4,
      beta: Math.PI / 3,
      radius: extent.length() * 0.35,
    };
  }

  function flyTo(preset: CameraPreset, onDone?: () => void): void {
    const frameRate = FLY_FRAMES;

    const animTarget = new Animation(
      "ifcCamTarget",
      "target",
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animTarget.setKeys([
      { frame: 0, value: camera.target.clone() },
      { frame: frameRate, value: preset.target },
    ]);

    const animAlpha = new Animation(
      "ifcCamAlpha",
      "alpha",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animAlpha.setKeys([
      { frame: 0, value: camera.alpha },
      { frame: frameRate, value: preset.alpha },
    ]);

    const animBeta = new Animation(
      "ifcCamBeta",
      "beta",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animBeta.setKeys([
      { frame: 0, value: camera.beta },
      { frame: frameRate, value: preset.beta },
    ]);

    const animRadius = new Animation(
      "ifcCamRadius",
      "radius",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animRadius.setKeys([
      { frame: 0, value: camera.radius },
      { frame: frameRate, value: preset.radius },
    ]);

    const speedRatio = 1000 / FLY_DURATION_MS;
    scene.beginDirectAnimation(
      camera,
      [animTarget, animAlpha, animBeta, animRadius],
      0,
      frameRate,
      false,
      speedRatio,
      onDone
    );
  }

  function focusStorey(storeyId: number): void {
    const meshes = indices.storeyMeshes.get(storeyId);
    if (!meshes || meshes.length === 0) return;

    let sumX = 0,
      sumY = 0,
      sumZ = 0,
      count = 0;
    for (const mesh of meshes) {
      if (!mesh.isEnabled()) continue;
      const center = mesh.getBoundingInfo().boundingBox.centerWorld;
      sumX += center.x;
      sumY += center.y;
      sumZ += center.z;
      count++;
    }
    if (count === 0) return;

    const target = new Vector3(sumX / count, sumY / count, sumZ / count);
    flyTo({ target, alpha: -Math.PI / 4, beta: Math.PI / 3, radius: camera.radius * 0.6 });
  }

  // Wall/slab transparency helpers
  function getTransparentMeshes(): AbstractMesh[] {
    const meshes: AbstractMesh[] = [];
    for (const typeName of TRANSPARENT_TYPES) {
      const typeMeshes = indices.typeMeshes.get(typeName);
      if (typeMeshes) meshes.push(...typeMeshes);
    }
    return meshes;
  }

  function animateAlpha(meshes: AbstractMesh[], targetAlpha: number): void {
    const frameRate = 30;
    const frames = Math.round((WALL_ANIM_MS / 1000) * frameRate);

    for (const mesh of meshes) {
      const mat = mesh.material;
      if (!mat || !("alpha" in mat)) continue;
      const startAlpha = (mat as { alpha: number }).alpha;

      const anim = new Animation(
        `ifcWallAlpha-${mesh.name}`,
        "material.alpha",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      anim.setKeys([
        { frame: 0, value: startAlpha },
        { frame: frames, value: targetAlpha },
      ]);
      scene.beginDirectAnimation(mesh, [anim], 0, frames, false, 1);
    }
  }

  function restoreTransparency(): void {
    if (transparentMeshes.length > 0) {
      // Restore to original alpha from material preset
      for (const mesh of transparentMeshes) {
        const mat = mesh.material as StandardMaterial | null;
        if (!mat) continue;
        // Windows already have alpha=0.35, walls should go back to 1.0
        const isWindow = mesh.name.toLowerCase().includes("window");
        mat.alpha = isWindow ? 0.35 : 1.0;
      }
      transparentMeshes = [];
    }
  }

  // Mode transitions
  function switchToOrbit(): void {
    restoreTransparency();

    camera.lowerRadiusLimit = origLowerRadius;
    camera.upperRadiusLimit = origUpperRadius;

    if (currentMode === "fps") {
      fpsCamera.detachControl();
      camera.target = fpsCamera.position.clone();
      camera.target.y = 0;
      camera.attachControl(canvas, true);
      scene.activeCamera = camera;
    }

    currentMode = "orbit";
    flyTo(getOrbitPreset());
  }

  function switchToInterior(): void {
    restoreTransparency();

    if (currentMode === "fps") {
      fpsCamera.detachControl();
      camera.attachControl(canvas, true);
      scene.activeCamera = camera;
    }

    currentMode = "interior";

    // Make upper walls/slabs nearly transparent
    transparentMeshes = getTransparentMeshes();
    animateAlpha(transparentMeshes, 0.05);

    const { extent } = getBuildingBounds();
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = extent.length() * 0.5;

    flyTo(getInteriorPreset());
  }

  function switchToFps(): void {
    if (currentMode !== "interior") {
      // Also make walls transparent in FPS mode
      restoreTransparency();
      transparentMeshes = getTransparentMeshes();
      animateAlpha(transparentMeshes, 0.05);
    }

    const startPos = camera.target.clone();
    startPos.y = 2;
    fpsCamera.position = startPos;

    const dir = camera.target.subtract(camera.position).normalize();
    fpsCamera.setTarget(startPos.add(dir));

    camera.detachControl();
    fpsCamera.attachControl(canvas, true);
    scene.activeCamera = fpsCamera;

    currentMode = "fps";
  }

  function setMode(mode: IFCCameraMode): void {
    if (mode === currentMode && mode !== "interior") return;

    switch (mode) {
      case "orbit":
        switchToOrbit();
        break;
      case "interior":
        switchToInterior();
        break;
      case "fps":
        switchToFps();
        break;
    }
  }

  function getMode(): IFCCameraMode {
    return currentMode;
  }

  function dispose(): void {
    restoreTransparency();
  }

  return { focusStorey, setMode, getMode, dispose };
}

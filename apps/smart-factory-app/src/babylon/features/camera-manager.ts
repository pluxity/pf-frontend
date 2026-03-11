import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Animation } from "@babylonjs/core/Animations/animation";
import type { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Scene } from "@babylonjs/core/scene";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { BuildingId, CameraMode } from "../types";
import { BUILDINGS, WALL_CONFIG } from "@/config/campus-layout.config";

interface CameraPreset {
  target: Vector3;
  alpha: number;
  beta: number;
  radius: number;
}

const FLY_DURATION_MS = 800;
const FLY_FRAMES = 60;
const WALL_ANIM_MS = 300;

/** Camera presets per building */
function getBuildingPreset(buildingId: BuildingId): CameraPreset {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  if (!building) {
    return getCampusPreset();
  }
  const floors = building.floors ?? 1;
  const floorHeight = building.floorHeight ?? building.wallHeight / Math.max(floors, 1);
  return {
    target: new Vector3(building.position.x, floorHeight / 2, building.position.z),
    alpha: -Math.PI / 4,
    beta: Math.PI / 3.5,
    radius: Math.max(building.width, building.depth) * 1.1,
  };
}

/** Interior preset: closer, steeper angle */
function getInteriorPreset(buildingId: BuildingId): CameraPreset {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  if (!building) {
    return getCampusPreset();
  }
  const floors = building.floors ?? 1;
  const floorHeight = building.floorHeight ?? building.wallHeight / Math.max(floors, 1);
  return {
    target: new Vector3(building.position.x, floorHeight / 2, building.position.z),
    alpha: -Math.PI / 4,
    beta: Math.PI / 3,
    radius: Math.max(building.width, building.depth) * 0.6,
  };
}

/** Campus overview preset */
function getCampusPreset(): CameraPreset {
  return {
    target: new Vector3(0, 0, 5),
    alpha: -Math.PI / 4,
    beta: Math.PI / 4,
    radius: 180,
  };
}

export function createCameraManager(
  scene: Scene,
  camera: ArcRotateCamera,
  fpsCamera: UniversalCamera,
  buildingNodes: Map<BuildingId, TransformNode>
) {
  let currentMode: CameraMode = "orbit";
  let currentInteriorBuildingId: BuildingId | null = null;
  const canvas = scene.getEngine().getRenderingCanvas()!;

  // Store original camera limits for restoring later
  const origLowerRadius = camera.lowerRadiusLimit ?? 15;
  const origUpperRadius = camera.upperRadiusLimit ?? 250;

  function flyTo(preset: CameraPreset, onDone?: () => void): void {
    const frameRate = FLY_FRAMES;

    const animTarget = new Animation(
      "camTarget",
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
      "camAlpha",
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
      "camBeta",
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
      "camRadius",
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

  function focusBuilding(buildingId: BuildingId): void {
    flyTo(getBuildingPreset(buildingId));
  }

  function focusCampus(): void {
    flyTo(getCampusPreset());
  }

  // --- Wall/roof transparency helpers ---

  function getWallRoofMeshes(buildingId: BuildingId): AbstractMesh[] {
    const node = buildingNodes.get(buildingId);
    if (!node) return [];
    const meshes: AbstractMesh[] = [];
    for (const child of node.getChildMeshes(false)) {
      const name = child.name;
      if (name.includes("-wall-") || name.includes("-roof") || name.includes("-pillar")) {
        meshes.push(child);
      }
    }
    return meshes;
  }

  function animateWallAlpha(buildingId: BuildingId, targetAlpha: number): void {
    const meshes = getWallRoofMeshes(buildingId);
    const frameRate = 30;
    const frames = Math.round((WALL_ANIM_MS / 1000) * frameRate);

    for (const mesh of meshes) {
      const mat = mesh.material;
      if (!mat || !("alpha" in mat)) continue;
      const startAlpha = (mat as { alpha: number }).alpha;

      const anim = new Animation(
        `wallAlpha-${mesh.name}`,
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

  // --- Mode transitions ---

  function switchToOrbit(): void {
    // Restore walls if was in interior/fps
    if (currentInteriorBuildingId) {
      animateWallAlpha(currentInteriorBuildingId, WALL_CONFIG.wallAlpha);
      currentInteriorBuildingId = null;
    }

    // Restore radius limits
    camera.lowerRadiusLimit = origLowerRadius;
    camera.upperRadiusLimit = origUpperRadius;

    if (currentMode === "fps") {
      // FPS → orbit: transfer position
      fpsCamera.detachControl();
      camera.target = fpsCamera.position.clone();
      camera.target.y = 0;
      camera.attachControl(canvas, true);
      scene.activeCamera = camera;
    }

    currentMode = "orbit";
    flyTo(getCampusPreset());
  }

  function switchToInterior(buildingId: BuildingId): void {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return;

    // Restore previous building walls if different
    if (currentInteriorBuildingId && currentInteriorBuildingId !== buildingId) {
      animateWallAlpha(currentInteriorBuildingId, WALL_CONFIG.wallAlpha);
    }

    if (currentMode === "fps") {
      fpsCamera.detachControl();
      camera.attachControl(canvas, true);
      scene.activeCamera = camera;
    }

    currentMode = "interior";
    currentInteriorBuildingId = buildingId;

    // Make walls/roof nearly transparent
    animateWallAlpha(buildingId, 0.05);

    // Constrain zoom for interior view
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = Math.max(building.width, building.depth) * 0.7;

    flyTo(getInteriorPreset(buildingId));
  }

  function switchToFps(buildingId?: BuildingId): void {
    const bid = buildingId ?? currentInteriorBuildingId;

    // Make walls transparent if targeting a building
    if (bid) {
      if (currentInteriorBuildingId && currentInteriorBuildingId !== bid) {
        animateWallAlpha(currentInteriorBuildingId, WALL_CONFIG.wallAlpha);
      }
      animateWallAlpha(bid, 0.05);
      currentInteriorBuildingId = bid;
    }

    // Set FPS camera position based on current orbit target
    const startPos = camera.target.clone();
    startPos.y = 2; // Eye height
    fpsCamera.position = startPos;

    // Point FPS camera in same direction orbit camera was looking
    const dir = camera.target.subtract(camera.position).normalize();
    fpsCamera.setTarget(startPos.add(dir));

    // Switch cameras
    camera.detachControl();
    fpsCamera.attachControl(canvas, true);
    scene.activeCamera = fpsCamera;

    currentMode = "fps";
  }

  function setMode(mode: CameraMode, buildingId?: BuildingId): void {
    if (mode === currentMode && mode !== "interior") return;

    switch (mode) {
      case "orbit":
        switchToOrbit();
        break;
      case "interior":
        if (buildingId) switchToInterior(buildingId);
        break;
      case "fps":
        switchToFps(buildingId);
        break;
    }
  }

  function getMode(): CameraMode {
    return currentMode;
  }

  return { focusBuilding, focusCampus, setMode, getMode };
}

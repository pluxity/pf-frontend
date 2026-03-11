import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { BuildingId } from "../types";
import { BUILDINGS } from "@/config/campus-layout.config";

import "@babylonjs/core/Particles/particleSystemComponent";

// ---------------------------------------------------------------------------
// Runtime texture generation (no external files)
// ---------------------------------------------------------------------------

function createFlameTexture(scene: Scene): Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 255, 100, 0.9)");
  gradient.addColorStop(0.5, "rgba(255, 160, 40, 0.6)");
  gradient.addColorStop(1, "rgba(255, 60, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new Texture(canvas.toDataURL(), scene);
  tex.name = "fire-flame-tex";
  return tex;
}

function createSmokeTexture(scene: Scene): Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(120, 120, 120, 0.6)");
  gradient.addColorStop(0.5, "rgba(80, 80, 80, 0.3)");
  gradient.addColorStop(1, "rgba(40, 40, 40, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new Texture(canvas.toDataURL(), scene);
  tex.name = "fire-smoke-tex";
  return tex;
}

// ---------------------------------------------------------------------------
// Fire zone: one flame + one smoke particle system at a location
// ---------------------------------------------------------------------------

interface FireZoneInstance {
  flame: ParticleSystem;
  smoke: ParticleSystem;
  position: Vector3;
}

function createFireZone(
  scene: Scene,
  flameTex: Texture,
  smokeTex: Texture,
  worldPos: Vector3,
  id: string
): FireZoneInstance {
  // --- Flame ---
  const flame = new ParticleSystem(`fire-flame-${id}`, 80, scene);
  flame.particleTexture = flameTex;
  flame.emitter = worldPos.clone();
  flame.minLifeTime = 0.3;
  flame.maxLifeTime = 0.8;
  flame.minSize = 0.3;
  flame.maxSize = 0.9;
  flame.emitRate = 40;

  flame.color1 = new Color4(1, 1, 0.5, 1);
  flame.color2 = new Color4(1, 0.6, 0.1, 1);
  flame.colorDead = new Color4(1, 0.2, 0, 0);

  flame.minEmitPower = 0.5;
  flame.maxEmitPower = 1.5;
  flame.direction1 = new Vector3(-0.3, 1, -0.3);
  flame.direction2 = new Vector3(0.3, 2, 0.3);
  flame.gravity = new Vector3(0, 0.5, 0);

  flame.blendMode = ParticleSystem.BLENDMODE_ADD;
  flame.updateSpeed = 0.02;

  // --- Smoke ---
  const smoke = new ParticleSystem(`fire-smoke-${id}`, 60, scene);
  smoke.particleTexture = smokeTex;
  smoke.emitter = worldPos.add(new Vector3(0, 0.5, 0));
  smoke.minLifeTime = 1.0;
  smoke.maxLifeTime = 3.0;
  smoke.minSize = 0.8;
  smoke.maxSize = 2.5;
  smoke.emitRate = 20;

  smoke.color1 = new Color4(0.4, 0.4, 0.4, 0.5);
  smoke.color2 = new Color4(0.3, 0.3, 0.3, 0.3);
  smoke.colorDead = new Color4(0.1, 0.1, 0.1, 0);

  smoke.minEmitPower = 0.2;
  smoke.maxEmitPower = 0.6;
  smoke.direction1 = new Vector3(-0.5, 1.5, -0.5);
  smoke.direction2 = new Vector3(0.5, 3, 0.5);
  smoke.gravity = new Vector3(0, 0.3, 0);

  smoke.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  smoke.updateSpeed = 0.02;

  return { flame, smoke, position: worldPos };
}

// ---------------------------------------------------------------------------
// Compute world position for a zone within a building
// ---------------------------------------------------------------------------

function getZoneWorldPosition(buildingId: BuildingId, zoneIndex: number): Vector3 | null {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  if (!building) return null;

  const zone = building.zones[zoneIndex];
  if (!zone) return null;

  const floorHeight = building.floorHeight ?? building.wallHeight / (building.floors ?? 1);
  const floor = zone.floor ?? 0;

  return new Vector3(
    building.position.x + zone.x,
    floor * floorHeight + 1.0, // slight offset above floor
    building.position.z + zone.z
  );
}

// ---------------------------------------------------------------------------
// Building alarm pulse (red glow on building meshes)
// ---------------------------------------------------------------------------

interface AlarmState {
  meshes: Mesh[];
  originalEmissive: Map<Mesh, Color3>;
}

function collectBuildingAlarmMeshes(
  buildingId: BuildingId,
  buildingNodes: Map<BuildingId, TransformNode>,
  glowLayer: GlowLayer
): AlarmState | null {
  const node = buildingNodes.get(buildingId);
  if (!node) return null;

  const meshes: Mesh[] = [];
  const originalEmissive = new Map<Mesh, Color3>();

  node.getChildMeshes(false).forEach((abstractMesh) => {
    if (!(abstractMesh instanceof Mesh)) return;
    const name = abstractMesh.name.toLowerCase();
    if (name.includes("floor") || name.includes("wall") || name.includes("roof")) {
      meshes.push(abstractMesh);
      glowLayer.addIncludedOnlyMesh(abstractMesh);
      const mat = abstractMesh.material as StandardMaterial | null;
      if (mat?.emissiveColor) {
        originalEmissive.set(abstractMesh, mat.emissiveColor.clone());
      }
    }
  });

  return { meshes, originalEmissive };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FireSimulationManager {
  startFire(buildingId: BuildingId, zoneIndex: number): void;
  spreadFire(buildingId: BuildingId, zoneIndex: number): void;
  startAlarm(buildingId: BuildingId): void;
  stopFire(): void;
  isRunning(): boolean;
  dispose(): void;
}

export function createFireSimulation(
  scene: Scene,
  glowLayer: GlowLayer,
  buildingNodes: Map<BuildingId, TransformNode>
): FireSimulationManager {
  // Shared textures (created lazily on first use)
  let flameTex: Texture | null = null;
  let smokeTex: Texture | null = null;

  const activeZones: FireZoneInstance[] = [];
  const alarmStates = new Map<BuildingId, AlarmState>();
  let observer: Observer<Scene> | null = null;
  let running = false;
  let time = 0;

  // Atmosphere originals
  let originalAmbient: Color3 | null = null;
  let originalFogEnabled = false;
  let originalFogColor: Color3 | null = null;
  let originalFogDensity = 0;

  function ensureTextures(): void {
    if (!flameTex) flameTex = createFlameTexture(scene);
    if (!smokeTex) smokeTex = createSmokeTexture(scene);
  }

  function ensureObserver(): void {
    if (observer) return;
    observer = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000;
      time += dt;
      updateAlarmPulse();
      updateAtmosphere();
    });
  }

  function updateAlarmPulse(): void {
    for (const alarm of alarmStates.values()) {
      const pulseIntensity = 0.3 + 0.35 * Math.sin(time * 6);
      const emissive = new Color3(pulseIntensity, 0, 0);
      for (const mesh of alarm.meshes) {
        const mat = mesh.material as StandardMaterial | null;
        if (mat) {
          mat.emissiveColor = emissive;
        }
      }
    }
  }

  function updateAtmosphere(): void {
    if (activeZones.length === 0) return;

    // Darken ambient based on number of active fire zones (max 3 zones)
    const intensity = Math.min(activeZones.length / 3, 1);

    // Reduce ambient light
    if (originalAmbient) {
      const factor = 1 - intensity * 0.3;
      scene.ambientColor = new Color3(
        originalAmbient.r * factor,
        originalAmbient.g * factor,
        originalAmbient.b * factor
      );
    }

    // Increase fog
    scene.fogEnabled = true;
    scene.fogDensity = 0.002 + intensity * 0.003;
  }

  function saveAtmosphereState(): void {
    if (originalAmbient !== null) return; // already saved
    originalAmbient = scene.ambientColor.clone();
    originalFogEnabled = scene.fogEnabled;
    originalFogColor = scene.fogColor.clone();
    originalFogDensity = scene.fogDensity;
  }

  function restoreAtmosphereState(): void {
    if (originalAmbient !== null) {
      scene.ambientColor = originalAmbient;
    }
    scene.fogEnabled = originalFogEnabled;
    if (originalFogColor) {
      scene.fogColor = originalFogColor;
    }
    scene.fogDensity = originalFogDensity;

    originalAmbient = null;
    originalFogColor = null;
  }

  // --- Public methods ---

  function startFire(buildingId: BuildingId, zoneIndex: number): void {
    ensureTextures();
    ensureObserver();

    if (!running) {
      saveAtmosphereState();
      // Set fog color to a smoky gray
      scene.fogColor = new Color3(0.15, 0.13, 0.12);
      scene.fogMode = 1; // exponential
      running = true;
    }

    const worldPos = getZoneWorldPosition(buildingId, zoneIndex);
    if (!worldPos) return;

    const id = `${buildingId}-${zoneIndex}`;
    const zone = createFireZone(scene, flameTex!, smokeTex!, worldPos, id);
    zone.flame.start();
    zone.smoke.start();
    activeZones.push(zone);
  }

  function spreadFire(buildingId: BuildingId, zoneIndex: number): void {
    // Same as startFire — adds another fire zone
    startFire(buildingId, zoneIndex);
  }

  function startAlarm(buildingId: BuildingId): void {
    if (alarmStates.has(buildingId)) return;

    const alarm = collectBuildingAlarmMeshes(buildingId, buildingNodes, glowLayer);
    if (!alarm) return;

    alarmStates.set(buildingId, alarm);
    ensureObserver();
  }

  function stopFire(): void {
    if (!running && alarmStates.size === 0) return;

    // Stop and dispose all particle systems
    for (const zone of activeZones) {
      zone.flame.stop();
      zone.smoke.stop();
      zone.flame.dispose();
      zone.smoke.dispose();
    }
    activeZones.length = 0;

    // Restore alarm meshes
    for (const alarm of alarmStates.values()) {
      for (const mesh of alarm.meshes) {
        const mat = mesh.material as StandardMaterial | null;
        if (mat) {
          const orig = alarm.originalEmissive.get(mesh) ?? Color3.Black();
          mat.emissiveColor = orig;
        }
      }
    }
    alarmStates.clear();

    // Remove observer
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }

    // Restore atmosphere
    restoreAtmosphereState();

    running = false;
    time = 0;
  }

  function isRunning(): boolean {
    return running;
  }

  function dispose(): void {
    stopFire();
    if (flameTex) {
      flameTex.dispose();
      flameTex = null;
    }
    if (smokeTex) {
      smokeTex.dispose();
      smokeTex = null;
    }
  }

  return { startFire, spreadFire, startAlarm, stopFire, isRunning, dispose };
}

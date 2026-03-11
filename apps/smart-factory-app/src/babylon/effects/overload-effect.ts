import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { BuildingId, PowerReading } from "../types";
import { PANELS } from "@/config/electrical.config";

interface OverloadState {
  buildingId: BuildingId;
  meshes: Mesh[];
  originalEmissive: Map<Mesh, Color3>;
  active: boolean;
  level: "warning" | "critical" | null;
}

/**
 * Create overload pulse glow effect on buildings when panels are overloaded.
 */
export function createOverloadEffect(
  scene: Scene,
  overloadGlowLayer: GlowLayer,
  buildingNodes: Map<BuildingId, TransformNode>
) {
  const states = new Map<BuildingId, OverloadState>();
  let observer: Observer<Scene> | null = null;
  let time = 0;

  // Collect floor/wall meshes for each building and register with glow layer
  for (const [buildingId, node] of buildingNodes) {
    const meshes: Mesh[] = [];
    const originalEmissive = new Map<Mesh, Color3>();

    node.getChildMeshes(false).forEach((abstractMesh) => {
      if (!(abstractMesh instanceof Mesh)) return;
      const mesh = abstractMesh;
      // Include floor and wall meshes (by naming convention)
      const name = mesh.name.toLowerCase();
      if (name.includes("floor") || name.includes("wall") || name.includes("roof")) {
        meshes.push(mesh);
        overloadGlowLayer.addIncludedOnlyMesh(mesh);
        const mat = mesh.material as StandardMaterial | null;
        if (mat?.emissiveColor) {
          originalEmissive.set(mesh, mat.emissiveColor.clone());
        }
      }
    });

    states.set(buildingId, {
      buildingId,
      meshes,
      originalEmissive,
      active: false,
      level: null,
    });
  }

  // Animation loop for pulse effect
  observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    time += dt;

    let hasActive = false;

    for (const state of states.values()) {
      if (!state.active || !state.level) continue;
      hasActive = true;

      if (state.level === "critical") {
        // Pulsing red: sin-based intensity oscillation
        const pulseIntensity = 0.4 + 0.4 * Math.sin(time * 5);
        const emissive = new Color3(pulseIntensity, 0, 0);
        for (const mesh of state.meshes) {
          const mat = mesh.material as StandardMaterial | null;
          if (mat) {
            mat.emissiveColor = emissive;
          }
        }
      } else {
        // Warning: steady orange glow
        const emissive = new Color3(0.3, 0.15, 0);
        for (const mesh of state.meshes) {
          const mat = mesh.material as StandardMaterial | null;
          if (mat) {
            mat.emissiveColor = emissive;
          }
        }
      }
    }

    // Adjust glow layer intensity based on active state
    overloadGlowLayer.intensity = hasActive ? 0.8 : 0;
  });

  function updateOverload(readings: PowerReading[]): void {
    // Map panelId → buildingId
    const buildingMaxLoad = new Map<BuildingId, number>();

    for (const r of readings) {
      const panel = PANELS.find((p) => p.id === r.panelId);
      if (!panel) continue;

      const current = buildingMaxLoad.get(panel.buildingId) ?? 0;
      if (r.loadPercent > current) {
        buildingMaxLoad.set(panel.buildingId, r.loadPercent);
      }
    }

    for (const [buildingId, state] of states) {
      const maxLoad = buildingMaxLoad.get(buildingId) ?? 0;

      if (maxLoad > 90) {
        state.active = true;
        state.level = "critical";
      } else if (maxLoad > 70) {
        state.active = true;
        state.level = "warning";
      } else {
        if (state.active) {
          clearBuildingOverload(state);
        }
        state.active = false;
        state.level = null;
      }
    }
  }

  function clearBuildingOverload(state: OverloadState): void {
    for (const mesh of state.meshes) {
      const mat = mesh.material as StandardMaterial | null;
      if (mat) {
        const orig = state.originalEmissive.get(mesh) ?? Color3.Black();
        mat.emissiveColor = orig;
      }
    }
  }

  function clearOverload(buildingId: BuildingId): void {
    const state = states.get(buildingId);
    if (!state) return;
    clearBuildingOverload(state);
    state.active = false;
    state.level = null;
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    // Restore original emissive colors
    for (const state of states.values()) {
      clearBuildingOverload(state);
    }
    states.clear();
  }

  return { updateOverload, clearOverload, dispose };
}

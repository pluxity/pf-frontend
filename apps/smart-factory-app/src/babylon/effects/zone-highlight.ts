import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { BuildingId } from "../types";

interface ZoneHighlightState {
  mesh: Mesh;
  originalEmissive: Color3;
  color: Color3;
  pulse: boolean;
  active: boolean;
}

/**
 * Zone-level floor highlight effect.
 * Highlights individual zone floor meshes within buildings (vs overload-effect which does whole building).
 */
export function createZoneHighlight(scene: Scene, buildingNodes: Map<BuildingId, TransformNode>) {
  // Map: buildingId -> zoneIndex -> highlight state
  const zoneStates = new Map<string, ZoneHighlightState>();
  let observer: Observer<Scene> | null = null;
  let time = 0;

  // Collect zone floor meshes from building nodes
  // Zone floors follow naming convention: "zone-floor-{name}" within each building
  for (const [buildingId, node] of buildingNodes) {
    let zoneIndex = 0;
    node.getChildMeshes(false).forEach((abstractMesh) => {
      if (!(abstractMesh instanceof Mesh)) return;
      const name = abstractMesh.name.toLowerCase();

      // Zone floor meshes contain "zone" in their name
      if (name.includes("zone")) {
        const mat = abstractMesh.material as StandardMaterial | null;
        const originalEmissive = mat?.emissiveColor?.clone() ?? Color3.Black();

        zoneStates.set(`${buildingId}-${zoneIndex}`, {
          mesh: abstractMesh,
          originalEmissive,
          color: Color3.Black(),
          pulse: false,
          active: false,
        });
        zoneIndex++;
      }
    });
  }

  // Animation loop for pulse effects
  observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    time += dt;

    for (const state of zoneStates.values()) {
      if (!state.active) continue;

      const mat = state.mesh.material as StandardMaterial | null;
      if (!mat) continue;

      if (state.pulse) {
        // Pulsing effect: sin-based intensity oscillation
        const intensity = 0.3 + 0.3 * Math.sin(time * 4);
        mat.emissiveColor = new Color3(
          state.color.r * intensity,
          state.color.g * intensity,
          state.color.b * intensity
        );
      } else {
        // Steady glow
        mat.emissiveColor = new Color3(
          state.color.r * 0.3,
          state.color.g * 0.3,
          state.color.b * 0.3
        );
      }
    }
  });

  /** Highlight a specific zone within a building */
  function highlightZone(
    buildingId: BuildingId,
    zoneIndex: number,
    color: string,
    pulse = false
  ): void {
    const key = `${buildingId}-${zoneIndex}`;
    const state = zoneStates.get(key);
    if (!state) return;

    const c3 = Color3.FromHexString(color);
    state.color = c3;
    state.pulse = pulse;
    state.active = true;
  }

  /** Highlight all zones of a building */
  function highlightBuilding(buildingId: BuildingId, color: string, pulse = false): void {
    for (const [key, state] of zoneStates) {
      if (key.startsWith(`${buildingId}-`)) {
        state.color = Color3.FromHexString(color);
        state.pulse = pulse;
        state.active = true;
      }
    }
  }

  /** Clear highlight for all zones of a building */
  function clearZoneHighlight(buildingId: BuildingId): void {
    for (const [key, state] of zoneStates) {
      if (key.startsWith(`${buildingId}-`)) {
        state.active = false;
        const mat = state.mesh.material as StandardMaterial | null;
        if (mat) {
          mat.emissiveColor = state.originalEmissive.clone();
        }
      }
    }
  }

  /** Clear all zone highlights */
  function clearAllZoneHighlights(): void {
    for (const state of zoneStates.values()) {
      state.active = false;
      const mat = state.mesh.material as StandardMaterial | null;
      if (mat) {
        mat.emissiveColor = state.originalEmissive.clone();
      }
    }
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    clearAllZoneHighlights();
    zoneStates.clear();
  }

  return {
    highlightZone,
    highlightBuilding,
    clearZoneHighlight,
    clearAllZoneHighlights,
    dispose,
  };
}

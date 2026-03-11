import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { CableRouteConfig, PowerReading, LoadLevel } from "../types";
import { LOAD_COLORS } from "@/config/campus-layout.config";

/** Number of energy packets per cable */
const PACKETS_PER_CABLE = 3;
const PACKET_SIZE = 0.18;

const LOAD_SPEED: Record<LoadLevel, number> = {
  low: 0.12,
  normal: 0.22,
  high: 0.38,
  critical: 0.55,
};

interface EnergyPacket {
  mesh: Mesh;
  material: StandardMaterial;
  progress: number; // 0~1 along path
}

interface FlowState {
  packets: EnergyPacket[];
  waypoints: Vector3[];
  segLens: number[];
  totalLen: number;
  speed: number;
  level: LoadLevel;
  active: boolean;
}

/**
 * Create power flow effect using animated glowing energy packets
 * that travel along cable routes. Much more visible than particles.
 */
export function createPowerFlowEffect(
  scene: Scene,
  _cables: Map<string, Mesh>,
  routes: CableRouteConfig[],
  glowLayer: GlowLayer
) {
  const flows = new Map<string, FlowState>();
  let visible = true;
  let observer: Observer<Scene> | null = null;

  for (const route of routes) {
    const waypoints = route.waypoints.map((wp) => new Vector3(wp.x, wp.y, wp.z));
    if (waypoints.length < 2) continue;

    // Pre-calculate segment lengths
    const segLens: number[] = [];
    let totalLen = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const len = Vector3.Distance(waypoints[i - 1]!, waypoints[i]!);
      segLens.push(len);
      totalLen += len;
    }

    // Create energy packets (glowing spheres)
    const packets: EnergyPacket[] = [];
    for (let p = 0; p < PACKETS_PER_CABLE; p++) {
      const mat = new StandardMaterial(`flow-mat-${route.id}-${p}`, scene);
      const color = Color3.FromHexString(LOAD_COLORS.normal);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.9);
      mat.specularColor = Color3.White();
      mat.alpha = 0.95;

      const sphere = MeshBuilder.CreateSphere(
        `flow-packet-${route.id}-${p}`,
        { diameter: PACKET_SIZE, segments: 6 },
        scene
      );
      sphere.material = mat;
      sphere.isPickable = false;

      // Register with glow layer for visible halo
      glowLayer.addIncludedOnlyMesh(sphere);

      packets.push({
        mesh: sphere,
        material: mat,
        progress: p / PACKETS_PER_CABLE, // Evenly spaced
      });
    }

    flows.set(route.id, {
      packets,
      waypoints,
      segLens,
      totalLen,
      speed: LOAD_SPEED.normal,
      level: "normal",
      active: true,
    });
  }

  // Helper: find position along path at progress [0, 1]
  function getPositionOnPath(flow: FlowState, progress: number): Vector3 {
    const target = progress * flow.totalLen;
    let accumulated = 0;

    for (let i = 0; i < flow.segLens.length; i++) {
      const segLen = flow.segLens[i]!;
      if (accumulated + segLen >= target) {
        const t = segLen > 0 ? (target - accumulated) / segLen : 0;
        return Vector3.Lerp(flow.waypoints[i]!, flow.waypoints[i + 1]!, t);
      }
      accumulated += segLen;
    }
    return flow.waypoints[flow.waypoints.length - 1]!.clone();
  }

  // Animation loop
  observer = scene.onBeforeRenderObservable.add(() => {
    if (!visible) return;

    const dt = scene.getEngine().getDeltaTime() / 1000;

    for (const flow of flows.values()) {
      if (!flow.active) continue;

      for (const packet of flow.packets) {
        packet.progress += flow.speed * dt;
        if (packet.progress >= 1) {
          packet.progress -= 1;
        }

        const pos = getPositionOnPath(flow, packet.progress);
        packet.mesh.position.copyFrom(pos);

        // Subtle size pulse for liveliness
        const pulse = 1 + 0.15 * Math.sin(packet.progress * Math.PI * 6);
        packet.mesh.scaling.setAll(pulse);
      }
    }
  });

  function setFlowVisible(show: boolean): void {
    visible = show;
    for (const flow of flows.values()) {
      for (const packet of flow.packets) {
        packet.mesh.setEnabled(show && flow.active);
      }
    }
  }

  function updateFlowLoads(readings: PowerReading[]): void {
    const panelLevels = new Map<string, LoadLevel>();
    for (const r of readings) {
      panelLevels.set(r.panelId, r.level);
    }

    for (const route of routes) {
      const flow = flows.get(route.id);
      if (!flow) continue;

      const reading = panelLevels.get(route.toId);
      const level = reading ?? "normal";

      flow.speed = LOAD_SPEED[level];
      flow.level = level;

      // Update packet colors
      const color = Color3.FromHexString(LOAD_COLORS[level]);
      for (const packet of flow.packets) {
        packet.material.diffuseColor = color;
        packet.material.emissiveColor = color.scale(0.9);
      }
    }
  }

  function stopCableFlow(cableId: string): void {
    const flow = flows.get(cableId);
    if (!flow) return;
    flow.active = false;
    for (const packet of flow.packets) {
      packet.mesh.setEnabled(false);
    }
  }

  function resumeCableFlow(cableId: string): void {
    const flow = flows.get(cableId);
    if (!flow) return;
    flow.active = true;
    if (visible) {
      for (const packet of flow.packets) {
        packet.mesh.setEnabled(true);
      }
    }
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    for (const flow of flows.values()) {
      for (const packet of flow.packets) {
        packet.material.dispose();
        packet.mesh.dispose();
      }
    }
    flows.clear();
  }

  return { setFlowVisible, updateFlowLoads, stopCableFlow, resumeCableFlow, dispose };
}

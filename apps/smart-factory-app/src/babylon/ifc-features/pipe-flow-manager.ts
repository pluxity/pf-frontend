import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { IFCIndices } from "../types";

const PACKETS_PER_CHAIN = 3;
const PACKET_SIZE = 0.12;
const DEFAULT_SPEED = 0.2;

interface FlowPacket {
  mesh: Mesh;
  material: StandardMaterial;
  progress: number;
}

interface FlowChain {
  packets: FlowPacket[];
  waypoints: Vector3[];
  segLens: number[];
  totalLen: number;
  active: boolean;
}

/**
 * Pipe flow visualization manager.
 * Automatically extracts pipe/duct mesh paths from IFC indices
 * and animates glowing spheres along them.
 */
export function createPipeFlowManager(scene: Scene, indices: IFCIndices, glowLayer: GlowLayer) {
  const chains: FlowChain[] = [];
  let visible = false; // Hidden by default, shown by demo or user toggle
  let speed = DEFAULT_SPEED;
  let observer: Observer<Scene> | null = null;

  // Find pipe and duct meshes
  // BIMcollab models use generic IfcFlowSegment/IfcFlowFitting instead of specific types
  const pipeTypes = [
    "IfcPipeSegment",
    "IfcDuctSegment",
    "IfcPipeFitting",
    "IfcDuctFitting",
    "IfcFlowSegment",
    "IfcFlowFitting",
  ];
  const pipeMeshes: AbstractMesh[] = [];
  for (const typeName of pipeTypes) {
    const meshes = indices.typeMeshes.get(typeName);
    if (meshes) {
      pipeMeshes.push(...meshes);
    }
  }

  // Extract waypoints from pipe meshes using bounding box centers
  // Group by proximity to form chains
  const centers: { mesh: AbstractMesh; center: Vector3 }[] = [];
  for (const mesh of pipeMeshes) {
    if (!mesh.isEnabled()) continue;
    const bounds = mesh.getBoundingInfo().boundingBox;
    centers.push({
      mesh,
      center: bounds.centerWorld.clone(),
    });
  }

  // Sort by position to form rough chains (sort by X then Z)
  centers.sort((a, b) => {
    const dx = a.center.x - b.center.x;
    if (Math.abs(dx) > 0.5) return dx;
    return a.center.z - b.center.z;
  });

  // Build chains by grouping nearby pipe segments
  const CHAIN_DISTANCE = 3.0;
  const used = new Set<number>();

  for (let i = 0; i < centers.length; i++) {
    if (used.has(i)) continue;

    const chainPoints: Vector3[] = [centers[i]!.center];
    used.add(i);

    // Greedily extend chain
    let lastPoint = centers[i]!.center;
    let searching = true;
    while (searching) {
      searching = false;
      let bestIdx = -1;
      let bestDist = CHAIN_DISTANCE;

      for (let j = 0; j < centers.length; j++) {
        if (used.has(j)) continue;
        const dist = Vector3.Distance(lastPoint, centers[j]!.center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = j;
        }
      }

      if (bestIdx >= 0) {
        chainPoints.push(centers[bestIdx]!.center);
        used.add(bestIdx);
        lastPoint = centers[bestIdx]!.center;
        searching = true;
      }
    }

    // Only create chains with 2+ points
    if (chainPoints.length < 2) continue;

    // Pre-calculate segment lengths
    const segLens: number[] = [];
    let totalLen = 0;
    for (let k = 1; k < chainPoints.length; k++) {
      const len = Vector3.Distance(chainPoints[k - 1]!, chainPoints[k]!);
      segLens.push(len);
      totalLen += len;
    }

    // Skip very short chains
    if (totalLen < 1.0) continue;

    // Create flow packets
    const packets: FlowPacket[] = [];
    const chainIdx = chains.length;
    for (let p = 0; p < PACKETS_PER_CHAIN; p++) {
      const mat = new StandardMaterial(`pipeflow-mat-${chainIdx}-${p}`, scene);
      const color = new Color3(0.2, 0.6, 1.0);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.9);
      mat.specularColor = Color3.White();
      mat.alpha = 0.9;

      const sphere = MeshBuilder.CreateSphere(
        `pipeflow-${chainIdx}-${p}`,
        { diameter: PACKET_SIZE, segments: 6 },
        scene
      );
      sphere.material = mat;
      sphere.isPickable = false;
      sphere.setEnabled(false); // Hidden by default
      glowLayer.addIncludedOnlyMesh(sphere);

      packets.push({
        mesh: sphere,
        material: mat,
        progress: p / PACKETS_PER_CHAIN,
      });
    }

    chains.push({
      packets,
      waypoints: chainPoints,
      segLens,
      totalLen,
      active: true,
    });
  }

  console.log(`[Pipe Flow] Found ${pipeMeshes.length} pipe meshes, built ${chains.length} chains`);

  // Position helper
  function getPositionOnPath(chain: FlowChain, progress: number): Vector3 {
    const target = progress * chain.totalLen;
    let accumulated = 0;

    for (let i = 0; i < chain.segLens.length; i++) {
      const segLen = chain.segLens[i]!;
      if (accumulated + segLen >= target) {
        const t = segLen > 0 ? (target - accumulated) / segLen : 0;
        return Vector3.Lerp(chain.waypoints[i]!, chain.waypoints[i + 1]!, t);
      }
      accumulated += segLen;
    }
    return chain.waypoints[chain.waypoints.length - 1]!.clone();
  }

  // Animation loop
  observer = scene.onBeforeRenderObservable.add(() => {
    if (!visible) return;

    const dt = scene.getEngine().getDeltaTime() / 1000;

    for (const chain of chains) {
      if (!chain.active) continue;

      for (const packet of chain.packets) {
        packet.progress += speed * dt;
        if (packet.progress >= 1) {
          packet.progress -= 1;
        }

        const pos = getPositionOnPath(chain, packet.progress);
        packet.mesh.position.copyFrom(pos);

        // Subtle size pulse
        const pulse = 1 + 0.12 * Math.sin(packet.progress * Math.PI * 6);
        packet.mesh.scaling.setAll(pulse);
      }
    }
  });

  function setFlowVisible(show: boolean): void {
    visible = show;
    for (const chain of chains) {
      for (const packet of chain.packets) {
        packet.mesh.setEnabled(show && chain.active);
      }
    }
  }

  function setFlowSpeed(newSpeed: number): void {
    speed = newSpeed;
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    for (const chain of chains) {
      for (const packet of chain.packets) {
        packet.material.dispose();
        packet.mesh.dispose();
      }
    }
    chains.length = 0;
  }

  return {
    setFlowVisible,
    setFlowSpeed,
    getChainCount: () => chains.length,
    dispose,
  };
}

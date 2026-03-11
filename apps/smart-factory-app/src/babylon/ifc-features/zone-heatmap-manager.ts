import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { IFCIndices } from "../types";

interface HeatEntry {
  mesh: AbstractMesh;
  originalDiffuse: Color3;
  originalEmissive: Color3;
  value: number; // 0~1
}

/**
 * Zone heatmap manager for IFC models.
 * Colors IfcSlab (floor) meshes based on heat values (0~1)
 * using blue→green→yellow→red color interpolation.
 */
export function createZoneHeatmapManager(indices: IFCIndices) {
  const entries = new Map<number, HeatEntry>();
  let active = false;

  // Collect slab meshes for heatmap (multiple slab-like types)
  const slabTypes = ["IfcSlab", "IfcCovering", "IfcPlate"];
  const slabMeshes: AbstractMesh[] = [];
  for (const typeName of slabTypes) {
    const meshes = indices.typeMeshes.get(typeName);
    if (meshes) slabMeshes.push(...meshes);
  }
  for (const mesh of slabMeshes) {
    const eids = (mesh.metadata?.ifcExpressIDs as number[] | undefined) ?? [];
    const eid = eids[0];
    if (eid == null || entries.has(eid)) continue;

    const mat = mesh.material as StandardMaterial | null;
    entries.set(eid, {
      mesh,
      originalDiffuse: mat?.diffuseColor?.clone() ?? new Color3(0.5, 0.5, 0.47),
      originalEmissive: mat?.emissiveColor?.clone() ?? Color3.Black(),
      value: 0,
    });
  }

  function heatColor(t: number): Color3 {
    // Blue(0) → Green(0.33) → Yellow(0.66) → Red(1.0)
    const cold = new Color3(0.0, 0.2, 0.8);
    const warm = new Color3(0.0, 0.8, 0.2);
    const hot = new Color3(1.0, 0.8, 0.0);
    const vhot = new Color3(1.0, 0.1, 0.0);

    if (t < 0.33) {
      return Color3.Lerp(cold, warm, t / 0.33);
    } else if (t < 0.66) {
      return Color3.Lerp(warm, hot, (t - 0.33) / 0.33);
    } else {
      return Color3.Lerp(hot, vhot, (t - 0.66) / 0.34);
    }
  }

  function setElementHeat(expressID: number, value: number): void {
    const entry = entries.get(expressID);
    if (!entry) return;

    entry.value = Math.max(0, Math.min(1, value));
    active = true;

    const mat = entry.mesh.material as StandardMaterial | null;
    if (!mat) return;

    const color = heatColor(entry.value);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.25);
  }

  function setStoreyHeat(storeyId: number, value: number, indices: IFCIndices): void {
    const meshes = indices.storeyMeshes.get(storeyId);
    if (!meshes) return;

    for (const mesh of meshes) {
      const eids = (mesh.metadata?.ifcExpressIDs as number[] | undefined) ?? [];
      for (const eid of eids) {
        if (entries.has(eid)) {
          setElementHeat(eid, value);
        }
      }
    }
  }

  function clearHeatmap(): void {
    active = false;
    for (const entry of entries.values()) {
      const mat = entry.mesh.material as StandardMaterial | null;
      if (!mat) continue;
      mat.diffuseColor = entry.originalDiffuse.clone();
      mat.emissiveColor = entry.originalEmissive.clone();
      entry.value = 0;
    }
  }

  function isActive(): boolean {
    return active;
  }

  function getSlabExpressIDs(): number[] {
    return [...entries.keys()];
  }

  function dispose(): void {
    clearHeatmap();
    entries.clear();
  }

  return {
    setElementHeat,
    setStoreyHeat,
    clearHeatmap,
    isActive,
    getSlabExpressIDs,
    dispose,
  };
}

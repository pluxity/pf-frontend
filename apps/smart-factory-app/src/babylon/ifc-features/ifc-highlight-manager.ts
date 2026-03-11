import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

/**
 * Selection highlight manager for IFC elements.
 * Uses GlowLayer for blue selection glow and red/orange alarm glow.
 */
export function createIFCHighlightManager(glowLayer: GlowLayer, alarmGlowLayer: GlowLayer) {
  const selectColor = new Color4(0.3, 0.5, 1.0, 1); // Blue
  const hoverColor = new Color4(0.4, 0.6, 0.9, 0.6); // Lighter blue for hover
  let selectedMeshes: AbstractMesh[] = [];
  let hoveredMesh: AbstractMesh | null = null;
  const alarmMeshes = new Set<AbstractMesh>();
  let alarmColor = new Color4(1.0, 0.2, 0.1, 1); // Red

  // Custom emissive selector for selection glow
  glowLayer.customEmissiveColorSelector = (_mesh, _subMesh, _material, result) => {
    if (selectedMeshes.includes(_mesh)) {
      result.set(selectColor.r, selectColor.g, selectColor.b, selectColor.a);
    } else if (_mesh === hoveredMesh) {
      result.set(hoverColor.r, hoverColor.g, hoverColor.b, hoverColor.a);
    } else {
      result.set(0, 0, 0, 0);
    }
  };

  // Custom emissive selector for alarm glow
  alarmGlowLayer.customEmissiveColorSelector = (_mesh, _subMesh, _material, result) => {
    if (alarmMeshes.has(_mesh)) {
      result.set(alarmColor.r, alarmColor.g, alarmColor.b, alarmColor.a);
    } else {
      result.set(0, 0, 0, 0);
    }
  };

  function selectMesh(mesh: AbstractMesh): void {
    clearSelection();
    selectedMeshes = [mesh];

    if (mesh instanceof Mesh) {
      glowLayer.addIncludedOnlyMesh(mesh);
    }
    // Also include child meshes
    for (const child of mesh.getChildMeshes()) {
      if (child instanceof Mesh) {
        glowLayer.addIncludedOnlyMesh(child);
        selectedMeshes.push(child);
      }
    }
  }

  function hoverMesh(mesh: AbstractMesh | null): void {
    // Remove previous hover glow
    if (hoveredMesh && hoveredMesh instanceof Mesh) {
      // Don't remove if it's also selected
      if (!selectedMeshes.includes(hoveredMesh)) {
        glowLayer.removeIncludedOnlyMesh(hoveredMesh);
      }
    }
    hoveredMesh = mesh;
    if (mesh && mesh instanceof Mesh) {
      glowLayer.addIncludedOnlyMesh(mesh);
    }
  }

  function clearSelection(): void {
    for (const mesh of selectedMeshes) {
      if (mesh instanceof Mesh) {
        glowLayer.removeIncludedOnlyMesh(mesh);
      }
    }
    selectedMeshes = [];
  }

  function setAlarmHighlight(meshes: AbstractMesh[], color?: Color4): void {
    if (color) {
      alarmColor = color;
    }
    for (const mesh of meshes) {
      alarmMeshes.add(mesh);
      if (mesh instanceof Mesh) {
        alarmGlowLayer.addIncludedOnlyMesh(mesh);
      }
    }
  }

  function clearAlarmHighlight(): void {
    for (const mesh of alarmMeshes) {
      if (mesh instanceof Mesh) {
        alarmGlowLayer.removeIncludedOnlyMesh(mesh);
      }
    }
    alarmMeshes.clear();
  }

  function dispose(): void {
    clearSelection();
    clearAlarmHighlight();
  }

  return {
    selectMesh,
    hoverMesh,
    clearSelection,
    setAlarmHighlight,
    clearAlarmHighlight,
    dispose,
  };
}

import { create } from "zustand";
import type { Material } from "three";
import type { InteractionState, InteractionActions, MeshInfo } from "../types/interaction";

export const useInteractionStore = create<InteractionState & InteractionActions>((set, get) => ({
  hoveredMesh: null,
  selectedMesh: null,
  enableHover: true,
  enableOutline: true,
  outlineColor: "#00cc44",
  outlineThickness: 2,
  hoverTarget: "all",

  setHoveredMesh: (mesh) => {
    set({ hoveredMesh: mesh });
  },

  setSelectedMesh: (mesh) => {
    set({ selectedMesh: mesh });
  },

  clearHover: () => {
    set({ hoveredMesh: null });
  },

  clearSelection: () => {
    set({ selectedMesh: null });
  },

  clearAll: () => {
    set({ hoveredMesh: null, selectedMesh: null });
  },

  toggleHover: () => {
    set((state) => ({ enableHover: !state.enableHover }));
  },

  toggleOutline: () => {
    set((state) => ({ enableOutline: !state.enableOutline }));
  },

  setOutlineColor: (color) => {
    set({ outlineColor: color });
  },

  setOutlineThickness: (thickness) => {
    set({ outlineThickness: thickness });
  },

  setHoverTarget: (target) => {
    set({ hoverTarget: target });
  },

  getHoveredMeshInfo: () => {
    const { hoveredMesh } = get();
    if (!hoveredMesh) return null;

    const mesh = hoveredMesh.mesh;
    const intersection = hoveredMesh.intersection;
    const geometry = mesh.geometry;

    let vertices = 0;
    let triangles = 0;

    if (geometry) {
      vertices = geometry.attributes.position?.count ?? 0;
      triangles = geometry.index ? geometry.index.count / 3 : vertices / 3;
    }

    // InstancedMesh인 경우 Feature 정보 추출
    const isFeatureGroup = mesh.userData?.isFeatureGroup === true;
    const instanceId = intersection.instanceId;
    let featureName = mesh.name || "Unnamed Mesh";

    if (isFeatureGroup && instanceId !== undefined) {
      const features = mesh.userData?.features;
      if (features && features[instanceId]) {
        const feature = features[instanceId];
        featureName = `${feature.id} (${feature.metadata?.location || feature.assetId})`;
      }
    }

    const meshInfo: MeshInfo = {
      name: featureName,
      type: mesh.type,
      position: [
        parseFloat(mesh.position.x.toFixed(2)),
        parseFloat(mesh.position.y.toFixed(2)),
        parseFloat(mesh.position.z.toFixed(2)),
      ],
      vertices,
      triangles: Math.floor(triangles),
      materialName: Array.isArray(mesh.material)
        ? `Multiple (${mesh.material.length})`
        : (() => {
            const mat = mesh.material as Material;
            return mat?.name || mat?.type || "Unknown";
          })(),
      visible: mesh.visible,
    };

    return meshInfo;
  },
}));

export const interactionStore = useInteractionStore;

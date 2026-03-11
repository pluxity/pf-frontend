import { create } from "zustand";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type {
  ModelTier,
  PFDiscipline,
  PFElementMeta,
  UnifiedTreeNode,
  ModelStats,
} from "@/babylon/types";

interface ModelViewerState {
  // Loading
  isLoading: boolean;
  sceneReady: boolean;

  // Model info
  tier: ModelTier | null;
  fileName: string | null;
  stats: ModelStats | null;

  // Tree
  tree: UnifiedTreeNode[];

  // Selection
  selectedMesh: AbstractMesh | null;
  selectedElement: PFElementMeta | null;

  // Filtering (Tier 1+)
  storeys: { id: string; name: string; elevation: number }[];
  systems: { id: string; name: string; type: string; storeyId: string | null }[];
  storeyVisibility: Record<string, boolean>;
  systemVisibility: Record<string, boolean>;
  disciplineVisibility: Record<PFDiscipline, boolean>;

  // Pathfinding
  pathfindingMode: "start" | "end" | "obstacle" | "wall" | "door" | "eraser" | null;
  pathfindingReady: boolean;
  walkableMeshCount: number;
  startPoint: { x: number; y: number; z: number } | null;
  endPoint: { x: number; y: number; z: number } | null;
  pathInfo: { distance: number; waypoints: number } | null;
  isAnimating: boolean;
  showNavMeshDebug: boolean;
  obstacleCount: number;
}

interface ModelViewerActions {
  setLoading: (loading: boolean) => void;
  setSceneData: (data: {
    tier: ModelTier;
    tree: UnifiedTreeNode[];
    stats: ModelStats;
    fileName: string;
    storeys: { id: string; name: string; elevation: number }[];
    systems: { id: string; name: string; type: string; storeyId: string | null }[];
  }) => void;
  setSelectedMesh: (mesh: AbstractMesh | null) => void;
  setSelectedElement: (element: PFElementMeta | null) => void;
  setNodeVisibility: (nodeId: string, visible: boolean) => void;
  setStoreyVisibility: (storeyId: string, visible: boolean) => void;
  setSystemVisibility: (systemId: string, visible: boolean) => void;
  setDisciplineVisibility: (discipline: PFDiscipline, visible: boolean) => void;
  setPathfindingMode: (
    mode: "start" | "end" | "obstacle" | "wall" | "door" | "eraser" | null
  ) => void;
  setPathfindingReady: (ready: boolean) => void;
  setWalkableMeshCount: (count: number) => void;
  setStartPoint: (point: { x: number; y: number; z: number } | null) => void;
  setEndPoint: (point: { x: number; y: number; z: number } | null) => void;
  setPathInfo: (info: { distance: number; waypoints: number } | null) => void;
  setIsAnimating: (animating: boolean) => void;
  setShowNavMeshDebug: (show: boolean) => void;
  setObstacleCount: (count: number) => void;
  resetAll: () => void;
}

type ModelViewerStore = ModelViewerState & ModelViewerActions;

const initialState: ModelViewerState = {
  isLoading: false,
  sceneReady: false,
  tier: null,
  fileName: null,
  stats: null,
  tree: [],
  selectedMesh: null,
  selectedElement: null,
  storeys: [],
  systems: [],
  storeyVisibility: {},
  systemVisibility: {},
  disciplineVisibility: { arc: true, mep: true, str: true },
  pathfindingMode: null,
  pathfindingReady: false,
  walkableMeshCount: 0,
  startPoint: null,
  endPoint: null,
  pathInfo: null,
  isAnimating: false,
  showNavMeshDebug: false,
  obstacleCount: 0,
};

export const useModelViewerStore = create<ModelViewerStore>()((set) => ({
  ...initialState,

  setLoading: (isLoading) => set({ isLoading }),

  setSceneData: ({ tier, tree, stats, fileName, storeys, systems }) => {
    const storeyVis: Record<string, boolean> = {};
    for (const s of storeys) storeyVis[s.id] = true;

    const systemVis: Record<string, boolean> = {};
    for (const s of systems) systemVis[s.id] = true;

    set({
      sceneReady: true,
      tier,
      tree,
      stats,
      fileName,
      storeys,
      systems,
      storeyVisibility: storeyVis,
      systemVisibility: systemVis,
      disciplineVisibility: { arc: true, mep: true, str: true },
    });
  },

  setSelectedMesh: (selectedMesh) => set({ selectedMesh }),

  setSelectedElement: (selectedElement) => set({ selectedElement }),

  setNodeVisibility: (nodeId, visible) =>
    set((s) => ({
      tree: updateTreeNodeVisibility(s.tree, nodeId, visible),
    })),

  setStoreyVisibility: (storeyId, visible) =>
    set((s) => ({
      storeyVisibility: { ...s.storeyVisibility, [storeyId]: visible },
    })),

  setSystemVisibility: (systemId, visible) =>
    set((s) => ({
      systemVisibility: { ...s.systemVisibility, [systemId]: visible },
    })),

  setDisciplineVisibility: (discipline, visible) =>
    set((s) => ({
      disciplineVisibility: { ...s.disciplineVisibility, [discipline]: visible },
    })),

  setPathfindingMode: (pathfindingMode) => set({ pathfindingMode }),
  setPathfindingReady: (pathfindingReady) => set({ pathfindingReady }),
  setWalkableMeshCount: (walkableMeshCount) => set({ walkableMeshCount }),
  setStartPoint: (startPoint) => set({ startPoint }),
  setEndPoint: (endPoint) => set({ endPoint }),
  setPathInfo: (pathInfo) => set({ pathInfo }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setShowNavMeshDebug: (showNavMeshDebug) => set({ showNavMeshDebug }),
  setObstacleCount: (obstacleCount) => set({ obstacleCount }),

  resetAll: () => set(initialState),
}));

// --- Helpers ---

/** Recursively update visibility for a node and all its children */
function updateTreeNodeVisibility(
  nodes: UnifiedTreeNode[],
  targetId: string,
  visible: boolean
): UnifiedTreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return setVisibilityRecursive(node, visible);
    }
    if (node.children.length > 0) {
      const updatedChildren = updateTreeNodeVisibility(node.children, targetId, visible);
      if (updatedChildren !== node.children) {
        return { ...node, children: updatedChildren };
      }
    }
    return node;
  });
}

function setVisibilityRecursive(node: UnifiedTreeNode, visible: boolean): UnifiedTreeNode {
  return {
    ...node,
    visible,
    children: node.children.map((child) => setVisibilityRecursive(child, visible)),
  };
}

// --- Selectors ---
export const selectIsLoading = (s: ModelViewerStore) => s.isLoading;
export const selectSceneReady = (s: ModelViewerStore) => s.sceneReady;
export const selectTier = (s: ModelViewerStore) => s.tier;
export const selectFileName = (s: ModelViewerStore) => s.fileName;
export const selectStats = (s: ModelViewerStore) => s.stats;
export const selectTree = (s: ModelViewerStore) => s.tree;
export const selectSelectedMesh = (s: ModelViewerStore) => s.selectedMesh;
export const selectSelectedElement = (s: ModelViewerStore) => s.selectedElement;
export const selectPathfindingMode = (s: ModelViewerStore) => s.pathfindingMode;
export const selectPathfindingReady = (s: ModelViewerStore) => s.pathfindingReady;
export const selectWalkableMeshCount = (s: ModelViewerStore) => s.walkableMeshCount;
export const selectStartPoint = (s: ModelViewerStore) => s.startPoint;
export const selectEndPoint = (s: ModelViewerStore) => s.endPoint;
export const selectPathInfo = (s: ModelViewerStore) => s.pathInfo;
export const selectIsAnimating = (s: ModelViewerStore) => s.isAnimating;
export const selectShowNavMeshDebug = (s: ModelViewerStore) => s.showNavMeshDebug;
export const selectObstacleCount = (s: ModelViewerStore) => s.obstacleCount;

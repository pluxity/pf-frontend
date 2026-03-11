import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

import type {
  ModelTier,
  PFModelMeta,
  PFNodeInfo,
  PFDiscipline,
  PFElementMeta,
  PFEquipmentDef,
  PFSystemDef,
  PFSpatialNode,
} from "./pf-model.types";

// ---------------------------------------------------------------------------
// Unified tree node (for MeshTreePanel rendering)
// ---------------------------------------------------------------------------

export interface UnifiedTreeNode {
  /** Unique key in tree */
  id: string;
  /** Display label */
  label: string;
  /** PF node info (null for Tier 0 raw meshes) */
  pfNode: PFNodeInfo | null;
  /** Babylon.js mesh or transform node reference */
  node: AbstractMesh | TransformNode | null;
  /** Children */
  children: UnifiedTreeNode[];
  /** Is currently visible? */
  visible: boolean;
  /** Mesh count under this node */
  meshCount: number;
  /** Triangle count under this node */
  triangleCount: number;
}

// ---------------------------------------------------------------------------
// Unified index (built from GLB nodes + optional sidecar JSON)
// ---------------------------------------------------------------------------

export interface UnifiedIndex {
  /** All meshes loaded */
  allMeshes: AbstractMesh[];
  /** Mesh tree for UI */
  tree: UnifiedTreeNode[];
  /** Storey nodes (Tier 1+) */
  storeyNodes: Map<string, TransformNode>;
  /** System nodes (Tier 1+) */
  systemNodes: Map<string, TransformNode>;
  /** Equipment nodes (Tier 1+) */
  equipmentNodes: Map<string, AbstractMesh | TransformNode>;
  /** Discipline -> list of nodes */
  disciplineNodes: Map<PFDiscipline, (AbstractMesh | TransformNode)[]>;
  /** Node name -> TransformNode/Mesh lookup */
  nodeByName: Map<string, AbstractMesh | TransformNode>;
}

// ---------------------------------------------------------------------------
// Unified model result (from loader)
// ---------------------------------------------------------------------------

export interface UnifiedModelResult {
  /** Detected model tier */
  tier: ModelTier;
  /** Loaded file name(s) */
  fileName: string;
  /** Sidecar metadata (Tier 2 only) */
  metadata: PFModelMeta | null;
  /** All loaded meshes */
  meshes: AbstractMesh[];
  /** Root transform node */
  root: TransformNode;
  /** Built index */
  index: UnifiedIndex;
  /** Scene stats */
  stats: ModelStats;
}

export interface ModelStats {
  meshCount: number;
  triangleCount: number;
  vertexCount: number;
  materialCount: number;
  tier: ModelTier;
  fileSize: number;
}

// ---------------------------------------------------------------------------
// Unified Scene API (exposed to React components)
// ---------------------------------------------------------------------------

export interface UnifiedSceneApi {
  scene: Scene;
  model: UnifiedModelResult;

  // --- Engine ---
  resize(): void;

  // --- Tier 0: Basic viewing ---
  fitCamera(): void;
  setWireframe(enabled: boolean): void;
  setNodeVisible(nodeId: string, visible: boolean): void;
  selectMesh(mesh: AbstractMesh | null): void;
  onSelect(callback: (mesh: AbstractMesh | null, element: PFElementMeta | null) => void): void;

  // --- Tier 0: Section view ---
  enableSection(axis: "x" | "y" | "z", position: number): void;
  setSectionPosition(position: number): void;
  disableSection(): void;
  isSectionEnabled(): boolean;

  // --- Tier 1: Spatial filtering ---
  setStoreyVisible(storeyId: string, visible: boolean): void;
  isolateStorey(storeyId: string): void;
  showAllStoreys(): void;
  setSystemVisible(systemId: string, visible: boolean): void;
  setDisciplineVisible(discipline: PFDiscipline, visible: boolean): void;
  highlightEquipment(equipmentId: string): void;
  clearHighlight(): void;

  // --- Tier 1: Spatial queries ---
  getStoreys(): { id: string; name: string; elevation: number }[];
  getSystems(): { id: string; name: string; type: string; storeyId: string | null }[];
  getEquipment(): PFEquipmentDef[];
  getSpatialHierarchy(): PFSpatialNode[];

  // --- Tier 2: Monitoring ---
  getElementMeta(nodeId: string): PFElementMeta | null;
  getEquipmentDef(equipmentId: string): PFEquipmentDef | null;
  getSystemDef(systemId: string): PFSystemDef | null;

  // --- Pathfinding ---
  initPathfinding(): Promise<void>;
  getWalkableMeshes(): AbstractMesh[];
  setWalkableMeshes(meshes: AbstractMesh[]): void;
  buildNavMesh(): boolean;
  isNavMeshReady(): boolean;
  setPathfindingStart(pos: { x: number; y: number; z: number }): void;
  setPathfindingEnd(pos: { x: number; y: number; z: number }): void;
  getPathInfo(): { distance: number; waypoints: number } | null;
  startPathAnimation(speed?: number): void;
  stopPathAnimation(): void;
  isPathAnimating(): boolean;
  showNavMeshDebug(show: boolean): void;
  clearPath(): void;
  pickNavMeshPoint(callback: (pos: { x: number; y: number; z: number }) => void): void;
  clearPickCallback(): void;

  // --- Obstacles & Walls ---
  addObstacle(
    pos: { x: number; y: number; z: number },
    size?: { w: number; h: number; d: number }
  ): string;
  addWall(
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    height?: number,
    thickness?: number
  ): string;
  addWallWithDoor(
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    height?: number,
    thickness?: number,
    doorWidth?: number,
    doorHeight?: number
  ): string;
  addDoorToWall(
    wallId: string,
    doorWidth?: number,
    doorHeight?: number,
    hitPoint?: { x: number; y: number; z: number }
  ): string | null;
  pickWall(callback: (wallId: string, hitPoint: { x: number; y: number; z: number }) => void): void;
  pickObstacle(callback: (id: string) => void): void;
  clearWallPick(): void;
  getWallEndpoints(): { x: number; y: number; z: number }[];
  removeObstacle(id: string): void;
  getObstacles(): {
    id: string;
    type: "box" | "wall";
    position: { x: number; y: number; z: number };
    size: { w: number; h: number; d: number };
  }[];
  clearObstacles(): void;

  // --- Cleanup ---
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Load options
// ---------------------------------------------------------------------------

export interface UnifiedLoadOptions {
  /** GLB file (File object from drop or URL string) */
  glbSource: File | string;
  /** Optional sidecar JSON (File object or URL string) */
  metaSource?: File | string | null;
}

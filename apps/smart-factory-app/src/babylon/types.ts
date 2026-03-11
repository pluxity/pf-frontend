import type {
  Scene,
  Engine,
  ArcRotateCamera,
  UniversalCamera,
  ShadowGenerator,
  GlowLayer,
  AbstractMesh,
  TransformNode,
} from "@babylonjs/core";

// --- Camera & View ---

export type CameraMode = "orbit" | "interior" | "fps";

export type ViewMode = "default" | "night" | "thermal" | "alert";

// --- Equipment ---

export type EquipmentStatus = "running" | "idle" | "warning" | "error" | "maintenance";

export type EquipmentType = "cnc" | "press" | "robot-arm" | "assembly" | "inspector";

export interface EquipmentDefinition {
  id: string;
  type: EquipmentType;
  label: string;
  position: { x: number; z: number };
  rotation?: number;
  status: EquipmentStatus;
  buildingId?: string;
  ratedPowerKw?: number;
  floor?: number; // 0=1F(default), 1=2F
}

// --- Building ---

export type BuildingId = "main-factory" | "warehouse" | "utility" | "quality-lab";

export interface StaircaseConfig {
  position: { x: number; z: number }; // local coords within building
  rotation: number; // Y-axis rotation (0 = +Z direction)
  width: number; // staircase width
  depth: number; // staircase depth (XZ footprint)
}

export interface BuildingConfig {
  id: BuildingId;
  label: string;
  width: number;
  depth: number;
  wallHeight: number; // total height (including all floors)
  floorHeight?: number; // single floor height (default: wallHeight / floors)
  floors?: number; // number of floors (default: 1)
  position: { x: number; z: number };
  rotation?: number;
  zones: ZoneConfig[];
  conveyor?: ConveyorConfig;
  storageRacks?: StorageRackConfig[];
  staircase?: StaircaseConfig;
}

export interface ZoneConfig {
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  floor?: number; // 0=1F(default), 1=2F
}

export interface ConveyorConfig {
  y: number;
  width: number;
  rollerRadius: number;
  rollerSpacing: number;
  segments: { from: { x: number; z: number }; to: { x: number; z: number } }[];
}

export interface StorageRackConfig {
  x: number;
  z: number;
  rotation: number;
}

export interface PathwayConfig {
  id: string;
  from: BuildingId;
  to: BuildingId;
  start: { x: number; z: number };
  end: { x: number; z: number };
  width: number;
}

// --- Electrical / MEP ---

export type LoadLevel = "low" | "normal" | "high" | "critical";

export interface TransformerConfig {
  id: string;
  label: string;
  position: { x: number; z: number };
  ratedKva: number;
}

export interface DistributionPanelConfig {
  id: string;
  label: string;
  type: "MSB" | "DP" | "SP";
  buildingId: BuildingId;
  position: { x: number; z: number };
  parentId: string | null;
  ratedAmps: number;
}

export interface CableRouteConfig {
  id: string;
  fromId: string;
  toId: string;
  waypoints: { x: number; y: number; z: number }[];
  voltage: "HV" | "LV";
}

// --- Power Data ---

export interface PowerReading {
  panelId: string;
  currentKw: number;
  ratedKw: number;
  loadPercent: number;
  level: LoadLevel;
  timestamp: number;
}

export interface PowerAlert {
  id: string;
  panelId: string;
  level: "warning" | "critical";
  message: string;
  loadPercent: number;
  timestamp: number;
}

// --- External Power ---

export interface ExternalPowerConfig {
  id: string;
  label: string;
  position: { x: number; z: number };
  hvCableWaypoints: { x: number; y: number; z: number }[];
}

// --- Emergency Generator ---

export interface EmergencyGeneratorConfig {
  id: string;
  label: string;
  buildingId: BuildingId;
  position: { x: number; z: number };
  ratedKva: number;
}

export type GeneratorStatus = "standby" | "starting" | "running";

// --- Scene Context ---

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
  fpsCamera: UniversalCamera;
  shadowGenerator: ShadowGenerator;
  glowLayer: GlowLayer;
  overloadGlowLayer: GlowLayer;
}

// --- Campus Scene API ---

export interface CampusSceneApi {
  /** Add equipment to the scene */
  addEquipment: (def: EquipmentDefinition) => void;
  /** Remove equipment by id */
  removeEquipment: (id: string) => void;
  /** Update equipment status (changes color) */
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;
  /** Highlight equipment (glow effect) */
  highlightEquipment: (id: string) => void;
  /** Clear highlight */
  clearHighlight: () => void;
  /** Get mesh by equipment id */
  getEquipmentMesh: (id: string) => AbstractMesh | null;
  /** Register click handler */
  onEquipmentClick: (handler: (id: string | null) => void) => void;
  /** Register building click handler */
  onBuildingClick: (handler: (buildingId: BuildingId | null) => void) => void;
  /** Camera: fly to building */
  focusBuilding: (buildingId: BuildingId) => void;
  /** Camera: back to campus overview */
  focusCampus: () => void;
  /** Toggle cable visibility */
  setCablesVisible: (visible: boolean) => void;
  /** Update cable load colors */
  updateCableLoads: (readings: PowerReading[]) => void;
  /** Get building root node */
  getBuildingNode: (buildingId: BuildingId) => TransformNode | null;
  /** Disconnect a cable (cascade to downstream) */
  disconnectCable: (cableId: string) => void;
  /** Reconnect a cable (cascade to downstream) */
  reconnectCable: (cableId: string) => void;
  /** Start emergency generator */
  startEmergencyPower: () => void;
  /** Stop emergency generator */
  stopEmergencyPower: () => void;
  /** Toggle power flow particle visibility */
  setFlowVisible: (visible: boolean) => void;
  /** Toggle billboard label visibility */
  setBillboardsVisible: (visible: boolean) => void;
  /** Highlight a specific zone floor within a building */
  highlightZone: (
    buildingId: BuildingId,
    zoneIndex: number,
    color: string,
    pulse?: boolean
  ) => void;
  /** Highlight all zones of a building */
  highlightBuilding: (buildingId: BuildingId, color: string, pulse?: boolean) => void;
  /** Clear zone highlights for a building */
  clearZoneHighlight: (buildingId: BuildingId) => void;
  /** Clear all zone highlights across all buildings */
  clearAllZoneHighlights: () => void;
  /** Open a 3D CCTV panel near a building */
  openCCTVPanel: (id: string, label: string, buildingId: BuildingId, triggerLabel?: string) => void;
  /** Set video source for a CCTV panel (when WHEP connects) */
  setCCTVVideoSource: (id: string, videoElement: HTMLVideoElement) => void;
  /** Update CCTV panel status */
  updateCCTVStatus: (id: string, status: "idle" | "connecting" | "connected" | "failed") => void;
  /** Close a CCTV panel */
  closeCCTVPanel: (id: string) => void;
  /** Close all CCTV panels */
  closeAllCCTVPanels: () => void;
  /** Set camera mode (orbit / interior / fps) */
  setCameraMode: (mode: CameraMode, buildingId?: BuildingId) => void;
  /** Get current camera mode */
  getCameraMode: () => CameraMode;
  /** Set view mode (default / night / thermal / alert) */
  setViewMode: (mode: ViewMode) => void;
  /** Get current view mode */
  getViewMode: () => ViewMode;
  /** Show a specific emergency route */
  showEmergencyRoute: (routeId: string) => void;
  /** Show all emergency routes */
  showAllEmergencyRoutes: () => void;
  /** Hide all emergency routes */
  hideEmergencyRoute: () => void;
  /** Start evacuation simulation (humanoid figures moving along routes) */
  startEvacuation: () => void;
  /** Stop evacuation simulation */
  stopEvacuation: () => void;
  /** Start fire at a building zone (flame + smoke particles) */
  startFire: (buildingId: BuildingId, zoneIndex: number) => void;
  /** Spread fire to another zone */
  spreadFire: (buildingId: BuildingId, zoneIndex: number) => void;
  /** Start red pulse alarm on a building */
  startFireAlarm: (buildingId: BuildingId) => void;
  /** Stop all fire effects and restore scene */
  stopFire: () => void;
  /** Clean up all resources */
  dispose: () => void;
}

// Keep backward compat alias
export type FactorySceneApi = CampusSceneApi;

// --- IFC Monitoring Types ---

export type MepStatus = "normal" | "warning" | "error" | "offline";

export type SectionAxis = "x" | "y" | "z";

export type IFCCameraMode = "orbit" | "interior" | "fps";

export type HeatmapMode = "temperature" | "energy";

export interface StoreyInfo {
  expressID: number;
  name: string;
  elevation: number;
  meshCount: number;
}

export interface SensorReading {
  expressID: number;
  label: string;
  value: number;
  unit: string;
  status: MepStatus;
}

export interface MepAlarm {
  id: string;
  expressID: number;
  type: string;
  message: string;
  level: "warning" | "critical";
  timestamp: number;
}

export interface IFCIndices {
  storeyMeshes: Map<number, AbstractMesh[]>;
  typeMeshes: Map<string, AbstractMesh[]>;
  expressIdToMesh: Map<number, AbstractMesh>;
  storeys: StoreyInfo[];
}

// --- IFC Model Types ---

/** IFC discipline classification */
export type Discipline = "arc" | "mep" | "str";

/** Spatial hierarchy node (Project → Site → Building → Storey) */
export interface SpatialNode {
  expressID: number;
  type: string;
  name: string;
  children: SpatialNode[];
  elementIds: number[];
}

/** Per-element metadata extracted from IFC */
export interface ElementMeta {
  expressID: number;
  type: string;
  name: string;
  discipline: Discipline | undefined;
  storeyId: number | null;
  properties: Record<string, string | number | boolean>;
}

/** Full IFC metadata (loaded from {model}-meta.json) */
export interface IFCMetadata {
  project: { name: string; description: string };
  spatialHierarchy: SpatialNode[];
  elements: Record<number, ElementMeta>;
}

// --- PF-Model Unified Types (re-export) ---
export type {
  PFNodeCategory,
  PFDiscipline,
  PFNodeInfo,
  ModelTier,
  PFModelMeta,
  PFProjectInfo,
  PFSpatialNode,
  PFElementMeta,
  PFEquipmentDef,
  PFSystemDef,
  PFSensorDef,
  PFZoneDef,
  UnifiedTreeNode,
  UnifiedIndex,
  UnifiedModelResult,
  UnifiedSceneApi,
  UnifiedLoadOptions,
  ModelStats,
} from "./types/index";

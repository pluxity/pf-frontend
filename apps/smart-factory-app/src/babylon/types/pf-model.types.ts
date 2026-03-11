/**
 * PF-Model Specification v1.0
 *
 * A unified format for building/factory 3D models.
 * Supports 3-tier loading:
 *   Tier 0: Raw GLB (no metadata)
 *   Tier 1: GLB with pf: node naming convention
 *   Tier 2: GLB + sidecar JSON (full metadata)
 */

// ---------------------------------------------------------------------------
// Node naming convention
// ---------------------------------------------------------------------------

/** PF node categories -- parsed from `pf:{category}/{id}[:{discipline}]` */
export type PFNodeCategory = "site" | "bldg" | "storey" | "space" | "sys" | "eq" | "grp";

/** Discipline suffix on pf: node names */
export type PFDiscipline = "arc" | "mep" | "str";

/** Result of parsing a single `pf:...` node name */
export interface PFNodeInfo {
  /** Raw node name from GLB */
  raw: string;
  /** Node category */
  category: PFNodeCategory;
  /** Node id (portion after category/) */
  id: string;
  /** Optional discipline suffix */
  discipline: PFDiscipline | null;
}

// ---------------------------------------------------------------------------
// Model Tier
// ---------------------------------------------------------------------------

/** Tier 0 = raw GLB, Tier 1 = pf: naming, Tier 2 = GLB + sidecar JSON */
export type ModelTier = 0 | 1 | 2;

// ---------------------------------------------------------------------------
// Sidecar JSON schema (Tier 2)
// ---------------------------------------------------------------------------

export interface PFModelMeta {
  version: string;
  project: PFProjectInfo;
  spatialHierarchy: PFSpatialNode[];
  elements: Record<string, PFElementMeta>;
  equipment: Record<string, PFEquipmentDef>;
  systems: Record<string, PFSystemDef>;
  sensors: Record<string, PFSensorDef>;
  zones: Record<string, PFZoneDef>;
  /** IFC backward-compatibility data (optional) */
  ifc?: {
    expressIdMap: Record<string, number[]>;
    schemaVersion: string;
  };
}

export interface PFProjectInfo {
  name: string;
  description: string;
  units: string;
  sourceFormat: string;
}

/** Spatial hierarchy node: site -> bldg -> storey -> space */
export interface PFSpatialNode {
  id: string;
  type: "site" | "building" | "storey" | "space";
  name: string;
  elevation?: number;
  children: PFSpatialNode[];
  /** Node names of GLB nodes that belong to this spatial node */
  nodeNames: string[];
}

/** Per-element metadata */
export interface PFElementMeta {
  id: string;
  type: string;
  name: string;
  discipline: PFDiscipline | null;
  storeyId: string | null;
  systemId: string | null;
  /** Node name in GLB that contains this element */
  nodeName: string;
  properties: Record<string, string | number | boolean>;
  /** IFC expressID if sourced from IFC */
  expressID?: number;
}

/** Equipment definition (monitorable asset) */
export interface PFEquipmentDef {
  id: string;
  type: string;
  name: string;
  storeyId: string;
  systemId: string | null;
  /** GLB node name for this equipment */
  nodeName: string;
  /** Fields that can be monitored */
  monitorable: string[];
  properties: Record<string, string | number | boolean>;
}

/** System definition (HVAC, plumbing, electrical, etc.) */
export interface PFSystemDef {
  id: string;
  type: "hvac" | "plumbing" | "electrical" | "fire-protection" | "custom";
  name: string;
  storeyId: string | null;
  equipmentIds: string[];
  /** GLB node name for the system group */
  nodeName: string;
  monitorable: {
    flow?: boolean;
    temperature?: boolean;
    power?: boolean;
  };
}

/** Sensor definition */
export interface PFSensorDef {
  id: string;
  type: string;
  name: string;
  equipmentId: string | null;
  unit: string;
  /** GLB node name for sensor placement */
  nodeName: string;
  position?: { x: number; y: number; z: number };
}

/** Zone definition (energy aggregation, temperature zone) */
export interface PFZoneDef {
  id: string;
  name: string;
  storeyId: string;
  /** Node names that comprise this zone */
  nodeNames: string[];
  properties: Record<string, string | number | boolean>;
}

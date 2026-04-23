export type StructureType =
  | "SITE"
  | "FOUNDATION"
  | "BUILDING"
  | "STOREY"
  | "WALL"
  | "SLAB"
  | "COLUMN"
  | "BEAM"
  | "STAIR"
  | "ROOF"
  | "SAFETY_NET"
  | "GANGFORM"
  | "SHORE"
  | "TEMPORARY";

export type ConstructionPhase =
  | "formwork"
  | "rebar"
  | "concrete_pouring"
  | "concrete_curing"
  | "completed";

export interface StructureNode {
  id: string;
  name: string;
  type: StructureType;
  children?: StructureNode[];
}

export interface PeriodTask {
  structureId: string;
  phase: ConstructionPhase;
}

export interface SchedulePeriod {
  week: number;
  startDate: string;
  endDate: string;
  tasks: PeriodTask[];
}

export interface ConstructionSchedule {
  project: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  structures: StructureNode[];
  periods: SchedulePeriod[];
}

export type MeshVisualState =
  | "not_started"
  | "formwork"
  | "rebar"
  | "concrete_pouring"
  | "concrete_curing"
  | "completed";

export type PlaybackSpeed = 1 | 2 | 4 | 8;

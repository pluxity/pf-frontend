import type { BuildingConfig, PathwayConfig, LoadLevel } from "@/babylon/types";

/** Campus ground dimensions */
export const CAMPUS = {
  groundWidth: 220,
  groundDepth: 160,
} as const;

/** Load level → color mapping */
export const LOAD_COLORS: Record<LoadLevel, string> = {
  low: "#00C48C",
  normal: "#4D7EFF",
  high: "#FFA26B",
  critical: "#DE4545",
};

/** Common wall parameters */
const WALL_DEFAULTS = {
  wallHeight: 8,
  wallThickness: 0.3,
  wallAlpha: 0.15,
  roofHeight: 0.2,
  pillarRadius: 0.3,
} as const;

/** 4 buildings forming the campus (all 2-story) */
export const BUILDINGS: BuildingConfig[] = [
  // --- 본관 (Main Factory) ---
  {
    id: "main-factory",
    label: "본관 (가공/조립/검사)",
    width: 60,
    depth: 40,
    wallHeight: 14,
    floorHeight: 7,
    floors: 2,
    position: { x: -40, z: -30 },
    zones: [
      // 1F — heavy equipment
      { name: "가공 구역", x: -15, z: -8, w: 20, d: 18, color: "#1a2a3a", floor: 0 },
      { name: "조립 구역", x: 12, z: -8, w: 16, d: 18, color: "#1a2a2a", floor: 0 },
      { name: "자재 구역", x: -15, z: 12, w: 20, d: 8, color: "#1a1a2a", floor: 0 },
      // 2F — inspection (lightweight)
      { name: "검사 구역", x: 12, z: 10, w: 16, d: 10, color: "#2a1a2a", floor: 1 },
    ],
    conveyor: {
      y: 1.0,
      width: 1.5,
      rollerRadius: 0.15,
      rollerSpacing: 0.6,
      segments: [
        { from: { x: -24, z: 0 }, to: { x: 5, z: 0 } },
        { from: { x: 5, z: 0 }, to: { x: 5, z: -12 } },
        { from: { x: 5, z: -12 }, to: { x: 20, z: -12 } },
      ],
    },
    storageRacks: [
      { x: -20, z: 14, rotation: 0 },
      { x: -14, z: 14, rotation: 0 },
      { x: -8, z: 14, rotation: 0 },
    ],
    staircase: { position: { x: 27, z: 17 }, rotation: 0, width: 3, depth: 5 },
  },

  // --- 물류동 (Warehouse) ---
  {
    id: "warehouse",
    label: "물류동 (입고/출고/적치)",
    width: 45,
    depth: 35,
    wallHeight: 12,
    floorHeight: 6,
    floors: 2,
    position: { x: 50, z: -32.5 },
    zones: [
      // 1F — logistics robots
      { name: "입고 구역", x: -12, z: -8, w: 16, d: 14, color: "#1a2a3a", floor: 0 },
      { name: "출고 구역", x: 10, z: -8, w: 14, d: 14, color: "#1a2a2a", floor: 0 },
      // 2F — lightweight storage
      { name: "적치 구역", x: 0, z: 8, w: 38, d: 12, color: "#1a1a2a", floor: 1 },
    ],
    storageRacks: [
      { x: -15, z: 10, rotation: 0 },
      { x: -9, z: 10, rotation: 0 },
      { x: -3, z: 10, rotation: 0 },
      { x: 3, z: 10, rotation: 0 },
      { x: 9, z: 10, rotation: 0 },
      { x: 15, z: 10, rotation: 0 },
    ],
    staircase: { position: { x: 19, z: -14 }, rotation: Math.PI, width: 3, depth: 5 },
  },

  // --- 유틸리티동 (Utility) ---
  {
    id: "utility",
    label: "유틸리티동 (전기실/기계실)",
    width: 30,
    depth: 20,
    wallHeight: 10,
    floorHeight: 5,
    floors: 2,
    position: { x: -40, z: 45 },
    zones: [
      // 1F — heavy electrical
      { name: "전기실", x: -6, z: 0, w: 12, d: 16, color: "#2a1a1a", floor: 0 },
      // 2F — HVAC/compressors
      { name: "기계실", x: 8, z: 0, w: 10, d: 16, color: "#1a2a1a", floor: 1 },
    ],
    staircase: { position: { x: 12, z: -7 }, rotation: 0, width: 2.5, depth: 4 },
  },

  // --- 품질동 (Quality Lab) ---
  {
    id: "quality-lab",
    label: "품질동 (측정/분석/시료)",
    width: 35,
    depth: 25,
    wallHeight: 12,
    floorHeight: 6,
    floors: 2,
    position: { x: 50, z: 42.5 },
    zones: [
      // 1F — CMM and heavy measurement
      { name: "정밀측정실", x: -8, z: -4, w: 14, d: 14, color: "#2a1a3a", floor: 0 },
      // 2F — analysis and samples (lightweight)
      { name: "분석실", x: 8, z: -4, w: 12, d: 14, color: "#1a2a3a", floor: 1 },
      { name: "시료보관", x: 0, z: 8, w: 28, d: 6, color: "#1a1a2a", floor: 1 },
    ],
    storageRacks: [
      { x: -10, z: 9, rotation: 0 },
      { x: -4, z: 9, rotation: 0 },
      { x: 2, z: 9, rotation: 0 },
    ],
    staircase: { position: { x: 14, z: -9 }, rotation: 0, width: 2.5, depth: 4 },
  },
];

/** Covered walkways between buildings */
export const PATHWAYS: PathwayConfig[] = [
  {
    id: "path-main-warehouse",
    from: "main-factory",
    to: "warehouse",
    start: { x: -10, z: -30 },
    end: { x: 28, z: -32.5 },
    width: 4,
  },
  {
    id: "path-main-utility",
    from: "main-factory",
    to: "utility",
    start: { x: -40, z: -10 },
    end: { x: -40, z: 35 },
    width: 4,
  },
  {
    id: "path-utility-quality",
    from: "utility",
    to: "quality-lab",
    start: { x: -25, z: 45 },
    end: { x: 33, z: 42.5 },
    width: 4,
  },
];

/** Wall constants exported for geometry builders */
export const WALL_CONFIG = WALL_DEFAULTS;

/** Equipment status → color mapping (kept for backward compatibility) */
export const STATUS_COLORS: Record<string, string> = {
  running: "#00C48C",
  idle: "#B3B3BA",
  warning: "#FFA26B",
  error: "#DE4545",
  maintenance: "#4D7EFF",
};

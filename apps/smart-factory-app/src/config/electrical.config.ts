import type {
  TransformerConfig,
  DistributionPanelConfig,
  CableRouteConfig,
  ExternalPowerConfig,
  EmergencyGeneratorConfig,
} from "@/babylon/types";

/** Main transformer in utility building */
export const TRANSFORMER: TransformerConfig = {
  id: "TR-001",
  label: "주변압기 1000kVA",
  position: { x: -46, z: 45 },
  ratedKva: 1000,
};

/** Distribution panels hierarchy: MSB → DP → SP */
export const PANELS: DistributionPanelConfig[] = [
  // Main Switchboard (in utility building)
  {
    id: "MSB-001",
    label: "주배전반",
    type: "MSB",
    buildingId: "utility",
    position: { x: -44, z: 42 },
    parentId: null,
    ratedAmps: 1600,
  },
  // Building Distribution Panels
  {
    id: "DP-MAIN",
    label: "본관 분전반",
    type: "DP",
    buildingId: "main-factory",
    position: { x: -68, z: -28 },
    parentId: "MSB-001",
    ratedAmps: 800,
  },
  {
    id: "DP-WH",
    label: "물류동 분전반",
    type: "DP",
    buildingId: "warehouse",
    position: { x: 29, z: -48 },
    parentId: "MSB-001",
    ratedAmps: 400,
  },
  {
    id: "DP-UTIL",
    label: "유틸리티동 분전반",
    type: "DP",
    buildingId: "utility",
    position: { x: -38, z: 42 },
    parentId: "MSB-001",
    ratedAmps: 300,
  },
  {
    id: "DP-QL",
    label: "품질동 분전반",
    type: "DP",
    buildingId: "quality-lab",
    position: { x: 34, z: 32 },
    parentId: "MSB-001",
    ratedAmps: 300,
  },
  // Sub Panels (per zone)
  {
    id: "SP-MAIN-MACH",
    label: "본관 가공 구역",
    type: "SP",
    buildingId: "main-factory",
    position: { x: -55, z: -38 },
    parentId: "DP-MAIN",
    ratedAmps: 400,
  },
  {
    id: "SP-MAIN-ASSY",
    label: "본관 조립 구역",
    type: "SP",
    buildingId: "main-factory",
    position: { x: -28, z: -38 },
    parentId: "DP-MAIN",
    ratedAmps: 300,
  },
];

/** Cable routes connecting transformers and panels */
export const CABLE_ROUTES: CableRouteConfig[] = [
  // Transformer → MSB
  {
    id: "cable-TR-MSB",
    fromId: "TR-001",
    toId: "MSB-001",
    waypoints: [
      { x: -46, y: 0.3, z: 45 },
      { x: -44, y: 0.3, z: 45 },
      { x: -44, y: 0.3, z: 42 },
    ],
    voltage: "HV",
  },
  // MSB → DP-MAIN (to main factory)
  {
    id: "cable-MSB-MAIN",
    fromId: "MSB-001",
    toId: "DP-MAIN",
    waypoints: [
      { x: -44, y: 0.3, z: 42 },
      { x: -44, y: 5, z: 42 },
      { x: -44, y: 5, z: 0 },
      { x: -68, y: 5, z: 0 },
      { x: -68, y: 5, z: -28 },
      { x: -68, y: 0.3, z: -28 },
    ],
    voltage: "LV",
  },
  // MSB → DP-WH (to warehouse)
  {
    id: "cable-MSB-WH",
    fromId: "MSB-001",
    toId: "DP-WH",
    waypoints: [
      { x: -44, y: 0.3, z: 42 },
      { x: -44, y: 5, z: 42 },
      { x: 0, y: 5, z: 42 },
      { x: 0, y: 5, z: -48 },
      { x: 29, y: 5, z: -48 },
      { x: 29, y: 0.3, z: -48 },
    ],
    voltage: "LV",
  },
  // MSB → DP-UTIL (internal, short)
  {
    id: "cable-MSB-UTIL",
    fromId: "MSB-001",
    toId: "DP-UTIL",
    waypoints: [
      { x: -44, y: 0.3, z: 42 },
      { x: -38, y: 0.3, z: 42 },
    ],
    voltage: "LV",
  },
  // MSB → DP-QL (to quality lab)
  {
    id: "cable-MSB-QL",
    fromId: "MSB-001",
    toId: "DP-QL",
    waypoints: [
      { x: -44, y: 0.3, z: 42 },
      { x: -44, y: 5, z: 42 },
      { x: 0, y: 5, z: 42 },
      { x: 34, y: 5, z: 42 },
      { x: 34, y: 5, z: 32 },
      { x: 34, y: 0.3, z: 32 },
    ],
    voltage: "LV",
  },
  // DP-MAIN → SP sub-panels
  {
    id: "cable-MAIN-MACH",
    fromId: "DP-MAIN",
    toId: "SP-MAIN-MACH",
    waypoints: [
      { x: -68, y: 0.3, z: -28 },
      { x: -68, y: 3, z: -28 },
      { x: -55, y: 3, z: -28 },
      { x: -55, y: 3, z: -38 },
      { x: -55, y: 0.3, z: -38 },
    ],
    voltage: "LV",
  },
  {
    id: "cable-MAIN-ASSY",
    fromId: "DP-MAIN",
    toId: "SP-MAIN-ASSY",
    waypoints: [
      { x: -68, y: 0.3, z: -28 },
      { x: -68, y: 3, z: -28 },
      { x: -28, y: 3, z: -28 },
      { x: -28, y: 3, z: -38 },
      { x: -28, y: 0.3, z: -38 },
    ],
    voltage: "LV",
  },
];

/** External power source (KEPCO substation outside campus) */
export const EXTERNAL_POWER: ExternalPowerConfig = {
  id: "KEPCO-001",
  label: "한전 변전소",
  position: { x: -90, z: 60 },
  hvCableWaypoints: [
    { x: -90, y: 0.5, z: 60 },
    { x: -90, y: 8, z: 60 },
    { x: -70, y: 8, z: 55 },
    { x: -55, y: 8, z: 50 },
    { x: -46, y: 5, z: 47 },
    { x: -46, y: 0.5, z: 45 },
  ],
};

/** Emergency diesel generator (inside utility building) */
export const EMERGENCY_GENERATOR: EmergencyGeneratorConfig = {
  id: "GEN-001",
  label: "비상 디젤 발전기",
  buildingId: "utility",
  position: { x: -30, z: 50 },
  ratedKva: 500,
};

/** Cable downstream map: parent cable → child cables (for cascade disconnect) */
export const CABLE_DOWNSTREAM: Record<string, string[]> = {
  "cable-TR-MSB": ["cable-MSB-MAIN", "cable-MSB-WH", "cable-MSB-QL", "cable-MSB-UTIL"],
  "cable-MSB-MAIN": ["cable-MAIN-MACH", "cable-MAIN-ASSY"],
};

import type { EquipmentDefinition } from "@/babylon/types";

/** Initial equipment placement across campus buildings */
export const INITIAL_EQUIPMENT: EquipmentDefinition[] = [
  // ============================================================
  // 본관 (main-factory) — 가공/조립/검사/자재
  // ============================================================

  // --- 가공 구역 (Machining zone) ---
  {
    id: "cnc-01",
    type: "cnc",
    label: "CNC 선반 #1",
    position: { x: -22, z: -12 },
    status: "running",
    buildingId: "main-factory",
    ratedPowerKw: 15,
  },
  {
    id: "cnc-02",
    type: "cnc",
    label: "CNC 선반 #2",
    position: { x: -16, z: -12 },
    status: "running",
    buildingId: "main-factory",
    ratedPowerKw: 15,
  },
  {
    id: "cnc-03",
    type: "cnc",
    label: "CNC 밀링 #3",
    position: { x: -10, z: -12 },
    status: "warning",
    buildingId: "main-factory",
    ratedPowerKw: 18,
  },
  {
    id: "press-01",
    type: "press",
    label: "유압 프레스 #1",
    position: { x: -22, z: -4 },
    status: "running",
    buildingId: "main-factory",
    ratedPowerKw: 30,
  },
  {
    id: "press-02",
    type: "press",
    label: "유압 프레스 #2",
    position: { x: -16, z: -4 },
    status: "idle",
    buildingId: "main-factory",
    ratedPowerKw: 30,
  },

  // --- 조립 구역 (Assembly zone) ---
  {
    id: "robot-01",
    type: "robot-arm",
    label: "용접 로봇 #1",
    position: { x: 8, z: -12 },
    status: "running",
    buildingId: "main-factory",
    ratedPowerKw: 12,
  },
  {
    id: "robot-02",
    type: "robot-arm",
    label: "용접 로봇 #2",
    position: { x: 14, z: -12 },
    status: "error",
    buildingId: "main-factory",
    ratedPowerKw: 12,
  },
  {
    id: "assembly-01",
    type: "assembly",
    label: "조립대 #1",
    position: { x: 8, z: -4 },
    status: "running",
    buildingId: "main-factory",
    ratedPowerKw: 5,
  },
  {
    id: "assembly-02",
    type: "assembly",
    label: "조립대 #2",
    position: { x: 14, z: -4 },
    status: "maintenance",
    buildingId: "main-factory",
    ratedPowerKw: 5,
  },

  // --- 검사 구역 (Inspection zone — 2F) ---
  {
    id: "inspector-01",
    type: "inspector",
    label: "품질검사기 #1",
    position: { x: 10, z: 12 },
    status: "running",
    buildingId: "main-factory",
    ratedPowerKw: 8,
    floor: 1,
  },
  {
    id: "inspector-02",
    type: "inspector",
    label: "품질검사기 #2",
    position: { x: 16, z: 12 },
    status: "idle",
    buildingId: "main-factory",
    ratedPowerKw: 8,
    floor: 1,
  },

  // ============================================================
  // 물류동 (warehouse) — 입고/출고/적치
  // ============================================================
  {
    id: "robot-wh-01",
    type: "robot-arm",
    label: "입고 로봇 #1",
    position: { x: -12, z: -8 },
    status: "running",
    buildingId: "warehouse",
    ratedPowerKw: 10,
  },
  {
    id: "robot-wh-02",
    type: "robot-arm",
    label: "출고 로봇 #1",
    position: { x: 10, z: -8 },
    status: "running",
    buildingId: "warehouse",
    ratedPowerKw: 10,
  },
  {
    id: "conveyor-wh-01",
    type: "assembly",
    label: "물류 컨베이어 제어기",
    position: { x: 0, z: 8 },
    status: "running",
    buildingId: "warehouse",
    ratedPowerKw: 7,
    floor: 1,
  },

  // ============================================================
  // 유틸리티동 (utility) — 전기실/기계실
  // ============================================================
  {
    id: "hvac-01",
    type: "press",
    label: "공조 시스템 #1",
    position: { x: 8, z: 0 },
    status: "running",
    buildingId: "utility",
    ratedPowerKw: 45,
    floor: 1,
  },
  {
    id: "compressor-01",
    type: "press",
    label: "공기 압축기 #1",
    position: { x: 8, z: -6 },
    status: "running",
    buildingId: "utility",
    ratedPowerKw: 22,
  },

  // ============================================================
  // 품질동 (quality-lab) — 측정/분석/시료
  // ============================================================
  {
    id: "cmm-01",
    type: "inspector",
    label: "3차원 측정기 CMM",
    position: { x: -8, z: -4 },
    status: "running",
    buildingId: "quality-lab",
    ratedPowerKw: 6,
  },
  {
    id: "analyzer-01",
    type: "inspector",
    label: "성분 분석기",
    position: { x: 8, z: -4 },
    status: "running",
    buildingId: "quality-lab",
    ratedPowerKw: 4,
    floor: 1,
  },
  {
    id: "microscope-01",
    type: "inspector",
    label: "전자현미경",
    position: { x: 0, z: -4 },
    status: "idle",
    buildingId: "quality-lab",
    ratedPowerKw: 3,
    floor: 1,
  },
];

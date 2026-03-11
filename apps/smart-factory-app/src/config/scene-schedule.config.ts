import type { BuildingId } from "@/babylon/types";

// --- Scene Schedule Types ---

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface SceneSchedule {
  type: "time-range" | "always";
  days?: DayOfWeek[];
  startHour?: number;
  endHour?: number;
}

export interface SceneDefinition {
  id: string;
  label: string;
  buildingId: BuildingId;
  panelIds: string[];
  schedule: SceneSchedule;
  expectedPower: {
    maxKw: number;
    allowedEquipment: string[];
    description: string;
  };
  anomalyThreshold: number;
  cctvIds: string[];
  priority: "low" | "medium" | "high";
}

// --- Weekday/Weekend helpers ---

const WEEKDAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri"];
const WEEKEND: DayOfWeek[] = ["sat", "sun"];

// --- Scene Definitions ---

export const SCENE_DEFINITIONS: SceneDefinition[] = [
  // 본관 (Main Factory)
  {
    id: "main-offhours",
    label: "본관 퇴근",
    buildingId: "main-factory",
    panelIds: ["DP-MAIN", "SP-MAIN-MACH", "SP-MAIN-ASSY"],
    schedule: { type: "time-range", days: WEEKDAYS, startHour: 18, endHour: 8 },
    expectedPower: {
      maxKw: 25,
      allowedEquipment: [],
      description: "조명 OFF, 장비 대기 전력만",
    },
    anomalyThreshold: 1.5,
    cctvIds: ["CAM-MAIN-01", "CAM-MAIN-02"],
    priority: "high",
  },
  {
    id: "main-weekend",
    label: "본관 주말",
    buildingId: "main-factory",
    panelIds: ["DP-MAIN", "SP-MAIN-MACH", "SP-MAIN-ASSY"],
    schedule: { type: "time-range", days: WEEKEND, startHour: 0, endHour: 24 },
    expectedPower: {
      maxKw: 10,
      allowedEquipment: [],
      description: "전체 OFF, 최소 대기 전력",
    },
    anomalyThreshold: 1.5,
    cctvIds: ["CAM-MAIN-01", "CAM-MAIN-02"],
    priority: "high",
  },
  {
    id: "main-lunch",
    label: "본관 점심",
    buildingId: "main-factory",
    panelIds: ["DP-MAIN", "SP-MAIN-MACH", "SP-MAIN-ASSY"],
    schedule: { type: "time-range", days: WEEKDAYS, startHour: 12, endHour: 13 },
    expectedPower: {
      maxKw: 80,
      allowedEquipment: ["CNC-001", "CNC-002"],
      description: "일부 장비 아이들, 조명 유지",
    },
    anomalyThreshold: 1.3,
    cctvIds: ["CAM-MAIN-01"],
    priority: "low",
  },

  // 물류동 (Warehouse)
  {
    id: "warehouse-offhours",
    label: "물류동 퇴근",
    buildingId: "warehouse",
    panelIds: ["DP-WH"],
    schedule: { type: "time-range", days: WEEKDAYS, startHour: 18, endHour: 8 },
    expectedPower: {
      maxKw: 10,
      allowedEquipment: [],
      description: "컨베이어 정지, 조명 OFF",
    },
    anomalyThreshold: 1.5,
    cctvIds: ["CAM-WH-01"],
    priority: "medium",
  },

  // 품질동 (Quality Lab)
  {
    id: "quality-offhours",
    label: "품질동 퇴근",
    buildingId: "quality-lab",
    panelIds: ["DP-QL"],
    schedule: { type: "time-range", days: WEEKDAYS, startHour: 18, endHour: 8 },
    expectedPower: {
      maxKw: 8,
      allowedEquipment: [],
      description: "측정 장비 OFF, 항온항습 유지",
    },
    anomalyThreshold: 1.5,
    cctvIds: ["CAM-MAIN-01"],
    priority: "high",
  },
  {
    id: "quality-weekend",
    label: "품질동 주말",
    buildingId: "quality-lab",
    panelIds: ["DP-QL"],
    schedule: { type: "time-range", days: WEEKEND, startHour: 0, endHour: 24 },
    expectedPower: {
      maxKw: 5,
      allowedEquipment: [],
      description: "전체 OFF, 항온항습만",
    },
    anomalyThreshold: 1.5,
    cctvIds: ["CAM-MAIN-01"],
    priority: "medium",
  },

  // 유틸리티동 (Utility) — 항상 모니터링
  {
    id: "utility-always",
    label: "유틸리티동 상시",
    buildingId: "utility",
    panelIds: ["DP-UTIL"],
    schedule: { type: "always" },
    expectedPower: {
      maxKw: 60,
      allowedEquipment: ["HVAC-001", "COMP-001"],
      description: "HVAC, 공기압축기 상시 가동",
    },
    anomalyThreshold: 1.3,
    cctvIds: ["CAM-UTIL-01"],
    priority: "low",
  },
];

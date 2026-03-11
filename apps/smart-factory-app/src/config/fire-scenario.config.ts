import type { BuildingId } from "@/babylon/types";

export interface FireZone {
  buildingId: BuildingId;
  zoneIndex: number;
  label: string;
}

export interface FireScenarioConfig {
  /** Where the fire starts */
  origin: FireZone;
  /** Ordered spread sequence with cumulative delay from T+0 */
  spreadSequence: (FireZone & { delayMs: number })[];
  /** Delay before evacuation begins (from T+0) */
  evacuationDelayMs: number;
  /** Delay before building alarm pulse starts (from T+0) */
  alarmDelayMs: number;
  /** Delay before alert view mode activates (from T+0) */
  alertViewDelayMs: number;
}

export const FIRE_SCENARIO: FireScenarioConfig = {
  origin: {
    buildingId: "utility",
    zoneIndex: 0,
    label: "유틸리티동 전기실 (1F)",
  },
  spreadSequence: [
    {
      buildingId: "utility",
      zoneIndex: 1,
      delayMs: 8000,
      label: "유틸리티동 기계실 (2F)",
    },
  ],
  evacuationDelayMs: 5000,
  alarmDelayMs: 2000,
  alertViewDelayMs: 3000,
};

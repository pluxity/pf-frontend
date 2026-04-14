import type { StompEventType } from "./events.types";

/** 안전 모니터링 항목 키 */
export type SafetyMonitoringKey =
  | "NO_HELMET"
  | "INTRUSION"
  | "FALLEN_PERSON"
  | "SOS_EMERGENCY"
  | "WORKER_ANOMALY"
  | "WORKER_ATTENDANCE";

/** 안전 모니터링 항목 */
export interface SafetyItem {
  key: SafetyMonitoringKey;
  name: string;
  count: number;
}

/** 항목 정의 (표시 순서대로) */
export const SAFETY_MONITORING_ITEMS: { key: SafetyMonitoringKey; name: string }[] = [
  { key: "NO_HELMET", name: "안전모 미착용" },
  { key: "INTRUSION", name: "위험구역진입" },
  { key: "FALLEN_PERSON", name: "쓰러짐감지" },
  { key: "SOS_EMERGENCY", name: "SOS 긴급호출" },
  { key: "WORKER_ANOMALY", name: "이상징후 감지" },
  { key: "WORKER_ATTENDANCE", name: "근로자 출근" },
];

/** Event API type → SafetyMonitoringKey 매핑 */
export const EVENT_TYPE_TO_SAFETY_KEY: Partial<Record<StompEventType, SafetyMonitoringKey>> = {
  NO_HELMET: "NO_HELMET",
  INTRUSION: "INTRUSION",
  FALLEN_PERSON: "FALLEN_PERSON",
};

/** 항목별 기본값 */
const DEFAULT_COUNTS: Partial<Record<SafetyMonitoringKey, number>> = {
  WORKER_ATTENDANCE: 100,
};

/** 기본 안전 모니터링 데이터 */
export function createDefaultSafetyData(): SafetyItem[] {
  return SAFETY_MONITORING_ITEMS.map((item) => ({
    key: item.key,
    name: item.name,
    count: DEFAULT_COUNTS[item.key] ?? 0,
  }));
}

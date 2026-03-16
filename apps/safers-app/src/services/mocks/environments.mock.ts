import type { Environment } from "../types/environments.types";

/**
 * 천안 일봉공원 2BL (ID 9)
 * - 미세먼지(PM10) 나쁨 (120µg/m³)
 * - 초미세먼지(PM2.5) 주의 (28µg/m³)
 */
const CHEONAN_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 28,
    unit: "µg/m³",
    status: "주의",
    fill: "#FDC200",
    percentage: 28,
  },
  {
    name: "미세먼지(PM10)",
    value: 120,
    unit: "µg/m³",
    status: "나쁨",
    fill: "#F86700",
    percentage: 80,
  },
  {
    name: "일산화탄소",
    value: 5,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 17,
  },
  {
    name: "총휘발성유기화합물",
    value: 320,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 27,
  },
  {
    name: "소음",
    value: 62,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 52,
  },
];

/**
 * 광주중앙공원 (ID 10)
 * - 소음 약간 높음 (68dB), CO 약간 (5ppm)
 */
const GWANGJU_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 8,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 8,
  },
  {
    name: "미세먼지(PM10)",
    value: 22,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 15,
  },
  {
    name: "일산화탄소",
    value: 5,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 17,
  },
  {
    name: "총휘발성유기화합물",
    value: 240,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 20,
  },
  {
    name: "소음",
    value: 68,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 57,
  },
];

/**
 * 인천연희공원 (ID 11)
 * - PM2.5 약간 (15µg/m³), VOC 약간 (350µg/m³)
 */
const INCHEON_YEONHUI_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 15,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 15,
  },
  {
    name: "미세먼지(PM10)",
    value: 30,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 20,
  },
  {
    name: "일산화탄소",
    value: 3,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 10,
  },
  {
    name: "총휘발성유기화합물",
    value: 350,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 29,
  },
  {
    name: "소음",
    value: 52,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 43,
  },
];

/**
 * 안동옥송 상록공원 (ID 12)
 * - 소음 초과 (92dB → 나쁨)
 * - 총휘발성유기화합물 주의 (620µg/m³)
 */
const ANDONG_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 12,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 12,
  },
  {
    name: "미세먼지(PM10)",
    value: 28,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 19,
  },
  {
    name: "일산화탄소",
    value: 6,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 20,
  },
  {
    name: "총휘발성유기화합물",
    value: 620,
    unit: "µg/m³",
    status: "주의",
    fill: "#FDC200",
    percentage: 52,
  },
  {
    name: "소음",
    value: 92,
    unit: "dB",
    status: "나쁨",
    fill: "#F86700",
    percentage: 77,
  },
];

/**
 * 인천검단3차 (ID 13)
 * - PM10 약간 (35µg/m³), 소음 (62dB)
 */
const INCHEON_GEOMDAN_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 11,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 11,
  },
  {
    name: "미세먼지(PM10)",
    value: 35,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 23,
  },
  {
    name: "일산화탄소",
    value: 4,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 13,
  },
  {
    name: "총휘발성유기화합물",
    value: 290,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 24,
  },
  {
    name: "소음",
    value: 62,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 52,
  },
];

/**
 * 제주위파크2단지 (ID 14)
 * - 전체 양호, 수치 고유
 */
const JEJU_2_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 7,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 7,
  },
  {
    name: "미세먼지(PM10)",
    value: 18,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 12,
  },
  {
    name: "일산화탄소",
    value: 2,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 7,
  },
  {
    name: "총휘발성유기화합물",
    value: 200,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 17,
  },
  {
    name: "소음",
    value: 48,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 40,
  },
];

/**
 * 제주위파크1단지 (ID 15)
 * - 전체 양호, 수치 고유
 */
const JEJU_1_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 9,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 9,
  },
  {
    name: "미세먼지(PM10)",
    value: 21,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 14,
  },
  {
    name: "일산화탄소",
    value: 3,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 10,
  },
  {
    name: "총휘발성유기화합물",
    value: 260,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 22,
  },
  {
    name: "소음",
    value: 55,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 46,
  },
];

/**
 * 당진 해저케이블 (ID 16)
 * - CO 약간 (6ppm), PM10 (32µg/m³)
 */
const DANGJIN_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 13,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 13,
  },
  {
    name: "미세먼지(PM10)",
    value: 32,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 21,
  },
  {
    name: "일산화탄소",
    value: 6,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 20,
  },
  {
    name: "총휘발성유기화합물",
    value: 300,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 25,
  },
  {
    name: "소음",
    value: 60,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 50,
  },
];

/**
 * 김포 풍무B5 (ID 17)
 * - VOC 약간 (310µg/m³), 소음 (55dB)
 */
const GIMPO_ENVIRONMENTS: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 10,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 10,
  },
  {
    name: "미세먼지(PM10)",
    value: 26,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 17,
  },
  {
    name: "일산화탄소",
    value: 4,
    unit: "ppm",
    status: "양호",
    fill: "#11C208",
    percentage: 13,
  },
  {
    name: "총휘발성유기화합물",
    value: 310,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 26,
  },
  {
    name: "소음",
    value: 55,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 46,
  },
];

/** 현장별 환경 데이터 맵 */
const SITE_ENVIRONMENTS: Record<number, Environment[]> = {
  9: CHEONAN_ENVIRONMENTS,
  10: GWANGJU_ENVIRONMENTS,
  11: INCHEON_YEONHUI_ENVIRONMENTS,
  12: ANDONG_ENVIRONMENTS,
  13: INCHEON_GEOMDAN_ENVIRONMENTS,
  14: JEJU_2_ENVIRONMENTS,
  15: JEJU_1_ENVIRONMENTS,
  16: DANGJIN_ENVIRONMENTS,
  17: GIMPO_ENVIRONMENTS,
};

/** siteId 기반 환경 데이터 반환 (기본: 김포 풍무B5) */
export function generateEnvironments(siteId: number): Environment[] {
  return SITE_ENVIRONMENTS[siteId] ?? GIMPO_ENVIRONMENTS;
}

/** 하위호환 */
export const mockEnvironments: Environment[] = GIMPO_ENVIRONMENTS;

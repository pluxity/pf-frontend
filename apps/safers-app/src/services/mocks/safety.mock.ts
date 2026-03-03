import type { SafetyItem } from "../types/safety.types";

/** 천안 일봉공원 2BL (ID 9) — 안전모 착용 낮음 */
const CHEONAN_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 72 },
  { name: "위험구역진입", value: 10 },
  { name: "쓰러짐감지", value: 5 },
  { name: "장비추돌", value: 12 },
  { name: "개구부열림", value: 8 },
  { name: "작업자출근", value: 85 },
  { name: "기타", value: 20 },
];

/** 광주중앙공원 (ID 10) — 안전모 95%, 위험구역 5% */
const GWANGJU_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 95 },
  { name: "위험구역진입", value: 5 },
  { name: "쓰러짐감지", value: 1 },
  { name: "장비추돌", value: 4 },
  { name: "개구부열림", value: 3 },
  { name: "작업자출근", value: 90 },
  { name: "기타", value: 7 },
];

/** 인천연희공원 (ID 11) — 안전모 97%, 개구부 7% */
const INCHEON_YEONHUI_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 97 },
  { name: "위험구역진입", value: 3 },
  { name: "쓰러짐감지", value: 0 },
  { name: "장비추돌", value: 2 },
  { name: "개구부열림", value: 7 },
  { name: "작업자출근", value: 94 },
  { name: "기타", value: 5 },
];

/** 안동옥송 상록공원 (ID 12) — 위험구역 진입 높음 */
const ANDONG_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 94 },
  { name: "위험구역진입", value: 35 },
  { name: "쓰러짐감지", value: 3 },
  { name: "장비추돌", value: 8 },
  { name: "개구부열림", value: 12 },
  { name: "작업자출근", value: 88 },
  { name: "기타", value: 15 },
];

/** 인천검단3차 (ID 13) — 안전모 96%, 장비추돌 6% */
const INCHEON_GEOMDAN_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 96 },
  { name: "위험구역진입", value: 4 },
  { name: "쓰러짐감지", value: 1 },
  { name: "장비추돌", value: 6 },
  { name: "개구부열림", value: 4 },
  { name: "작업자출근", value: 91 },
  { name: "기타", value: 9 },
];

/** 제주위파크2단지 (ID 14) — 안전모 99%, 쓰러짐 1% */
const JEJU_2_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 99 },
  { name: "위험구역진입", value: 1 },
  { name: "쓰러짐감지", value: 1 },
  { name: "장비추돌", value: 2 },
  { name: "개구부열림", value: 2 },
  { name: "작업자출근", value: 95 },
  { name: "기타", value: 3 },
];

/** 제주위파크1단지 (ID 15) — 안전모 97%, 개구부 4% */
const JEJU_1_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 97 },
  { name: "위험구역진입", value: 2 },
  { name: "쓰러짐감지", value: 0 },
  { name: "장비추돌", value: 3 },
  { name: "개구부열림", value: 4 },
  { name: "작업자출근", value: 93 },
  { name: "기타", value: 6 },
];

/** 당진 해저케이블 (ID 16) — 안전모 96%, 장비추돌 5% */
const DANGJIN_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 96 },
  { name: "위험구역진입", value: 3 },
  { name: "쓰러짐감지", value: 2 },
  { name: "장비추돌", value: 5 },
  { name: "개구부열림", value: 6 },
  { name: "작업자출근", value: 89 },
  { name: "기타", value: 10 },
];

/** 김포 풍무B5 (ID 17) — 안전모 98%, 위험구역 3% */
const GIMPO_SAFETY: SafetyItem[] = [
  { name: "안전모 착용", value: 98 },
  { name: "위험구역진입", value: 3 },
  { name: "쓰러짐감지", value: 0 },
  { name: "장비추돌", value: 3 },
  { name: "개구부열림", value: 5 },
  { name: "작업자출근", value: 96 },
  { name: "기타", value: 4 },
];

/** 현장별 안전 데이터 맵 */
const SITE_SAFETY: Record<number, SafetyItem[]> = {
  9: CHEONAN_SAFETY,
  10: GWANGJU_SAFETY,
  11: INCHEON_YEONHUI_SAFETY,
  12: ANDONG_SAFETY,
  13: INCHEON_GEOMDAN_SAFETY,
  14: JEJU_2_SAFETY,
  15: JEJU_1_SAFETY,
  16: DANGJIN_SAFETY,
  17: GIMPO_SAFETY,
};

/** siteId 기반 안전 데이터 반환 (기본: 김포 풍무B5) */
export function generateSafetyData(siteId: number): SafetyItem[] {
  return SITE_SAFETY[siteId] ?? GIMPO_SAFETY;
}

export const SAFETY_MOCK_DATA: SafetyItem[] = GIMPO_SAFETY;

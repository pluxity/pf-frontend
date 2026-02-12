// 안전율 상태
export type SafetyStatus = "safe" | "warning" | "danger";

// 안전율 카테고리 항목
export interface SafetyCategory {
  id: string;
  name: string;
  current: number; // 발생 건수
  total: number; // 전체 점검 건수
  status: SafetyStatus;
}

// 안전율 데이터
export interface SafetyScoreData {
  score: number; // 0~100 안전 점수
  categories: SafetyCategory[];
}

// 기성률 데이터 포인트
export interface ProgressDataPoint {
  label: string; // x축 라벨 (예: "1일", "1주차", "1월")
  plan: number; // 계획 기성률 (%)
  actual: number; // 실적 기성률 (%)
}

// 기성률 기간 탭
export type ProgressPeriod = "daily" | "weekly" | "monthly";

// 직종별 인원 현황
export interface PersonnelByOccupation {
  occupation: string; // 직종명
  count: number; // 인원 수
  color: string; // 차트 색상
}

// 현장 상세 데이터 (weather 제거 - 별도 Weather API 사용)
export interface SiteDetail {
  safetyScore: SafetyScoreData;
  progress: Record<ProgressPeriod, ProgressDataPoint[]>;
  personnel: PersonnelByOccupation[];
  totalPersonnel: number;
}

// API 응답
export interface SiteDetailResponse {
  data: SiteDetail;
}

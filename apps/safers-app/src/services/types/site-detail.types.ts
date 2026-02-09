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

// 날씨 정보
export interface SiteWeather {
  temperature: number; // 현재 기온 (°C)
  condition: string; // 날씨 상태 (맑음, 흐림 등)
  humidity: number; // 습도 (%)
  windSpeed: number; // 풍속 (m/s)
}

// 현장 상세 데이터
export interface SiteDetail {
  progress: Record<ProgressPeriod, ProgressDataPoint[]>;
  personnel: PersonnelByOccupation[];
  totalPersonnel: number;
  weather: SiteWeather;
}

// API 응답
export interface SiteDetailResponse {
  data: SiteDetail;
}

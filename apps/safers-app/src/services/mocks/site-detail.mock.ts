import type {
  ProgressDataPoint,
  PersonnelByOccupation,
  SiteWeather,
  SiteDetail,
  ProgressPeriod,
  SafetyScoreData,
} from "../types/site-detail.types";

/** 안전율 데이터 */
const mockSafetyScore: SafetyScoreData = {
  score: 95,
  categories: [
    { id: "1", name: "공정 안전 점검", current: 5, total: 155, status: "safe" },
    { id: "2", name: "안전 시설 관리", current: 2, total: 35, status: "safe" },
    { id: "3", name: "위험 작업 관리", current: 3, total: 155, status: "danger" },
    { id: "4", name: "안전 교육 이수", current: 5, total: 23, status: "safe" },
    { id: "5", name: "화재 예방 점검", current: 5, total: 12, status: "warning" },
  ],
};

/** 기성률 일간 데이터 (최근 7일) */
const dailyProgress: ProgressDataPoint[] = [
  { label: "1일", plan: 12, actual: 11 },
  { label: "2일", plan: 18, actual: 17 },
  { label: "3일", plan: 25, actual: 23 },
  { label: "4일", plan: 32, actual: 30 },
  { label: "5일", plan: 40, actual: 36 },
  { label: "6일", plan: 47, actual: 44 },
  { label: "7일", plan: 55, actual: 50 },
];

/** 기성률 주간 데이터 (최근 8주) */
const weeklyProgress: ProgressDataPoint[] = [
  { label: "1주", plan: 8, actual: 7 },
  { label: "2주", plan: 16, actual: 14 },
  { label: "3주", plan: 24, actual: 22 },
  { label: "4주", plan: 33, actual: 30 },
  { label: "5주", plan: 42, actual: 38 },
  { label: "6주", plan: 52, actual: 47 },
  { label: "7주", plan: 62, actual: 56 },
  { label: "8주", plan: 72, actual: 65 },
];

/** 기성률 월간 데이터 (최근 6개월) */
const monthlyProgress: ProgressDataPoint[] = [
  { label: "1월", plan: 10, actual: 9 },
  { label: "2월", plan: 22, actual: 20 },
  { label: "3월", plan: 36, actual: 33 },
  { label: "4월", plan: 52, actual: 48 },
  { label: "5월", plan: 68, actual: 62 },
  { label: "6월", plan: 85, actual: 78 },
];

/** 직종별 인원 현황 */
const mockPersonnel: PersonnelByOccupation[] = [
  { occupation: "철근공", count: 85, color: "#5E81F4" },
  { occupation: "안전관리자", count: 48, color: "#9F31FF" },
  { occupation: "콘크리트공", count: 62, color: "#8AF1B9" },
  { occupation: "형틀목공", count: 38, color: "#FF808B" },
  { occupation: "기타", count: 17, color: "#BBBFCF" },
];

/** 날씨 정보 */
const mockWeather: SiteWeather = {
  temperature: 24,
  condition: "맑음",
  humidity: 55,
  windSpeed: 3.2,
};

/** 기성률 데이터 맵 */
const progressMap: Record<ProgressPeriod, ProgressDataPoint[]> = {
  daily: dailyProgress,
  weekly: weeklyProgress,
  monthly: monthlyProgress,
};

/** 전체 현장 상세 mock 데이터 */
export const mockSiteDetail: SiteDetail = {
  safetyScore: mockSafetyScore,
  progress: progressMap,
  personnel: mockPersonnel,
  totalPersonnel: mockPersonnel.reduce((sum, p) => sum + p.count, 0),
  weather: mockWeather,
};

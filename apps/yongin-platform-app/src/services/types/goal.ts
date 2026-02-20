export type { PageResponse } from "@/types";

// API 응답 타입
export interface ConstructionSection {
  id: number;
  name: string;
}

export interface GoalResponse {
  id: number;
  inputDate: string;
  constructionSection: ConstructionSection;
  progressRate: number;
  constructionRate: number;
  totalQuantity: number;
  cumulativeQuantity: number;
  previousCumulativeQuantity: number;
  targetQuantity: number;
  workQuantity: number;
  startDate: string;
  completionDate: string;
  plannedWorkDays: number;
  delayDays: number;
}

// 앱에서 사용할 타입
export interface GoalData {
  id: number;
  inputDate: string;
  constructionSectionId: number;
  constructionSectionName: string;
  totalQuantity: number;
  cumulativeQuantity: number;
  previousCumulativeQuantity: number;
  targetQuantity: number;
  workQuantity: number;
  constructionRate: number;
  progressRate: number;
  startDate: string;
  plannedWorkDays: number;
  completionDate: string;
  delayDays: number;
}

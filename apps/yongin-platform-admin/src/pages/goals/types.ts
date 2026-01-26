// API 응답 타입
export interface ConstructionSection {
  id: number;
  name: string;
}

export interface ConstructionSectionRequest {
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

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

// API 요청 타입
export interface GoalRequest {
  id?: number;
  inputDate: string;
  constructionSectionId: number;
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

export interface GoalBulkRequest {
  upserts: GoalRequest[];
  deletedIds: number[];
}

// 그리드용 내부 타입
export interface GoalData {
  id: number | null; // null이면 신규
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
  isNew?: boolean;
}

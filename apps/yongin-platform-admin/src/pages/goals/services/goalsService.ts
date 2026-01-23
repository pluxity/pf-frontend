import { getApiClient, type DataResponse } from "@pf-dev/api";
import type {
  GoalResponse,
  GoalData,
  PageResponse,
  ConstructionSection,
  GoalBulkRequest,
  ConstructionSectionRequest,
} from "../types";

// API 응답을 그리드 데이터로 변환
function toGridData(response: GoalResponse): GoalData {
  return {
    id: response.id,
    inputDate: response.inputDate,
    constructionSectionId: response.constructionSection.id,
    constructionSectionName: response.constructionSection.name,
    totalQuantity: response.totalQuantity,
    cumulativeQuantity: response.cumulativeQuantity,
    previousCumulativeQuantity: response.previousCumulativeQuantity,
    targetQuantity: response.targetQuantity,
    workQuantity: response.workQuantity,
    constructionRate: response.constructionRate,
    progressRate: response.progressRate,
    startDate: response.startDate,
    plannedWorkDays: response.plannedWorkDays,
    completionDate: response.completionDate,
    delayDays: response.delayDays,
  };
}

// 목표관리 전체 조회
export async function getGoalList(
  page?: number,
  size?: number
): Promise<{ data: GoalData[]; totalElements: number }> {
  const response = await getApiClient().get<DataResponse<PageResponse<GoalResponse>>>("/goals", {
    params: { page, size },
  });
  return {
    data: response.data.content.map(toGridData),
    totalElements: response.data.totalElements,
  };
}

// 최근 목표관리 조회
export async function getLatestGoals(): Promise<GoalData[]> {
  const response = await getApiClient().get<DataResponse<GoalResponse[]>>("/goals/latest");
  return response.data.map(toGridData);
}

// 시공구간 전체 조회
export async function getConstructionSections(): Promise<ConstructionSection[]> {
  const response = await getApiClient().get<DataResponse<ConstructionSection[]>>(
    "/goals/construction-sections"
  );
  return response.data;
}

// 시공구간 등록
export async function createConstructionSection(name: string): Promise<void> {
  await getApiClient().post<void>("/goals/construction-sections", {
    name,
  } as ConstructionSectionRequest);
}

// 시공구간 삭제
export async function deleteConstructionSection(id: number): Promise<void> {
  await getApiClient().delete<void>(`/goals/construction-sections/${id}`);
}

// 목표관리 일괄 저장/수정/삭제
export async function saveGoals(request: GoalBulkRequest): Promise<void> {
  await getApiClient().put<void>("/goals", request);
}

import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { GoalResponse, GoalData, PageResponse } from "./types/goal";

// API 응답을 앱 데이터로 변환
function toGoalData(response: GoalResponse): GoalData {
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

export const goalService = {
  // 목표관리 전체 조회
  getGoals: async (): Promise<GoalData[]> => {
    const response = await getApiClient().get<DataResponse<PageResponse<GoalResponse>>>("/goals");
    return response.data.content.map(toGoalData);
  },
};

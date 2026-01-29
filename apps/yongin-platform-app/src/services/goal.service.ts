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
  getAll: async (): Promise<GoalData[]> => {
    const response = await getApiClient().get<DataResponse<PageResponse<GoalResponse>>>("/goals");
    return response.data.content.map(toGoalData);
  },
};

// 목표 계산 유틸리티 함수
export function calculateGoal(goal: GoalData): GoalData {
  const toUtcDate = (dateString: string) => {
    if (!dateString) return new Date(0);
    const parts = dateString.split("-").map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    if (!year || !month || !day) return new Date(0);

    return new Date(Date.UTC(year, month - 1, day));
  };

  const startDate = toUtcDate(goal.startDate);
  const completionDate = toUtcDate(goal.completionDate);
  const currentDate = toUtcDate(goal.inputDate);

  // 누계량(전일 누계량 + 금일작업량)
  const cumulativeQuantity = goal.previousCumulativeQuantity + goal.workQuantity;

  // 진행률 (누계량 / 전체량)
  const progressRate = goal.totalQuantity > 0 ? (cumulativeQuantity / goal.totalQuantity) * 100 : 0;

  // 계획작업일 (준공일 - 착공일)
  const plannedWorkDays = Math.floor(
    (completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 목표량 (전체량 / 계획작업일)
  const targetQuantity = plannedWorkDays > 0 ? Math.round(goal.totalQuantity / plannedWorkDays) : 0;

  // 공정률 (작업량 / 목표량)
  const constructionRate = targetQuantity > 0 ? (goal.workQuantity / targetQuantity) * 100 : 0;

  // 지연일 (roundup{목표량*(일자-착공일)-누계량}/목표량)
  const elapsedDays = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const delayDays =
    targetQuantity > 0
      ? Math.ceil((targetQuantity * elapsedDays - cumulativeQuantity) / targetQuantity)
      : 0;

  return {
    ...goal,
    progressRate: Math.round(Math.min(progressRate, 100)),
    cumulativeQuantity,
    targetQuantity,
    constructionRate: Math.round(constructionRate),
    plannedWorkDays,
    delayDays,
  };
}

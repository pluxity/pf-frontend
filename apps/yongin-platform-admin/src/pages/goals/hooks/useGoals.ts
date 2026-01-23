import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { GoalData, ConstructionSection, GoalBulkRequest } from "../types";
import {
  getGoalList,
  saveGoals,
  getConstructionSections,
  createConstructionSection,
  deleteConstructionSection,
} from "../services";

const API_PATH = {
  GOALS: "/goals",
  CONSTRUCTION_SECTIONS: "/goals/construction-sections",
} as const;

export function useGoals() {
  // 목표관리 목록
  const {
    data: goalsData,
    error: dataError,
    isLoading: isLoadingData,
    mutate: refreshData,
  } = useSWR(API_PATH.GOALS, () => getGoalList(), {
    revalidateOnFocus: false,
  });

  // 시공구간 목록
  const {
    data: constructionSections = [],
    error: constructionSectionsError,
    isLoading: isLoadingConstructionSections,
  } = useSWR(API_PATH.CONSTRUCTION_SECTIONS, getConstructionSections, {
    revalidateOnFocus: false,
  });

  // 목표관리 저장
  const { trigger: save, isMutating: isSaving } = useSWRMutation(
    API_PATH.GOALS,
    (_key, { arg }: { arg: GoalBulkRequest }) => saveGoals(arg)
  );

  // 시공구간 추가
  const { trigger: addConstructionSection } = useSWRMutation(
    API_PATH.CONSTRUCTION_SECTIONS,
    (_key, { arg }: { arg: string }) => createConstructionSection(arg)
  );

  // 시공구간 삭제
  const { trigger: removeConstructionSection } = useSWRMutation(
    API_PATH.CONSTRUCTION_SECTIONS,
    (_key, { arg }: { arg: number }) => deleteConstructionSection(arg)
  );

  return {
    // 데이터
    data: goalsData?.data ?? [],
    totalElements: goalsData?.totalElements ?? 0,
    constructionSections: constructionSections as ConstructionSection[],

    // 상태
    isLoading: isLoadingData || isLoadingConstructionSections,
    isError: !!dataError || !!constructionSectionsError,
    error: dataError || constructionSectionsError,
    isSaving,

    // 액션
    save,
    refreshData,
    addConstructionSection,
    removeConstructionSection,
  };
}

export const CalculateGoal = (goal: GoalData): GoalData => {
  const startDate = new Date(goal.startDate);
  const completionDate = new Date(goal.completionDate);
  const currentDate = new Date(goal.inputDate);

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
};

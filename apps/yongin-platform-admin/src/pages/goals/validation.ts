/**
 * 목표관리 Validation
 */
import { validators, collectErrors, type ValidationError } from "@/utils";
import type { GoalData } from "./types";

/**
 * 목표관리 행 유효성 검사
 * - 시공구간: 10글자 미만
 * - 작업량: 전체량보다 클 수 없음
 * - 준공일: 착공일보다 빠를 수 없음
 */
export function validateGoal(row: GoalData): ValidationError[] {
  return collectErrors(
    validators.maxLength(row.constructionSectionName, 10, "시공구간"),
    validators.lessThanOrEqual(row.workQuantity, row.totalQuantity, "작업량", "전체량"),
    validators.dateRange(row.startDate, row.completionDate, "착공일", "준공일")
  );
}

/**
 * 단일 행 유효성 검사 결과 반환
 */
export function isValidGoal(row: GoalData): boolean {
  return validateGoal(row).length === 0;
}

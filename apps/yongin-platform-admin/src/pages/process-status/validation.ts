/**
 * 공정관리 Validation
 */
import { validators, collectErrors, type ValidationError } from "@/utils";
import type { ProcessStatusData } from "./types";

/**
 * 공정관리 행 유효성 검사
 * - 공정명: 10글자 미만
 * - 목표율: 100% 이하
 * - 공정률: 100% 이하
 */
export function validateProcessStatus(row: ProcessStatusData): ValidationError[] {
  return collectErrors(
    validators.maxLength(row.workTypeName, 10, "공정명"),
    validators.max(row.plannedRate, 100, "목표율"),
    validators.max(row.actualRate, 100, "공정률")
  );
}

/**
 * 단일 행 유효성 검사 결과 반환
 */
export function isValidProcessStatus(row: ProcessStatusData): boolean {
  return validateProcessStatus(row).length === 0;
}

/**
 * 작업일 + 공정명 중복 검사
 * 동일한 workDate + workTypeId 조합이 이미 존재하면 에러 반환
 */
export function checkDuplicate(
  allRows: ProcessStatusData[],
  currentRow: ProcessStatusData
): ValidationError | null {
  const duplicate = allRows.find(
    (row) =>
      row.id !== currentRow.id &&
      row.workDate === currentRow.workDate &&
      row.workTypeId === currentRow.workTypeId
  );
  if (duplicate) {
    return {
      field: "workTypeId",
      message: `동일 작업일(${currentRow.workDate})에 "${currentRow.workTypeName}" 공정이 이미 존재합니다.`,
    };
  }
  return null;
}

/** "전체" 공종 이름 상수 */
export const OVERALL_WORK_TYPE_NAME = "전체";

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

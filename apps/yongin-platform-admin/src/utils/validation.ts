/**
 * 공통 Validation 유틸리티
 */

/** Validation 에러 */
export interface ValidationError {
  field: string;
  message: string;
}

/** Validation 결과 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 공통 Validator 헬퍼 함수들
 */
export const validators = {
  /** 필수값 체크 */
  required: (value: unknown, fieldName: string): ValidationError | null => {
    if (value === null || value === undefined || value === "") {
      return { field: fieldName, message: `${fieldName}은(는) 필수입니다` };
    }
    return null;
  },

  /** 최소값 체크 */
  min: (value: number, min: number, fieldName: string): ValidationError | null => {
    if (value < min) {
      return { field: fieldName, message: `${fieldName}은(는) ${min} 이상이어야 합니다` };
    }
    return null;
  },

  /** 최대값 체크 */
  max: (value: number, max: number, fieldName: string): ValidationError | null => {
    if (value > max) {
      return { field: fieldName, message: `${fieldName}은(는) ${max} 이하여야 합니다` };
    }
    return null;
  },

  /** 최대값 미만 체크 (미만, <) */
  lessThan: (value: number, limit: number, fieldName: string): ValidationError | null => {
    if (value >= limit) {
      return { field: fieldName, message: `${fieldName}은(는) ${limit} 미만이어야 합니다` };
    }
    return null;
  },

  /** 문자열 최대 길이 체크 */
  maxLength: (value: string, maxLen: number, fieldName: string): ValidationError | null => {
    if (value.length >= maxLen) {
      return { field: fieldName, message: `${fieldName}은(는) ${maxLen}자 미만이어야 합니다` };
    }
    return null;
  },

  /** 값 비교 (A <= B) */
  lessThanOrEqual: (
    valueA: number,
    valueB: number,
    fieldNameA: string,
    fieldNameB: string
  ): ValidationError | null => {
    if (valueA > valueB) {
      return { field: fieldNameA, message: `${fieldNameA}은(는) ${fieldNameB}보다 클 수 없습니다` };
    }
    return null;
  },

  /** 날짜 비교 (시작일 <= 종료일) */
  dateRange: (
    startDate: string,
    endDate: string,
    startFieldName: string,
    endFieldName: string
  ): ValidationError | null => {
    if (startDate > endDate) {
      return {
        field: startFieldName,
        message: `${startFieldName}이 ${endFieldName}보다 늦을 수 없습니다`,
      };
    }
    return null;
  },
};

/**
 * ValidationError 배열에서 null 제거
 */
export function collectErrors(...results: (ValidationError | null)[]): ValidationError[] {
  return results.filter((r): r is ValidationError => r !== null);
}

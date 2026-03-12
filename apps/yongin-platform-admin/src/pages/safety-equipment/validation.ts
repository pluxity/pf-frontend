/**
 * 안전 장비 Validation
 */
import { validators, collectErrors, type ValidationError } from "@/utils";
import type { SafetyEquipmentRequest } from "./types";

/**
 * 안전장비 행 유효성 검사
 * - 장비명: 필수
 * - 수량: 0 이상
 */
export function validateSafetyEquipment(data: SafetyEquipmentRequest): ValidationError[] {
  return collectErrors(
    validators.required(data.name, "장비명"),
    validators.min(data.quantity, 0, "수량")
  );
}

export interface SafetyEquipmentResponse {
  id: number;
  name: string;
  quantity: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SafetyEquipmentPayload {
  name: string;
  quantity: number;
}

export type SafetyEquipmentRequest = SafetyEquipmentPayload;

export type SafetyEquipmentUpdateRequest = SafetyEquipmentPayload;

// 그리드용 내부 타입
export interface SafetyEquipmentRow {
  id: number;
  name: string;
  quantity: number;
}

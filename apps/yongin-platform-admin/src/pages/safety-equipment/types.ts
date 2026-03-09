export interface SafetyEquipmentResponse {
  id: number;
  name: string;
  quantity: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SafetyEquipmentRequest {
  name: string;
  quantity: number;
}

export interface SafetyEquipmentUpdateResquest {
  name: string;
  quantity: number;
}

// 그리드용 내부 타입
export interface SafetyEquipmentRow {
  id: number;
  name: string;
  quantity: number;
}

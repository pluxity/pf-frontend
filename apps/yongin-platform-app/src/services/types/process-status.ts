export type { PageResponse } from "@/types";

// API 응답 타입 (Admin과 동일 구조)
export interface ProcessStatusResponse {
  id: number;
  workDate: string;
  workType: { id: number; name: string };
  plannedRate: number;
  actualRate: number;
}

// APP용 변환 타입
export interface ProcessStatusData {
  id: number;
  workDate: string;
  workTypeId: number;
  workTypeName: string;
  plannedRate: number;
  actualRate: number;
}

// API 응답 타입
export interface WorkType {
  id: number;
  name: string;
}

export interface ProcessStatusResponse {
  id: number;
  workDate: string;
  workType: WorkType;
  plannedRate: number;
  actualRate: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

// API 요청 타입
export interface ProcessStatusRequest {
  id?: number;
  workDate: string;
  workTypeId: number;
  plannedRate: number;
  actualRate: number;
}

export interface ProcessStatusBulkRequest {
  upserts: ProcessStatusRequest[];
  deletedIds: number[];
}

// 그리드용 내부 타입
export interface ProcessStatusData {
  id: number | null; // null이면 신규
  workDate: string;
  workTypeId: number;
  workTypeName: string;
  plannedRate: number;
  actualRate: number;
  isNew?: boolean;
}

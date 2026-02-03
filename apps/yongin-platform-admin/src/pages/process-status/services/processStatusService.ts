import { getApiClient, type DataResponse } from "@pf-dev/api";
import type {
  ProcessStatusResponse,
  ProcessStatusData,
  ProcessStatusBulkRequest,
  WorkType,
  PageResponse,
} from "../types";

// API 응답을 그리드 데이터로 변환
function toGridData(response: ProcessStatusResponse): ProcessStatusData {
  return {
    id: response.id,
    workDate: response.workDate,
    workTypeId: response.workType.id,
    workTypeName: response.workType.name,
    plannedRate: response.plannedRate,
    actualRate: response.actualRate,
  };
}

// 공정현황 목록 조회
export async function getProcessStatusList(
  page?: number,
  size?: number
): Promise<{ data: ProcessStatusData[]; totalElements: number }> {
  const response = await getApiClient().get<DataResponse<PageResponse<ProcessStatusResponse>>>(
    "/process-statuses",
    {
      params: { page, size },
    }
  );
  return {
    data: response.data.content.map(toGridData),
    totalElements: response.data.totalElements,
  };
}

// 공정명 목록 조회
export async function getWorkTypes(): Promise<WorkType[]> {
  const response = await getApiClient().get<DataResponse<WorkType[]>>(
    "/process-statuses/work-types"
  );
  return response.data;
}

// 공정명 추가
export async function createWorkType(name: string): Promise<void> {
  await getApiClient().post<void>("/process-statuses/work-types", { name });
}

// 공정명 삭제
export async function deleteWorkType(id: number): Promise<void> {
  await getApiClient().delete<void>(`/process-statuses/work-types/${id}`);
}

// 공정현황 일괄 저장/수정/삭제
export async function saveProcessStatuses(request: ProcessStatusBulkRequest): Promise<void> {
  await getApiClient().put<void>("/process-statuses", request);
}

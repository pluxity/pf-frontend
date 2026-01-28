import { getApiClient, type DataResponse } from "@pf-dev/api";
import type {
  KeyManagementItem,
  KeyManagementGroup,
  KeyManagementType,
  KeyManagementRequest,
  KeyManagementUpdateRequest,
} from "../types";

// 전체 목록 조회
export async function getKeyManagementList(): Promise<KeyManagementGroup[]> {
  const response = await getApiClient().get<DataResponse<KeyManagementGroup[]>>("/key-management");
  return response.data;
}

// 항목 상세 조회
export async function getKeyManagementItem(id: number): Promise<KeyManagementItem> {
  const response = await getApiClient().get<DataResponse<KeyManagementItem>>(
    `/key-management/${id}`
  );
  return response.data;
}

// 선택된 항목 목록 조회 (대시보드용)
export async function getSelectedKeyManagement(): Promise<KeyManagementItem[]> {
  const response = await getApiClient().get<DataResponse<KeyManagementItem[]>>(
    "/key-management/selected"
  );
  return response.data;
}

// 타입 목록 조회
export async function getKeyManagementTypes(): Promise<KeyManagementType[]> {
  const response =
    await getApiClient().get<DataResponse<KeyManagementType[]>>("/key-management/types");
  return response.data;
}

// 새 항목 생성
export async function createKeyManagement(request: KeyManagementRequest): Promise<void> {
  await getApiClient().post<void>("/key-management", request);
}

// 항목 수정
export async function updateKeyManagement(
  id: number,
  request: KeyManagementUpdateRequest
): Promise<void> {
  await getApiClient().put<void>(`/key-management/${id}`, request);
}

// 항목 선택
export async function selectKeyManagement(id: number): Promise<void> {
  await getApiClient().patch<void>(`/key-management/${id}/select`);
}

// 항목 선택 해제
export async function deselectKeyManagement(id: number): Promise<void> {
  await getApiClient().patch<void>(`/key-management/${id}/deselect`);
}

// 항목 삭제
export async function deleteKeyManagement(id: number): Promise<void> {
  await getApiClient().delete<void>(`/key-management/${id}`);
}
